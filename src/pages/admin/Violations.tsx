import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserX, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

type Violation = {
  id: string; user_id: string; violation_type: string;
  message_content: string | null; order_id: string | null;
  created_at: string; display_name?: string; is_suspended?: boolean;
};

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const Violations = () => {
  const { toast } = useToast();
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState<string | null>(null);
  const [countMap, setCountMap] = useState<Record<string, number>>({});

  useEffect(() => {
    supabase.from("violations").select("*").order("created_at", { ascending: false })
      .then(async ({ data }) => {
        const rows = data ?? [];
        const userIds = [...new Set(rows.map((v) => v.user_id))];
        const { data: profiles } = await supabase.from("profiles").select("user_id, display_name, is_suspended").in("user_id", userIds);
        const nameMap = Object.fromEntries((profiles ?? []).map((p) => [p.user_id, p.display_name]));
        const suspendedMap = Object.fromEntries((profiles ?? []).map((p) => [p.user_id, p.is_suspended]));
        const counts: Record<string, number> = {};
        rows.forEach((v) => { counts[v.user_id] = (counts[v.user_id] ?? 0) + 1; });
        setCountMap(counts);
        setViolations(rows.map((v) => ({ ...v, display_name: nameMap[v.user_id], is_suspended: suspendedMap[v.user_id] })));
        setLoading(false);
      });
  }, []);

  const suspendUser = async (userId: string) => {
    setActioning(userId);
    const { error } = await supabase.from("profiles").update({ is_suspended: true }).eq("user_id", userId);
    setActioning(null);
    if (error) { toast({ title: "Failed to suspend user", description: error.message, variant: "destructive" }); }
    else {
      toast({ title: "User suspended" });
      setViolations((prev) => prev.map((v) => v.user_id === userId ? { ...v, is_suspended: true } : v));
    }
  };

  const getSeverityClass = (count: number) => {
    if (count >= 3) return "border-l-destructive bg-destructive/5";
    if (count >= 2) return "border-l-warning bg-warning/5";
    return "border-l-border";
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold">Violations Log</h1>
              <p className="text-muted-foreground text-sm">Chat messages blocked for policy violations. Users auto-suspended at 3 violations.</p>
            </div>
          </div>
        </motion.div>

        {/* Severity legend */}
        <div className="flex gap-3 flex-wrap text-xs">
          <div className="flex items-center gap-2 rounded-full border border-warning/30 bg-warning/10 px-3 py-1.5 text-warning font-medium">
            <div className="h-2 w-2 rounded-full bg-warning" /> 2+ violations — watch
          </div>
          <div className="flex items-center gap-2 rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-destructive font-medium">
            <div className="h-2 w-2 rounded-full bg-destructive" /> 3+ violations — critical
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : violations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 py-16 text-center text-muted-foreground">
            No violations recorded.
          </div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-3">
            {violations.map((v) => {
              const count = countMap[v.user_id] ?? 1;
              return (
                <motion.div key={v.id} variants={itemVariants}>
                  <Card className={`border-l-4 ${getSeverityClass(count)} transition-all`}>
                    <CardContent className="py-4">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-3 justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                            <span className="font-semibold">{v.display_name ?? v.user_id}</span>
                            <Badge variant="destructive" className="text-xs">
                              {v.violation_type.replace(/_/g, " ")}
                            </Badge>
                            <Badge variant="outline" className={`text-xs ${count >= 3 ? "border-destructive/40 text-destructive" : count >= 2 ? "border-warning/40 text-warning" : ""}`}>
                              {count} violation{count !== 1 ? "s" : ""}
                            </Badge>
                            {v.is_suspended && (
                              <Badge className="text-xs bg-destructive/20 text-destructive border-destructive/30">Already suspended</Badge>
                            )}
                          </div>
                          {v.message_content && (
                            <div className="rounded-lg border border-border/60 bg-muted/50 px-3 py-2">
                              <code className="text-xs text-muted-foreground font-mono break-all line-clamp-2">
                                &ldquo;{v.message_content}&rdquo;
                              </code>
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground/60">
                            {new Date(v.created_at).toLocaleString()}
                            {v.order_id && ` · Order ${v.order_id.slice(0, 8)}…`}
                          </p>
                        </div>
                        {!v.is_suspended && (
                          <Button
                            size="sm"
                            variant="destructive"
                            className="gap-1.5 shrink-0"
                            disabled={actioning === v.user_id}
                            onClick={() => suspendUser(v.user_id)}
                          >
                            {actioning === v.user_id ? <Loader2 className="h-3 w-3 animate-spin" /> : <><UserX className="h-3.5 w-3.5" /> Suspend</>}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </AppShell>
  );
};

export default Violations;
