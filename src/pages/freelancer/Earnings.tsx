import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { DollarSign, Briefcase, TrendingUp, Calendar, Wallet, ArrowUpRight, CheckCircle2 } from "lucide-react";
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
    { icon: DollarSign, label: "Total Earned", value: `$${totalEarned.toLocaleString()}`, color: "text-accent", bg: "bg-accent/10" },
    { icon: Briefcase, label: "Completed Projects", value: orders.length.toString(), color: "text-primary", bg: "bg-primary/10" },
    { icon: TrendingUp, label: "Average Value", value: `$${Math.round(avgValue).toLocaleString()}`, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  ];

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-12 pb-24 relative px-4 sm:px-6 lg:px-8 mt-6">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />
        <div className="absolute top-[30%] left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] pointer-events-none -z-10" />

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="space-y-4 pb-8 border-b border-border/40">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500 shadow-sm glass">
              <Wallet className="h-3.5 w-3.5" /> Financial Overview
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground drop-shadow-sm">Earnings</h1>
            <p className="text-muted-foreground text-lg sm:text-xl font-medium max-w-2xl">Track your revenue, analyze performance, and manage payment history from successfully completed projects.</p>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {summaryCards.map(({ icon: Icon, label, value, color, bg }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i, duration: 0.5 }}
              className="bg-card/40 backdrop-blur-xl border border-border/60 rounded-[2.5rem] p-8 lg:p-10 space-y-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] relative overflow-hidden group">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-border to-transparent opacity-50" />
              <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full blur-3xl opacity-20 ${bg} group-hover:scale-150 transition-transform duration-700 pointer-events-none`} />

              <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${bg} border border-white/5`}>
                <Icon className={`h-7 w-7 ${color}`} />
              </div>
              <div className="space-y-2 relative z-10">
                <div className="text-5xl lg:text-6xl font-display font-bold tracking-tighter text-foreground drop-shadow-sm">{loading ? "—" : value}</div>
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Payment History */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }} className="space-y-6">
          <h2 className="font-display text-2xl lg:text-3xl font-bold tracking-tight">Payment History</h2>

          {loading ? (
            <div className="bg-card/40 border border-border/60 rounded-[2.5rem] p-24 flex justify-center items-center">
              <div className="animate-pulse flex items-center gap-3 text-muted-foreground"><Wallet className="h-5 w-5" /> Loading ledger...</div>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-card/40 backdrop-blur-xl border border-border/60 rounded-[3rem] p-20 text-center space-y-6 shadow-sm">
              <div className="h-24 w-24 rounded-full bg-muted/30 flex items-center justify-center border border-border/50 mx-auto">
                <Briefcase className="h-10 w-10 text-muted-foreground/40" />
              </div>
              <div className="space-y-2">
                <h3 className="font-display text-2xl font-bold text-foreground">No completed projects yet</h3>
                <p className="text-muted-foreground font-medium max-w-md mx-auto">Once you complete your first project, your earnings and payment history will appear here.</p>
              </div>
            </div>
          ) : (
            <div className="bg-card/60 backdrop-blur-xl border border-border/60 rounded-[2.5rem] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/40 bg-muted/20">
                      <th className="text-left text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 px-8 py-5">Project Details</th>
                      <th className="text-left text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 px-8 py-5">Amount</th>
                      <th className="text-left text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 px-8 py-5">Completed Date</th>
                      <th className="text-left text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 px-8 py-5">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b border-border/20 last:border-0 hover:bg-muted/10 transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary group-hover:text-primary-foreground transition-colors hidden sm:flex">
                              <ArrowUpRight className="h-5 w-5 text-primary group-hover:text-primary-foreground" />
                            </div>
                            <span className="font-display font-bold text-base text-foreground tracking-tight group-hover:text-primary transition-colors">{order.title}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="font-display font-bold text-xl text-foreground">${order.budget.toLocaleString()}</span>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-sm font-medium text-muted-foreground flex items-center gap-2 bg-muted/30 w-fit px-3 py-1.5 rounded-lg border border-border/30">
                            <Calendar className="h-3.5 w-3.5" />
                            {format(new Date(order.updated_at), "MMM d, yyyy")}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2 text-emerald-500 font-bold text-[11px] uppercase tracking-wider bg-emerald-500/10 px-3 py-1.5 rounded-lg w-fit border border-emerald-500/20">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Paid Securely
                          </div>
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
