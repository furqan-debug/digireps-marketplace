import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Code, Palette, Video, PenTool, Smartphone, Star, MapPin, ArrowRight, Loader2, Crown, Shield, Search, Sparkles, Award, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getActivityStatus } from "@/lib/activity-status";

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  "Web Development": Code,
  "UI/UX Design": Palette,
  "Video Editing": Video,
  "Copywriting": PenTool,
  "Mobile Development": Smartphone,
};

const CATEGORY_COLORS: Record<string, string> = {
  "Web Development": "from-blue-500/20 to-blue-600/10",
  "UI/UX Design": "from-purple-500/20 to-purple-600/10",
  "Video Editing": "from-pink-500/20 to-pink-600/10",
  "Copywriting": "from-amber-500/20 to-amber-600/10",
  "Mobile Development": "from-green-500/20 to-green-600/10",
};

const LEVEL_CONFIG: Record<string, { icon: React.ElementType; label: string; className: string }> = {
  verified: { icon: Shield, label: "Verified", className: "bg-secondary text-secondary-foreground" },
  pro: { icon: Star, label: "Pro", className: "bg-primary/10 text-primary" },
  elite: { icon: Crown, label: "Elite", className: "bg-warning/15 text-warning" },
};

type Category = { id: string; name: string; description: string | null };
type Freelancer = {
  id: string;
  user_id: string;
  display_name: string;
  headline: string | null;
  country: string | null;
  bio: string | null;
  skills: string[] | null;
  experience_years: number | null;
  freelancer_level: "verified" | "pro" | "elite" | null;
  last_active_at: string | null;
  certifications: any[] | null;
  avg_rating?: number;
};

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

type SortOption = "recently_active" | "most_experienced" | "highest_rated";
type FilterChip = "online" | "pro_plus" | "elite_only";

