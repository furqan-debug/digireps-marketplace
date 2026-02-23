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
    verified: {
      label: "Verified Talent",
      color: "text-blue-500",
      icon: Shield,
      glow: "bg-blue-500/10",
      accent: "border-blue-500/20",
      ring: "ring-blue-500/5"
    },
    pro: {
      label: "Pro Elite",
      color: "text-purple-500",
      icon: Star,
      glow: "bg-purple-500/15",
      accent: "border-purple-500/30",
      ring: "ring-purple-500/10"
    },
    elite: {
      label: "Master Class",
      color: "text-amber-600",
      icon: Crown,
      glow: "bg-amber-500/20",
      accent: "border-amber-500/40",
      ring: "ring-amber-500/20"
    },
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
      <div className="relative isolate min-h-screen bg-background">
        {/* Dynamic Background */}
        <div className="absolute inset-x-0 top-0 -z-10 h-[500px] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] via-transparent to-transparent" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-full max-w-4xl bg-primary/[0.02] blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8 space-y-12">
          {/* Top Navbar */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-all group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to Search
            </button>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" className="hidden sm:flex rounded-xl gap-2 h-9 border-border/40 font-bold text-[10px] uppercase tracking-widest shadow-sm">
                <ExternalLink className="h-3.5 w-3.5" /> Share
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1fr_380px] gap-12 items-start">
            {/* Main Content Column */}
            <div className="space-y-20">
              {/* Profile Header Card - Editorial Look */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="dossier-card relative bg-white border border-border/40 rounded-[2.5rem] p-10 sm:p-14 flex flex-col md:flex-row gap-12 items-center md:items-start text-center md:text-left shadow-2xl shadow-black/[0.02]"
              >
                {/* Level Specific Glow Background */}
                <div className={`absolute -top-24 -left-24 h-96 w-96 rounded-full blur-[120px] opacity-20 ${config.glow} transition-colors duration-1000`} />

                {/* Photo Section */}
                <div className="relative shrink-0 group">
                  <div className={`h-48 w-48 sm:h-64 sm:w-64 rounded-[2rem] bg-muted border-[6px] border-white shadow-xl overflow-hidden ring-4 ${config.ring} transition-all duration-500 group-hover:scale-[1.02]`}>
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt={profile.display_name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    ) : (
                      <div className="h-full w-full bg-primary/5 flex items-center justify-center font-display font-bold text-primary text-6xl">
                        {initials}
                      </div>
                    )}
                  </div>
                  {/* Level Badge Overlay - Premium Floating Tag */}
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white border border-border/40 px-5 py-2.5 rounded-2xl shadow-lg backdrop-blur-md">
                    <LevelIcon className={`h-4 w-4 ${config.color}`} />
                    <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${config.color}`}>
                      {config.label}
                    </span>
                  </div>
                </div>

                {/* Identity Detail */}
                <div className="flex-1 pt-4 space-y-8">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
                    {verified.isVerified && (
                      <Badge className="rounded-xl px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest bg-blue-500/5 text-blue-600 border border-blue-500/10 flex items-center gap-2">
                        <CheckCircle className="h-3.5 w-3.5" /> ID Verified
                      </Badge>
                    )}
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full ${activity.color} ${activity.status === "online" ? "animate-pulse" : ""}`} />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">{activity.label}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-foreground leading-[1.1]">
                      {profile.display_name}
                    </h1>
                    {profile.headline && (
                      <p className="text-xl sm:text-2xl text-muted-foreground font-medium leading-relaxed max-w-2xl italic">
                        {profile.headline}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-8 text-[11px] font-bold text-muted-foreground/60 uppercase tracking-[0.15em] pt-2 border-t border-border/10">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary/30" /> {profile.country}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary/30" /> Est. {new Date(profile.created_at || "").getFullYear()}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Information Sections */}
              <div className="space-y-16">
                {/* BIO */}
                <section className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">01</div>
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary flex items-center gap-3">
                      <FileText className="h-4 w-4" /> Professional Summary
                    </h2>
                    <div className="h-px flex-1 bg-border/40" />
                  </div>
                  <div className="dossier-card p-10 sm:p-14 rounded-[2rem] bg-white border border-border/40 shadow-xl shadow-black/[0.01] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary/10" />
                    <p className="text-xl text-foreground font-medium leading-relaxed whitespace-pre-wrap italic">
                      "{profile.bio || "Excellence in every pixel, code line, and strategy implementation."}"
                    </p>
                  </div>
                </section>

                {/* SKILLS */}
                <section className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">02</div>
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary flex items-center gap-3">
                      <Award className="h-4 w-4" /> Core Specialties
                    </h2>
                    <div className="h-px flex-1 bg-border/40" />
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {(profile.skills ?? []).map((skill, i) => (
                      <div
                        key={skill}
                        className="px-6 py-3 rounded-xl bg-white border border-border/60 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground hover:border-primary/40 hover:text-primary hover:shadow-md transition-all cursor-default"
                      >
                        {skill}
                      </div>
                    ))}
                  </div>
                </section>

                {/* EXPERIENCE */}
                {workExp.length > 0 && (
                  <section className="space-y-6">
                    <div className="flex items-center gap-6">
                      <div className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">03</div>
                      <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary flex items-center gap-3">
                        <Briefcase className="h-4 w-4" /> Work Experience
                      </h2>
                      <div className="h-px flex-1 bg-border/40" />
                    </div>
                    <div className="grid gap-4">
                      {workExp.map((we, i) => (
                        <div key={i} className="dossier-card p-8 rounded-[2rem] bg-white border border-border/40 group hover:border-primary/30 transition-all shadow-sm hover:shadow-xl hover:shadow-black/[0.02]">
                          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                            <div className="space-y-1">
                              <h3 className="font-bold text-lg text-foreground tracking-tight">{we.title}</h3>
                              <p className="text-[11px] font-bold text-primary uppercase tracking-[0.1em]">{we.company}</p>
                            </div>
                            <span className="text-[10px] font-bold text-muted-foreground/60 border border-border/60 px-4 py-1.5 rounded-[1.25rem] shrink-0">
                              {we.start_year} – {we.is_current ? "Present" : we.end_year}
                            </span>
                          </div>
                          {we.description && <p className="text-sm text-muted-foreground mt-5 leading-relaxed max-w-2xl">{we.description}</p>}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* EDUCATION */}
                {eduList.length > 0 && (
                  <section className="space-y-6">
                    <div className="flex items-center gap-6">
                      <div className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">04</div>
                      <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary flex items-center gap-3">
                        <GraduationCap className="h-4 w-4" /> Education
                      </h2>
                      <div className="h-px flex-1 bg-border/40" />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {eduList.map((ed, i) => (
                        <div key={i} className="dossier-card p-8 rounded-[2rem] bg-white border border-border/40 shadow-sm">
                          <h3 className="font-bold text-base tracking-tight">{ed.degree}</h3>
                          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mt-2">{ed.institution} &bull; {ed.year}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* LANGUAGES */}
                {langList.length > 0 && (
                  <section className="space-y-6">
                    <div className="flex items-center gap-6">
                      <div className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">05</div>
                      <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary flex items-center gap-3">
                        <Languages className="h-4 w-4" /> Languages
                      </h2>
                      <div className="h-px flex-1 bg-border/40" />
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {langList.map((lang, i) => (
                        <div key={i} className="px-6 py-3 rounded-xl bg-white border border-border/40 flex items-center gap-4 shadow-sm">
                          <span className="font-bold text-sm tracking-tight">{lang.language}</span>
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60 bg-primary/5 px-2.5 py-1 rounded-lg">{lang.proficiency}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* PORTFOLIO */}
                {portfolio.length > 0 && (
                  <section className="space-y-8 pt-4">
                    <div className="flex items-center gap-6">
                      <div className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">06</div>
                      <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary flex items-center gap-3">
                        <Briefcase className="h-4 w-4" /> Commercial Portfolio
                      </h2>
                      <div className="h-px flex-1 bg-border/40" />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-8">
                      {portfolio.map((item, i) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.1 }}
                          className="group relative flex flex-col rounded-[2rem] bg-white border border-border/40 hover:border-primary/40 transition-all duration-500 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-black/[0.05]"
                        >
                          <div className="aspect-[16/10] relative overflow-hidden bg-muted">
                            {item.image_url ? (
                              <img src={item.image_url} alt={item.title} className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-primary/5 text-primary/10">
                                <Briefcase className="h-12 w-12" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
                          </div>
                          <div className="p-8 space-y-3">
                            <h3 className="text-2xl font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">{item.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{item.description}</p>
                            <div className="pt-4 flex items-center justify-between">
                              <Button variant="ghost" size="sm" className="rounded-xl text-[10px] font-bold uppercase tracking-[0.15em] text-primary-glow h-auto p-0 hover:bg-transparent">
                                View Case Study
                              </Button>
                              <div className="h-8 w-8 rounded-full border border-border/40 flex items-center justify-center group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-500">
                                <ArrowLeft className="h-3 w-3 rotate-180" />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </section>
                )}

                {/* CERTIFICATIONS */}
                {certs.length > 0 && (
                  <section className="space-y-6">
                    <div className="flex items-center gap-6">
                      <div className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">07</div>
                      <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary flex items-center gap-3">
                        <ShieldCheckIcon className="h-4 w-4" /> Verified Credentials
                      </h2>
                      <div className="h-px flex-1 bg-border/40" />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {certs.map((cert, idx) => (
                        <div key={idx} className="p-8 rounded-[2rem] border border-border/40 bg-white hover:border-primary/40 transition-all flex items-center gap-6 shadow-sm hover:shadow-lg">
                          <div className={`h-11 w-11 rounded-[1rem] flex items-center justify-center shrink-0 shadow-sm ${cert.verified ? "bg-primary/10 text-primary border border-primary/20" : "bg-muted text-muted-foreground"}`}>
                            {cert.verified ? <CheckCircle className="h-6 w-6" /> : <Award className="h-6 w-6" />}
                          </div>
                          <div className="space-y-1">
                            <h3 className="font-bold text-base tracking-tight text-foreground">{cert.name}</h3>
                            <p className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest">{cert.issuer} &bull; {cert.year}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </div>

            {/* Sticky Sidebar */}
            <div className="lg:sticky lg:top-8 space-y-8">
              {/* Performance Card - High Impact */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="dossier-card bg-white border border-border/40 rounded-[2.5rem] p-10 space-y-10 shadow-2xl shadow-black/[0.03] relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />

                <div className="space-y-2 text-center relative">
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">Performance Equity</p>
                  <div className="flex items-center justify-center gap-4">
                    <span className="text-6xl font-bold tracking-tighter text-foreground">{avgRating != null ? avgRating.toFixed(1) : "5.0"}</span>
                    <div className="flex flex-col items-start">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(i => (
                          <Star key={i} className={`h-3.5 w-3.5 ${(avgRating != null ? i <= avgRating : i <= 5) ? "fill-warning text-warning" : "text-muted-foreground/15"}`} />
                        ))}
                      </div>
                      <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-1.5">{ratings.length || 0} Professional Reviews</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { label: "Tenure", value: `${profile.experience_years || 0}+ Years`, icon: Shield },
                    { label: "Base Rate", value: profile.hourly_rate ? `$${profile.hourly_rate}/hr` : "Market", icon: DollarSign },
                    { label: "Presence", value: profile.availability_status || "Available", icon: Globe, status: true },
                    { label: "SLA", value: profile.response_time_expectation || "< 24h", icon: Clock },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between p-5 rounded-2xl bg-muted/30 border border-border/5 group hover:bg-white hover:border-border/40 hover:shadow-sm transition-all duration-300">
                      <div className="flex items-center gap-3">
                        <item.icon className="h-4 w-4 text-primary/30 group-hover:text-primary transition-colors" />
                        <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80">{item.label}</span>
                      </div>
                      <span className={`text-xs font-bold ${item.status ? 'text-primary' : 'text-foreground'}`}>{item.value}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 pt-4">
                  <Button
                    size="lg"
                    className="w-full rounded-[1.25rem] h-16 bg-gradient-to-r from-primary to-primary-glow hover:brightness-110 text-primary-foreground font-bold uppercase tracking-[0.2em] text-[10px] transition-all flex items-center justify-center gap-3 shadow-elegant border-0"
                    onClick={() => navigate(`/client/brief/${profile.user_id}${categoryId ? `?category=${categoryId}` : ""}`)}
                  >
                    Initiate Engagement <Zap className="h-4 w-4 fill-white" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full rounded-[1.25rem] h-16 border-2 border-border/60 text-[10px] font-bold uppercase tracking-[0.2em] hover:border-primary/30 hover:bg-primary/5 transition-all flex items-center justify-center gap-3"
                  >
                    Send Inquiry <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>

                <div className="pt-6 border-t border-border/10 text-center">
                  <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.1em] px-8 leading-relaxed">
                    DigiReps Escrow ensures 100% financial security for all premium engagements.
                  </p>
                </div>
              </motion.div>

              {/* Vetting Status Card - Elite Branding */}
              <Card className="dossier-card rounded-[2rem] border border-border/40 bg-white p-10 space-y-8 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-1 w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary shadow-inner">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.25em]">Talent Verification</h3>
                </div>
                <p className="text-[13px] font-medium leading-relaxed text-muted-foreground italic">
                  "Part of the top 3% of freelancers on DigiReps, having passed our comprehensive 5-stage vetting process."
                </p>
                <div className="space-y-4">
                  {['Identity Authenticated', 'Portfolio Audited', 'Performance Monitored'].map(check => (
                    <div key={check} className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/80">
                      <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                        <CheckCircle className="h-3 w-3 text-primary" />
                      </div>
                      {check}
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
