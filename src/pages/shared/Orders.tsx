import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, MessageSquare, Clock, DollarSign, Search, User, FileText, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Order = {
  id: string;
  title: string;
  description: string;
  budget: number;
  status: string;
  escrow_status: string;
  deadline: string | null;
  created_at: string;
  category_id: string;
  client_id: string;
  freelancer_id: string;
};

const STATUS_BADGE: Record<string, { label: string; className: string; borderColor: string }> = {
  pending: { label: "Pending", className: "bg-secondary text-secondary-foreground", borderColor: "border-l-secondary" },
  accepted: { label: "Accepted", className: "bg-primary/10 text-primary", borderColor: "border-l-primary" },
  in_progress: { label: "In Progress", className: "bg-primary/10 text-primary", borderColor: "border-l-primary" },
  delivered: { label: "Delivered", className: "bg-warning/15 text-warning", borderColor: "border-l-warning" },
  completed: { label: "Completed", className: "bg-success/15 text-success", borderColor: "border-l-success" },
  disputed: { label: "Disputed", className: "bg-destructive/10 text-destructive", borderColor: "border-l-destructive" },
  refunded: { label: "Refunded", className: "bg-muted text-muted-foreground", borderColor: "border-l-muted-foreground" },
};

const ESCROW_BADGE: Record<string, string> = {
  none: "bg-muted text-muted-foreground",
  held: "bg-warning/15 text-warning",
  released: "bg-success/15 text-success",
  refunded: "bg-destructive/10 text-destructive",
};

const FILTER_TABS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
  { key: "disputed", label: "Disputed" },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const Orders = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    if (!user) return;
    const col = role === "client" ? "client_id" : "freelancer_id";
    supabase
      .from("orders")
      .select("*")
      .eq(col, user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setOrders(data ?? []);
        setLoading(false);
      });
  }, [user, role]);

  const filtered = orders.filter((o) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "active") return ["accepted", "in_progress", "delivered"].includes(o.status);
    if (activeFilter === "completed") return o.status === "completed";
    if (activeFilter === "disputed") return o.status === "disputed";
    return true;
  });

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header — Elite Command Center */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/40">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary mb-2">
                <Sparkles className="h-3 w-3" /> Management
              </div>
              <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight">Active Workstreams</h1>
              <p className="text-muted-foreground/60 text-sm font-medium">
                {role === "client" ? "Overseeing your strategic talent engagements" : "Managing your elite performance delivery"}
              </p>
            </div>

            {/* Filter Tabs — Minimalist Pill */}
            <div className="flex gap-1 rounded-2xl bg-muted/30 p-1.5 border border-border/20 backdrop-blur-sm shadow-inner">
              {FILTER_TABS.map((tab) => {
                const count = tab.key === "all" ? orders.length
                  : tab.key === "active" ? orders.filter((o) => ["accepted", "in_progress", "delivered"].includes(o.status)).length
                    : orders.filter((o) => o.status === tab.key).length;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveFilter(tab.key)}
                    className={`relative flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-bold uppercase tracking-widest transition-all ${activeFilter === tab.key
                      ? "bg-background text-primary shadow-elegant"
                      : "text-muted-foreground/60 hover:text-foreground"
                      }`}
                  >
                    {tab.label}
                    {count > 0 && (
                      <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${activeFilter === tab.key ? "bg-primary text-primary-foreground" : "bg-muted/60 text-muted-foreground/40"}`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-32">
            <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-[3rem] border-2 border-dashed border-border/40 bg-muted/5 py-32 text-center space-y-8">
            <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-gradient-to-br from-primary/10 to-primary-glow/10 border border-primary/20 mx-auto">
              <FileText className="h-10 w-10 text-primary/40" />
            </div>
            <div className="space-y-2">
              <h2 className="font-display text-2xl font-bold">No Records Found</h2>
              <p className="text-sm text-muted-foreground/60 max-w-xs mx-auto">
                {role === "client" ? "You haven't initiated any workstreams yet. Access the talent network to begin." : "Your workload is currently at capacity for zero. Enhance your profile to attract elite inquiries."}
              </p>
            </div>
            {role === "client" ? (
              <Button onClick={() => navigate("/client/discover")} className="rounded-2xl h-14 px-10 gap-3 bg-gradient-to-r from-primary to-primary-glow border-0 text-primary-foreground hover:scale-[1.02] transition-transform shadow-elegant text-sm font-bold">
                <Search className="h-5 w-5" /> Explore Talent
              </Button>
            ) : (
              <Button variant="outline" onClick={() => navigate("/freelancer/profile")} className="rounded-2xl h-14 px-10 gap-3 border-2 font-bold text-sm">
                <User className="h-5 w-5" /> Optimise Profile
              </Button>
            )}
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFilter}
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {filtered.map((order) => {
                const s = STATUS_BADGE[order.status] ?? STATUS_BADGE.pending;
                return (
                  <motion.div key={order.id} variants={itemVariants} className="h-full">
                    <Card className="dossier-card group relative h-full flex flex-col p-8 bg-card border border-border/40 hover:border-primary/30 transition-all hover:shadow-elegant">
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${s.borderColor?.replace('border-l-', 'bg-')}`} />
                      <div className="flex-1 space-y-6">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <Badge className={`${s.className} rounded-xl px-3 py-1 text-[9px] font-bold uppercase tracking-widest border-0 shadow-sm`}>
                            {s.label}
                          </Badge>
                          {order.escrow_status !== "none" && (
                            <Badge className={`${ESCROW_BADGE[order.escrow_status] ?? ""} rounded-xl px-3 py-1 text-[9px] font-bold uppercase tracking-widest border-0 shadow-sm bg-success/10 text-success`}>
                              Secured
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-display text-xl font-bold group-hover:text-primary transition-colors leading-tight line-clamp-2">{order.title}</h3>

                        <div className="grid grid-cols-2 gap-4 text-left">
                          <div className="space-y-1">
                            <span className="font-display text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Budget</span>
                            <div className="flex items-center gap-2 font-display text-sm font-bold">
                              <DollarSign className="h-3.5 w-3.5 text-primary" />
                              ${order.budget.toLocaleString()}
                            </div>
                          </div>
                          {order.deadline && (
                            <div className="space-y-1">
                              <span className="font-display text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Deadline</span>
                              <div className="flex items-center gap-2 font-display text-sm font-bold">
                                <Clock className="h-3.5 w-3.5 text-primary" />
                                {new Date(order.deadline).toLocaleDateString()}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-8 pt-6 border-t border-border/40">
                        <Button
                          size="lg"
                          className="w-full rounded-[1.25rem] h-12 gap-2 bg-gradient-to-r from-primary to-primary-glow border-0 text-primary-foreground hover:scale-[1.02] transition-transform shadow-elegant text-[10px] font-bold uppercase tracking-widest"
                          onClick={() => navigate(`/orders/${order.id}`)}
                        >
                          <MessageSquare className="h-4 w-4" />
                          View Details
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        )}

      </div>
    </AppShell>
  );
};

export default Orders;
