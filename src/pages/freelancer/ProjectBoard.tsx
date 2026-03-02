import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, DollarSign, Users, Loader2, Briefcase, ArrowRight, Sparkles } from "lucide-react";
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
      <div className="max-w-6xl mx-auto space-y-10 pb-24 relative px-4 sm:px-6 lg:px-8 mt-6">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10" />
        <div className="absolute top-[20%] left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] pointer-events-none -z-10" />

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="space-y-4 pb-8 border-b border-border/40">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-primary shadow-sm glass">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" /> Find Work
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground drop-shadow-sm">Project Board</h1>
            <p className="text-muted-foreground text-lg sm:text-xl font-medium max-w-2xl">Discover premium projects precisely matching your expertise. Review briefs, submit bids, and scale your freelance career.</p>
          </div>
        </motion.div>

        {/* Filters Area */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }} className="bg-card/40 backdrop-blur-md rounded-[2rem] p-4 lg:p-6 border border-border/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50" />
            <Input
              placeholder="Search project title or description..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-12 h-14 rounded-2xl border-border/60 bg-background/50 hover:border-primary/40 focus:border-primary focus:ring-primary/20 transition-all font-medium"
            />
          </div>
          <Select value={filterCat} onValueChange={setFilterCat}>
            <SelectTrigger className="h-14 rounded-2xl border-border/60 bg-background/50 hover:border-primary/40 focus:ring-primary/20 transition-all font-medium">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-border/60">
              <SelectItem value="all" className="rounded-xl">All Categories</SelectItem>
              {categories.map(c => <SelectItem key={c.id} value={c.id} className="rounded-xl">{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={v => setSort(v as typeof sort)}>
            <SelectTrigger className="h-14 rounded-2xl border-border/60 bg-background/50 hover:border-primary/40 focus:ring-primary/20 transition-all font-medium">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-border/60">
              <SelectItem value="newest" className="rounded-xl">Newest First</SelectItem>
              <SelectItem value="budget_high" className="rounded-xl">Highest Budget</SelectItem>
              <SelectItem value="budget_low" className="rounded-xl">Lowest Budget</SelectItem>
              <SelectItem value="deadline" className="rounded-xl">Earliest Deadline</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Projects List */}
        {loading ? (
          <div className="flex justify-center py-32"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card/40 backdrop-blur-md border border-border/60 rounded-[3rem] p-24 text-center space-y-6 shadow-sm">
            <div className="h-24 w-24 rounded-full bg-muted/30 flex items-center justify-center mx-auto border border-border">
              <Briefcase className="h-10 w-10 text-muted-foreground/40" />
            </div>
            <div className="space-y-2">
              <h3 className="font-display text-2xl font-bold text-foreground">No projects found.</h3>
              <p className="text-muted-foreground font-medium max-w-sm mx-auto">Try adjusting your search criteria, category filters, or check back later.</p>
            </div>
          </motion.div>
        ) : (
          <div className="grid gap-5">
            {filtered.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.5 }}>
                <Link to={`/projects/${p.id}`} className="block group">
                  <Card className="rounded-[2.5rem] border border-border/60 bg-card/60 backdrop-blur-md hover:border-primary/50 hover:shadow-[0_15px_40px_-10px_rgba(29,69,151,0.15)] hover:-translate-y-1 transition-all duration-500 overflow-hidden relative">
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-primary/[0.03] to-transparent pointer-events-none" />

                    <CardContent className="p-8 lg:p-10 space-y-6">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">

                        <div className="space-y-3 flex-1">
                          <div className="flex items-center gap-3">
                            <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 text-[10px] uppercase font-bold tracking-widest">{p.category_name}</Badge>
                            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
                              <Calendar className="h-3 w-3" /> Posted {format(new Date(p.created_at), "MMM d, yyyy")}
                            </span>
                          </div>

                          <h3 className="font-display text-2xl lg:text-3xl font-bold text-foreground group-hover:text-primary transition-colors tracking-tight line-clamp-2 md:line-clamp-1 pr-12">{p.title}</h3>
                          <p className="text-muted-foreground leading-relaxed line-clamp-2 max-w-3xl font-medium text-[15px]">{p.description}</p>
                        </div>

                        <div className="md:text-right shrink-0 flex flex-row md:flex-col items-center md:items-end gap-4 md:gap-1 bg-background/50 md:bg-transparent rounded-2xl p-4 md:p-0 border border-border/40 md:border-transparent">
                          <div>
                            <p className="text-3xl font-display font-bold text-foreground tracking-tighter">${p.budget.toLocaleString()}</p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] md:mt-1">Fixed Budget</p>
                          </div>
                          <div className="hidden md:flex h-10 w-10 rounded-full bg-primary/10 items-center justify-center mt-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-500">
                            <ArrowRight className="h-5 w-5 text-primary group-hover:text-primary-foreground group-hover:translate-x-0.5 transition-all" />
                          </div>
                        </div>

                      </div>

                      <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-border/40 text-sm text-muted-foreground font-medium relative z-10">
                        <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/40 text-foreground/80">
                          <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                            <span className="text-[10px] font-bold text-primary">{p.client_name?.charAt(0) || "C"}</span>
                          </div>
                          Client: {p.client_name}
                        </span>

                        {p.deadline && (
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-warning" />
                            Deadline: <span className="text-foreground">{format(new Date(p.deadline), "MMM d, yyyy")}</span>
                          </span>
                        )}

                        <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/10 text-accent-foreground ml-auto group-hover:bg-accent/20 transition-colors">
                          <Users className="h-4 w-4 text-accent" /> {p.bid_count} Proposals
                        </span>
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
