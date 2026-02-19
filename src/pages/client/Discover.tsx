import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Code, Palette, Video, PenTool, Smartphone, Star, MapPin, ArrowRight, Loader2, Crown, Shield, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  verified: { icon: Shield,  label: "Verified", className: "bg-secondary text-secondary-foreground" },
  pro:      { icon: Star,    label: "Pro",      className: "bg-primary/10 text-primary" },
  elite:    { icon: Crown,   label: "Elite",    className: "bg-warning/15 text-warning" },
};

type Category = { id: string; name: string; description: string | null };
type Freelancer = {
  id: string;
  user_id: string;
  display_name: string;
  country: string | null;
  bio: string | null;
  skills: string[] | null;
  experience_years: number | null;
  freelancer_level: "verified" | "pro" | "elite" | null;
  avg_rating?: number;
};

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const Discover = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [loading, setLoading] = useState(false);
  const [catLoading, setCatLoading] = useState(true);

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
      .select("id, user_id, display_name, country, bio, skills, experience_years, freelancer_level")
      .in("user_id", ids)
      .eq("application_status", "approved")
      .eq("is_suspended", false)
      .order("freelancer_level", { ascending: false })
      .limit(10);

    const withRatings = await Promise.all(
      (profiles ?? []).map(async (p) => {
        const { data: ratings } = await supabase.from("ratings").select("rating").eq("reviewee_id", p.user_id);
        const avg = ratings && ratings.length > 0
          ? ratings.reduce((s, r) => s + r.rating, 0) / ratings.length
          : null;
        return { ...p, avg_rating: avg ?? undefined };
      })
    );

    setFreelancers(withRatings);
    setLoading(false);
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl icon-gradient">
              <Search className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold">Find Talent</h1>
              <p className="text-muted-foreground text-sm">Choose a service to see matched, vetted freelancers.</p>
            </div>
          </div>
        </motion.div>

        {/* Categories */}
        {catLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3"
          >
            {categories.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.name] ?? Code;
              const colorClass = CATEGORY_COLORS[cat.name] ?? "from-primary/20 to-primary/10";
              const active = selectedCategory?.id === cat.id;
              return (
                <motion.button
                  key={cat.id}
                  variants={itemVariants}
                  onClick={() => handleSelectCategory(cat)}
                  className={`flex flex-col items-center gap-3 rounded-2xl border-2 p-5 text-sm font-medium transition-all
                    ${active
                      ? "border-primary bg-primary text-primary-foreground shadow-elegant"
                      : "border-border/60 bg-card hover:border-primary/40 hover:shadow-sm text-foreground"
                    }`}
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${active ? "bg-white/20" : `bg-gradient-to-br ${colorClass}`}`}>
                    <Icon className={`h-6 w-6 ${active ? "text-white" : "text-primary"}`} />
                  </div>
                  <span className="text-center leading-tight text-xs">{cat.name}</span>
                </motion.button>
              );
            })}
          </motion.div>
        )}

        {/* Freelancer Results */}
        <AnimatePresence mode="wait">
          {selectedCategory && (
            <motion.div
              key={selectedCategory.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-semibold">
                  {selectedCategory.name} Freelancers
                </h2>
                {!loading && freelancers.length > 0 && (
                  <span className="text-sm text-muted-foreground">{freelancers.length} available</span>
                )}
              </div>

              {loading ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : freelancers.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/60 bg-muted/30 py-16 text-center">
                  <Search className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="font-medium text-muted-foreground">No freelancers available</p>
                  <p className="text-sm text-muted-foreground/60 mt-1">No approved freelancers for this category yet.</p>
                </div>
              ) : (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="grid gap-4 sm:grid-cols-2"
                >
                  {freelancers.map((f) => {
                    const level = f.freelancer_level ?? "verified";
                    const lvlCfg = LEVEL_CONFIG[level];
                    const LvlIcon = lvlCfg.icon;
                    const initials = f.display_name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

                    return (
                      <motion.div key={f.id} variants={itemVariants}>
                        <Card className="hover:shadow-elegant hover:border-primary/30 transition-all group h-full">
                          <CardHeader className="pb-3">
                            <div className="flex items-start gap-3">
                              {/* Avatar with gradient ring */}
                              <div className="relative shrink-0">
                                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-primary-glow blur-sm opacity-40" />
                                <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary-glow/20 border-2 border-primary/20 font-display font-bold text-primary text-lg">
                                  {initials}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <CardTitle className="font-display text-base">{f.display_name}</CardTitle>
                                  <Badge className={`${lvlCfg.className} text-xs gap-1`}>
                                    <LvlIcon className="h-2.5 w-2.5" />
                                    {lvlCfg.label}
                                  </Badge>
                                </div>
                                {f.country && (
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                    <MapPin className="h-3 w-3" />
                                    {f.country}
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {f.bio && (
                              <p className="text-sm text-muted-foreground line-clamp-2">{f.bio}</p>
                            )}

                            {/* Experience bar */}
                            {f.experience_years != null && (
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs text-muted-foreground">
                                  <span>Experience</span>
                                  <span>{f.experience_years}y</span>
                                </div>
                                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-gradient-to-r from-primary to-primary-glow"
                                    style={{ width: `${Math.min((f.experience_years / 15) * 100, 100)}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            <div className="flex flex-wrap gap-1.5">
                              {(f.skills ?? []).slice(0, 4).map((skill) => (
                                <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                              ))}
                              {(f.skills ?? []).length > 4 && (
                                <Badge variant="secondary" className="text-xs">+{(f.skills ?? []).length - 4}</Badge>
                              )}
                            </div>

                            <div className="flex items-center justify-between pt-1">
                              {f.avg_rating != null ? (
                                <div className="flex items-center gap-1 text-xs">
                                  <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                                  <span className="font-medium">{f.avg_rating.toFixed(1)}</span>
                                </div>
                              ) : <span />}
                              <Button
                                size="sm"
                                className="gap-1.5 bg-gradient-to-r from-primary to-primary-glow border-0 text-primary-foreground hover:opacity-90 text-xs"
                                onClick={() => navigate(`/client/freelancer/${f.user_id}?category=${selectedCategory.id}`)}
                              >
                                View Profile <ArrowRight className="h-3 w-3" />
                              </Button>
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
      </div>
    </AppShell>
  );
};

export default Discover;
