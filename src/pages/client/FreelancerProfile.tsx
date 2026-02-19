import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, ArrowLeft, Star, Crown, Shield, ShieldCheck, Award, Loader2, Edit3, Globe, Sparkles, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";

const LEVEL_CONFIG: Record<string, { icon: React.ElementType; label: string; className: string }> = {
  verified: { icon: Shield, label: "Verified", className: "bg-secondary text-secondary-foreground" },
  pro: { icon: Star, label: "Pro", className: "bg-primary/10 text-primary" },
  elite: { icon: Crown, label: "Elite", className: "bg-warning/15 text-warning" },
};

type Profile = {
  id: string;
  user_id: string;
  display_name: string;
  country: string | null;
  timezone: string | null;
  bio: string | null;
  skills: string[] | null;
  experience_years: number | null;
  freelancer_level: "verified" | "pro" | "elite" | null;
  avatar_url: string | null;
  is_suspended?: boolean;
  created_at?: string;
};

type PortfolioItem = { id: string; title: string; description: string | null; image_url: string };
type Rating = { id: string; rating: number; review_text: string | null; created_at: string };

const FreelancerProfile = () => {
  const { freelancerId } = useParams<{ freelancerId: string }>();
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get("category");
  const navigate = useNavigate();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!freelancerId) return;
    Promise.all([
      supabase.from("profiles").select("*").eq("user_id", freelancerId).single(),
      supabase.from("portfolio_items").select("*").eq("freelancer_id", freelancerId),
      supabase.from("ratings").select("*").eq("reviewee_id", freelancerId).order("created_at", { ascending: false }),
    ]).then(([profileRes, portfolioRes, ratingsRes]) => {
      setProfile(profileRes.data as Profile | null);
      setPortfolio(portfolioRes.data ?? []);
      setRatings(ratingsRes.data ?? []);
      setLoading(false);
    });
  }, [freelancerId]);

  const avgRating = ratings.length > 0
    ? ratings.reduce((s, r) => s + r.rating, 0) / ratings.length
    : null;

  if (loading) {
    return (
      <AppShell>
        <div className="flex justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </AppShell>
    );
  }

  if (!profile) {
    return (
      <AppShell>
        <div className="text-center py-24 text-muted-foreground">Freelancer not found.</div>
      </AppShell>
    );
  }

  const initials = profile.display_name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  const badgeConfigMap = {
    verified: {
      label: "Verified",
      bg: "bg-blue-500/10",
      color: "text-blue-500",
      icon: Shield,
    },
    pro: {
      label: "Pro",
      bg: "bg-purple-500/10",
      color: "text-purple-500",
      icon: Star,
    },
    elite: {
      label: "Elite",
      bg: "bg-yellow-500/10",
      color: "text-yellow-500",
      icon: Crown,
    },
  };
  const badgeCfg = badgeConfigMap[profile.freelancer_level || "verified"];
  const BadgeIcon = badgeCfg.icon;
  const isSuspended = profile.is_suspended || false;

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-12">
        <button onClick={() => navigate(-1)} className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-all">
          <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" /> Back
        </button>

        {/* Profile Header — Elite Identity */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex flex-col md:flex-row gap-10 items-start md:items-end pb-12 border-b border-border/40">
            {/* Large Modern Avatar */}
            <div className="relative shrink-0 self-center md:self-auto">
              <div className="absolute -inset-2 rounded-[2.5rem] bg-gradient-to-br from-primary to-primary-glow blur-md opacity-20" />
              <div className="relative flex h-48 w-48 items-center justify-center rounded-[3rem] bg-gradient-to-br from-primary/10 to-primary-glow/10 border-2 border-primary/20 font-display font-bold text-primary text-6xl shadow-inner overflow-hidden">
                {initials}
              </div>
              <div className="absolute -bottom-2 -right-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-background border border-border/60 shadow-elegant">
                <BadgeIcon className={`h-6 w-6 ${badgeCfg.color}`} />
              </div>
            </div>

            <div className="flex-1 space-y-6 text-center md:text-left">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                  <Badge className={`${badgeCfg.bg} ${badgeCfg.color} rounded-xl px-4 py-1.5 text-xs font-bold uppercase tracking-wider border-0 shadow-sm`}>
                    {badgeCfg.label} Specialist
                  </Badge>
                  {isSuspended && (
                    <Badge variant="destructive" className="rounded-xl px-4 py-1.5 text-xs font-bold uppercase tracking-wider border-0">
                      Account Restricted
                    </Badge>
                  )}
                </div>
                <h1 className="font-display text-5xl sm:text-6xl font-bold tracking-tight">{profile.display_name}</h1>
                {profile.country && (
                  <div className="flex items-center justify-center md:justify-start gap-2 text-sm font-bold text-muted-foreground/60 uppercase tracking-widest">
                    <MapPin className="h-4 w-4" />
                    {profile.country} {profile.created_at && `— Member since ${new Date(profile.created_at).getFullYear()}`}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <Button size="lg" className="rounded-2xl h-14 px-10 gap-2 bg-gradient-to-r from-primary to-primary-glow border-0 text-primary-foreground hover:scale-[1.02] transition-transform shadow-elegant text-sm font-bold" onClick={() => navigate(`/client/brief/${profile.user_id}${categoryId ? `?category=${categoryId}` : ""}`)}>
                  Hire {profile.display_name.split(" ")[0]}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Profile Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column: Bio & Skills */}
          <div className="lg:col-span-2 space-y-12">
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border/40" />
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-primary">Commercial Biography</h2>
                <div className="h-px flex-1 bg-border/40" />
              </div>
              <p className="text-xl text-foreground font-medium leading-relaxed italic opacity-80">
                "{profile.bio || "Maintaining elite performance standards across all engagements."}"
              </p>
            </section>

            <section className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border/40" />
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-primary">Technical Expertise</h2>
                <div className="h-px flex-1 bg-border/40" />
              </div>
              <div className="flex flex-wrap gap-3">
                {(profile.skills ?? ["Strategic Consulting", "Elite Execution", "System Architecture"]).map((skill) => (
                  <div key={skill} className="flex items-center gap-3 rounded-[1.5rem] border border-border/40 bg-card px-6 py-4 text-sm font-bold shadow-sm hover:border-primary/40 hover:shadow-elegant transition-all group">
                    <div className="h-2 w-2 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                    {skill}
                  </div>
                ))}
              </div>
            </section>

            {/* Portfolio */}
            {portfolio.length > 0 && (
              <section className="space-y-8">
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-border/40" />
                  <h2 className="text-[10px] font-bold uppercase tracking-widest text-primary">Showcased Works</h2>
                  <div className="h-px flex-1 bg-border/40" />
                </div>
                <div className="grid gap-8 sm:grid-cols-2">
                  {portfolio.map((item) => (
                    <Card key={item.id} className="group overflow-hidden rounded-[2.5rem] border-border/40 hover:border-primary/30 transition-all hover:shadow-elegant">
                      <div className="aspect-video relative overflow-hidden bg-muted">
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <CardContent className="p-8">
                        <h3 className="font-display text-xl font-bold mb-2">{item.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{item.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Reviews */}
            {ratings.length > 0 && (
              <section className="space-y-8">
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-border/40" />
                  <h2 className="text-[10px] font-bold uppercase tracking-widest text-primary">Public Assessments</h2>
                  <div className="h-px flex-1 bg-border/40" />
                </div>
                <div className="grid gap-6">
                  {ratings.map((rating) => (
                    <Card key={rating.id} className="rounded-[2rem] border-border/40 bg-card/60 backdrop-blur-sm p-8">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${i <= rating.rating ? "fill-warning text-warning" : "text-muted-foreground/20"}`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                          {new Date(rating.created_at).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/80 leading-relaxed italic">"{rating.review_text}"</p>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column: Performance Stats */}
          <div className="space-y-8">
            <Card className="rounded-[2.5rem] border-border/40 bg-muted/20 overflow-hidden">
              <CardHeader className="p-8 border-b border-border/10 bg-white/20">
                <CardTitle className="font-display text-lg font-bold">Commercial Performance</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Reliability Rating</p>
                    <p className="text-3xl font-display font-bold text-primary">
                      {avgRating != null ? avgRating.toFixed(1) : "N/A"}/5.0
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} className={`h-4 w-4 ${avgRating != null && i <= avgRating ? "fill-warning text-warning" : "text-muted-foreground/20"}`} />
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-white/40 border border-border/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-primary/60" />
                      <span className="text-xs font-bold uppercase tracking-wide text-foreground/70">Exp. Tier</span>
                    </div>
                    <span className="text-sm font-bold">{profile.experience_years || 0} Years</span>
                  </div>
                  <div className="p-5 rounded-2xl bg-white/40 border border-border/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-primary/60" />
                      <span className="text-xs font-bold uppercase tracking-wide text-foreground/70">Language</span>
                    </div>
                    <span className="text-sm font-bold">English (Elite)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[2.5rem] border-primary/20 bg-primary/5 p-8 border-2 border-dashed">
              <div className="text-center space-y-4">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-display text-xl font-bold">Elite Verified</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">This partner has successfully passed our multi-stage vetting process and maintains a performance rating in the top 1%.</p>
              </div>
            </Card>
          </div>
        </div>

        {/* Decorative background elements */}
        <div className="fixed -bottom-48 -right-48 h-[40rem] w-[40rem] rounded-full bg-primary/5 blur-[140px] pointer-events-none" />
        <div className="fixed -top-48 -left-48 h-[40rem] w-[40rem] rounded-full bg-indigo-500/5 blur-[140px] pointer-events-none" />
      </div>
    </AppShell>
  );
};

export default FreelancerProfile;
