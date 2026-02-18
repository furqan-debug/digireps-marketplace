import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserX, AlertTriangle } from "lucide-react";

type Violation = {
  id: string;
  user_id: string;
  violation_type: string;
  message_content: string | null;
  order_id: string | null;
  created_at: string;
  display_name?: string;
};

const Violations = () => {
  const { toast } = useToast();
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState<string | null>(null);
  const [countMap, setCountMap] = useState<Record<string, number>>({});

  useEffect(() => {
    supabase
      .from("violations")
      .select("*")
      .order("created_at", { ascending: false })
      .then(async ({ data }) => {
        const rows = data ?? [];

        // Get display names
        const userIds = [...new Set(rows.map((v) => v.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, display_name")
          .in("user_id", userIds);
        const nameMap = Object.fromEntries((profiles ?? []).map((p) => [p.user_id, p.display_name]));

        // Count per user
        const counts: Record<string, number> = {};
        rows.forEach((v) => { counts[v.user_id] = (counts[v.user_id] ?? 0) + 1; });
        setCountMap(counts);

        setViolations(rows.map((v) => ({ ...v, display_name: nameMap[v.user_id] })));
        setLoading(false);
      });
  }, []);

  const suspendUser = async (userId: string) => {
    setActioning(userId);
    const { error } = await supabase.from("profiles").update({ is_suspended: true }).eq("user_id", userId);
    setActioning(null);
    if (error) {
      toast({ title: "Failed to suspend user", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "User suspended" });
    }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold">Violations Log</h1>
          <p className="text-muted-foreground mt-1">
            Chat messages blocked for policy violations. Users are auto-suspended at 3 violations.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : violations.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              No violations recorded.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {violations.map((v) => (
              <Card key={v.id} className="border-destructive/20">
                <CardContent className="py-4">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3 justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        <span className="font-medium">{v.display_name ?? v.user_id}</span>
                        <Badge variant="destructive" className="text-xs">
                          {v.violation_type.replace(/_/g, " ")}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {countMap[v.user_id] ?? 1} violation{(countMap[v.user_id] ?? 1) !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                      {v.message_content && (
                        <p className="text-xs text-muted-foreground bg-muted rounded px-2 py-1 font-mono line-clamp-2">
                          &ldquo;{v.message_content}&rdquo;
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(v.created_at).toLocaleString()}
                        {v.order_id && ` · Order ${v.order_id.slice(0, 8)}…`}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="gap-1.5 shrink-0"
                      disabled={actioning === v.user_id}
                      onClick={() => suspendUser(v.user_id)}
                    >
                      {actioning === v.user_id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <><UserX className="h-3.5 w-3.5" /> Suspend</>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default Violations;
