import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { DollarSign, Briefcase, TrendingUp, Calendar, Wallet } from "lucide-react";
import { format } from "date-fns";

interface CompletedOrder {
  id: string;
  title: string;
  budget: number;
  updated_at: string;
  client_id: string;
}

const Earnings = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<CompletedOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("orders")
      .select("id, title, budget, updated_at, client_id")
      .eq("freelancer_id", user.id)
      .eq("status", "completed")
      .order("updated_at", { ascending: false })
      .then(({ data }) => {
        setOrders(data ?? []);
        setLoading(false);
      });
  }, [user]);

  const totalEarned = orders.reduce((sum, o) => sum + o.budget, 0);
  const avgValue = orders.length > 0 ? totalEarned / orders.length : 0;

  const summaryCards = [
    { icon: DollarSign, label: "Total Earned", value: `$${totalEarned.toLocaleString()}`, color: "text-accent" },
    { icon: Briefcase, label: "Completed Projects", value: orders.length.toString(), color: "text-primary" },
    { icon: TrendingUp, label: "Average Project Value", value: `$${Math.round(avgValue).toLocaleString()}`, color: "text-warning" },
  ];

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-10 pb-20">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="space-y-4 pb-10 border-b border-border/40">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent/5 border border-accent/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
              <Wallet className="h-3.5 w-3.5" /> Financial Overview
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-foreground">Earnings</h1>
            <p className="text-muted-foreground text-lg font-medium">Track your income and payment history from completed projects.</p>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {summaryCards.map(({ icon: Icon, label, value, color }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i, duration: 0.5 }}
              className="bg-card border border-border/60 rounded-3xl p-8 space-y-4">
              <div className={`h-12 w-12 rounded-2xl bg-primary/5 border border-border/40 flex items-center justify-center ${color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div className="text-4xl font-display font-bold tracking-tighter text-foreground">{loading ? "—" : value}</div>
              <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60">{label}</div>
            </motion.div>
          ))}
        </div>

        {/* Payment History */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}>
          <h2 className="font-display text-2xl font-bold tracking-tight mb-6">Payment History</h2>
          {loading ? (
            <div className="bg-card border border-border/60 rounded-3xl p-10 text-center text-muted-foreground">Loading...</div>
          ) : orders.length === 0 ? (
            <div className="bg-card border border-border/60 rounded-3xl p-16 text-center space-y-4">
              <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground mx-auto">
                <Briefcase className="h-8 w-8" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground">No completed projects yet</h3>
              <p className="text-muted-foreground font-medium max-w-sm mx-auto">Once you complete your first project, your earnings and payment history will appear here.</p>
            </div>
          ) : (
            <div className="bg-card border border-border/60 rounded-3xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/40">
                      <th className="text-left text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 px-6 py-4">Project</th>
                      <th className="text-left text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 px-6 py-4">Amount</th>
                      <th className="text-left text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 px-6 py-4">Completed</th>
                      <th className="text-left text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b border-border/20 last:border-0 hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-5">
                          <span className="font-display font-bold text-sm text-foreground">{order.title}</span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="font-display font-bold text-sm text-accent">${order.budget.toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-sm text-muted-foreground flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5" />
                            {format(new Date(order.updated_at), "MMM d, yyyy")}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <Badge className="bg-accent/10 text-accent border-accent/20 text-[10px] font-bold uppercase tracking-wider">Paid</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AppShell>
  );
};

export default Earnings;
