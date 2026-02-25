import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheck, Users, FileText, AlertTriangle, ArrowRight, Loader2, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ pending: 0, users: 0, orders: 0, violations: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }).in("application_status", ["pending", "submitted"]),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("id", { count: "exact", head: true }),
      supabase.from("violations").select("id", { count: "exact", head: true }),
    ]).then(([pending, users, orders, violations]) => {
      setStats({
        pending: pending.count ?? 0,
        users: users.count ?? 0,
        orders: orders.count ?? 0,
        violations: violations.count ?? 0,
      });
      setLoading(false);
    });
  }, []);

  const panels = [
    {
      icon: ShieldCheck,
      label: "Applications",
      description: "Review freelancer applications",
      to: "/admin/applications",
      count: stats.pending,
      countLabel: "pending review",
      borderColor: "border-l-primary",
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      icon: Users,
      label: "Users",
      description: "Manage all platform users",
      to: "/admin/users",
      count: stats.users,
      countLabel: "total users",
      borderColor: "border-l-accent",
      iconBg: "bg-accent/10",
      iconColor: "text-accent",
    },
    {
      icon: FileText,
      label: "Orders",
      description: "View and manage all orders",
      to: "/admin/orders",
      count: stats.orders,
      countLabel: "total orders",
      borderColor: "border-l-primary",
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      icon: AlertTriangle,
      label: "Violations",
      description: "Review chat violations",
      to: "/admin/violations",
      count: stats.violations,
      countLabel: "logged violations",
      borderColor: "border-l-destructive",
      iconBg: "bg-destructive/10",
      iconColor: "text-destructive",
    },
  ];

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-glow shadow-elegant">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground text-sm">Platform oversight and moderation.</p>
            </div>
          </div>
        </motion.div>

        {/* Platform Health header */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Platform Health</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
          >
            {panels.map(({ icon: Icon, label, description, to, count, countLabel, borderColor, iconBg, iconColor }) => (
              <motion.div key={to} variants={itemVariants}>
                <Card
                  className={`cursor-pointer hover:shadow-elegant hover:-translate-y-0.5 transition-all group border-l-4 ${borderColor} h-full`}
                  onClick={() => navigate(to)}
                >
                  <CardHeader className="pb-2">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg} mb-2`}>
                      <Icon className={`h-5 w-5 ${iconColor}`} />
                    </div>
                    <div className="flex items-center justify-between">
                      <CardTitle className="font-display text-base">{label}</CardTitle>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <CardDescription className="text-xs">{description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-display font-bold">{count}</div>
                    <p className="text-xs text-muted-foreground mt-0.5">{countLabel}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </AppShell>
  );
};

export default AdminDashboard;
