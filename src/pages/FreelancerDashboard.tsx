import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Briefcase, User, Star, ArrowRight, Clock, Crown, Shield, AlertCircle, Sparkles, Eye, MessageSquare, Ban, Edit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending: { label: "Under Review", className: "bg-warning/15 text-warning border-warning/30" },
  submitted: { label: "Profile Submitted", className: "bg-blue-500/15 text-blue-600 border-blue-500/30" },
  under_review: { label: "Under Review", className: "bg-indigo-500/15 text-indigo-600 border-indigo-500/30" },
  revision_required: { label: "Revision Required", className: "bg-amber-500/15 text-amber-600 border-amber-500/30" },
  approved: { label: "Approved", className: "bg-success/15 text-success border-success/30" },
  rejected: { label: "Rejected", className: "bg-destructive/10 text-destructive border-destructive/30" },
  suspended: { label: "Suspended", className: "bg-destructive/15 text-destructive border-destructive/40" },
  onboarding: { label: "Incomplete", className: "bg-muted text-muted-foreground border-border" },
};

const LEVEL_CONFIG = {
  verified: { icon: Shield, label: "Verified", progress: 33, color: "text-muted-foreground", bg: "bg-secondary" },
  pro: { icon: Star, label: "Pro", progress: 66, color: "text-primary", bg: "bg-primary/10" },
  elite: { icon: Crown, label: "Elite", progress: 100, color: "text-warning", bg: "bg-warning/15" },
};

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const FreelancerDashboard = () => {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalJobs: 0, avgRating: null as number | null });

  const status = profile?.application_status as keyof typeof STATUS_CONFIG | null;
  const statusCfg = status ? (STATUS_CONFIG[status] ?? STATUS_CONFIG.onboarding) : STATUS_CONFIG.onboarding;
  const isApproved = status === "approved" && !profile?.is_suspended;
  const isSuspended = status === "suspended" || profile?.is_suspended;
  const isRevisionRequired = status === "revision_required";
  const level = profile?.freelancer_level ?? "verified";
  const levelCfg = LEVEL_CONFIG[level];
  const LevelIcon = levelCfg.icon;
  const completionScore = (profile as any)?.profile_completion_score ?? 0;
  const adminFeedback = (profile as any)?.admin_feedback;

  useEffect(() => {
    if (!user || !isApproved) return;
    Promise.all([
      supabase.from("orders").select("id", { count: "exact", head: true }).eq("freelancer_id", user.id).eq("status", "completed"),
      supabase.from("ratings").select("rating").eq("reviewee_id", user.id),
    ]).then(([jobs, ratings]) => {
      const ratingData = ratings.data ?? [];
      const avg = ratingData.length > 0 ? ratingData.reduce((s, r) => s + r.rating, 0) / ratingData.length : null;
      setStats({ totalJobs: jobs.count ?? 0, avgRating: avg });
    });
  }, [user, isApproved]);

  return (
    <AppShell>
      <div className="relative isolate min-h-screen">
        <div className="absolute inset-x-0 top-0 -z-10 h-[500px] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] via-transparent to-transparent" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-full max-w-4xl bg-primary/[0.02] blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 space-y-16">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b border-border/40">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/5 border border-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
                <Sparkles className="h-3 w-3" /> Freelancer Central
              </div>
              <h1 className="font-display text-4xl sm:text-6xl font-bold tracking-tight text-foreground">
                Welcome, <span className="text-primary">{profile?.display_name?.split(" ")[0] || "Partner"}</span>
              </h1>
              <p className="text-muted-foreground text-base sm:text-lg font-medium max-w-xl">
                Manage your professional portfolio and client engagements.
              </p>
            </div>

            <div className="flex flex-col items-end gap-4">
              <Badge className={`${statusCfg.className} rounded-full border px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest`}>
                {statusCfg.label}
              </Badge>
              {profile && (
                <Button onClick={() => navigate(`/client/freelancer/${user?.id}`)} variant="outline" className="rounded-xl h-11 px-6 border-border/60 hover:bg-accent/50 transition-all font-bold text-xs uppercase tracking-widest gap-2">
                  <Eye className="h-4 w-4" /> Public Profile
                </Button>
              )}
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-[1fr_400px] gap-12 items-start">
            <div className="space-y-12">
              <AnimatePresence mode="wait">
                {/* Suspended Banner */}
                {isSuspended && (
                  <motion.div key="suspended" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-destructive/5 rounded-2xl border border-destructive/20 p-8">
                    <div className="flex items-start gap-6">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                        <Ban className="h-6 w-6" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-lg font-bold text-destructive">Account Suspended</h4>
                        {adminFeedback && <p className="text-destructive/80 text-sm font-medium bg-destructive/5 rounded-lg p-3 border border-destructive/10">{adminFeedback}</p>}
                        <p className="text-muted-foreground text-sm">Please contact support if you believe this is an error.</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Revision Required Banner */}
                {isRevisionRequired && !isSuspended && (
                  <motion.div key="revision" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-amber-500/5 rounded-2xl border border-amber-500/20 p-8">
                    <div className="flex items-start gap-6">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                        <MessageSquare className="h-6 w-6" />
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-lg font-bold text-amber-700">Revision Required</h4>
                        {adminFeedback && <p className="text-amber-700/80 text-sm font-medium bg-white/50 rounded-lg p-3 border border-amber-200">{adminFeedback}</p>}
                        <Button onClick={() => navigate("/freelancer/profile")} size="sm" className="rounded-lg bg-amber-500 text-white hover:bg-amber-600 font-bold uppercase tracking-widest text-[10px] px-4">
                          <Edit className="h-3.5 w-3.5 mr-2" /> Revise Profile
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Under Review Banners */}
                {(status === "under_review" || status === "submitted" || status === "pending") && !isSuspended && (
                  <motion.div key="review" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-primary/5 rounded-2xl border border-primary/10 p-8">
                    <div className="flex items-start gap-6">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Clock className="h-6 w-6" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-lg font-bold text-primary-glow">Profile Under Review</h4>
                        <p className="text-muted-foreground text-sm font-medium max-w-lg">Our team typically reviews applications within 24–72 hours. You'll be notified once a decision is made.</p>
                        <Button onClick={() => navigate("/freelancer/profile")} variant="ghost" size="sm" className="text-[10px] font-bold uppercase hover:bg-primary/5 p-0 h-auto">
                          Edit Application
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Onboarding Banner */}
                {(!status || status === "onboarding") && !isSuspended && (
                  <motion.div key="onboarding" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/40 backdrop-blur-sm rounded-3xl border border-border/40 p-10 text-center space-y-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto">
                      <User className="h-8 w-8" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold text-foreground">Complete Your Profile</h2>
                      <p className="text-muted-foreground text-sm font-medium max-w-sm mx-auto">
                        Finish setting up your profile to join the network and start receiving project briefs.
                      </p>
                    </div>
                    <Button onClick={() => navigate("/freelancer/profile")} className="rounded-xl h-12 px-8 bg-primary text-white font-bold uppercase tracking-widest text-[10px]">
                      Complete Onboarding <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Stats Grid */}
              {isApproved && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="group relative rounded-2xl border border-border/40 bg-white p-8 transition-all hover:border-primary/20 hover:shadow-sm">
                    <div className="absolute top-6 right-8 text-primary/10 group-hover:text-primary/20 transition-colors"><Briefcase className="h-10 w-10" /></div>
                    <div className="text-5xl font-bold mb-1 tracking-tight text-foreground">{stats.totalJobs}</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Jobs Completed</div>
                  </div>
                  <div className="group relative rounded-2xl border border-border/40 bg-white p-8 transition-all hover:border-warning/20 hover:shadow-sm">
                    <div className="absolute top-6 right-8 text-warning/10 group-hover:text-warning/20 transition-colors"><Star className="h-10 w-10" /></div>
                    <div className="text-5xl font-bold mb-1 tracking-tight text-foreground">{stats.avgRating != null ? stats.avgRating.toFixed(1) : "5.0"}</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Average Rating</div>
                  </div>
                </motion.div>
              )}

              {/* Action Cards */}
              <div className="grid gap-6 sm:grid-cols-2">
                <motion.div variants={itemVariants} initial="hidden" animate="show">
                  <Card className="group cursor-pointer rounded-2xl border-border/40 hover:border-primary/20 transition-all hover:shadow-sm h-full bg-white" onClick={() => navigate("/freelancer/profile")}>
                    <CardHeader className="p-8 pb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/5 mb-6 text-primary group-hover:bg-primary/10 transition-colors"><User className="h-6 w-6" /></div>
                      <CardTitle className="text-xl font-bold tracking-tight">Manage Profile</CardTitle>
                      <CardDescription className="text-sm font-medium pt-1">Professional presence, bio, and portfolio.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 pt-0 flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Edit Details</span>
                      <ArrowRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={itemVariants} initial="hidden" animate="show">
                  <Card className={`group transition-all h-full rounded-2xl border-border/40 bg-white ${isApproved ? "cursor-pointer hover:border-primary/20 hover:shadow-sm" : "opacity-60 grayscale cursor-not-allowed"}`} onClick={() => isApproved && navigate("/freelancer/orders")}>
                    <CardHeader className="p-8 pb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50/50 mb-6 text-indigo-500 group-hover:bg-indigo-50 transition-colors"><Briefcase className="h-6 w-6" /></div>
                      <CardTitle className="text-xl font-bold tracking-tight">Project Briefs</CardTitle>
                      <CardDescription className="text-sm font-medium pt-1">View invitations and manage active briefs.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 pt-0 flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500">
                        {isApproved ? "Open Briefs" : "Verify to Access"}
                      </span>
                      {isApproved && <ArrowRight className="h-4 w-4 text-indigo-500 group-hover:translate-x-1 transition-transform" />}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                <Card className="rounded-2xl border-border/40 bg-white p-8 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 text-primary">
                      <LevelIcon className={`h-5 w-5 ${levelCfg.color}`} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Level</p>
                      <h3 className="text-lg font-bold capitalize leading-tight">{levelCfg.label}</h3>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                      <span className="text-muted-foreground">Rank Progress</span>
                      <span className="text-primary">{levelCfg.progress}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${levelCfg.progress}%` }} transition={{ duration: 1, ease: "easeOut" }} className="h-full bg-primary" />
                    </div>
                  </div>

                  {/* Profile Completeness */}
                  <div className="space-y-3 pt-6 border-t border-border/10">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                      <span className="text-muted-foreground">Profile Completeness</span>
                      <span className="text-primary">{completionScore}%</span>
                    </div>
                    <Progress value={completionScore} className="h-2" />
                  </div>
                </Card>
              </motion.div>

              <Card className="rounded-2xl border border-border/40 bg-white p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary"><AlertCircle className="h-4 w-4" /></div>
                  <h3 className="text-[10px] font-bold uppercase tracking-widest">Support</h3>
                </div>
                <p className="text-xs font-medium text-muted-foreground leading-relaxed">Need assistance? Our support team is available to help with orders and account issues.</p>
                <Button variant="outline" className="w-full rounded-xl h-10 text-[10px] font-bold uppercase tracking-widest border-border/60 hover:bg-accent/50">Contact Support</Button>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed inset-0 bg-[radial-gradient(45%_40%_at_50%_0%,rgba(var(--primary),0.02)_0%,transparent_100%)] pointer-events-none" />
    </AppShell>
  );
};

export default FreelancerDashboard;
