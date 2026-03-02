// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ──────────────────────────────────────── Anti-bypass patterns ─────────────────────────────────────────────────────
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

// Check if recent messages are being used to split a phone number
// Only flags when the NEW message is also digit-heavy (intentional splitting)
function detectSplitPhone(recentContents: string[], newContent: string): boolean {
  // The current message must itself be short and digit-heavy to be part of a split
  const trimmedNew = newContent.trim();
  if (trimmedNew.length > 20) return false;
  const newDigits = (trimmedNew.match(/\d/g) || []).length;
  if (trimmedNew.length === 0 || newDigits / trimmedNew.length < 0.5) return false;

  // Gather digit-heavy recent messages
  const digitHeavyRecent = recentContents.filter(m => {
    const trimmed = m.trim();
    if (trimmed.length > 20) return false;
    const digitCount = (trimmed.match(/\d/g) || []).length; 
    return trimmed.length > 0 && digitCount / trimmed.length > 0.5;
  });

  // Need at least 1 recent digit-heavy message + current one
  if (digitHeavyRecent.length < 1) return false;

  const combinedDigits = [...digitHeavyRecent, trimmedNew].join("").replace(/[^\d]/g, "");
  return combinedDigits.length >= 7 && combinedDigits.length <= 15;
}

// @ts-ignore
Deno.serve(async (req: Request) => {
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

    // @ts-ignore
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    // @ts-ignore
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    // @ts-ignore
    const anonKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;

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
      await adminClient.from("violations").insert({
        user_id: user.id,
        order_id: order_id,
        violation_type: violationType,
        message_content: content.substring(0, 500),
      });

      const { count } = await adminClient
        .from("violations")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);

      return new Response(
        JSON.stringify({
          blocked: true,
          message: "Sharing contact info is against platform rules.",
          violation_count: count ?? 0,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // ── Split-message phone detection ───────────────────────────────────────
    const { data: recentMsgs } = await adminClient
      .from("messages")
      .select("content")
      .eq("order_id", order_id)
      .eq("sender_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    if (recentMsgs && recentMsgs.length > 0) {
      const recentContents = recentMsgs.map((m: { content: string }) => m.content).reverse();
      if (detectSplitPhone(recentContents, content)) {
        await adminClient.from("violations").insert({
          user_id: user.id,
          order_id: order_id,
          violation_type: "split_phone_pattern",
          message_content: [...recentContents, content].join(" | ").substring(0, 500),
        });

        const { count } = await adminClient
          .from("violations")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id);

        return new Response(
          JSON.stringify({
            blocked: true,
            message: "Sharing contact info is against platform rules.",
            violation_count: count ?? 0,
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    // ── Save message ────────────────────────────────────────────────────────
    const { data: message, error: msgErr } = await adminClient
      .from("messages")
      .insert({
        order_id,
        sender_id: user.id,
        content: content.trim(),
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
