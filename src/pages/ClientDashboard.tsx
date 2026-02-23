import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Search, FileText, MessageSquare, ArrowRight, Sparkles, TrendingUp, CheckCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";

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
      <div className="max-w-7xl mx-auto space-y-12 pb-20">

        {/* Mission Control Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-border/40">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/5 border border-primary/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                <Sparkles className="h-3.5 w-3.5" /> Mission Control
              </div>
              <h1 className="font-display text-5xl sm:text-7xl font-bold tracking-tight text-foreground leading-[1.1]">
                Welcome, {firstName}
              </h1>
              <p className="text-muted-foreground/60 text-lg sm:text-xl font-medium max-w-2xl italic">
                Manage your active workstreams and discover elite talent for your next project.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Button onClick={() => navigate("/client/discover")} className="h-14 px-8 rounded-2xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-[0.2em] hover:scale-[1.02] hover:shadow-glow transition-all duration-300">
                <Search className="h-4 w-4 mr-3 opacity-70" /> Find Talent
              </Button>
            </div>
          </div>
        </motion.div>

        {/* The Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[160px]">

          {/* Main Stats - Span 8 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}
            className="md:col-span-8 row-span-2 dossier-card p-10 flex flex-col justify-between group cursor-pointer hover:border-primary/30 transition-colors duration-500"
            onClick={() => navigate("/client/orders")}
          >
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" /> Active Workstreams
                </div>
                <h2 className="font-display text-3xl font-bold tracking-tight">Project Overview</h2>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                <ArrowRight className="h-5 w-5 -rotate-45 group-hover:rotate-0 transition-transform duration-500" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-border/40">
              <div>
                <div className="text-5xl font-display font-bold tracking-tighter text-foreground mb-2">{stats.active}</div>
                <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground/60 flex items-center gap-2">
                  <Clock className="h-3 w-3" /> In Progress
                </div>
              </div>
              <div>
                <div className="text-5xl font-display font-bold tracking-tighter text-foreground mb-2">{stats.completed}</div>
                <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground/60 flex items-center gap-2">
                  <CheckCircle className="h-3 w-3" /> Delivered
                </div>
              </div>
              <div>
                <div className="text-5xl font-display font-bold tracking-tighter text-primary mb-2">{stats.total}</div>
                <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-primary/60 flex items-center gap-2">
                  <TrendingUp className="h-3 w-3" /> Total Engagements
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Action: Find Talent - Span 4 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}
            className="md:col-span-4 row-span-1 rounded-[2rem] bg-gradient-to-br from-primary to-primary-glow p-8 text-white flex flex-col justify-between group cursor-pointer hover:shadow-glow-lg transition-all duration-500 relative overflow-hidden"
            onClick={() => navigate("/client/discover")}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform duration-700 group-hover:scale-150" />
            <div className="h-10 w-10 text-white/80 mb-4 z-10">
              <Search className="h-8 w-8" />
            </div>
            <div className="z-10">
              <h3 className="font-display text-xl font-bold tracking-tight mb-1">Source Elite Talent</h3>
              <p className="text-xs text-white/70 font-medium">Access the top 1% network &rarr;</p>
            </div>
          </motion.div>

          {/* Quick Action: Messages - Span 4 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}
            className="md:col-span-4 row-span-1 border border-border/40 bg-white rounded-[2rem] p-8 flex flex-col justify-between group cursor-pointer hover:border-primary/30 hover:shadow-elegant transition-all duration-500"
            onClick={() => navigate("/client/orders")}
          >
            <div className="flex justify-between items-start">
              <div className="h-10 w-10 text-muted-foreground/40 group-hover:text-primary transition-colors duration-300">
                <MessageSquare className="h-8 w-8" />
              </div>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white">
                {stats.active > 0 ? stats.active : 0}
              </span>
            </div>
            <div>
              <h3 className="font-display text-lg font-bold tracking-tight mb-1 text-foreground">Communications</h3>
              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground/50">Active Channels &rarr;</p>
            </div>
          </motion.div>

        </div>
      </div>
    </AppShell>
  );
};

export default ClientDashboard;
