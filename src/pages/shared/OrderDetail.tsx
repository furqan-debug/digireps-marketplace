import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send, ArrowLeft, AlertTriangle, DollarSign, Clock, Star, X, CheckCircle, ShieldCheck, MessageSquare, Flag, Milestone, Plus } from "lucide-react";
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
  client_id: string;
  freelancer_id: string;
};

type Message = {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read?: boolean;
};

type MilestoneItem = {
  id: string;
  order_id: string;
  title: string;
  amount: number;
  due_date: string | null;
  status: string;
  created_at: string;
};

type Dispute = {
  id: string;
  order_id: string;
  opened_by: string;
  reason: string;
  admin_resolution: string | null;
  status: string;
  created_at: string;
  resolved_at: string | null;
};

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending Review", className: "bg-secondary text-secondary-foreground" },
  accepted: { label: "Accepted", className: "bg-primary/10 text-primary" },
  in_progress: { label: "In Progress", className: "bg-primary/10 text-primary" },
  delivered: { label: "Delivered", className: "bg-warning/15 text-warning" },
  completed: { label: "Completed", className: "bg-success/15 text-success" },
  disputed: { label: "Disputed", className: "bg-destructive/10 text-destructive" },
  refunded: { label: "Refunded", className: "bg-muted text-muted-foreground" },
};

const StarPicker = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
  <div className="flex gap-1.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <button key={n} type="button" onClick={() => onChange(n)} className="transition-transform hover:scale-110">
        <Star className={`h-7 w-7 transition-colors ${n <= value ? "fill-warning text-warning" : "text-muted-foreground/40"}`} />
      </button>
    ))}
  </div>
);

