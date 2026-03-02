import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, DollarSign, Users, Loader2, FolderOpen } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

interface Project {
  id: string;
  title: string;
  budget: number;
  status: string;
  deadline: string | null;
  created_at: string;
  category_name?: string;
  bid_count?: number;
}

const ClientProjects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("projects")
        .select("id, title, budget, status, deadline, created_at, category_id")
        .eq("client_id", user.id)
        .order("created_at", { ascending: false });

      if (!data) { setLoading(false); return; }

      // Get categories + bid counts
      const catIds = [...new Set(data.map(p => p.category_id))];
      const { data: cats } = await supabase.from("service_categories").select("id, name").in("id", catIds);
      const catMap = Object.fromEntries((cats ?? []).map(c => [c.id, c.name]));

      const projectIds = data.map(p => p.id);
      // Count bids per project
      const bidCounts: Record<string, number> = {};
      if (projectIds.length > 0) {
        for (const pid of projectIds) {
          const { count } = await supabase
            .from("project_bids")
            .select("id", { count: "exact", head: true })
            .eq("project_id", pid);
          bidCounts[pid] = count ?? 0;
        }
      }

      setProjects(data.map(p => ({
        ...p,
        category_name: catMap[p.category_id] ?? "Unknown",
        bid_count: bidCounts[p.id] ?? 0,
      })));
      setLoading(false);
    };
    load();
  }, [user]);

  const statusColor = (s: string) => {
    if (s === "open") return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
    if (s === "awarded") return "bg-blue-500/10 text-blue-600 border-blue-500/20";
    return "bg-muted text-muted-foreground border-border/20";
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">My Projects</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your posted projects and review bids.</p>
          </div>
          <Button asChild className="rounded-2xl gap-2 h-12 px-6 text-xs font-bold uppercase tracking-widest">
            <Link to="/client/projects/new"><Plus className="h-4 w-4" /> Post Project</Link>
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : projects.length === 0 ? (
          <Card className="rounded-3xl border border-border/40 bg-card">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <FolderOpen className="h-12 w-12 text-muted-foreground/30" />
              <p className="text-muted-foreground font-medium">No projects yet.</p>
              <Button asChild variant="outline" className="rounded-xl gap-2">
                <Link to="/client/projects/new"><Plus className="h-4 w-4" /> Post Your First Project</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {projects.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link to={`/projects/${p.id}`}>
                  <Card className="rounded-2xl border border-border/40 bg-card hover:border-primary/30 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                    <CardContent className="p-6 flex items-center justify-between gap-4">
                      <div className="space-y-2 min-w-0 flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="font-bold text-foreground group-hover:text-primary transition-colors truncate">{p.title}</h3>
                          <Badge variant="outline" className={`text-[9px] uppercase tracking-wider ${statusColor(p.status)}`}>{p.status}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="font-medium">{p.category_name}</span>
                          <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />${p.budget.toLocaleString()}</span>
                          {p.deadline && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{format(new Date(p.deadline), "MMM d, yyyy")}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground shrink-0">
                        <Users className="h-4 w-4" />
                        <span>{p.bid_count}</span>
                        <span className="text-xs font-medium">bids</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default ClientProjects;
