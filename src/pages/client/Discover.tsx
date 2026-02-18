import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Code, Palette, Video, PenTool, Smartphone, Star, MapPin, ArrowRight, Loader2 } from "lucide-react";

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  "Web Development": Code,
  "UI/UX Design": Palette,
  "Video Editing": Video,
  "Copywriting": PenTool,
  "Mobile Development": Smartphone,
};

const LEVEL_COLOR: Record<string, string> = {
  verified: "bg-secondary text-secondary-foreground",
  pro: "bg-primary/10 text-primary",
  elite: "bg-warning/15 text-warning-foreground",
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

    // Get freelancer_ids that offer this service
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

    // Get approved, non-suspended freelancer profiles
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, user_id, display_name, country, bio, skills, experience_years, freelancer_level")
      .in("user_id", ids)
      .eq("application_status", "approved")
      .eq("is_suspended", false)
      .order("freelancer_level", { ascending: false })
      .limit(10);

    // Fetch avg ratings for each
    const withRatings = await Promise.all(
      (profiles ?? []).map(async (p) => {
        const { data: ratings } = await supabase
          .from("ratings")
          .select("rating")
          .eq("reviewee_id", p.user_id);
        const avg =
          ratings && ratings.length > 0
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
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold">Find Talent</h1>
          <p className="text-muted-foreground mt-1">
            Choose a service to see matched, vetted freelancers.
          </p>
        </div>

        {/* Categories */}
        {catLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {categories.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.name] ?? Code;
              const active = selectedCategory?.id === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat)}
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-sm font-medium transition-all
                    ${active
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border bg-card hover:border-primary/40 hover:shadow-sm text-foreground"
                    }`}
                >
                  <Icon className="h-7 w-7" />
                  <span className="text-center leading-tight">{cat.name}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Freelancer Results */}
        {selectedCategory && (
          <div className="space-y-4">
            <h2 className="font-display text-xl font-semibold">
              {selectedCategory.name} Freelancers
            </h2>

            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : freelancers.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No approved freelancers available for this category yet.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {freelancers.map((f) => (
                  <Card key={f.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="font-display text-lg">{f.display_name}</CardTitle>
                          {f.country && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                              <MapPin className="h-3 w-3" />
                              {f.country}
                            </div>
                          )}
                        </div>
                        <Badge className={LEVEL_COLOR[f.freelancer_level ?? "verified"]}>
                          {f.freelancer_level ?? "verified"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {f.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{f.bio}</p>
                      )}
                      <div className="flex flex-wrap gap-1.5">
                        {(f.skills ?? []).slice(0, 5).map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {f.avg_rating != null && (
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-warning text-warning" />
                              {f.avg_rating.toFixed(1)}
                            </span>
                          )}
                          {f.experience_years != null && (
                            <span>{f.experience_years}y exp</span>
                          )}
                        </div>
                        <Button
                          size="sm"
                          className="gap-1.5"
                          onClick={() =>
                            navigate(`/client/freelancer/${f.user_id}?category=${selectedCategory.id}`)
                          }
                        >
                          View Profile <ArrowRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default Discover;
