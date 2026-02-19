import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, FileText, MessageSquare, ArrowRight, Sparkles, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const ClientDashboard = () => {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0 });

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("orders").select("id", { count: "exact", head: true }).eq("client_id", user.id),
      supabase.from("orders").select("id", { count: "exact", head: true }).eq("client_id", user.id).in("status", ["accepted", "in_progress", "delivered"]),
      supabase.from("orders").select("id", { count: "exact", head: true }).eq("client_id", user.id).eq("status", "completed"),
    ]).then(([total, active, completed]) => {
      setStats({
        total: total.count ?? 0,
        active: active.count ?? 0,
        completed: completed.count ?? 0,
      });
    });
  }, [user]);

  const firstName = profile?.display_name?.split(" ")[0] || "Client";

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Greeting */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex flex-wrap items-end justify-between gap-6 pb-2 border-b border-border/40">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/5 border border-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary mb-2">
                <Sparkles className="h-3 w-3" /> Workspace Overview
              </div>
              <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight">
                Welcome, <span className="gradient-text">{firstName}</span>
              </h1>
              <p className="text-muted-foreground text-base max-w-lg">Manage your elite network and projects from one central command center.</p>
            </div>

            <div className="flex items-center gap-3">
              <Button onClick={() => navigate("/client/discover")} className="rounded-2xl h-12 px-6 bg-gradient-to-r from-primary to-primary-glow border-0 shadow-elegant">
                <Search className="h-4 w-4 mr-2" /> Find Talent
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6"
        >
          {[
            { label: "Total Engagements", value: stats.total, icon: TrendingUp, color: "text-primary" },
            { label: "Active Workstreams", value: stats.active, icon: FileText, color: "text-indigo-500" },
            { label: "Deliveries Completed", value: stats.completed, icon: MessageSquare, color: "text-emerald-500" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="group relative rounded-[2rem] border border-border/40 bg-card p-8 transition-all hover:shadow-elegant hover:border-primary/20">
              <div className="absolute top-6 right-8">
                <Icon className={`h-6 w-6 opacity-20 group-hover:opacity-40 transition-opacity ${color}`} />
              </div>
              <div className={`text-5xl font-display font-bold mb-2 ${color}`}>{value}</div>
              <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">{label}</div>
            </div>
          ))}
        </motion.div>

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
              onClick={() => navigate("/client/discover")}
            >
              <CardHeader className="p-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl icon-gradient mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="font-display text-2xl font-bold bg-clip-text">
                  Source Talent
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed pt-2">
                  Access our curated network of the world's top 1% freelancers across all domains.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <div className="flex items-center text-sm font-bold text-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                  Get Started <ArrowRight className="h-4 w-4 ml-2" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card
              className="group cursor-pointer rounded-[2rem] border-border/40 hover:border-primary/30 transition-all hover:shadow-elegant overflow-hidden h-full"
              onClick={() => navigate("/client/orders")}
            >
              <CardHeader className="p-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl icon-gradient mb-6 group-hover:scale-110 transition-transform duration-300">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="font-display text-2xl font-bold">
                  Management
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed pt-2">
                  Oversee all active workstreams, track milestones, and manage secure escrow payments.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <div className="flex items-center text-sm font-bold text-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                  View Dashboard <ArrowRight className="h-4 w-4 ml-2" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="rounded-[2rem] border-border/40 bg-muted/20 overflow-hidden h-full">
              <CardHeader className="p-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white borber border-border/20 mb-6 shadow-sm">
                  <MessageSquare className="h-6 w-6 text-muted-foreground/60" />
                </div>
                <CardTitle className="font-display text-2xl font-bold text-muted-foreground/60">Communication</CardTitle>
                <CardDescription className="text-sm leading-relaxed pt-2">
                  Secure, verified communication channels are automatically established for every engagement.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <Button variant="outline" size="sm" className="rounded-xl font-bold border-2 hover:bg-white" onClick={() => navigate("/client/orders")}>
                  Active Chats
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Decorative background element */}
        <div className="fixed -bottom-24 -right-24 h-96 w-96 rounded-full bg-primary/5 blur-[100px] pointer-events-none" />
      </div>
    </AppShell>
  );
};

export default ClientDashboard;
