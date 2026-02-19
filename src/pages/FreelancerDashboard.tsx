import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Briefcase, User, Star, ArrowRight, Clock, Crown, Shield, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

const STATUS_CONFIG = {
  pending:  { label: "Under Review",  className: "bg-warning/15 text-warning border-warning/30" },
  approved: { label: "Approved",      className: "bg-success/15 text-success border-success/30" },
  rejected: { label: "Rejected",      className: "bg-destructive/10 text-destructive border-destructive/30" },
};

const LEVEL_CONFIG = {
  verified: { icon: Shield,  label: "Verified",  progress: 33,  color: "text-muted-foreground",  bg: "bg-secondary" },
  pro:      { icon: Star,    label: "Pro",       progress: 66,  color: "text-primary",            bg: "bg-primary/10" },
  elite:    { icon: Crown,   label: "Elite",     progress: 100, color: "text-warning",            bg: "bg-warning/15" },
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
  const statusCfg = status ? STATUS_CONFIG[status] : STATUS_CONFIG.pending;
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
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold">
                Welcome, {profile?.display_name?.split(" ")[0] || "Freelancer"} 👋
              </h1>
              <p className="text-muted-foreground mt-1.5">Manage your profile and incoming projects.</p>
            </div>
            <Badge className={`${statusCfg.className} border text-sm px-3 py-1`}>{statusCfg.label}</Badge>
          </div>
        </motion.div>

        {/* Status banners */}
        {(!status || status === "pending") && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <div className="rounded-xl border border-warning/30 bg-gradient-to-r from-warning/10 to-warning/5 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-warning/20">
                  <Clock className="h-4 w-4 text-warning" />
                </div>
                <div>
                  <p className="font-semibold text-warning">Application Under Review</p>
                  <p className="text-muted-foreground mt-0.5 text-sm">
                    An admin will review your profile and approve or reject it. Keep your profile complete to improve your chances.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        {status === "rejected" && (
          <div className="rounded-xl border border-destructive/30 bg-gradient-to-r from-destructive/10 to-destructive/5 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-destructive/20">
                <AlertCircle className="h-4 w-4 text-destructive" />
              </div>
              <div>
                <p className="font-semibold text-destructive">Application Rejected</p>
                <p className="text-muted-foreground mt-0.5 text-sm">
                  Your application was not approved. Update your profile and contact support if needed.
                </p>
              </div>
            </div>
          </div>
        )}
        {profile?.is_suspended && (
          <div className="rounded-xl border border-destructive/30 bg-gradient-to-r from-destructive/10 to-destructive/5 p-5">
            <p className="font-semibold text-destructive">Account Suspended</p>
            <p className="text-muted-foreground mt-0.5 text-sm">Your account has been suspended due to policy violations.</p>
          </div>
        )}

        {/* Stats (only if approved) */}
        {isApproved && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="grid grid-cols-2 gap-4"
          >
            <div className="rounded-xl border border-border/60 bg-card p-4 text-center shadow-sm">
              <div className="text-2xl font-display font-bold text-primary">{stats.totalJobs}</div>
              <div className="text-xs text-muted-foreground mt-1">Completed Jobs</div>
            </div>
            <div className="rounded-xl border border-border/60 bg-card p-4 text-center shadow-sm">
              <div className="text-2xl font-display font-bold text-primary">
                {stats.avgRating != null ? stats.avgRating.toFixed(1) : "—"}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Avg Rating</div>
            </div>
          </motion.div>
        )}

        {/* Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid gap-5 sm:grid-cols-3"
        >
          <motion.div variants={itemVariants}>
            <Card
              className="cursor-pointer hover:shadow-elegant hover:border-primary/30 transition-all group h-full"
              onClick={() => navigate("/freelancer/profile")}
            >
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl icon-gradient mb-2">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="font-display text-lg flex items-center justify-between">
                  My Profile
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardTitle>
                <CardDescription>Edit your bio, skills, and portfolio to attract more clients</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm" className="w-full">Edit Profile</Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card
              className={`transition-all h-full ${isApproved ? "cursor-pointer hover:shadow-elegant hover:border-primary/30 group" : "opacity-60"}`}
              onClick={() => isApproved && navigate("/freelancer/orders")}
            >
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl icon-gradient mb-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="font-display text-lg flex items-center justify-between">
                  My Orders
                  {isApproved && <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />}
                </CardTitle>
                <CardDescription>Incoming briefs and active projects from clients</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm" className="w-full" disabled={!isApproved}>
                  {isApproved ? "View Orders" : "Approval required"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="border-border/60 bg-card h-full">
              <CardHeader>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl mb-2 ${levelCfg.bg}`}>
                  <LevelIcon className={`h-5 w-5 ${levelCfg.color}`} />
                </div>
                <CardTitle className="font-display text-lg">
                  {levelCfg.label} Level
                </CardTitle>
                <CardDescription>Complete orders and earn reviews to level up</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Progress value={levelCfg.progress} className="h-2" />
                <p className="text-xs text-muted-foreground">{levelCfg.progress}% to max level</p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </AppShell>
  );
};

export default FreelancerDashboard;
