import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Clock, Briefcase, ArrowLeft, Loader2, CheckCircle } from "lucide-react";

const LEVEL_COLOR: Record<string, string> = {
  verified: "bg-secondary text-secondary-foreground",
  pro: "bg-primary/10 text-primary",
  elite: "bg-warning/15 text-warning",
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
      <Star
        key={n}
        className={`h-4 w-4 ${n <= rating ? "fill-warning text-warning" : "text-muted"}`}
      />
    ))}
  </div>
);

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

  const avgRating =
    ratings.length > 0
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

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        {/* Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-display font-bold text-2xl">
                {profile.display_name[0].toUpperCase()}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display text-2xl font-bold">{profile.display_name}</h1>
                  <Badge className={LEVEL_COLOR[profile.freelancer_level ?? "verified"]}>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {profile.freelancer_level ?? "verified"}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  {profile.country && (
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{profile.country}</span>
                  )}
                  {profile.timezone && (
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{profile.timezone}</span>
                  )}
                  {profile.experience_years != null && (
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-3 w-3" />{profile.experience_years}y experience
                    </span>
                  )}
                  {avgRating != null && (
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-warning text-warning" />
                      {avgRating.toFixed(1)} ({ratings.length} review{ratings.length !== 1 ? "s" : ""})
                    </span>
                  )}
                </div>
                {profile.bio && (
                  <p className="text-sm text-muted-foreground leading-relaxed">{profile.bio}</p>
                )}
                {(profile.skills ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {profile.skills!.map((s) => (
                      <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                className="gap-2"
                onClick={() =>
                  navigate(`/client/brief/${profile.user_id}${categoryId ? `?category=${categoryId}` : ""}`)
                }
              >
                Hire {profile.display_name.split(" ")[0]}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio */}
        {portfolio.length > 0 && (
          <div>
            <h2 className="font-display text-xl font-semibold mb-3">Portfolio</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {portfolio.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <div className="aspect-video bg-muted overflow-hidden">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  {item.title && (
                    <CardContent className="py-3">
                      <p className="text-sm font-medium">{item.title}</p>
                      {item.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                      )}
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        {ratings.length > 0 && (
          <div>
            <h2 className="font-display text-xl font-semibold mb-3">Reviews</h2>
            <div className="space-y-3">
              {ratings.map((r) => (
                <Card key={r.id}>
                  <CardContent className="pt-4 pb-4">
                    <StarRow rating={r.rating} />
                    {r.review_text && (
                      <p className="mt-2 text-sm text-muted-foreground">{r.review_text}</p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground/60">
                      {new Date(r.created_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default FreelancerProfile;
