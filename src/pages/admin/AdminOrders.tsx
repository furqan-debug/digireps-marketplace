import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, RotateCcw, MessageSquare, DollarSign, Clock, FileText } from "lucide-react";
import { motion } from "framer-motion";

type Order = {
  id: string; title: string; budget: number; status: string;
  escrow_status: string; deadline: string | null; created_at: string;
  client_id: string; freelancer_id: string;
};

const STATUS_BADGE: Record<string, { label: string; className: string; borderColor: string }> = {
  pending:     { label: "Pending",     className: "bg-secondary text-secondary-foreground",    borderColor: "border-l-secondary" },
  accepted:    { label: "Accepted",    className: "bg-primary/10 text-primary",                borderColor: "border-l-primary" },
  in_progress: { label: "In Progress", className: "bg-primary/10 text-primary",                borderColor: "border-l-primary" },
  delivered:   { label: "Delivered",   className: "bg-warning/15 text-warning",                borderColor: "border-l-warning" },
  completed:   { label: "Completed",   className: "bg-success/15 text-success",                borderColor: "border-l-success" },
  disputed:    { label: "Disputed",    className: "bg-destructive/10 text-destructive",         borderColor: "border-l-destructive" },
  refunded:    { label: "Refunded",    className: "bg-muted text-muted-foreground",             borderColor: "border-l-muted-foreground" },
};

const ESCROW_BADGE: Record<string, string> = {
  none: "bg-muted text-muted-foreground", held: "bg-warning/15 text-warning",
  released: "bg-success/15 text-success", refunded: "bg-destructive/10 text-destructive",
};

const FILTER_TABS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
  { key: "disputed", label: "Disputed" },
];

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const AdminOrders = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [actioning, setActioning] = useState<string | null>(null);
  const [confirmRefund, setConfirmRefund] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("orders").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { setOrders((data ?? []) as Order[]); setLoading(false); });
  }, []);

  const triggerRefund = async (orderId: string) => {
    setActioning(orderId);
    const { error } = await supabase.from("orders").update({ status: "refunded", escrow_status: "refunded" }).eq("id", orderId);
    setActioning(null);
    setConfirmRefund(null);
    if (error) { toast({ title: "Failed to trigger refund", description: error.message, variant: "destructive" }); }
    else {
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: "refunded", escrow_status: "refunded" } : o));
      toast({ title: "Refund triggered" });
    }
  };

  const filtered = orders.filter((o) => {
    const matchSearch = o.title.toLowerCase().includes(search.toLowerCase());
    if (activeFilter === "all") return matchSearch;
    if (activeFilter === "active") return matchSearch && ["accepted", "in_progress", "delivered"].includes(o.status);
    if (activeFilter === "completed") return matchSearch && o.status === "completed";
    if (activeFilter === "disputed") return matchSearch && o.status === "disputed";
    return matchSearch;
  });

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl icon-gradient">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold">All Orders</h1>
                <p className="text-muted-foreground text-sm">Oversee all platform orders and trigger refunds.</p>
              </div>
            </div>
            <Input placeholder="Search by title..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-64" />
          </div>
        </motion.div>

        {/* Filter tabs */}
        <div className="flex gap-1 rounded-xl bg-muted/50 p-1 w-fit">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${activeFilter === tab.key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-3">
            {filtered.map((o) => {
              const s = STATUS_BADGE[o.status] ?? STATUS_BADGE.pending;
              const canRefund = ["pending", "accepted", "in_progress", "delivered", "disputed"].includes(o.status);
              return (
                <motion.div key={o.id} variants={itemVariants}>
                  <Card className={`border-l-4 ${s.borderColor} hover:shadow-elegant transition-all`}>
                    <CardContent className="py-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold">{o.title}</span>
                            <Badge className={`${s.className} text-xs`}>{s.label}</Badge>
                            {o.escrow_status !== "none" && (
                              <Badge className={`${ESCROW_BADGE[o.escrow_status] ?? ""} text-xs`}>
                                Escrow: {o.escrow_status}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />${o.budget.toLocaleString()}</span>
                            {o.deadline && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(o.deadline).toLocaleDateString()}</span>}
                            <span className="text-muted-foreground/60">{new Date(o.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-wrap shrink-0">
                          {canRefund && (
                            confirmRefund === o.id ? (
                              <div className="flex gap-1.5 items-center">
                                <span className="text-xs text-destructive font-medium">Confirm?</span>
                                <Button size="sm" variant="destructive" className="h-7 text-xs gap-1" disabled={actioning === o.id} onClick={() => triggerRefund(o.id)}>
                                  {actioning === o.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <><RotateCcw className="h-3 w-3" /> Yes</>}
                                </Button>
                                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setConfirmRefund(null)}>No</Button>
                              </div>
                            ) : (
                              <Button size="sm" variant="outline" className="gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10 h-8 text-xs" onClick={() => setConfirmRefund(o.id)}>
                                <RotateCcw className="h-3 w-3" /> Refund
                              </Button>
                            )
                          )}
                          <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs" onClick={() => navigate(`/orders/${o.id}`)}>
                            <MessageSquare className="h-3 w-3" /> View
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
            {filtered.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border/60 py-12 text-center text-muted-foreground">No orders found.</div>
            )}
          </motion.div>
        )}
      </div>
    </AppShell>
  );
};

export default AdminOrders;
