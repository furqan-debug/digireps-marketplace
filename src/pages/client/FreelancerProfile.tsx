import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin, ArrowLeft, Star, Crown, Shield, Award,
  Loader2, Globe, Sparkles, CheckCircle, ExternalLink,
  MessageSquare, Briefcase, Calendar, Zap, FileText, PlayCircle, Image,
  ShieldCheck as ShieldCheckIcon, GraduationCap, Languages, Clock, DollarSign
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getActivityStatus } from "@/lib/activity-status";
import { getVerifiedStatus } from "@/lib/verified-badge";

type Profile = {
  id: string;
  user_id: string;
  display_name: string;
  headline: string | null;
  country: string | null;
  timezone: string | null;
  bio: string | null;
  skills: string[] | null;
  experience_years: number | null;
  freelancer_level: "verified" | "pro" | "elite" | null;
  avatar_url: string | null;
  is_suspended?: boolean;
  created_at?: string;
  last_active_at: string | null;
  certifications: any[] | null;
  hourly_rate?: number | null;
  work_experience?: any[];
  education?: any[];
  languages?: any[];
  availability_status?: string | null;
  response_time_expectation?: string | null;
  profile_completion_score?: number;
  application_status?: string | null;
};

type PortfolioItem = {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  project_data?: any[];
};

