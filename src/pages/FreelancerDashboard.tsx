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
      <div className="max-w-7xl mx-auto space-y-12 pb-20">
        {/* Dashboard Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-border/40">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/5 border border-primary/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                <Sparkles className="h-3.5 w-3.5" /> Operations Center
              </div>
              <h1 className="font-display text-5xl sm:text-7xl font-bold tracking-tight text-foreground leading-[1.1]">
                Welcome, {profile?.display_name?.split(" ")[0] || "Partner"}
              </h1>
              <p className="text-muted-foreground/60 text-lg sm:text-xl font-medium max-w-2xl italic">
                Manage your professional portfolio and active client engagements.
              </p>
            </div>

            <div className="flex flex-col md:items-end gap-4">
              <Badge className={`${statusCfg.className} rounded-full border px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] shadow-sm`}>
                {statusCfg.label}
              </Badge>
              {profile && (
                <Button onClick={() => navigate(`/client/freelancer/${user?.id}`)} variant="outline" className="h-14 px-8 rounded-2xl border-border/50 hover:bg-muted/50 transition-all font-bold text-[11px] uppercase tracking-[0.2em] gap-3">
                  <Eye className="h-4 w-4" /> View Public Profile
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[minmax(160px,auto)]">

          {/* Main Status Area - Span 8 */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }} className="md:col-span-8 flex flex-col gap-6">
            <AnimatePresence mode="wait">
              {/* Suspended Banner */}
              {isSuspended && (
                <motion.div key="suspended" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-destructive/5 rounded-[2rem] border border-destructive/20 p-8 shadow-sm">
                  <div className="flex items-start gap-6">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-destructive/10 text-destructive shadow-inner">
                      <Ban className="h-7 w-7" />
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-display text-2xl font-bold text-destructive tracking-tight">Account Suspended</h4>
                      {adminFeedback && <p className="text-destructive/80 text-sm font-medium bg-destructive/5 rounded-xl p-4 border border-destructive/10">{adminFeedback}</p>}
                      <p className="text-muted-foreground text-sm font-medium">Please contact support if you believe this is an error.</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Revision Required Banner */}
              {isRevisionRequired && !isSuspended && (
                <motion.div key="revision" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-amber-500/5 rounded-[2rem] border border-amber-500/20 p-8 shadow-sm">
                  <div className="flex items-start gap-6">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 shadow-inner">
                      <MessageSquare className="h-7 w-7" />
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-display text-2xl font-bold text-amber-700 tracking-tight">Revision Required</h4>
                      {adminFeedback && <p className="text-amber-700/80 text-sm font-medium bg-white/60 rounded-xl p-4 border border-amber-200 shadow-sm">{adminFeedback}</p>}
                      <Button onClick={() => navigate("/freelancer/profile")} className="h-12 px-8 rounded-xl bg-amber-500 text-white hover:bg-amber-600 font-bold uppercase tracking-[0.2em] text-[10px] shadow-sm">
                        <Edit className="h-4 w-4 mr-3" /> Update Profile
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Under Review Banners */}
              {(status === "under_review" || status === "submitted" || status === "pending") && !isSuspended && (
                <motion.div key="review" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="dossier-card p-10 bg-primary/5">
                  <div className="flex items-start gap-8">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
                      <Clock className="h-8 w-8 animate-pulse-slow" />
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-display text-3xl font-bold text-primary-glow tracking-tight">Profile Under Review</h4>
                      <p className="text-muted-foreground/80 text-base font-medium max-w-lg leading-relaxed">Our evaluation team typically completes reviews within 24–72 hours. You will be notified immediately upon decision.</p>
                      <Button onClick={() => navigate("/freelancer/profile")} variant="ghost" className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-primary/10 h-10 px-4 rounded-xl">
                        Preview Application
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Onboarding Banner */}
              {(!status || status === "onboarding") && !isSuspended && (
                <motion.div key="onboarding" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="dossier-card p-12 text-center space-y-8">
                  <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-primary/10 text-primary mx-auto shadow-inner">
                    <User className="h-10 w-10" />
                  </div>
                  <div className="space-y-3">
                    <h2 className="font-display text-4xl font-bold text-foreground tracking-tight">Complete Your Profile</h2>
                    <p className="text-muted-foreground/80 text-lg font-medium max-w-md mx-auto leading-relaxed">
                      Finalize your portfolio and credentials to activate your account and receive project briefs.
                    </p>
                  </div>
                  <Button onClick={() => navigate("/freelancer/profile")} className="h-14 px-10 rounded-2xl bg-primary text-white font-bold uppercase tracking-[0.2em] text-[11px] hover:scale-[1.02] hover:shadow-glow transition-all duration-300">
                    Finish Setup <ArrowRight className="h-4 w-4 ml-3" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Performance Equity Grid (If Approved) */}
            {isApproved && (
              <div className="grid grid-cols-2 gap-6">
                <div className="dossier-card p-8 group hover:border-primary/30 transition-colors duration-500">
                  <div className="flex justify-between items-start mb-6">
                    <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                      <Briefcase className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="text-6xl font-display font-bold mb-2 tracking-tighter text-foreground">{stats.totalJobs}</div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">Completed Briefs</div>
                </div>

                <div className="dossier-card p-8 group hover:border-warning/30 transition-colors duration-500">
                  <div className="flex justify-between items-start mb-6">
                    <div className="h-12 w-12 rounded-2xl bg-warning/10 flex items-center justify-center text-warning group-hover:bg-warning group-hover:text-white transition-colors duration-500">
                      <Star className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="text-6xl font-display font-bold mb-2 tracking-tighter text-foreground">{stats.avgRating != null ? stats.avgRating.toFixed(1) : "5.0"}</div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">Client Rating</div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Sidebar Area - Span 4 */}
          <div className="md:col-span-4 flex flex-col gap-6">

            {/* Rank Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="dossier-card p-8 space-y-8">
                <div className="flex items-center gap-5">
                  <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-primary/5 text-primary shadow-inner">
                    <LevelIcon className={`h-7 w-7 ${levelCfg.color}`} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">Current Status</p>
                    <h3 className="font-display text-2xl font-bold capitalize leading-tight tracking-tight">{levelCfg.label} Member</h3>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-[11px] font-bold uppercase tracking-[0.2em]">
                    <span className="text-muted-foreground/60">Rank Progression</span>
                    <span className="text-primary">{levelCfg.progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted/50 overflow-hidden border border-border/50">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${levelCfg.progress}%` }} transition={{ duration: 1.5, ease: "easeOut" }} className="h-full bg-gradient-to-r from-primary to-primary-glow" />
                  </div>
                </div>

                <div className="space-y-4 pt-8 border-t border-border/20">
                  <div className="flex justify-between text-[11px] font-bold uppercase tracking-[0.2em]">
                    <span className="text-muted-foreground/60">Profile Depth</span>
                    <span className="text-primary">{completionScore}%</span>
                  </div>
                  <Progress value={completionScore} className="h-2 rounded-full bg-muted/50 border border-border/50" />
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="grid grid-cols-1 gap-4">
              <div
                onClick={() => navigate("/freelancer/profile")}
                className="group p-6 rounded-[1.5rem] bg-white border border-border/40 hover:border-primary/30 hover:shadow-elegant cursor-pointer flex items-center justify-between transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    <User className="h-5 w-5" />
                  </div>
                  <span className="font-display font-bold text-base tracking-tight">Edit Profile</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>

              <div
                onClick={() => isApproved && navigate("/freelancer/orders")}
                className={`group p-6 rounded-[1.5rem] bg-white border border-border/40 flex items-center justify-between transition-all duration-300 ${isApproved ? 'hover:border-indigo-500/30 hover:shadow-elegant cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-indigo-500/5 text-indigo-500 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-colors duration-300">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="font-display font-bold text-base tracking-tight block">Project Briefs</span>
                    {!isApproved && <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Requires Approval</span>}
                  </div>
                </div>
                {isApproved && <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />}
              </div>
            </motion.div>

          </div>
        </div>
      </div>

      <div className="fixed inset-0 bg-[radial-gradient(45%_40%_at_50%_0%,rgba(var(--primary),0.02)_0%,transparent_100%)] pointer-events-none" />
    </AppShell>
  );
};

export default FreelancerDashboard;