const OrderDetail = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const bottomRef = useRef<HTMLDivElement>(null);

  const [order, setOrder] = useState<Order | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [msgContent, setMsgContent] = useState("");
  const [sending, setSending] = useState(false);
  const [violationWarning, setViolationWarning] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const [showRating, setShowRating] = useState(false);
  const [ratingValue, setRatingValue] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);

  // Milestones
  const [milestones, setMilestones] = useState<MilestoneItem[]>([]);
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState("");
  const [newMilestoneAmount, setNewMilestoneAmount] = useState("");

  // Disputes
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");

  // Unread count
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!orderId) return;
    Promise.all([
      supabase.from("orders").select("*").eq("id", orderId).single(),
      supabase.from("messages").select("*").eq("order_id", orderId).order("created_at"),
      supabase.from("order_milestones").select("*").eq("order_id", orderId).order("created_at"),
      supabase.from("disputes").select("*").eq("order_id", orderId).order("created_at"),
    ]).then(([orderRes, msgRes, milestoneRes, disputeRes]) => {
      setOrder(orderRes.data as Order | null);
      const msgs = (msgRes.data ?? []) as Message[];
      setMessages(msgs);
      setMilestones((milestoneRes.data ?? []) as MilestoneItem[]);
      setDisputes((disputeRes.data ?? []) as Dispute[]);
      setLoading(false);

      // Count unread (messages not from me and not read)
      if (user) {
        const unread = msgs.filter(m => m.sender_id !== user.id && !m.is_read).length;
        setUnreadCount(unread);
        // Mark messages as read
        if (unread > 0) {
          const unreadIds = msgs.filter(m => m.sender_id !== user.id && !m.is_read).map(m => m.id);
          supabase.from("messages").update({ is_read: true } as any).in("id", unreadIds).then();
        }
      }
    });

    const channel = supabase
      .channel(`order-${orderId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `order_id=eq.${orderId}` },
        (payload) => { setMessages((prev) => [...prev, payload.new as Message]); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [orderId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!msgContent.trim() || !user || !orderId) return;
    setSending(true);
    setViolationWarning("");

    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-message`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ order_id: orderId, content: msgContent.trim() }),
      }
    );

    const data = await res.json();
    setSending(false);

    if (data.blocked) {
      setViolationWarning(data.message);
    } else if (data.error) {
      toast({ title: "Error", description: data.error, variant: "destructive" });
    } else {
      setMsgContent("");
    }
  };

  const updateStatus = async (newStatus: string, newEscrow?: string) => {
    if (!orderId) return;
    setActionLoading(true);
    const update: Record<string, string> = { status: newStatus };
    if (newEscrow) update.escrow_status = newEscrow;
    const { error } = await supabase.from("orders").update(update).eq("id", orderId);
    setActionLoading(false);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } else {
      setOrder((prev) => prev ? { ...prev, status: newStatus, escrow_status: newEscrow ?? prev.escrow_status } : prev);
      toast({ title: "Order updated" });
    }
  };

  const escrowAction = async (action: string) => {
    if (!orderId) return;
    setActionLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/escrow`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ action, order_id: orderId }),
        }
      );
      const data = await res.json();
      if (!res.ok || data.error) {
        toast({ title: "Escrow error", description: data.error || "Something went wrong", variant: "destructive" });
      } else {
        const { data: updated } = await supabase.from("orders").select("*").eq("id", orderId).single();
        if (updated) setOrder(updated as Order);
        toast({ title: action === "create_transaction" ? "Escrow funded successfully" : "Funds released successfully" });
        if (action === "release_funds") setShowRating(true);
      }
    } catch (err: any) {
      toast({ title: "Escrow error", description: err.message, variant: "destructive" });
    }
    setActionLoading(false);
  };

  const submitRating = async () => {
    if (!user || !order) return;
    setSubmittingRating(true);
    const revieweeId = role === "client" ? order.freelancer_id : order.client_id;
    const { error } = await supabase.from("ratings").insert({
      order_id: order.id,
      reviewer_id: user.id,
      reviewee_id: revieweeId,
      rating: ratingValue,
      review_text: reviewText.trim() || null,
    });
    setSubmittingRating(false);
    if (error) {
      toast({ title: "Failed to submit rating", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Rating submitted!" });
      setShowRating(false);
    }
  };

  const addMilestone = async () => {
    if (!newMilestoneTitle.trim() || !newMilestoneAmount || !orderId) return;
    const { data, error } = await supabase.from("order_milestones").insert({
      order_id: orderId,
      title: newMilestoneTitle.trim(),
      amount: parseFloat(newMilestoneAmount),
    } as any).select().single();
    if (error) {
      toast({ title: "Failed to add milestone", description: error.message, variant: "destructive" });
    } else {
      setMilestones(prev => [...prev, data as any]);
      setNewMilestoneTitle("");
      setNewMilestoneAmount("");
      setShowAddMilestone(false);
      toast({ title: "Milestone added" });
    }
  };

  const updateMilestoneStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("order_milestones").update({ status } as any).eq("id", id);
    if (error) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
    } else {
      setMilestones(prev => prev.map(m => m.id === id ? { ...m, status } : m));
    }
  };

  const openDispute = async () => {
    if (!disputeReason.trim() || !orderId || !user) return;
    const { data, error } = await supabase.from("disputes").insert({
      order_id: orderId,
      opened_by: user.id,
      reason: disputeReason.trim(),
    } as any).select().single();
    if (error) {
      toast({ title: "Failed to open dispute", description: error.message, variant: "destructive" });
    } else {
      setDisputes(prev => [...prev, data as any]);
      setDisputeReason("");
      setShowDisputeForm(false);
      updateStatus("disputed");
      toast({ title: "Dispute opened" });
    }
  };

  if (loading) {
    return <AppShell><div className="flex justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div></AppShell>;
  }

  if (!order) {
    return <AppShell><div className="text-center py-24 text-muted-foreground">Order not found.</div></AppShell>;
  }

  const isClient = user?.id === order.client_id;
  const isFreelancer = user?.id === order.freelancer_id;
  const statusCfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;

  const completedMilestones = milestones.filter(m => m.status === "completed").length;
  const milestoneProgress = milestones.length > 0 ? (completedMilestones / milestones.length) * 100 : 0;

  const getStepLabel = () => {
    if (isFreelancer && order.status === "pending") return "Step: Review and accept or decline the order";
    if (isClient && order.status === "accepted") return "Step: Confirm payment to move to escrow";
    if (isFreelancer && order.status === "in_progress") return "Step: Work on the project and mark as delivered";
    if (isClient && order.status === "delivered") return "Step: Review delivery and approve or dispute";
    return null;
  };

  const stepLabel = getStepLabel();

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-10">
        <button onClick={() => navigate(-1)} className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-all">
          <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
        </button>

        {/* Order Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="dossier-card rounded-3xl bg-card border border-border/40 overflow-hidden shadow-sm hover:shadow-elegant transition-all">
            <CardContent className="p-10">
              <div className="flex flex-col lg:flex-row lg:items-center gap-10">
                <div className="space-y-6 flex-1 border-b lg:border-b-0 lg:border-r border-border/40 pb-10 lg:pb-0 lg:pr-10">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Badge className={`${statusCfg.className} rounded-xl px-3 py-1 text-[9px] font-bold uppercase tracking-wider border-0 shadow-sm`}>
                        {statusCfg.label}
                      </Badge>
                      <span className="font-display text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Order #{orderId?.slice(-6).toUpperCase()}</span>
                    </div>
                    <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">{order.title}</h1>
                  </div>

                  <div className="flex items-center gap-4 text-sm font-bold flex-wrap">
                    <div className="flex flex-col">
                      <span className="font-display text-[9px] uppercase tracking-widest text-muted-foreground/60 mb-1">Budget</span>
                      <span className="flex items-center gap-2 text-xl text-primary font-display font-bold">
                        <DollarSign className="h-4 w-4" />{order.budget.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-10 w-px bg-border/40 mx-2" />
                    <div className="flex flex-col">
                      <span className="font-display text-[9px] uppercase tracking-widest text-muted-foreground/60 mb-1">Timeline</span>
                      <span className="flex items-center gap-2 text-foreground font-display font-medium">
                        <Clock className="h-4 w-4 text-muted-foreground/40" />
                        {order.deadline ? new Date(order.deadline).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : "Flexible"}
                      </span>
                    </div>
                    {order.escrow_status !== "none" && (
                      <>
                        <div className="h-10 w-px bg-border/40 mx-2" />
                        <div className="flex flex-col">
                          <span className="font-display text-[9px] uppercase tracking-widest text-muted-foreground/60 mb-1">Escrow Status</span>
                          <span className="flex items-center gap-2 text-warning font-display font-bold">
                            <ShieldCheck className="h-4 w-4" /> {order.escrow_status.toUpperCase()}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed max-w-2xl">{order.description}</p>
                </div>

                {/* Right: Actions */}
                <div className="lg:w-64 space-y-6 flex flex-col items-center lg:items-stretch text-center lg:text-left">
                  <div className="space-y-1">
                    <span className="font-display text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">Next Step</span>
                    {stepLabel ? (
                      <p className="font-display text-sm font-bold text-primary leading-tight">{stepLabel}</p>
                    ) : (
                      <p className="font-display text-sm font-bold text-muted-foreground leading-tight">Project active. Maintain regular updates.</p>
                    )}
                  </div>

                  <div className="grid gap-3 w-full">
                    {isFreelancer && order.status === "pending" && (
                      <>
                        <Button size="lg" className="w-full rounded-2xl gap-2 bg-gradient-to-r from-primary to-primary-glow border-0 text-primary-foreground hover:scale-[1.02] transition-transform shadow-elegant" onClick={() => updateStatus("accepted")} disabled={actionLoading}>
                          <CheckCircle className="h-4 w-4" /> Accept Order
                        </Button>
                        <Button size="lg" variant="outline" className="w-full rounded-2xl border-2 font-bold" onClick={() => updateStatus("refunded")} disabled={actionLoading}>
                          Decline
                        </Button>
                      </>
                    )}
                    {isClient && order.status === "accepted" && (
                      <Button size="lg" className="w-full rounded-2xl gap-2 bg-gradient-to-r from-primary to-primary-glow border-0 text-primary-foreground hover:scale-[1.02] transition-transform shadow-elegant" onClick={() => escrowAction("create_transaction")} disabled={actionLoading}>
                        <DollarSign className="h-4 w-4" /> Fund Escrow & Start
                      </Button>
                    )}
                    {isFreelancer && order.status === "in_progress" && (
                      <Button size="lg" className="w-full rounded-2xl gap-2 bg-gradient-to-r from-primary to-primary-glow border-0 text-primary-foreground hover:scale-[1.02] transition-transform shadow-elegant" onClick={() => updateStatus("delivered")} disabled={actionLoading}>
                        <CheckCircle className="h-4 w-4" /> Mark as Delivered
                      </Button>
                    )}
                    {isClient && order.status === "delivered" && (
                      <>
                        <Button size="lg" className="w-full rounded-2xl gap-2 bg-gradient-to-r from-primary to-primary-glow border-0 text-primary-foreground hover:scale-[1.02] transition-transform shadow-elegant" onClick={() => escrowAction("release_funds")} disabled={actionLoading}>
                          <CheckCircle className="h-4 w-4" /> Approve & Pay
                        </Button>
                        <Button size="lg" variant="destructive" className="w-full rounded-2xl border-0 font-bold" onClick={() => setShowDisputeForm(true)} disabled={actionLoading}>
                          <AlertTriangle className="h-4 w-4" /> Dispute
                        </Button>
                      </>
                    )}
                    {order.status === "completed" && (
                      <Button size="lg" variant="outline" className="w-full rounded-2xl gap-2 border-2 font-bold" onClick={() => setShowRating(true)}>
                        <Star className="h-4 w-4" /> Leave a Review
                      </Button>
                    )}
                  </div>
                  {actionLoading && <div className="flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-primary/40" /></div>}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Milestones Section */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <Card className="rounded-3xl border border-border/40 overflow-hidden shadow-sm">
            <CardHeader className="px-8 py-6 border-b border-border/40 bg-muted/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 flex items-center justify-center rounded-[1.25rem] bg-primary/10 border border-primary/20 text-primary">
                    <Milestone className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="font-display text-lg font-bold tracking-tight">Milestones</CardTitle>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                      {completedMilestones}/{milestones.length} completed
                    </p>
                  </div>
                </div>
                {isClient && ["in_progress", "accepted"].includes(order.status) && (
                  <Button size="sm" variant="outline" className="rounded-xl gap-1.5" onClick={() => setShowAddMilestone(true)}>
                    <Plus className="h-3.5 w-3.5" /> Add
                  </Button>
                )}
              </div>
              {milestones.length > 0 && (
                <Progress value={milestoneProgress} className="mt-4 h-2 rounded-full" />
              )}
            </CardHeader>
            <CardContent className="p-8">
              {milestones.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No milestones set yet.</p>
              ) : (
                <div className="space-y-4">
                  {milestones.map((m) => (
                    <div key={m.id} className="flex items-center justify-between p-4 rounded-2xl border border-border/30 bg-muted/10">
                      <div className="flex items-center gap-4">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${m.status === "completed" ? "bg-primary/15 text-primary" : "bg-muted/40 text-muted-foreground"}`}>
                          {m.status === "completed" ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold">{m.title}</p>
                          <p className="text-xs text-muted-foreground">${m.amount.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`rounded-lg text-[9px] font-bold uppercase tracking-wider border-0 ${m.status === "completed" ? "bg-primary/10 text-primary" : m.status === "in_progress" ? "bg-warning/15 text-warning" : "bg-secondary text-secondary-foreground"}`}>
                          {m.status}
                        </Badge>
                        {(isFreelancer || isClient) && m.status === "pending" && (
                          <Button size="sm" variant="ghost" className="text-xs" onClick={() => updateMilestoneStatus(m.id, "in_progress")}>Start</Button>
                        )}
                        {isFreelancer && m.status === "in_progress" && (
                          <Button size="sm" variant="ghost" className="text-xs" onClick={() => updateMilestoneStatus(m.id, "completed")}>Complete</Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add milestone form */}
              <AnimatePresence>
                {showAddMilestone && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-4 space-y-3 p-4 rounded-2xl border border-border/30 bg-muted/10">
                    <Input placeholder="Milestone title" value={newMilestoneTitle} onChange={e => setNewMilestoneTitle(e.target.value)} className="h-12 rounded-xl" />
                    <Input placeholder="Amount ($)" type="number" value={newMilestoneAmount} onChange={e => setNewMilestoneAmount(e.target.value)} className="h-12 rounded-xl" />
                    <div className="flex gap-2">
                      <Button onClick={addMilestone} className="rounded-xl">Add Milestone</Button>
                      <Button variant="ghost" onClick={() => setShowAddMilestone(false)} className="rounded-xl">Cancel</Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Disputes Section */}
        {disputes.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
            <Card className="rounded-3xl border border-destructive/20 overflow-hidden shadow-sm">
              <CardHeader className="px-8 py-6 border-b border-destructive/20 bg-destructive/5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 flex items-center justify-center rounded-[1.25rem] bg-destructive/10 text-destructive">
                    <Flag className="h-5 w-5" />
                  </div>
                  <CardTitle className="font-display text-lg font-bold tracking-tight text-destructive">Disputes</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-4">
                {disputes.map(d => (
                  <div key={d.id} className="p-4 rounded-2xl border border-border/30 bg-muted/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge className={`rounded-lg text-[9px] font-bold uppercase border-0 ${d.status === "open" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
                        {d.status}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">{new Date(d.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm font-medium">{d.reason}</p>
                    {d.admin_resolution && (
                      <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Admin Resolution</p>
                        <p className="text-sm">{d.admin_resolution}</p>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Dispute Form Modal */}
        <AnimatePresence>
          {showDisputeForm && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-md rounded-[2.5rem] border border-border/40 bg-card shadow-elegant p-10 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-2xl font-bold tracking-tight">Open a Dispute</h3>
                  <button onClick={() => setShowDisputeForm(false)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-muted/40 text-muted-foreground hover:text-foreground transition-colors">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <Textarea placeholder="Describe the issue in detail..." value={disputeReason} onChange={e => setDisputeReason(e.target.value)} rows={4} className="resize-none rounded-2xl" />
                <div className="flex gap-4">
                  <Button className="flex-1 h-14 rounded-2xl" variant="destructive" onClick={openDispute} disabled={!disputeReason.trim()}>
                    <Flag className="h-4 w-4 mr-2" /> Submit Dispute
                  </Button>
                  <Button variant="ghost" className="h-14 rounded-2xl" onClick={() => setShowDisputeForm(false)}>Cancel</Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rating modal */}
        <AnimatePresence>
          {showRating && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
              <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="w-full max-w-md rounded-[2.5rem] border border-border/40 bg-card shadow-elegant p-10 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-display text-2xl font-bold tracking-tight">Leave a Review</h3>
                    <p className="text-xs text-muted-foreground font-medium">Rate your experience</p>
                  </div>
                  <button onClick={() => setShowRating(false)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-muted/40 text-muted-foreground hover:text-foreground transition-colors">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="space-y-8">
                  <div className="text-center py-4 bg-muted/20 rounded-[2rem] border border-border/20">
                    <StarPicker value={ratingValue} onChange={setRatingValue} />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary mt-4">
                      {ratingValue === 5 ? "Exceptional Delivery" : ratingValue === 4 ? "Above Standard" : ratingValue === 3 ? "Standard Met" : ratingValue === 2 ? "Below Standard" : "Unsatisfactory"}
                    </p>
                  </div>
                  <Textarea placeholder="Provide a detailed assessment..." value={reviewText} onChange={(e) => setReviewText(e.target.value)} rows={4} className="resize-none rounded-2xl bg-muted/20 border-border/40 p-4 text-sm" />
                  <div className="flex gap-4">
                    <Button className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-primary to-primary-glow border-0 text-primary-foreground hover:scale-[1.02] transition-transform shadow-elegant font-bold" onClick={submitRating} disabled={submittingRating}>
                      {submittingRating ? <Loader2 className="h-5 w-5 animate-spin" /> : "Submit Assessment"}
                    </Button>
                    <Button variant="ghost" className="h-14 rounded-2xl font-bold" onClick={() => setShowRating(false)}>Cancel</Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat */}
        <Card className="dossier-card rounded-3xl border border-border/40 overflow-hidden shadow-sm hover:shadow-elegant transition-all flex flex-col bg-card">
          <CardHeader className="px-8 py-6 border-b border-border/40 bg-muted/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 flex items-center justify-center rounded-[1.25rem] bg-primary/10 border border-primary/20 text-primary relative">
                  <MessageSquare className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div>
                  <CardTitle className="font-display text-lg font-bold tracking-tight">Messages</CardTitle>
                  <div className="flex items-center gap-1.5 font-display text-[9px] font-bold text-emerald-500 uppercase tracking-widest">
                    <ShieldCheck className="h-3 w-3" /> Secure Channel
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex flex-col">
            <div className="chat-scroll flex flex-col gap-6 p-8 min-h-[400px] max-h-[500px] overflow-y-auto">
              {messages.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center text-sm text-muted-foreground gap-4 py-12">
                  <div className="h-16 w-16 rounded-full bg-muted/30 flex items-center justify-center">
                    <Send className="h-8 w-8 text-muted-foreground/20" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold uppercase tracking-widest text-[10px] text-muted-foreground/40 mb-1">No messages yet</p>
                    <p className="text-sm">Start the conversation with your partner.</p>
                  </div>
                </div>
              )}
              {messages.map((m, idx) => {
                const isOwn = m.sender_id === user?.id;
                const nextMsg = messages[idx + 1];
                const isLastInGroup = !nextMsg || nextMsg.sender_id !== m.sender_id;

                return (
                  <div key={m.id} className={`flex group/msg ${isOwn ? "flex-row-reverse" : "flex-row"} gap-4 items-end`}>
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[1.25rem] font-display text-xs font-bold shadow-sm transition-all
                      ${isLastInGroup ? "opacity-100 scale-100" : "opacity-0 scale-90 select-none"}
                      ${isOwn ? "bg-primary text-primary-foreground" : "bg-white border border-border/40 text-muted-foreground"}`}>
                      {isOwn ? "ME" : "RP"}
                    </div>
                    <div className={`flex flex-col gap-1.5 max-w-[75%] ${isOwn ? "items-end" : "items-start"}`}>
                      <div className={`relative px-6 py-4 text-sm font-medium leading-relaxed shadow-sm transition-all hover:shadow-elegant
                        ${isOwn
                          ? "bg-gradient-to-br from-primary to-primary-glow text-primary-foreground rounded-[2rem] rounded-br-[0.5rem]"
                          : "bg-white border border-border/40 text-foreground rounded-[2rem] rounded-bl-[0.5rem]"
                        }`}>
                        {m.content}
                      </div>
                      <div className="flex items-center gap-2 px-2 font-display text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest opacity-0 group-hover/msg:opacity-100 transition-opacity">
                        {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        {isOwn && <ShieldCheck className="h-3 w-3 text-primary/40" />}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            <AnimatePresence>
              {violationWarning && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mx-8 mb-4 flex items-start gap-4 rounded-2xl border border-destructive/20 bg-destructive/5 p-5 text-xs text-destructive shadow-sm">
                  <AlertTriangle className="h-5 w-5 shrink-0 opacity-70" />
                  <div className="flex-1 space-y-1">
                    <p className="font-bold uppercase tracking-widest text-[10px]">Security Violation Detected</p>
                    <p className="leading-relaxed font-medium">{violationWarning}</p>
                  </div>
                  <button onClick={() => setViolationWarning("")} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-destructive/10 transition-colors"><X className="h-4 w-4" /></button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="p-6 border-t border-border/40 bg-muted/5">
              <div className="relative group/input flex items-end gap-3 rounded-[2rem] bg-white border border-border/40 p-2 pl-6 pr-2 focus-within:border-primary/40 transition-all focus-within:shadow-elegant">
                <Textarea
                  placeholder="Type a message... (Shift+Enter for new line)"
                  value={msgContent}
                  onChange={(e) => setMsgContent(e.target.value)}
                  rows={1}
                  className="flex-1 bg-transparent border-0 ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[44px] py-3 text-sm font-medium resize-none placeholder:text-muted-foreground/30"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
                  }}
                />
                <Button
                  onClick={handleSend}
                  disabled={sending || !msgContent.trim()}
                  className="shrink-0 h-11 w-11 rounded-[1.25rem] bg-gradient-to-br from-primary to-primary-glow border-0 text-primary-foreground hover:scale-105 transition-transform shadow-elegant overflow-hidden p-0"
                >
                  {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </Button>
              </div>
              <p className="font-display text-[9px] font-medium text-muted-foreground/40 text-center mt-4">
                All communication is monitored to protect both parties.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
};

export default OrderDetail;
