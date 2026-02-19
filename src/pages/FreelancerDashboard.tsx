import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Briefcase, User, Star, ArrowRight, Clock, Crown, Shield, AlertCircle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const STATUS_CONFIG = {
  pending: { label: "Under Review", className: "bg-warning/15 text-warning border-warning/30" },
  approved: { label: "Approved", className: "bg-success/15 text-success border-success/30" },
  rejected: { label: "Rejected", className: "bg-destructive/10 text-destructive border-destructive/30" },
  onboarding: { label: "Incomplete", className: "bg-muted text-muted-foreground border-border" },
};

const LEVEL_CONFIG = {
  verified: { icon: Shield, label: "Verified", progress: 33, color: "text-muted-foreground", bg: "bg-secondary" },
  pro: { icon: Star, label: "Pro", progress: 66, color: "text-primary", bg: "bg-primary/10" },
  elite: { icon: Crown, label: "Elite", progress: 100, color: "text-warning", bg: "bg-warning/15" },
};

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const FreelancerDashboard = () => {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalJobs: 0, avgRating: null as number | null });

  const status = profile?.application_status as keyof typeof STATUS_CONFIG | null;
  const statusCfg = status ? STATUS_CONFIG[status] : STATUS_CONFIG.onboarding;
  const isApproved = status === "approved" && !profile?.is_suspended;
  const level = profile?.freelancer_level ?? "verified";
  const levelCfg = LEVEL_CONFIG[level];
  const LevelIcon = levelCfg.icon;

  useEffect(() => {
    if (!user || !isApproved) return;
    Promise.all([
      supabase.from("orders").select("id", { count: "exact", head: true }).eq("freelancer_id", user.id).eq("status", "completed"),
      supabase.from("ratings").select("rating").eq("reviewee_id", user.id),
    ]).then(([jobs, ratings]) => {
      const ratingData = ratings.data ?? [];
      const avg = ratingData.length > 0
        ? ratingData.reduce((s, r) => s + r.rating, 0) / ratingData.length
        : null;
      setStats({ totalJobs: jobs.count ?? 0, avgRating: avg });
    });
  }, [user, isApproved]);

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex flex-wrap items-end justify-between gap-6 pb-2 border-b border-border/40">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/5 border border-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary mb-2">
                <Sparkles className="h-3 w-3" /> Freelancer Center
              </div>
              <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight">
                Welcome, <span className="gradient-text">{profile?.display_name?.split(" ")[0] || "Elite Partner"}</span>
              </h1>
              <p className="text-muted-foreground text-base max-w-lg">Execute projects, manage your elite profile, and track your commercial performance.</p>
            </div>
            <Badge className={`${statusCfg.className} rounded-xl border px-4 py-1.5 text-xs font-bold uppercase tracking-wider`}>{statusCfg.label}</Badge>
          </div>
        </motion.div>

        {/* Status banners */}
        {!status && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <div className="rounded-[2.5rem] border-2 border-dashed border-primary/20 bg-primary/5 p-10 text-center space-y-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-background border border-primary/20 shadow-sm mx-auto">
                <User className="h-10 w-10 text-primary" />
              </div>
              <div className="space-y-2">
                <h2 className="font-display text-3xl font-bold tracking-tight text-foreground">Complete Your Identity</h2>
                <p className="text-muted-foreground text-sm max-w-lg mx-auto leading-relaxed">
                  Your profile is the first step to joining our elite network. Complete your bio, skills, and categories to submit your application for review.
                </p>
              </div>
              <Button
                onClick={() => navigate("/freelancer/profile")}
                className="rounded-2xl h-14 px-10 gap-3 bg-primary text-primary-foreground shadow-elegant hover:scale-[1.02] transition-transform font-bold"
              >
                Finalize Profile <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        )}

        {status === "pending" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <div className="rounded-[2.5rem] border border-warning/20 bg-gradient-to-br from-warning/10 to-transparent p-10 shadow-sm">
              <div className="flex items-start gap-6">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-warning/10 border border-warning/20">
                  <Clock className="h-7 w-7 text-warning" />
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-display font-bold text-warning">Application Under Review</p>
                  <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl">
                    Our compliance team is currently verifying your credentials. Maintaining an elite network requires rigorous vetting. You will be notified via email once approved.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats Grid */}
        {isApproved && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          >
            <div className="group relative rounded-[2rem] border border-border/40 bg-card p-8 transition-all hover:shadow-elegant hover:border-primary/20">
              <div className="absolute top-6 right-8">
                <Briefcase className="h-6 w-6 opacity-20 group-hover:opacity-40 transition-opacity text-primary" />
              </div>
              <div className="text-5xl font-display font-bold mb-2 text-primary">{stats.totalJobs}</div>
              <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Completed Projects</div>
            </div>
            <div className="group relative rounded-[2rem] border border-border/40 bg-card p-8 transition-all hover:shadow-elegant hover:border-primary/20">
              <div className="absolute top-6 right-8">
                <Star className="h-6 w-6 opacity-20 group-hover:opacity-40 transition-opacity text-warning" />
              </div>
              <div className="text-5xl font-display font-bold mb-2 text-warning">
                {stats.avgRating != null ? stats.avgRating.toFixed(1) : "—"}
              </div>
              <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Customer Satisfaction</div>
            </div>
          </motion.div>
        )}

        {/* Main Actions */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          <motion.div variants={itemVariants}>
            <Card
              className="group cursor-pointer rounded-[2rem] border-border/40 hover:border-primary/30 transition-all hover:shadow-elegant overflow-hidden h-full"
              onClick={() => navigate("/freelancer/profile")}
            >
              <CardHeader className="p-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl icon-gradient mb-6 group-hover:scale-110 transition-transform duration-300">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="font-display text-2xl font-bold">
                  Elite Profile
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed pt-2">
                  Update your commercial bio, technical stack, and portfolio to maintain elite status.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <div className="flex items-center text-sm font-bold text-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                  Maintain Profile <ArrowRight className="h-4 w-4 ml-2" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card
              className={`group transition-all h-full rounded-[2rem] border-border/40 overflow-hidden ${isApproved ? "cursor-pointer hover:shadow-elegant hover:border-primary/30" : "opacity-60 grayscale"}`}
              onClick={() => isApproved && navigate("/freelancer/orders")}
            >
              <CardHeader className="p-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl icon-gradient mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="font-display text-2xl font-bold">
                  Workstreams
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed pt-2">
                  Access incoming project briefs and manage your active execution pipeline.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <div className="flex items-center text-sm font-bold text-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                  View Pipeline <ArrowRight className="h-4 w-4 ml-2" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="rounded-[2rem] border-border/40 bg-card overflow-hidden h-full">
              <CardHeader className="p-8">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl mb-6 shadow-sm border border-border/10 ${levelCfg.bg}`}>
                  <LevelIcon className={`h-6 w-6 ${levelCfg.color}`} />
                </div>
                <CardTitle className="font-display text-2xl font-bold">
                  {levelCfg.label} Status
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed pt-2">
                  Maintain high performance to advance to the next elite tier and unlock premium perks.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-4">
                <div className="space-y-2">
                  <Progress value={levelCfg.progress} className="h-2 rounded-full" />
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                    <span>Progression</span>
                    <span>{levelCfg.progress}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Decorative background element */}
        <div className="fixed -bottom-24 -left-24 h-96 w-96 rounded-full bg-primary/5 blur-[100px] pointer-events-none" />
      </div>
    </AppShell>
  );
};

export default FreelancerDashboard;
