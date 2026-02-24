import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Settings, User, Building, Mail, Globe, Save, Loader2 } from "lucide-react";

const ClientSettings = () => {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState("");
  const [company, setCompany] = useState("");
  const [saving, setSaving] = useState(false);
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setCompany((profile as any).company || "");
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName, company })
      .eq("user_id", user.id);

    setSaving(false);
    if (error) {
      toast({ title: "Error", description: "Failed to save settings. Please try again.", variant: "destructive" });
    } else {
      toast({ title: "Settings saved", description: "Your profile has been updated." });
    }
  };

  const initials = displayName
    ? displayName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-10 pb-20">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="space-y-4 pb-10 border-b border-border/40">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/5 border border-primary/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              <Settings className="h-3.5 w-3.5" /> Account Settings
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-foreground">Settings</h1>
            <p className="text-muted-foreground text-lg font-medium">Manage your profile information and preferences.</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}
          className="bg-card border border-border/60 rounded-3xl p-8 sm:p-10 space-y-8">
          
          {/* Avatar */}
          <div className="flex items-center gap-6">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={displayName} className="h-20 w-20 rounded-3xl object-cover border border-primary/20 shadow-sm" />
            ) : (
              <div className="h-20 w-20 flex items-center justify-center rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 text-primary text-2xl font-bold">
                {initials}
              </div>
            )}
            <div>
              <p className="font-display font-bold text-lg">{displayName || "Your Name"}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <div className="border-t border-border/40" />

          {/* Form */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground flex items-center gap-2">
                <User className="h-3.5 w-3.5" /> Display Name
              </Label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your full name"
                className="h-12 rounded-xl border-border/60 bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground flex items-center gap-2">
                <Building className="h-3.5 w-3.5" /> Company
              </Label>
              <Input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Your company name (optional)"
                className="h-12 rounded-xl border-border/60 bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" /> Email
              </Label>
              <Input value={user?.email || ""} disabled className="h-12 rounded-xl border-border/60 bg-muted/30 text-muted-foreground" />
            </div>

            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground flex items-center gap-2">
                <Globe className="h-3.5 w-3.5" /> Timezone
              </Label>
              <Input value={timezone} disabled className="h-12 rounded-xl border-border/60 bg-muted/30 text-muted-foreground" />
            </div>
          </div>

          <div className="border-t border-border/40 pt-6">
            <Button onClick={handleSave} disabled={saving} className="h-12 px-8 rounded-xl bg-primary text-primary-foreground font-display font-bold text-xs uppercase tracking-widest border-0 gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </motion.div>
      </div>
    </AppShell>
  );
};

export default ClientSettings;