type Rating = {
  id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  reviewer_name?: string;
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
    window.scrollTo(0, 0);

    const fetchData = async () => {
      try {
        const [profileRes, portfolioRes, ratingsRes] = await Promise.all([
          supabase.from("profiles").select("*").eq("user_id", freelancerId).single(),
          supabase.from("portfolio_items").select("*").eq("freelancer_id", freelancerId),
          supabase.from("ratings").select("*").eq("reviewee_id", freelancerId).order("created_at", { ascending: false }),
        ]);

        if (profileRes.data) setProfile(profileRes.data as unknown as Profile);
        if (portfolioRes.data) setPortfolio(portfolioRes.data as unknown as PortfolioItem[]);
        if (ratingsRes.data) setRatings(ratingsRes.data ?? []);
      } catch (err) {
        console.error("Error fetching freelancer details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [freelancerId]);

  const avgRating = ratings.length > 0
    ? ratings.reduce((s, r) => s + r.rating, 0) / ratings.length
    : null;

  if (loading) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
          <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading Elite Talent...</p>
        </div>
      </AppShell>
    );
  }

  if (!profile) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto py-24 text-center space-y-6">
          <div className="h-20 w-20 rounded-3xl bg-muted/20 flex items-center justify-center mx-auto">
            <Shield className="h-10 w-10 text-muted-foreground/40" />
          </div>
          <h1 className="text-3xl font-bold">Talent Unavailable</h1>
          <p className="text-muted-foreground">The requested freelancer profile is no longer public or was recently moved.</p>
          <Button onClick={() => navigate("/client/discover")} variant="outline" className="rounded-2xl">Return to Discovery</Button>
        </div>
      </AppShell>
    );
  }

  const initials = profile.display_name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  const activity = getActivityStatus(profile.last_active_at);
  const certs = (profile.certifications ?? []) as { name: string; issuer: string; year: number; verified: boolean }[];
  const verified = getVerifiedStatus({ application_status: profile.application_status ?? null, is_suspended: profile.is_suspended ?? false, profile_completion_score: profile.profile_completion_score ?? 0 });
  const workExp = (profile.work_experience ?? []) as { title: string; company: string; description: string; start_year: number; end_year: number | null; is_current: boolean }[];
  const eduList = (profile.education ?? []) as { degree: string; institution: string; year: number }[];
  const langList = (profile.languages ?? []) as { language: string; proficiency: string }[];

  const levelConfigs = {
    verified: { label: "Verified", color: "text-blue-500", icon: Shield, gradient: "from-blue-500/20 to-cyan-500/5" },
    pro: { label: "Pro Elite", color: "text-purple-500", icon: Star, gradient: "from-purple-500/20 to-pink-500/5" },
    elite: { label: "Master Class", color: "text-yellow-600", icon: Crown, gradient: "from-amber-500/20 to-yellow-500/5" },
  };
  const config = levelConfigs[profile.freelancer_level || "verified"];
  const LevelIcon = config.icon;

  const getVideoId = (url: string) => {
    if (!url) return null;
    const ytMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/);
    if (ytMatch && ytMatch[1]) return ytMatch[1].split('&')[0];
    return null;
  };

  return (
    <AppShell>
      <div className="relative isolate">
        {/* Dynamic Background */}
        <div className="absolute inset-x-0 top-0 -z-10 h-[500px] overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-b ${config.gradient} to-background`} />
          <div className="absolute top-[10%] left-[15%] h-64 w-64 rounded-full bg-primary/10 blur-[100px]" />
          <div className="absolute top-[20%] right-[10%] h-96 w-96 rounded-full bg-indigo-500/5 blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8 space-y-12">
          {/* Top Navbar */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-all group px-4 py-2 rounded-xl hover:bg-white/50 backdrop-blur-sm border border-transparent hover:border-border/40"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to Search
            </button>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" className="hidden sm:flex rounded-xl gap-2 h-10 border-border/40 font-bold text-xs uppercase tracking-wider">
                <ExternalLink className="h-3.5 w-3.5" /> Share
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1fr_400px] gap-12 items-start">
            {/* Main Content */}
            <div className="space-y-16">
              {/* Profile Card Header */}
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative p-1 bg-gradient-to-br from-white/80 to-white/20 rounded-[3rem] border border-white/40 shadow-elegant backdrop-blur-md"
              >
                <div className="p-8 sm:p-12 flex flex-col md:flex-row gap-10 items-center md:items-start text-center md:text-left">
                  {/* Photo Section */}
                  <div className="relative group">
                    <div className="absolute -inset-1 rounded-[2.8rem] bg-gradient-to-br from-primary to-primary/40 blur-md opacity-0 group-hover:opacity-30 transition-opacity" />
                    <div className="relative h-44 w-44 sm:h-52 sm:w-52 rounded-[2.5rem] bg-card border-4 border-white shadow-2xl overflow-hidden ring-1 ring-border/20">
                      {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt={profile.display_name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center font-display font-bold text-primary text-6xl">
                          {initials}
                        </div>
                      )}
                    </div>
                    {/* Level Badge Overlay */}
                    <div className="absolute -bottom-3 -right-3 h-14 w-14 rounded-2xl bg-background border border-border/40 shadow-elegant flex items-center justify-center">
                      <LevelIcon className={`h-7 w-7 ${config.color}`} />
                    </div>
                  </div>

                  {/* Identity Detail */}
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                      <Badge className={`rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-widest border-0 shadow-sm transition-transform cursor-default ${config.color} bg-white/80`}>
                        {config.label}
                      </Badge>
                      {verified.isVerified && (
                        <Badge className="rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-widest border-0 shadow-sm bg-blue-500/10 text-blue-600 gap-1">
                          <ShieldCheckIcon className="h-3 w-3" /> Verified
                        </Badge>
                      )}
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border border-border/10 text-[10px] font-black uppercase tracking-widest ${activity.status === "online" ? "bg-emerald-50 text-emerald-600" : "bg-muted/30 text-muted-foreground"}`}>
                        <div className={`h-1.5 w-1.5 rounded-full ${activity.color} ${activity.status === "online" ? "animate-pulse" : ""}`} />
                        {activity.label}
                      </div>
                    </div>

                    <h1 className="font-display text-4xl sm:text-6xl font-black tracking-tight text-foreground leading-[1.1]">
                      {profile.display_name}
                    </h1>

                    {profile.headline && (
                      <p className="text-xl sm:text-2xl text-muted-foreground/80 font-medium leading-relaxed max-w-xl">
                        {profile.headline}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-bold text-muted-foreground uppercase tracking-widest pt-2">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3 text-primary/60" /> {profile.country}
                      </div>
                      <div className="h-1 w-1 rounded-full bg-border" />
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3 text-primary/60" /> Joined {new Date(profile.created_at || "").getFullYear()}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Bio & Skills */}
              <div className="grid md:grid-cols-1 gap-16">
                <section className="space-y-6">
                  <div className="flex items-center gap-4">
                    <h2 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                      <Zap className="h-4 w-4 bg-primary/10 p-0.5 rounded" /> The Vision
                    </h2>
                    <div className="h-px flex-1 bg-gradient-to-r from-border/80 to-transparent" />
                  </div>
                  <div className="relative p-8 sm:p-10 rounded-[2.5rem] bg-card border border-border/40 shadow-sm overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 text-primary/5 select-none pointer-events-none group-hover:scale-110 transition-transform duration-700">
                      <Shield className="h-32 w-32" />
                    </div>
                    <p className="relative text-lg sm:text-xl text-foreground font-medium italic leading-relaxed whitespace-pre-wrap leading-[1.8]">
                      "{profile.bio || "Excellence in every pixel, code line, and strategy implementation."}"
                    </p>
                  </div>
                </section>

                <section className="space-y-6">
                  <div className="flex items-center gap-4">
                    <h2 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                      <Crown className="h-4 w-4 bg-primary/10 p-0.5 rounded" /> Core Specialties
                    </h2>
                    <div className="h-px flex-1 bg-gradient-to-r from-border/80 to-transparent" />
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {(profile.skills ?? []).map((skill, i) => (
                      <motion.div
                        key={skill}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="group flex items-center gap-3 px-6 py-4 rounded-2xl bg-white border border-border/40 shadow-sm hover:border-primary/40 hover:shadow-elegant transition-all cursor-default"
                      >
                        <div className="h-2 w-2 rounded-full bg-primary/20 group-hover:bg-primary transition-colors" />
                        <span className="text-[13px] font-black uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">{skill}</span>
                      </motion.div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Work Experience Timeline */}
              {workExp.length > 0 && (
                <section className="space-y-6">
                  <div className="flex items-center gap-4">
                    <h2 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                      <Briefcase className="h-4 w-4 bg-primary/10 p-0.5 rounded" /> Work Experience
                    </h2>
                    <div className="h-px flex-1 bg-gradient-to-r from-border/80 to-transparent" />
                  </div>
                  <div className="space-y-4">
                    {workExp.map((we, i) => (
                      <div key={i} className="relative pl-8 pb-6 border-l-2 border-primary/10 last:border-l-0 last:pb-0">
                        <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-primary/20 border-2 border-background" />
                        <div className="p-6 rounded-[2rem] bg-white/50 border border-border/40 hover:shadow-sm transition-all">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-black text-base tracking-tight">{we.title}</h3>
                              <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest mt-1">{we.company}</p>
                            </div>
                            <Badge variant="secondary" className="text-[9px] font-bold">{we.start_year} – {we.is_current ? "Present" : we.end_year}</Badge>
                          </div>
                          {we.description && <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{we.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Education */}
              {eduList.length > 0 && (
                <section className="space-y-6">
                  <div className="flex items-center gap-4">
                    <h2 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 bg-primary/10 p-0.5 rounded" /> Education
                    </h2>
                    <div className="h-px flex-1 bg-gradient-to-r from-border/80 to-transparent" />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {eduList.map((ed, i) => (
                      <div key={i} className="p-6 rounded-[2rem] bg-white/50 border border-border/40">
                        <h3 className="font-black text-sm tracking-tight">{ed.degree}</h3>
                        <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest mt-1">{ed.institution} &bull; {ed.year}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Languages */}
              {langList.length > 0 && (
                <section className="space-y-6">
                  <div className="flex items-center gap-4">
                    <h2 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                      <Languages className="h-4 w-4 bg-primary/10 p-0.5 rounded" /> Languages
                    </h2>
                    <div className="h-px flex-1 bg-gradient-to-r from-border/80 to-transparent" />
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {langList.map((lang, i) => (
                      <div key={i} className="px-5 py-3 rounded-2xl bg-white/50 border border-border/40 flex items-center gap-3">
                        <span className="font-black text-sm">{lang.language}</span>
                        <Badge variant="secondary" className="text-[9px] font-bold capitalize">{lang.proficiency}</Badge>
                      </div>
                    ))}
                  </div>
                </section>
              )}


              {portfolio.length > 0 && (
                <section className="space-y-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <h2 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                        <Briefcase className="h-4 w-4 bg-primary/10 p-0.5 rounded" /> Commercial Case Studies
                      </h2>
                      <div className="h-px flex-1 bg-gradient-to-r from-border/80 to-transparent" />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-10">
                    {portfolio.map((item, i) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        viewport={{ once: true }}
                        className="group relative flex flex-col rounded-[2.5rem] bg-card border border-border/40 shadow-sm hover:shadow-elegant hover:border-primary/20 transition-all overflow-hidden"
                      >
                        <div className="aspect-[16/10] relative overflow-hidden bg-muted">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.title} className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-transparent">
                              <Briefcase className="h-12 w-12 text-primary/10" />
                            </div>
                          )}
                          {/* Media Type Icon */}
                          <div className="absolute top-6 right-6">
                            {item.project_data?.some(b => b.type === 'video') && (
                              <div className="h-10 w-10 rounded-xl bg-white/90 backdrop-blur-md shadow-xl flex items-center justify-center">
                                <PlayCircle className="h-5 w-5 text-primary" />
                              </div>
                            )}
                            {!item.project_data?.some(b => b.type === 'video') && (
                              <div className="h-10 w-10 rounded-xl bg-white/90 backdrop-blur-md shadow-xl flex items-center justify-center">
                                <Image className="h-5 w-5 text-muted-foreground/40" />
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="p-8 space-y-3">
                          <h3 className="font-display text-2xl font-black tracking-tight text-foreground group-hover:text-primary transition-colors">{item.title}</h3>
                          <p className="text-sm text-muted-foreground/80 leading-relaxed line-clamp-2 font-medium">
                            {item.description}
                          </p>
                          <div className="pt-4 flex items-center gap-2">
                            <Button variant="ghost" className="rounded-xl h-10 px-4 text-xs font-black uppercase tracking-widest text-primary bg-primary/5 hover:bg-primary/10">
                              View Case Study
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}

              {/* Verified Credentials */}
              {certs.length > 0 && (
                <section className="space-y-8">
                  <div className="flex items-center gap-4">
                    <h2 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                      <Award className="h-4 w-4 bg-primary/10 p-0.5 rounded" /> Verified Credentials
                    </h2>
                    <div className="h-px flex-1 bg-gradient-to-r from-border/80 to-transparent" />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {certs.map((cert, idx) => (
                      <div key={idx} className="group p-6 rounded-[2rem] border border-border/40 bg-white/50 backdrop-blur-sm hover:bg-white hover:border-primary/20 transition-all flex items-center gap-5">
                        <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${cert.verified ? "bg-primary/10 ring-1 ring-primary/20" : "bg-muted"}`}>
                          {cert.verified ? <CheckCircle className="h-7 w-7 text-primary" /> : <Award className="h-7 w-7 text-muted-foreground" />}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-black text-sm uppercase tracking-tight">{cert.name}</h3>
                          </div>
                          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">{cert.issuer} • {cert.year}</p>
                          {cert.verified && <span className="inline-block text-[9px] font-black uppercase tracking-[0.2em] text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Trust Verified</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar Sticky Panel */}
            <div className="lg:sticky lg:top-8 space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative p-1 bg-gradient-to-br from-primary to-primary/60 rounded-[3rem] shadow-elegant overflow-hidden"
              >
                <div className="bg-card rounded-[2.8rem] p-8 sm:p-10 space-y-10">
                  <div className="space-y-2 text-center">
                    <p className="text-[11px] font-black uppercase tracking-widest text-primary">Service Performance</p>
                    <div className="flex items-end justify-center gap-2">
                      <span className="text-5xl font-display font-black tracking-tighter">{avgRating != null ? avgRating.toFixed(1) : "5.0"}</span>
                      <div className="pb-2">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(i => (
                            <Star key={i} className={`h-4 w-4 ${(avgRating != null ? i <= avgRating : i <= 5) ? "fill-warning text-warning" : "text-muted-foreground/20"}`} />
                          ))}
                        </div>
                        <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest mt-1">From {ratings.length || 0} Reviews</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-5 rounded-[1.5rem] bg-muted/20 border border-border/10">
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-primary/40" />
                        <span className="text-xs font-black uppercase tracking-widest text-muted-foreground/80">Experience</span>
                      </div>
                      <span className="text-sm font-black">{profile.experience_years || 0}+ Years</span>
                    </div>
                    {profile.hourly_rate != null && profile.hourly_rate > 0 && (
                      <div className="flex items-center justify-between p-5 rounded-[1.5rem] bg-muted/20 border border-border/10">
                        <div className="flex items-center gap-3">
                          <DollarSign className="h-5 w-5 text-primary/40" />
                          <span className="text-xs font-black uppercase tracking-widest text-muted-foreground/80">Rate</span>
                        </div>
                        <span className="text-sm font-black">${profile.hourly_rate}/hr</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between p-5 rounded-[1.5rem] bg-muted/20 border border-border/10">
                      <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 text-primary/40" />
                        <span className="text-xs font-black uppercase tracking-widest text-muted-foreground/80">Availability</span>
                      </div>
                      <span className={`text-xs font-black uppercase tracking-widest ${profile.availability_status === "available" ? "text-emerald-600" : profile.availability_status === "limited" ? "text-amber-600" : "text-muted-foreground"}`}>
                        {profile.availability_status === "available" ? "Available" : profile.availability_status === "limited" ? "Limited" : profile.availability_status === "unavailable" ? "Unavailable" : "Available"}
                      </span>
                    </div>
                    {profile.response_time_expectation && (
                      <div className="flex items-center justify-between p-5 rounded-[1.5rem] bg-muted/20 border border-border/10">
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-primary/40" />
                          <span className="text-xs font-black uppercase tracking-widest text-muted-foreground/80">Response</span>
                        </div>
                        <span className="text-sm font-black">{profile.response_time_expectation}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <Button
                      size="lg"
                      className="w-full rounded-[1.5rem] h-16 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg text-sm font-black uppercase tracking-[0.2em] transform transition hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
                      onClick={() => navigate(`/client/brief/${profile.user_id}${categoryId ? `?category=${categoryId}` : ""}`)}
                    >
                      Secure Services <ShieldCheckIcon className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full rounded-[1.5rem] h-16 border-border/40 text-sm font-black uppercase tracking-[0.2em] hover:bg-muted/30 transition-colors flex items-center justify-center gap-3"
                    >
                      Messenger <MessageSquare className="h-5 w-5" />
                    </Button>
                  </div>

                  <div className="pt-6 border-t border-border/10 text-center">
                    <p className="text-[10px] font-bold text-muted-foreground/60 leading-relaxed px-4 uppercase tracking-[0.05em]">
                      All transactions are secured by DigiReps Enterprise Protection.
                    </p>
                  </div>
                </div>
              </motion.div>

              <Card className="rounded-[2.5rem] border border-border/40 bg-white/40 backdrop-blur-sm p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-widest">Vetting Status</h3>
                </div>
                <p className="text-sm font-medium leading-relaxed text-muted-foreground">
                  This partner is one of the top 3% of talent on DigiReps, having passed our comprehensive skills and portfolio verification process.
                </p>
                <div className="space-y-3">
                  {['Identity Verified', 'Portfolio Screened', 'Performance Tracked'].map(check => (
                    <div key={check} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-foreground/70">
                      <CheckCircle className="h-4 w-4 text-emerald-500" /> {check}
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default FreelancerProfile;
