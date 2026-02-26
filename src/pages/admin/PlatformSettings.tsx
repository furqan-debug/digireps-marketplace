import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Settings, Save } from "lucide-react";

const PlatformSettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settingsId, setSettingsId] = useState("");
  const [commissionRate, setCommissionRate] = useState("10");

  useEffect(() => {
    supabase.from("platform_settings").select("*").limit(1).single().then(({ data }) => {
      if (data) {
        setSettingsId((data as any).id);
        setCommissionRate(String((data as any).commission_rate));
      }
      setLoading(false);
    });
  }, []);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("platform_settings").update({
      commission_rate: parseFloat(commissionRate),
      updated_at: new Date().toISOString(),
    } as any).eq("id", settingsId);
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Settings saved" });
    }
  };

  if (loading) return <AppShell><div className="flex justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div></AppShell>;

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="font-display text-3xl font-bold tracking-tight">Platform Settings</h1>
          <p className="text-sm text-muted-foreground">Configure global platform parameters.</p>
        </div>

        <Card className="rounded-3xl border border-border/40">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Settings className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg font-bold">Commission Rate</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Global Commission (%)</label>
              <p className="text-xs text-muted-foreground">Applied automatically to all new orders via database trigger.</p>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={commissionRate}
                onChange={e => setCommissionRate(e.target.value)}
                className="max-w-xs h-14 rounded-2xl text-lg font-bold"
              />
            </div>
            <Button onClick={save} disabled={saving} className="rounded-xl gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
};

export default PlatformSettings;
