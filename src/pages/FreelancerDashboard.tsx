import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Briefcase, User, Star, ArrowRight, Clock, Crown, Shield, AlertCircle, Sparkles, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
      <div className="relative isolate min-h-screen">
        {/* Premium Mesh Background */}
        <div className="absolute inset-x-0 top-0 -z-10 h-[600px] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="absolute top-[5%] left-[20%] h-64 w-64 rounded-full bg-primary/10 blur-[100px] animate-pulse" />
          <div className="absolute top-[15%] right-[25%] h-80 w-80 rounded-full bg-indigo-500/5 blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 space-y-16">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-10"
          >
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-xl bg-white/60 backdrop-blur-sm border border-primary/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-primary shadow-sm">
                <Sparkles className="h-3.5 w-3.5" /> Freelancer Dashboard
              </div>
              <h1 className="font-display text-5xl sm:text-7xl font-black tracking-tight leading-[0.9]">
                Welcome Back,<br />
                <span className="text-primary italic">{profile?.display_name?.split(" ")[0] || "Partner"}</span>
              </h1>
              <p className="text-muted-foreground/80 text-lg sm:text-xl font-medium max-w-xl leading-relaxed">
                Your personal dashboard for managing projects and growing your business.
              </p>
            </div>

            <div className="flex flex-col items-end gap-6">
              <Badge className={`${statusCfg.className} rounded-2xl border-2 px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] shadow-sm`}>
                {statusCfg.label}
              </Badge>
              {profile && (
                <Button
                  onClick={() => navigate(`/client/freelancer/${user?.id}`)}
                  variant="outline"
                  className="rounded-2xl h-14 px-8 border-border/40 hover:bg-white/60 transition-all font-black text-xs uppercase tracking-widest gap-3 shadow-sm hover:shadow-elegant"
                >
                  <Eye className="h-4 w-4" /> View Public Profile
                </Button>
              )}
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-[1fr_400px] gap-12 items-start">
            <div className="space-y-12">
              {/* Specialized Banners based on Status */}
              <AnimatePresence mode="wait">
                {(!status || status === 'onboarding') && (
                  <motion.div
                    key="onboarding"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative p-1 bg-gradient-to-br from-primary/40 to-primary/5 rounded-[3rem] shadow-elegant overflow-hidden group"
                  >
                    <div className="bg-card/40 backdrop-blur-md rounded-[2.8rem] p-10 sm:p-12 text-center space-y-8 border border-white/40">
                      <div className="flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-white border border-primary/20 shadow-xl mx-auto group-hover:scale-110 transition-transform duration-500">
                        <User className="h-10 w-10 text-primary" />
                      </div>
                      <div className="space-y-3">
                        <h2 className="font-display text-3xl sm:text-4xl font-black tracking-tight text-foreground">Complete Your Profile</h2>
                        <p className="text-muted-foreground font-medium max-w-lg mx-auto leading-relaxed">
                          Your profile is currently <span className="text-primary font-bold">Incomplete</span>. Finish setting up your profile to start receiving orders.
                        </p>
                      </div>
                      <Button
                        onClick={() => navigate("/freelancer/profile")}
                        className="rounded-[1.5rem] h-16 px-12 gap-3 bg-primary text-primary-foreground shadow-2xl hover:scale-[1.03] transition-all font-black uppercase tracking-[0.2em] text-xs"
                      >
                        Complete Onboarding <ArrowRight className="h-5 w-5" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {status === "pending" && (
                  <motion.div
                    key="pending"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative p-1 bg-gradient-to-br from-warning/40 to-warning/5 rounded-[3rem] shadow-elegant overflow-hidden"
                  >
                    <div className="bg-amber-50/40 backdrop-blur-md rounded-[2.8rem] p-10 sm:p-12 border border-white/60">
                      <div className="flex items-start gap-8">
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[2rem] bg-white border border-warning/20 shadow-xl">
                          <Clock className="h-10 w-10 text-warning" />
                        </div>
                        <div className="space-y-4">
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-warning/10 text-[10px] font-black uppercase tracking-widest text-warning border border-warning/10">
                            Application Under Review
                          </div>
                          <h4 className="font-display text-xl sm:text-2xl font-black tracking-tight text-warning">Review in Progress</h4>
                          <p className="text-warning/70 font-medium leading-relaxed max-w-md">Our team is reviewing your profile. You'll receive a notification once you are approved.</p>
                          <div className="pt-4 flex items-center gap-4">
                            <Button onClick={() => navigate("/freelancer/profile")} variant="ghost" className="rounded-xl h-12 text-xs font-black uppercase tracking-widest hover:bg-warning/5">
                              Edit Application
                            </Button>
                            <div className="h-1 w-1 rounded-full bg-warning/20" />
                            <span className="text-xs font-bold text-warning/60 uppercase tracking-widest">Priority Review Active</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Stats Grid */}
              {isApproved && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-8"
                >
                  <div className="group relative rounded-[2.5rem] border border-border/40 bg-white/40 backdrop-blur-sm p-10 transition-all hover:shadow-elegant hover:border-primary/20">
                    <div className="absolute top-8 right-10">
                      <Briefcase className="h-8 w-8 opacity-10 group-hover:opacity-30 transition-opacity text-primary" />
                    </div>
                    <div className="text-7xl font-display font-black mb-2 tracking-tighter text-primary">{stats.totalJobs}</div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Elite Project Wins</div>
                  </div>
                  <div className="group relative rounded-[2.5rem] border border-border/40 bg-white/40 backdrop-blur-sm p-10 transition-all hover:shadow-elegant hover:border-primary/20">
                    <div className="absolute top-8 right-10">
                      <Star className="h-8 w-8 opacity-10 group-hover:opacity-30 transition-opacity text-warning" />
                    </div>
                    <div className="text-7xl font-display font-black mb-2 tracking-tighter text-warning">
                      {stats.avgRating != null ? stats.avgRating.toFixed(1) : "5.0"}
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Global Talent Rating</div>
                  </div>
                </motion.div>
              )}

              {/* Action Cards */}
              <div className="grid gap-8 sm:grid-cols-2">
                <motion.div variants={itemVariants} initial="hidden" animate="show">
                  <Card
                    className="group cursor-pointer rounded-[3rem] border-border/40 hover:border-primary/30 transition-all hover:shadow-elegant overflow-hidden h-full bg-white/40 backdrop-blur-sm"
                    onClick={() => navigate("/freelancer/profile")}
                  >
                    <CardHeader className="p-10 pb-6">
                      <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-primary/10 mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                        <User className="h-7 w-7 text-primary" />
                      </div>
                      <CardTitle className="font-display text-3xl font-black tracking-tight">
                        Identity Office
                      </CardTitle>
                      <CardDescription className="text-base font-medium leading-relaxed pt-2 text-muted-foreground/60">
                        Manage your global commercial presence, certifications, and portfolio items.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-10 pt-0">
                      <div className="inline-flex items-center text-xs font-black uppercase tracking-widest text-primary border-b-2 border-primary/20 pb-1 group-hover:border-primary transition-all">
                        Edit Elite Profile <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={itemVariants} initial="hidden" animate="show">
                  <Card
                    className={`group transition-all h-full rounded-[3rem] border-border/40 overflow-hidden bg-white/40 backdrop-blur-sm ${isApproved ? "cursor-pointer hover:shadow-elegant hover:border-primary/30" : "opacity-60 grayscale cursor-not-allowed"}`}
                    onClick={() => isApproved && navigate("/freelancer/orders")}
                  >
                    <CardHeader className="p-10 pb-6">
                      <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-indigo-50 color-indigo-500 mb-8 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500">
                        <Briefcase className="h-7 w-7 text-indigo-500" />
                      </div>
                      <CardTitle className="font-display text-3xl font-black tracking-tight">
                        Project Briefs
                      </CardTitle>
                      <CardDescription className="text-base font-medium leading-relaxed pt-2 text-muted-foreground/60">
                        Access incoming high-budget briefs and manage your active execution workstreams.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-10 pt-0">
                      <div className="inline-flex items-center text-xs font-black uppercase tracking-widest text-indigo-500 border-b-2 border-indigo-500/20 pb-1 group-hover:border-indigo-500 transition-all">
                        {isApproved ? "Open Workstream" : "Awaiting Verification"} <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>

            {/* Sidebar Column */}
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="rounded-[3rem] border-border/40 bg-gradient-to-br from-card to-muted/20 p-10 space-y-8 shadow-sm">
                  <div className="space-y-6 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-[2.5rem] bg-white border border-border/10 shadow-xl mx-auto">
                      <LevelIcon className={`h-8 w-8 ${levelCfg.color}`} />
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Freelancer Level</p>
                      <h3 className="font-display text-3xl font-black tracking-tight capitalize">
                        {levelCfg.label}
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                      <span className="text-muted-foreground/60">Level Progress</span>
                      <span className="text-primary">{levelCfg.progress}%</span>
                    </div>
                    <div className="h-3 rounded-full bg-white border border-border/10 overflow-hidden p-0.5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${levelCfg.progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full rounded-full bg-gradient-to-r from-primary to-indigo-500"
                      />
                    </div>
                  </div>

                  <p className="text-xs font-medium text-center text-muted-foreground/60 leading-relaxed italic">
                    "Consistent high-quality work unlocks higher levels and more benefits."
                  </p>
                </Card>
              </motion.div>

              <Card className="rounded-[2.5rem] border border-border/40 bg-card/40 backdrop-blur-sm p-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center shadow-sm">
                    <AlertCircle className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-widest">Support</h3>
                </div>
                <div className="space-y-4">
                  <p className="text-sm font-medium leading-relaxed text-muted-foreground">
                    Need assistance with an order or have a question? Our support team is here to help.
                  </p>
                  <Button variant="outline" className="w-full rounded-xl h-12 text-[10px] font-black uppercase tracking-widest border-border/60 hover:bg-white/60">
                    Contact Support
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Decorative Elements */}
      <div className="fixed -bottom-48 -right-48 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="fixed -top-48 -left-48 h-[500px] w-[500px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
    </AppShell>
  );
};

export default FreelancerDashboard;
