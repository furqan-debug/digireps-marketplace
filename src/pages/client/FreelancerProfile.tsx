import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Clock, Briefcase, ArrowLeft, Loader2, Crown, Shield } from "lucide-react";
import { motion } from "framer-motion";

const LEVEL_CONFIG: Record<string, { icon: React.ElementType; label: string; className: string }> = {
  verified: { icon: Shield, label: "Verified", className: "bg-secondary text-secondary-foreground" },
  pro:      { icon: Star,   label: "Pro",      className: "bg-primary/10 text-primary" },
  elite:    { icon: Crown,  label: "Elite",    className: "bg-warning/15 text-warning" },
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
};

type PortfolioItem = { id: string; title: string; description: string | null; image_url: string };
type Rating = { id: string; rating: number; review_text: string | null; created_at: string };

const StarRow = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <Star key={n} className={`h-3.5 w-3.5 ${n <= rating ? "fill-warning text-warning" : "text-muted"}`} />
    ))}
  </div>
);

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
};

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

  const level = profile.freelancer_level ?? "verified";
  const lvlCfg = LEVEL_CONFIG[level];
  const LvlIcon = lvlCfg.icon;
  const initials = profile.display_name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-7">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        {/* Hero Card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="overflow-hidden">
            {/* Gradient header band */}
            <div className="h-28 bg-gradient-to-br from-primary via-primary-glow to-accent relative">
              <div className="absolute inset-0 bg-black/10" />
            </div>
            <CardContent className="pt-0">
              {/* Avatar */}
              <div className="-mt-10 mb-4 flex items-end justify-between">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-primary-glow blur-md opacity-50" />
                  <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-primary/30 to-primary-glow/20 border-4 border-card flex items-center justify-center font-display font-bold text-primary text-3xl shadow-elegant">
                    {initials}
                  </div>
                </div>
                <Button
                  className="bg-gradient-to-r from-primary to-primary-glow border-0 text-primary-foreground hover:opacity-90 shadow-elegant gap-2 px-6"
                  onClick={() => navigate(`/client/brief/${profile.user_id}${categoryId ? `?category=${categoryId}` : ""}`)}
                >
                  Hire {profile.display_name.split(" ")[0]}
                </Button>
              </div>

              {/* Name + level */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <h1 className="font-display text-2xl font-bold">{profile.display_name}</h1>
                <Badge className={`${lvlCfg.className} gap-1 text-sm`}>
                  <LvlIcon className="h-3 w-3" />
                  {lvlCfg.label}
                </Badge>
              </div>

              {/* Stats pills */}
              <div className="flex flex-wrap gap-2 mb-4">
                {profile.country && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />{profile.country}
                  </span>
                )}
                {profile.timezone && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />{profile.timezone}
                  </span>
                )}
                {profile.experience_years != null && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
                    <Briefcase className="h-3 w-3" />{profile.experience_years}y experience
                  </span>
                )}
                {avgRating != null && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-warning/30 bg-warning/10 px-3 py-1 text-xs text-warning font-medium">
                    <Star className="h-3 w-3 fill-warning" />{avgRating.toFixed(1)} ({ratings.length} review{ratings.length !== 1 ? "s" : ""})
                  </span>
                )}
              </div>

              {profile.bio && (
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{profile.bio}</p>
              )}

              {(profile.skills ?? []).length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {profile.skills!.map((s) => (
                    <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Portfolio */}
        {portfolio.length > 0 && (
          <div>
            <h2 className="font-display text-xl font-semibold mb-4">Portfolio</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {portfolio.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.4 }}
                  className="group relative rounded-2xl overflow-hidden border border-border/60 shadow-sm"
                >
                  <div className="aspect-[4/3] bg-muted overflow-hidden">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  {/* Title overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <div>
                      <p className="text-sm font-semibold text-white">{item.title}</p>
                      {item.description && (
                        <p className="text-xs text-white/75 mt-0.5">{item.description}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        {ratings.length > 0 && (
          <div>
            <h2 className="font-display text-xl font-semibold mb-4">
              Reviews
              <span className="ml-2 text-sm font-normal text-muted-foreground">({ratings.length})</span>
            </h2>
            <div className="space-y-3">
              {ratings.map((r, i) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                >
                  <Card>
                    <CardContent className="pt-4 pb-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <StarRow rating={r.rating} />
                        <span className="text-xs text-muted-foreground/60">{timeAgo(r.created_at)}</span>
                      </div>
                      {r.review_text && (
                        <p className="text-sm text-muted-foreground">{r.review_text}</p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default FreelancerProfile;
