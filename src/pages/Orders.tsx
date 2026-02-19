import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, MessageSquare, Clock, DollarSign, Search, User, FileText } from "lucide-react";
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
  pending:     { label: "Pending",     className: "bg-secondary text-secondary-foreground",     borderColor: "border-l-secondary" },
  accepted:    { label: "Accepted",    className: "bg-primary/10 text-primary",                 borderColor: "border-l-primary" },
  in_progress: { label: "In Progress", className: "bg-primary/10 text-primary",                 borderColor: "border-l-primary" },
  delivered:   { label: "Delivered",   className: "bg-warning/15 text-warning",                 borderColor: "border-l-warning" },
  completed:   { label: "Completed",   className: "bg-success/15 text-success",                 borderColor: "border-l-success" },
  disputed:    { label: "Disputed",    className: "bg-destructive/10 text-destructive",          borderColor: "border-l-destructive" },
  refunded:    { label: "Refunded",    className: "bg-muted text-muted-foreground",              borderColor: "border-l-muted-foreground" },
};

const ESCROW_BADGE: Record<string, string> = {
  none:     "bg-muted text-muted-foreground",
  held:     "bg-warning/15 text-warning",
  released: "bg-success/15 text-success",
  refunded: "bg-destructive/10 text-destructive",
};

const FILTER_TABS = [
  { key: "all",       label: "All" },
  { key: "active",    label: "Active" },
  { key: "completed", label: "Completed" },
  { key: "disputed",  label: "Disputed" },
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
      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl icon-gradient">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold">My Orders</h1>
              <p className="text-muted-foreground text-sm">
                {role === "client" ? "Projects you have submitted" : "Incoming and active projects"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Filter Tabs */}
        <div className="flex gap-1 rounded-xl bg-muted/50 p-1 w-fit">
          {FILTER_TABS.map((tab) => {
            const count = tab.key === "all" ? orders.length
              : tab.key === "active" ? orders.filter((o) => ["accepted", "in_progress", "delivered"].includes(o.status)).length
              : orders.filter((o) => o.status === tab.key).length;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                  activeFilter === tab.key
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
                {count > 0 && (
                  <span className={`rounded-full px-1.5 py-0.5 text-xs ${activeFilter === tab.key ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 py-20 text-center space-y-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mx-auto">
              <FileText className="h-6 w-6 text-muted-foreground/50" />
            </div>
            <div>
              <p className="font-medium text-muted-foreground">No orders here</p>
              <p className="text-sm text-muted-foreground/60 mt-1">
                {role === "client" ? "Find talent to get started." : "Complete your profile to start receiving orders."}
              </p>
            </div>
            {role === "client" ? (
              <Button onClick={() => navigate("/client/discover")} className="gap-2 bg-gradient-to-r from-primary to-primary-glow border-0 text-primary-foreground hover:opacity-90">
                <Search className="h-4 w-4" /> Find Talent
              </Button>
            ) : (
              <Button variant="outline" onClick={() => navigate("/freelancer/profile")} className="gap-2">
                <User className="h-4 w-4" /> Edit Profile
              </Button>
            )}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFilter}
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="space-y-3"
            >
              {filtered.map((order) => {
                const s = STATUS_BADGE[order.status] ?? STATUS_BADGE.pending;
                return (
                  <motion.div key={order.id} variants={itemVariants}>
                    <Card className={`hover:shadow-elegant transition-all border-l-4 ${s.borderColor}`}>
                      <CardContent className="py-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold">{order.title}</h3>
                              <Badge className={`${s.className} text-xs`}>{s.label}</Badge>
                              {order.escrow_status !== "none" && (
                                <Badge className={`${ESCROW_BADGE[order.escrow_status] ?? ""} text-xs`}>
                                  Escrow: {order.escrow_status}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />${order.budget.toLocaleString()}
                              </span>
                              {order.deadline && (
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  Due {new Date(order.deadline).toLocaleDateString()}
                                </span>
                              )}
                              <span className="text-muted-foreground/60">{new Date(order.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            className="gap-1.5 shrink-0 bg-gradient-to-r from-primary to-primary-glow border-0 text-primary-foreground hover:opacity-90"
                            onClick={() => navigate(`/orders/${order.id}`)}
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                            View & Chat
                          </Button>
                        </div>
                      </CardContent>
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
