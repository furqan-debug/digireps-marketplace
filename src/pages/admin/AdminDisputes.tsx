import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Flag, CheckCircle } from "lucide-react";

type Dispute = {
  id: string;
  order_id: string;
  opened_by: string;
  reason: string;
  admin_resolution: string | null;
  status: string;
  created_at: string;
  resolved_at: string | null;
};

const AdminDisputes = () => {
  const { toast } = useToast();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolutions, setResolutions] = useState<Record<string, string>>({});
  const [resolving, setResolving] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("disputes").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      setDisputes((data ?? []) as Dispute[]);
      setLoading(false);
    });
  }, []);

  const resolve = async (id: string) => {
    const text = resolutions[id]?.trim();
    if (!text) return;
    setResolving(id);
    const { error } = await supabase.from("disputes").update({
      admin_resolution: text,
      status: "resolved",
      resolved_at: new Date().toISOString(),
    } as any).eq("id", id);
    setResolving(null);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setDisputes(prev => prev.map(d => d.id === id ? { ...d, status: "resolved", admin_resolution: text, resolved_at: new Date().toISOString() } : d));
      toast({ title: "Dispute resolved" });
    }
  };

  if (loading) return <AppShell><div className="flex justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div></AppShell>;

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="font-display text-3xl font-bold tracking-tight">Dispute Management</h1>
          <p className="text-sm text-muted-foreground">Review and resolve disputes between clients and freelancers.</p>
        </div>

        {disputes.length === 0 ? (
          <Card className="rounded-3xl"><CardContent className="py-16 text-center text-muted-foreground">No disputes found.</CardContent></Card>
        ) : (
          <div className="space-y-4">
            {disputes.map(d => (
              <Card key={d.id} className="rounded-3xl border border-border/40">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Flag className="h-5 w-5 text-destructive" />
                      <CardTitle className="text-base font-bold">Order #{d.order_id.slice(-6).toUpperCase()}</CardTitle>
                    </div>
                    <Badge className={`rounded-lg text-[9px] font-bold uppercase border-0 ${d.status === "open" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
                      {d.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Reason</p>
                    <p className="text-sm">{d.reason}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">Opened: {new Date(d.created_at).toLocaleDateString()}</p>

                  {d.admin_resolution ? (
                    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Resolution</p>
                      <p className="text-sm">{d.admin_resolution}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Textarea
                        placeholder="Write your resolution..."
                        value={resolutions[d.id] ?? ""}
                        onChange={e => setResolutions(prev => ({ ...prev, [d.id]: e.target.value }))}
                        rows={3}
                        className="rounded-2xl resize-none"
                      />
                      <Button onClick={() => resolve(d.id)} disabled={resolving === d.id || !resolutions[d.id]?.trim()} className="rounded-xl gap-2">
                        {resolving === d.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                        Resolve Dispute
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default AdminDisputes;
