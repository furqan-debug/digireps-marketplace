import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ESCROW_API_BASE = "https://api.escrow.com/2017-09-01";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const escrowEmail = Deno.env.get("ESCROW_API_EMAIL");
    const escrowApiKey = Deno.env.get("ESCROW_API_KEY");

    if (!escrowEmail || !escrowApiKey) {
      return new Response(
        JSON.stringify({ error: "Escrow.com credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await anonClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, order_id } = await req.json();

    // Fetch order and verify participant
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", order_id)
      .single();

    if (orderError || !order) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (order.client_id !== user.id && order.freelancer_id !== user.id) {
      return new Response(JSON.stringify({ error: "Not a participant" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get client and freelancer emails for Escrow.com
    const { data: clientProfile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("user_id", order.client_id)
      .single();

    const { data: freelancerProfile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("user_id", order.freelancer_id)
      .single();

    // Get user emails from auth
    const { data: { users: allUsers } } = await supabase.auth.admin.listUsers();
    const clientUser = allUsers?.find((u: any) => u.id === order.client_id);
    const freelancerUser = allUsers?.find((u: any) => u.id === order.freelancer_id);
    const clientEmail = clientUser?.email;
    const freelancerEmail = freelancerUser?.email;

    if (!clientEmail || !freelancerEmail) {
      return new Response(JSON.stringify({ error: "Could not resolve participant emails" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const escrowAuth = btoa(`${escrowEmail}:${escrowApiKey}`);

    const escrowFetch = async (url: string, options: RequestInit = {}) => {
      const res = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${escrowAuth}`,
          ...(options.headers || {}),
        },
      });
      const data = await res.json();
      if (!res.ok) {
        console.error("Escrow API error:", res.status, JSON.stringify(data));
        throw new Error(`Escrow API error [${res.status}]: ${JSON.stringify(data)}`);
      }
      return data;
    };

    let result: any = {};

    switch (action) {
      // 1. CREATE TRANSACTION — called when client funds escrow
      case "create_transaction": {
        if (user.id !== order.client_id) {
          return new Response(JSON.stringify({ error: "Only the client can create escrow" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const inspectionDays = 3;
        const txPayload = {
          parties: [
            { role: "buyer", customer: clientEmail },
            { role: "seller", customer: freelancerEmail },
          ],
          currency: "usd",
          description: order.title,
          items: [
            {
              title: order.title,
              description: order.description || "Service delivery",
              type: "domain_name", // Escrow.com uses domain_name for digital services
              inspection_period: inspectionDays * 86400,
              quantity: 1,
              schedule: [
                {
                  amount: Number(order.budget),
                  payer_customer: clientEmail,
                  beneficiary_customer: freelancerEmail,
                },
              ],
            },
          ],
        };

        const tx = await escrowFetch(`${ESCROW_API_BASE}/transaction`, {
          method: "POST",
          body: JSON.stringify(txPayload),
        });

        // Store transaction ID and update order status
        await supabase
          .from("orders")
          .update({
            escrow_transaction_id: String(tx.id),
            escrow_status: "held",
            status: "in_progress",
          })
          .eq("id", order_id);

        result = { success: true, transaction_id: tx.id, escrow_status: "held" };
        break;
      }

      // 2. GET TRANSACTION STATUS
      case "get_status": {
        if (!order.escrow_transaction_id) {
          return new Response(JSON.stringify({ error: "No escrow transaction for this order" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const tx = await escrowFetch(
          `${ESCROW_API_BASE}/transaction/${order.escrow_transaction_id}`
        );
        result = { success: true, transaction: tx };
        break;
      }

      // 3. RELEASE FUNDS — called when client approves delivery
      case "release_funds": {
        if (user.id !== order.client_id) {
          return new Response(JSON.stringify({ error: "Only the client can release funds" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        if (!order.escrow_transaction_id) {
          return new Response(JSON.stringify({ error: "No escrow transaction to release" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Mark items as received/accepted on Escrow.com
        // This triggers fund release to the seller
        const txId = order.escrow_transaction_id;

        // Get transaction to find item ID
        const tx = await escrowFetch(`${ESCROW_API_BASE}/transaction/${txId}`);
        const itemId = tx.items?.[0]?.id;

        if (itemId) {
          // Mark as received
          await escrowFetch(
            `${ESCROW_API_BASE}/transaction/${txId}/item/${itemId}/receive`,
            { method: "PATCH" }
          );
          // Accept the item (releases funds)
          await escrowFetch(
            `${ESCROW_API_BASE}/transaction/${txId}/item/${itemId}/accept`,
            { method: "PATCH" }
          );
        }

        await supabase
          .from("orders")
          .update({ escrow_status: "released", status: "completed" })
          .eq("id", order_id);

        result = { success: true, escrow_status: "released" };
        break;
      }

      default:
        return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Escrow function error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
