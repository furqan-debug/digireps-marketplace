// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── Anti-bypass patterns (shared with send-message & submit-bid) ──
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

    // Check suspension via userClient (RLS should allow reading own profile)
    const { data: profile, error: profileErr } = await userClient
      .from("profiles").select("is_suspended").eq("user_id", user.id).single();

    if (profileErr) {
      return new Response(JSON.stringify({ error: `Profile lookup failed: ${profileErr.message}` }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (profile?.is_suspended) {
      return new Response(JSON.stringify({ error: "Your account has been suspended." }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { title, description, category_id, budget, deadline } = await req.json();

    if (!title?.trim() || !description?.trim() || !category_id || !budget) {
      return new Response(JSON.stringify({ error: "title, description, category_id, and budget are required." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (parseFloat(budget) < 100) {
      return new Response(JSON.stringify({ error: "Minimum budget is $100." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Scan title + description for contact info
    const combined = `${title} ${description}`;
    const violationType = detectViolation(combined);

    if (violationType) {
      await adminClient.from("violations").insert({
        user_id: user.id,
        violation_type: violationType,
        message_content: combined.substring(0, 500),
      });

      const { count } = await adminClient
        .from("violations").select("id", { count: "exact", head: true }).eq("user_id", user.id);

      // Auto-suspend after 3 violations
      if ((count ?? 0) >= 3) {
        await adminClient.from("profiles").update({ is_suspended: true }).eq("user_id", user.id);
      }

      return new Response(JSON.stringify({
        blocked: true,
        message: "Sharing contact information is against platform rules.",
        violation_count: count ?? 0,
      }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Insert project (using userClient so it attributes correctly and respects RLS)
    const { data: project, error: insertErr } = await userClient
      .from("projects").insert({
        client_id: user.id,
        category_id,
        title: title.trim(),
        description: description.trim(),
        budget: parseFloat(budget),
        deadline: deadline || null,
        status: "open",
      }).select("id").single();

    if (insertErr) {
      console.error("Project insert error:", insertErr);
      return new Response(JSON.stringify({ error: `Failed to post project: ${insertErr.message}` }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ blocked: false, project }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
