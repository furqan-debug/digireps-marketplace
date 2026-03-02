// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i;
const PHONE_PATTERN = /(\+?\d[\s-.]?){7,15}/;
const URL_PATTERN = /https?:\/\/|www\.[^\s]+|[^\s]+\.(com|net|org|io|co|app|dev|me)/i;
const BLOCKED_WORDS = [
  "gmail", "yahoo", "hotmail", "outlook",
  "whatsapp", "telegram", "instagram", "skype",
  "discord", "snapchat", "wechat", "signal",
  "viber", "line", "zalo", "kakaotalk",
];
const SOCIAL_ENGINEERING = [
  "contact me", "reach me", "call me", "text me", "dm me",
  "message me on", "hit me up", "hmu", "add me",
  "my number", "my email", "my insta", "my snap",
  "off platform", "outside the app", "outside platform",
];

function detectViolation(content: string): string | null {
  if (EMAIL_PATTERN.test(content)) return "email_pattern";
  if (PHONE_PATTERN.test(content)) return "phone_pattern";
  if (URL_PATTERN.test(content)) return "url_pattern";
  const lower = content.toLowerCase();
  for (const word of BLOCKED_WORDS) {
    if (lower.includes(word)) return `blocked_word:${word}`;
  }
  for (const phrase of SOCIAL_ENGINEERING) {
    if (lower.includes(phrase)) return `social_engineering:${phrase}`;
  }
  return null;
}

// @ts-ignore
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // @ts-ignore
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    // @ts-ignore
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    // @ts-ignore
    const anonKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const adminClient = createClient(supabaseUrl, serviceKey);

    const { data: { user }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check suspension
    const { data: profile } = await adminClient
      .from("profiles").select("is_suspended").eq("user_id", user.id).single();
    if (profile?.is_suspended) {
      return new Response(JSON.stringify({ error: "Your account has been suspended." }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check freelancer is approved
    const { data: approvedCheck } = await adminClient
      .from("profiles").select("application_status").eq("user_id", user.id).single();
    if (approvedCheck?.application_status !== "approved") {
      return new Response(JSON.stringify({ error: "Only approved freelancers can submit bids." }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { project_id, amount, message } = await req.json();

    if (!project_id || !amount || !message?.trim()) {
      return new Response(JSON.stringify({ error: "project_id, amount, and message are required." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (parseFloat(amount) < 100) {
      return new Response(JSON.stringify({ error: "Minimum bid amount is $100." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check project exists and is open
    const { data: project } = await adminClient
      .from("projects").select("id, status, client_id").eq("id", project_id).single();
    if (!project || project.status !== "open") {
      return new Response(JSON.stringify({ error: "Project not found or no longer open." }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Can't bid on own project
    if (project.client_id === user.id) {
      return new Response(JSON.stringify({ error: "Cannot bid on your own project." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Scan bid message
    const violationType = detectViolation(message);
    if (violationType) {
      await adminClient.from("violations").insert({
        user_id: user.id,
        violation_type: violationType,
        message_content: message.substring(0, 500),
      });

      const { count } = await adminClient
        .from("violations").select("id", { count: "exact", head: true }).eq("user_id", user.id);

      if ((count ?? 0) >= 3) {
        await adminClient.from("profiles").update({ is_suspended: true }).eq("user_id", user.id);
      }

      return new Response(JSON.stringify({
        blocked: true,
        message: "Sharing contact information is against platform rules.",
        violation_count: count ?? 0,
      }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Check for existing bid
    const { data: existingBid } = await adminClient
      .from("project_bids").select("id").eq("project_id", project_id).eq("freelancer_id", user.id).maybeSingle();
    if (existingBid) {
      return new Response(JSON.stringify({ error: "You have already submitted a bid for this project." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Insert bid
    const { data: bid, error: bidErr } = await adminClient
      .from("project_bids").insert({
        project_id,
        freelancer_id: user.id,
        amount: parseFloat(amount),
        message: message.trim(),
      }).select("id").single();

    if (bidErr) {
      console.error("Bid insert error:", bidErr);
      return new Response(JSON.stringify({ error: "Failed to submit bid." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ blocked: false, bid }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
