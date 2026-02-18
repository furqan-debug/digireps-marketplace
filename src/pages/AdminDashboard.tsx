import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Users, FileText, AlertTriangle, ArrowRight, Loader2 } from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ pending: 0, users: 0, orders: 0, violations: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("application_status", "pending"),
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
      countLabel: "pending",
      accent: "text-primary",
      bg: "bg-primary/10",
    },
    {
      icon: Users,
      label: "Users",
      description: "Manage all platform users",
      to: "/admin/users",
      count: stats.users,
      countLabel: "total",
      accent: "text-accent",
      bg: "bg-accent/10",
    },
    {
      icon: FileText,
      label: "Orders",
      description: "View and manage all orders",
      to: "/admin/orders",
      count: stats.orders,
      countLabel: "total",
      accent: "text-primary",
      bg: "bg-primary/10",
    },
    {
      icon: AlertTriangle,
      label: "Violations",
      description: "Review chat violations",
      to: "/admin/violations",
      count: stats.violations,
      countLabel: "logged",
      accent: "text-destructive",
      bg: "bg-destructive/10",
    },
  ];

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Platform oversight and moderation.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {panels.map(({ icon: Icon, label, description, to, count, countLabel, accent, bg }) => (
              <Card
                key={to}
                className="cursor-pointer hover:shadow-md hover:border-primary/30 transition-all group"
                onClick={() => navigate(to)}
              >
                <CardHeader className="pb-2">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${bg} mb-2`}>
                    <Icon className={`h-5 w-5 ${accent}`} />
                  </div>
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-display text-base">{label}</CardTitle>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-display font-bold">{count}</div>
                  <p className="text-xs text-muted-foreground">{countLabel}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default AdminDashboard;