const Discover = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [loading, setLoading] = useState(false);
  const [catLoading, setCatLoading] = useState(true);

  // Search & filters
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Set<FilterChip>>(new Set());
  const [sortBy, setSortBy] = useState<SortOption>("recently_active");

  useEffect(() => {
    supabase.from("service_categories").select("*").then(({ data }) => {
      setCategories(data ?? []);
      setCatLoading(false);
    });
  }, []);

  const handleSelectCategory = async (cat: Category) => {
    setSelectedCategory(cat);
    setLoading(true);
    setFreelancers([]);

    const { data: services } = await supabase
      .from("freelancer_services")
      .select("freelancer_id")
      .eq("category_id", cat.id);

    const ids = (services ?? []).map((s) => s.freelancer_id);

    if (ids.length === 0) {
      setFreelancers([]);
      setLoading(false);
      return;
    }

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, user_id, display_name, country, bio, skills, experience_years, freelancer_level, last_active_at, certifications, headline" as any)
      .in("user_id", ids)
      .eq("application_status", "approved")
      .eq("is_suspended", false)
      .order("freelancer_level", { ascending: false })
      .limit(50);

    const withRatings = await Promise.all(
      (profiles ?? []).map(async (p: any) => {
        const { data: ratings } = await supabase.from("ratings").select("rating").eq("reviewee_id", p.user_id);
        const avg = ratings && ratings.length > 0
          ? ratings.reduce((s: number, r: any) => s + r.rating, 0) / ratings.length
          : null;
        return { ...p, avg_rating: avg ?? undefined } as Freelancer;
      })
    );

    setFreelancers(withRatings);
    setLoading(false);
  };

  const toggleFilter = (f: FilterChip) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (next.has(f)) next.delete(f); else next.add(f);
      return next;
    });
  };

  const filteredFreelancers = useMemo(() => {
    let result = [...freelancers];

    // Text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(f =>
        f.display_name.toLowerCase().includes(q) ||
        (f.headline?.toLowerCase().includes(q)) ||
        (f.bio?.toLowerCase().includes(q)) ||
        (f.skills ?? []).some(s => s.toLowerCase().includes(q))
      );
    }

    // Filters
    if (activeFilters.has("online")) {
      result = result.filter(f => getActivityStatus(f.last_active_at).status === "online");
    }
    if (activeFilters.has("elite_only")) {
      result = result.filter(f => f.freelancer_level === "elite");
    }
    if (activeFilters.has("pro_plus")) {
      result = result.filter(f => f.freelancer_level === "pro" || f.freelancer_level === "elite");
    }

    // Sort
    if (sortBy === "highest_rated") {
      result.sort((a, b) => (b.avg_rating ?? 0) - (a.avg_rating ?? 0));
    } else if (sortBy === "most_experienced") {
      result.sort((a, b) => (b.experience_years ?? 0) - (a.experience_years ?? 0));
    } else {
      result.sort((a, b) => new Date(b.last_active_at ?? 0).getTime() - new Date(a.last_active_at ?? 0).getTime());
    }

    return result;
  }, [freelancers, searchQuery, activeFilters, sortBy]);

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-16 pb-20">
        {/* Header Section */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-border/40">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/5 border border-primary/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                <Sparkles className="h-3.5 w-3.5" /> Talent Acquisition
              </div>
              <h1 className="font-display text-5xl sm:text-7xl font-bold tracking-tight text-foreground leading-[1.1]">
                Source <span className="text-primary italic">Intelligence</span>
              </h1>
              <p className="text-muted-foreground/60 text-lg sm:text-xl font-medium max-w-2xl">
                Access our curated network of the world's most elite freelancers, rigorously vetted for excellence.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Search Bar - Dossier Style */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="relative">
          <div className="dossier-card p-2 rounded-[2rem] border-primary/20 bg-primary/5 shadow-inner">
            <div className="flex items-center gap-4 px-6 bg-white rounded-[1.5rem] border border-border/40 shadow-sm transition-all focus-within:border-primary/50 focus-within:shadow-elegant">
              <Search className="h-6 w-6 text-primary shrink-0" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search candidates by name, specialization, skills, or biography..."
                className="h-16 border-0 bg-transparent shadow-none focus-visible:ring-0 text-lg font-medium placeholder:text-muted-foreground/40 font-display"
              />
            </div>
          </div>
        </motion.div>

        {/* Filter chips & sort */}
        <AnimatePresence>
          {selectedCategory && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex flex-col sm:flex-row flex-wrap items-center justify-between gap-4 py-4 border-b border-border/40 overflow-hidden">
              <div className="flex items-center gap-4 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 shrink-0">
                  <Filter className="h-4 w-4 inline mr-2" /> Filters
                </span>
                {([["online", "Active Now"], ["pro_plus", "Pro & Elite"], ["elite_only", "Elite Exclusive"]] as [FilterChip, string][]).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => toggleFilter(key)}
                    className={`px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.1em] transition-all whitespace-nowrap shrink-0 border ${activeFilters.has(key) ? "bg-primary text-white border-primary shadow-sm" : "bg-muted/30 border-border/40 text-muted-foreground hover:border-primary/30 hover:bg-white"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 shrink-0 bg-muted/30 p-1.5 rounded-2xl border border-border/40">
                {([["recently_active", "Recent"], ["highest_rated", "Top Rated"], ["most_experienced", "Veteran"]] as [SortOption, string][]).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setSortBy(key)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-[0.1em] transition-all ${sortBy === key ? "bg-white text-primary shadow-sm border border-border/50" : "text-muted-foreground/60 hover:text-foreground"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Categories */}
        {catLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.name] ?? Code;
              const colorClass = CATEGORY_COLORS[cat.name] ?? "from-primary/20 to-primary/10";
              const active = selectedCategory?.id === cat.id;
              return (
                <motion.button key={cat.id} variants={itemVariants} onClick={() => handleSelectCategory(cat)} className={`group flex flex-col items-center gap-5 rounded-[2rem] border p-8 transition-all duration-300 ${active ? "border-primary bg-primary text-primary-foreground shadow-elegant scale-[1.02]" : "border-border/40 bg-white hover:border-primary/40 hover:shadow-elegant text-foreground hover:-translate-y-1"}`}>
                  <div className={`flex h-16 w-16 items-center justify-center rounded-[1.25rem] transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ${active ? "bg-white/20" : `bg-primary/5 border border-primary/10 text-primary group-hover:bg-primary group-hover:text-white`}`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <span className="text-center font-display font-bold text-base tracking-tight leading-tight">{cat.name}</span>
                </motion.button>
              );
            })}
          </motion.div>
        )}

        {/* Results */}
        <AnimatePresence mode="wait">
          {selectedCategory && (
            <motion.div key={selectedCategory.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="space-y-8">
              <div className="flex items-center justify-between border-b border-border/40 pb-4">
                <h2 className="font-display text-2xl font-bold tracking-tight text-foreground/80">
                  {selectedCategory.name} <span className="text-primary/70">Partners</span>
                </h2>
                {!loading && filteredFreelancers.length > 0 && (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{filteredFreelancers.length} Found</span>
                )}
              </div>

              {loading ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
                </div>
              ) : filteredFreelancers.length === 0 ? (
                <div className="rounded-[2rem] border-2 border-dashed border-border/40 bg-muted/20 py-24 text-center">
                  <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-xl font-bold text-muted-foreground/60">No talent found</p>
                  <p className="text-sm text-muted-foreground/40 mt-1">Try adjusting your filters or search query.</p>
                </div>
              ) : (
                <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid gap-6 sm:grid-cols-2">
                  {filteredFreelancers.map((f) => {
                    const level = f.freelancer_level ?? "verified";
                    const lvlCfg = LEVEL_CONFIG[level];
                    const LvlIcon = lvlCfg.icon;
                    const initials = f.display_name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
                    const activity = getActivityStatus(f.last_active_at);
                    const hasCerts = (f.certifications ?? []).some((c: any) => c.verified);

                    return (
                      <motion.div key={f.id} variants={itemVariants}>
                        <Card className="dossier-card group h-full flex flex-col p-2 hover:-translate-y-1 transition-all duration-500 cursor-pointer" onClick={() => navigate(`/client/freelancer/${f.user_id}?category=${selectedCategory.id}`)}>
                          <CardHeader className="p-6 pb-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-center gap-4">
                                <div className="relative shrink-0">
                                  <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-primary to-primary-glow blur-sm opacity-20 group-hover:opacity-60 transition-opacity duration-500" />
                                  <div className="relative flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-white border border-primary/20 font-display font-bold text-primary text-2xl shadow-sm z-10">
                                    {initials}
                                  </div>
                                  {/* Activity status dot */}
                                  <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full ${activity.color} border-2 border-white z-20`} title={activity.label} />
                                  <div className="absolute -top-2 -left-2 flex h-7 w-7 items-center justify-center rounded-xl bg-white border border-border/60 shadow-sm z-20 group-hover:scale-110 transition-transform duration-300">
                                    <LvlIcon className={`h-3.5 w-3.5 ${lvlCfg.className.includes('text-primary') ? 'text-primary' : lvlCfg.className.includes('text-warning') ? 'text-warning' : 'text-muted-foreground'}`} />
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <CardTitle className="font-display text-xl font-bold tracking-tight mb-1 group-hover:text-primary transition-colors">{f.display_name}</CardTitle>
                                  {f.headline && <p className="text-xs text-muted-foreground font-medium truncate mb-2">{f.headline}</p>}
                                  <div className="flex flex-wrap items-center gap-2">
                                    <Badge className={`${lvlCfg.className} rounded-md px-1.5 py-0 h-4 text-[9px] font-bold uppercase tracking-wider border-0 shadow-none`}>
                                      {lvlCfg.label}
                                    </Badge>
                                    {hasCerts && (
                                      <Badge className="bg-primary/5 text-primary rounded-md px-1.5 py-0 h-4 text-[9px] font-bold border border-primary/10">
                                        <Award className="h-3 w-3 mr-1" /> Certified
                                      </Badge>
                                    )}
                                    {f.country && (
                                      <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">
                                        <MapPin className="h-3 w-3 opacity-60" />{f.country}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="p-6 pt-0 flex flex-col flex-1 justify-between gap-6">
                            <div className="space-y-4">
                              {f.bio && <p className="text-sm text-muted-foreground/80 leading-relaxed line-clamp-2 italic">"{f.bio}"</p>}
                              <div className="flex flex-wrap gap-2">
                                {(f.skills ?? []).slice(0, 3).map((skill) => (
                                  <Badge key={skill} variant="secondary" className="rounded-lg px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-muted/50 border border-border/40 text-muted-foreground/80">{skill}</Badge>
                                ))}
                                {(f.skills?.length ?? 0) > 3 && (
                                  <span className="text-[10px] font-bold text-muted-foreground/60 flex items-center px-1">+{f.skills!.length - 3} more</span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-border/40 mt-auto">
                              <div className="flex items-center gap-4">
                                {f.avg_rating != null ? (
                                  <div className="flex items-center gap-1.5 bg-warning/5 px-2 py-1 rounded-md border border-warning/10">
                                    <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                                    <span className="font-bold text-xs text-warning-foreground">{f.avg_rating.toFixed(1)}</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1.5 opacity-40 px-2 py-1">
                                    <Star className="h-3.5 w-3.5" />
                                    <span className="text-[10px] font-bold uppercase italic">New</span>
                                  </div>
                                )}
                                {f.experience_years != null && (
                                  <div className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">{f.experience_years}Y Exp</div>
                                )}
                              </div>
                              <div className="h-8 w-8 rounded-xl bg-primary/5 flex items-center justify-center group-hover:bg-primary text-primary group-hover:text-white transition-all duration-300">
                                <ArrowRight className="h-4 w-4 -rotate-45 group-hover:rotate-0 transition-transform duration-500" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="fixed -bottom-32 -right-32 h-96 w-96 rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
        <div className="fixed -top-32 -left-32 h-96 w-96 rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
      </div>
    </AppShell>
  );
};

export default Discover;
