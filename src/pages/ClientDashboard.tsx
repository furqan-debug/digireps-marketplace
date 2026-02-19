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
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Greeting */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-medium text-primary mb-3">
                <Sparkles className="h-3 w-3" /> Client Dashboard
              </div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold">
                Welcome back, {firstName} 👋
              </h1>
              <p className="text-muted-foreground mt-1.5">Find and hire top freelancers for your next project.</p>
            </div>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="grid grid-cols-3 gap-4"
        >
          {[
            { label: "Total Orders", value: stats.total, icon: TrendingUp },
            { label: "Active Orders", value: stats.active, icon: FileText },
            { label: "Completed", value: stats.completed, icon: MessageSquare },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-xl border border-border/60 bg-card p-4 text-center shadow-sm">
              <div className="text-2xl font-display font-bold text-primary">{value}</div>
              <div className="text-xs text-muted-foreground mt-1">{label}</div>
            </div>
          ))}
        </motion.div>

        {/* Action cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid gap-5 sm:grid-cols-3"
        >
          <motion.div variants={itemVariants}>
            <Card
              className="cursor-pointer hover:shadow-elegant hover:border-primary/30 transition-all group h-full"
              onClick={() => navigate("/client/discover")}
            >
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl icon-gradient mb-2">
                  <Search className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="font-display text-lg flex items-center justify-between">
                  Find Talent
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardTitle>
                <CardDescription>Browse vetted freelancers by service category and hire the best</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-gradient-to-r from-primary to-primary-glow border-0 text-primary-foreground hover:opacity-90" size="sm">Start Discovery</Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card
              className="cursor-pointer hover:shadow-elegant hover:border-primary/30 transition-all group h-full"
              onClick={() => navigate("/client/orders")}
            >
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl icon-gradient mb-2">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="font-display text-lg flex items-center justify-between">
                  My Orders
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardTitle>
                <CardDescription>View and manage your active projects and track their progress</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm" className="w-full">View Orders</Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="border-border/60 bg-muted/20 h-full">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted mb-2">
                  <MessageSquare className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardTitle className="font-display text-lg text-muted-foreground">Chat</CardTitle>
                <CardDescription>Chat is available inside each order for secure communication</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" size="sm" className="w-full" onClick={() => navigate("/client/orders")}>
                  Go to Orders
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </AppShell>
  );
};

export default ClientDashboard;
