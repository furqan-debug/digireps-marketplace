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
  show: { transition: { staggerChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
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
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b border-border/40">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/5 border border-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
                <Sparkles className="h-3 w-3" /> Talent Network
              </div>
              <h1 className="font-display text-4xl sm:text-6xl font-bold tracking-tight text-foreground">
                Hello, <span className="text-primary">{firstName}</span>
              </h1>
              <p className="text-muted-foreground text-base sm:text-lg font-medium max-w-xl">
                Source world-class talent and manage your active workstreams.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button onClick={() => navigate("/client/discover")} className="rounded-xl h-11 px-6 bg-primary text-white font-bold text-xs uppercase tracking-widest shadow-sm hover:scale-[1.02] transition-all">
                <Search className="h-4 w-4 mr-2" /> Find Talent
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6"
        >
          {[
            { label: "Total Engagements", value: stats.total, icon: TrendingUp },
            { label: "Active Workstreams", value: stats.active, icon: FileText },
            { label: "Deliveries Received", value: stats.completed, icon: MessageSquare },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="group relative rounded-2xl border border-border/40 bg-white p-8 transition-all hover:border-primary/20 hover:shadow-sm">
              <div className="absolute top-6 right-8 text-primary/10 group-hover:text-primary/20 transition-colors">
                <Icon className="h-10 w-10" />
              </div>
              <div className="text-5xl font-bold mb-1 tracking-tight text-foreground">{value}</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{label}</div>
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
              className="group cursor-pointer rounded-2xl border-border/40 hover:border-primary/20 transition-all hover:shadow-sm h-full bg-white"
              onClick={() => navigate("/client/discover")}
            >
              <CardHeader className="p-8 pb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/5 mb-6 text-primary group-hover:bg-primary/10 transition-colors">
                  <Search className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl font-bold tracking-tight">Source Talent</CardTitle>
                <CardDescription className="text-sm font-medium pt-1">
                  Access our curated network of the world's top 1% freelancers.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Discover</span>
                <ArrowRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card
              className="group cursor-pointer rounded-2xl border-border/40 hover:border-primary/20 transition-all hover:shadow-sm h-full bg-white"
              onClick={() => navigate("/client/orders")}
            >
              <CardHeader className="p-8 pb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/5 mb-6 text-primary group-hover:bg-primary/10 transition-colors">
                  <FileText className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl font-bold tracking-tight">Management</CardTitle>
                <CardDescription className="text-sm font-medium pt-1">
                  Oversee active workstreams, track milestones, and payments.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">View Briefs</span>
                <ArrowRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="group cursor-pointer rounded-2xl border-border/40 bg-muted/20 hover:bg-muted/30 transition-all h-full" onClick={() => navigate("/client/orders")}>
              <CardHeader className="p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white border border-border/20 mb-6 text-muted-foreground/60 group-hover:text-primary transition-colors">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl font-bold tracking-tight">Communication</CardTitle>
                <CardDescription className="text-sm font-medium pt-1">
                  Secure channels established for every engagement.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <Button variant="outline" size="sm" className="rounded-xl font-bold text-[10px] uppercase tracking-widest border-border/60 hover:bg-white bg-transparent">
                  Active Chats
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <div className="fixed inset-0 bg-[radial-gradient(45%_40%_at_50%_0%,rgba(var(--primary),0.02)_0%,transparent_100%)] pointer-events-none" />
      </div>
    </AppShell>
  );
};

export default ClientDashboard;
