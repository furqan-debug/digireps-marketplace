import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, DollarSign, Users, Loader2, Briefcase } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

interface Project {
  id: string;
  title: string;
  description: string;
  budget: number;
  deadline: string | null;
  created_at: string;
  category_id: string;
  category_name?: string;
  client_name?: string;
  bid_count?: number;
}

type Category = { id: string; name: string };

const ProjectBoard = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [sort, setSort] = useState<"newest" | "budget_high" | "budget_low" | "deadline">("newest");

  useEffect(() => {
    supabase.from("service_categories").select("id, name").then(({ data }) => setCategories(data ?? []));
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      let query = supabase.from("projects").select("id, title, description, budget, deadline, created_at, category_id, client_id").eq("status", "open");

      if (filterCat !== "all") query = query.eq("category_id", filterCat);

      if (sort === "newest") query = query.order("created_at", { ascending: false });
      else if (sort === "budget_high") query = query.order("budget", { ascending: false });
      else if (sort === "budget_low") query = query.order("budget", { ascending: true });
      else if (sort === "deadline") query = query.order("deadline", { ascending: true, nullsFirst: false });

      const { data } = await query;
      if (!data) { setLoading(false); return; }

      // Get category names
      const catIds = [...new Set(data.map(p => p.category_id))];
      const { data: cats } = await supabase.from("service_categories").select("id, name").in("id", catIds);
      const catMap = Object.fromEntries((cats ?? []).map(c => [c.id, c.name]));

      // Get client names
      const clientIds = [...new Set(data.map(p => p.client_id))];
      const { data: profiles } = await supabase.from("profiles").select("user_id, display_name").in("user_id", clientIds);
      const nameMap = Object.fromEntries((profiles ?? []).map(p => [p.user_id, p.display_name?.split(" ")[0] ?? "Client"]));

      // Get bid counts
      const bidCounts: Record<string, number> = {};
      for (const p of data) {
        const { count } = await supabase.from("project_bids").select("id", { count: "exact", head: true }).eq("project_id", p.id);
        bidCounts[p.id] = count ?? 0;
      }

      setProjects(data.map(p => ({
        ...p,
        category_name: catMap[p.category_id] ?? "Unknown",
        client_name: nameMap[p.client_id] ?? "Client",
        bid_count: bidCounts[p.id] ?? 0,
      })));
      setLoading(false);
    };
    load();
  }, [filterCat, sort]);

  const filtered = projects.filter(p => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return p.title.toLowerCase().includes(s) || p.description.toLowerCase().includes(s);
  });

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Project Board</h1>
          <p className="text-sm text-muted-foreground mt-1">Browse open projects and submit your bid.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
            <Input placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)} className="pl-11 h-12 rounded-xl" />
          </div>
          <Select value={filterCat} onValueChange={setFilterCat}>
            <SelectTrigger className="h-12 w-full sm:w-48 rounded-xl">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all" className="rounded-lg">All Categories</SelectItem>
              {categories.map(c => <SelectItem key={c.id} value={c.id} className="rounded-lg">{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={v => setSort(v as typeof sort)}>
            <SelectTrigger className="h-12 w-full sm:w-48 rounded-xl">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="newest" className="rounded-lg">Newest First</SelectItem>
              <SelectItem value="budget_high" className="rounded-lg">Highest Budget</SelectItem>
              <SelectItem value="budget_low" className="rounded-lg">Lowest Budget</SelectItem>
              <SelectItem value="deadline" className="rounded-lg">Earliest Deadline</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : filtered.length === 0 ? (
          <Card className="rounded-3xl border border-border/40 bg-card">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <Briefcase className="h-12 w-12 text-muted-foreground/30" />
              <p className="text-muted-foreground font-medium">No open projects found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filtered.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Link to={`/projects/${p.id}`}>
                  <Card className="rounded-2xl border border-border/40 bg-card hover:border-primary/30 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                    <CardContent className="p-6 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1 min-w-0 flex-1">
                          <h3 className="font-bold text-foreground group-hover:text-primary transition-colors truncate text-lg">{p.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{p.description}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xl font-bold text-foreground">${p.budget.toLocaleString()}</p>
                          <p className="text-[10px] font-medium text-muted-foreground uppercase">Budget</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                        <Badge variant="outline" className="text-[9px] uppercase tracking-wider">{p.category_name}</Badge>
                        <span>by {p.client_name}</span>
                        {p.deadline && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{format(new Date(p.deadline), "MMM d, yyyy")}</span>}
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" />{p.bid_count} bids</span>
                        <span className="ml-auto text-muted-foreground/40">{format(new Date(p.created_at), "MMM d")}</span>
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

export default ProjectBoard;
