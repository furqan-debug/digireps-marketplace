import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── Anti-bypass patterns ─────────────────────────────────────────────────────
const EMAIL_PATTERN    = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/i;
const PHONE_PATTERN    = /(\+?\d[\s\-.]?){7,15}/;
const URL_PATTERN      = /https?:\/\/|www\.[^\s]+|[^\s]+\.(com|net|org|io|co|app|dev|me)/i;
const BLOCKED_WORDS    = [
  "gmail", "yahoo", "hotmail", "outlook",
  "whatsapp", "telegram", "instagram", "skype",
  "discord", "snapchat", "wechat", "signal",
  "viber", "line", "zalo", "kakaotalk",
];

function detectViolation(content: string): string | null {
  if (EMAIL_PATTERN.test(content))   return "email_pattern";
  if (PHONE_PATTERN.test(content))   return "phone_pattern";
  if (URL_PATTERN.test(content))     return "url_pattern";

  const lower = content.toLowerCase();
  for (const word of BLOCKED_WORDS) {
    if (lower.includes(word)) return `blocked_word:${word}`;
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ── Auth ────────────────────────────────────────────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl  = Deno.env.get("SUPABASE_URL")!;
    const serviceKey   = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey      = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;

    // User-scoped client (respects RLS)
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Service-role client (bypasses RLS for admin writes)
    const adminClient = createClient(supabaseUrl, serviceKey);

    // Identify caller
    const { data: { user }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Input ───────────────────────────────────────────────────────────────
    const { order_id, content } = await req.json() as { order_id: string; content: string };

    if (!order_id || !content?.trim()) {
      return new Response(JSON.stringify({ error: "order_id and content are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Check if user is suspended ──────────────────────────────────────────
    const { data: profile } = await adminClient
      .from("profiles")
      .select("is_suspended")
      .eq("user_id", user.id)
      .single();

    if (profile?.is_suspended) {
      return new Response(
        JSON.stringify({ error: "Your account has been suspended." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // ── Check if user is a participant in this order ────────────────────────
    const { data: order } = await adminClient
      .from("orders")
      .select("id, client_id, freelancer_id")
      .eq("id", order_id)
      .single();

    if (!order || (order.client_id !== user.id && order.freelancer_id !== user.id)) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Anti-bypass scan ────────────────────────────────────────────────────
    const violationType = detectViolation(content);

    if (violationType) {
      // Log violation using service-role (violations RLS only allows admin or own user_id)
      await adminClient.from("violations").insert({
        user_id:         user.id,
        order_id:        order_id,
        violation_type:  violationType,
        message_content: content.substring(0, 500),
      });

      // Count total violations (trigger will suspend if >= 3, but return count to caller)
      const { count } = await adminClient
        .from("violations")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);

      return new Response(
        JSON.stringify({
          blocked:   true,
          message:   "Sharing contact info is against platform rules.",
          violation_count: count ?? 0,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // ── Save message ────────────────────────────────────────────────────────
    const { data: message, error: msgErr } = await adminClient
      .from("messages")
      .insert({
        order_id,
        sender_id: user.id,
        content:   content.trim(),
      })
      .select()
      .single();

    if (msgErr) {
      console.error("Message insert error:", msgErr);
      return new Response(JSON.stringify({ error: "Failed to send message" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ blocked: false, message }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );

  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
