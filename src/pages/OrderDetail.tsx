import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send, ArrowLeft, AlertTriangle, DollarSign, Clock, Star, X, CheckCircle, RotateCcw, ShieldCheck, MessageSquare } from "lucide-react";
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

  useEffect(() => {
    if (!orderId) return;
    Promise.all([
      supabase.from("orders").select("*").eq("id", orderId).single(),
      supabase.from("messages").select("*").eq("order_id", orderId).order("created_at"),
    ]).then(([orderRes, msgRes]) => {
      setOrder(orderRes.data as Order | null);
      setMessages(msgRes.data ?? []);
      setLoading(false);
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

  if (loading) {
    return <AppShell><div className="flex justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div></AppShell>;
  }

  if (!order) {
    return <AppShell><div className="text-center py-24 text-muted-foreground">Order not found.</div></AppShell>;
  }

  const isClient = user?.id === order.client_id;
  const isFreelancer = user?.id === order.freelancer_id;
  const statusCfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;

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

        {/* Order Header — Elite Workspace style */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="rounded-[2.5rem] border-border/40 overflow-hidden shadow-sm">
            <CardContent className="p-10">
              <div className="flex flex-col lg:flex-row lg:items-center gap-10">
                {/* Left: Branding + Info */}
                <div className="space-y-6 flex-1 border-b lg:border-b-0 lg:border-r border-border/40 pb-10 lg:pb-0 lg:pr-10">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Badge className={`${statusCfg.className} rounded-xl px-3 py-1 text-[10px] font-bold uppercase tracking-wider border-0 shadow-sm`}>
                        {statusCfg.label}
                      </Badge>
                      <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Workspace ID: #{orderId?.slice(-6).toUpperCase()}</span>
                    </div>
                    <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">{order.title}</h1>
                  </div>

                  <div className="flex items-center gap-4 text-sm font-bold flex-wrap">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-1">Contract Budget</span>
                      <span className="flex items-center gap-2 text-xl text-primary font-display font-bold">
                        <DollarSign className="h-4 w-4" />{order.budget.toLocaleString()}
                      </span>
                    </div>

                    <div className="h-10 w-px bg-border/40 mx-2" />

                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-1">Timeline</span>
                      <span className="flex items-center gap-2 text-foreground font-display font-medium">
                        <Clock className="h-4 w-4 text-muted-foreground/40" />
                        {order.deadline ? new Date(order.deadline).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : "Flexible"}
                      </span>
                    </div>

                    {order.escrow_status !== "none" && (
                      <>
                        <div className="h-10 w-px bg-border/40 mx-2" />
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-1">Escrow Status</span>
                          <span className="flex items-center gap-2 text-warning font-display font-bold">
                            <ShieldCheck className="h-4 w-4" /> {order.escrow_status.toUpperCase()}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">{order.description}</p>
                </div>

                {/* Right: Actions Context */}
                <div className="lg:w-64 space-y-6 flex flex-col items-center lg:items-stretch text-center lg:text-left">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Engagement Phase</span>
                    {stepLabel ? (
                      <p className="text-sm font-bold text-primary leading-tight">{stepLabel}</p>
                    ) : (
                      <p className="text-sm font-bold text-muted-foreground leading-tight">Project active. Maintain regular updates.</p>
                    )}
                  </div>

                  {/* Actions Grid */}
                  <div className="grid gap-3 w-full">
                    {isFreelancer && order.status === "pending" && (
                      <>
                        <Button size="lg" className="w-full rounded-2xl gap-2 bg-gradient-to-r from-primary to-primary-glow border-0 text-primary-foreground hover:scale-[1.02] transition-transform shadow-elegant" onClick={() => updateStatus("accepted")} disabled={actionLoading}>
                          <CheckCircle className="h-4 w-4" /> Accept Proposal
                        </Button>
                        <Button size="lg" variant="outline" className="w-full rounded-2xl border-2 font-bold" onClick={() => updateStatus("refunded")} disabled={actionLoading}>
                          Decline
                        </Button>
                      </>
                    )}
                    {isClient && order.status === "accepted" && (
                      <Button size="lg" className="w-full rounded-2xl gap-2 bg-gradient-to-r from-primary to-primary-glow border-0 text-primary-foreground hover:scale-[1.02] transition-transform shadow-elegant" onClick={() => updateStatus("in_progress", "held")} disabled={actionLoading}>
                        <DollarSign className="h-4 w-4" /> Fund Escrow & Start
                      </Button>
                    )}
                    {isFreelancer && order.status === "in_progress" && (
                      <Button size="lg" className="w-full rounded-2xl gap-2 bg-gradient-to-r from-primary to-primary-glow border-0 text-primary-foreground hover:scale-[1.02] transition-transform shadow-elegant" onClick={() => updateStatus("delivered")} disabled={actionLoading}>
                        <CheckCircle className="h-4 w-4" /> Finalize & Deliver
                      </Button>
                    )}
                    {isClient && order.status === "delivered" && (
                      <>
                        <Button size="lg" className="w-full rounded-2xl gap-2 bg-gradient-to-r from-primary to-primary-glow border-0 text-primary-foreground hover:scale-[1.02] transition-transform shadow-elegant" onClick={() => { updateStatus("completed", "released"); setShowRating(true); }} disabled={actionLoading}>
                          <CheckCircle className="h-4 w-4" /> Approve Release
                        </Button>
                        <Button size="lg" variant="destructive" className="w-full rounded-2xl border-0 font-bold" onClick={() => updateStatus("disputed")} disabled={actionLoading}>
                          <AlertTriangle className="h-4 w-4" /> Dispute
                        </Button>
                      </>
                    )}
                    {order.status === "completed" && (
                      <Button size="lg" variant="outline" className="w-full rounded-2xl gap-2 border-2 font-bold" onClick={() => setShowRating(true)}>
                        <Star className="h-4 w-4" /> Post Review
                      </Button>
                    )}
                  </div>
                  {actionLoading && <div className="flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-primary/40" /></div>}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Rating modal overlay */}
        <AnimatePresence>
          {showRating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="w-full max-w-md rounded-[2.5rem] border border-border/40 bg-card shadow-elegant p-10 space-y-8"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-display text-2xl font-bold tracking-tight">Post Engagement Review</h3>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Rate the commercial experience</p>
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

                  <Textarea
                    placeholder="Provide a detailed assessment of the partner's performance..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    rows={4}
                    className="resize-none rounded-2xl bg-muted/20 border-border/40 focus:ring-primary/20 p-4 text-sm"
                  />

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

        {/* Chat - Elite Interface */}
        <Card className="rounded-[2.5rem] border-border/40 overflow-hidden shadow-sm flex flex-col bg-card/60 backdrop-blur-sm">
          <CardHeader className="px-8 py-6 border-b border-border/40 bg-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="font-display text-lg font-bold">Secure Command Center</CardTitle>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                    <ShieldCheck className="h-3 w-3" /> Encrypted Protocol Active
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex flex-col">
            {/* Messages */}
            <div className="chat-scroll flex flex-col gap-6 p-8 min-h-[400px] max-h-[500px] overflow-y-auto">
              {messages.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center text-sm text-muted-foreground gap-4 py-12">
                  <div className="h-16 w-16 rounded-full bg-muted/30 flex items-center justify-center">
                    <Send className="h-8 w-8 text-muted-foreground/20" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold uppercase tracking-widest text-[10px] text-muted-foreground/40 mb-1">Channel Initialized</p>
                    <p className="text-sm">Initiate secure communication with your partner.</p>
                  </div>
                </div>
              )}
              {messages.map((m, idx) => {
                const isOwn = m.sender_id === user?.id;
                const nextMsg = messages[idx + 1];
                const isLastInGroup = !nextMsg || nextMsg.sender_id !== m.sender_id;

                return (
                  <div key={m.id} className={`flex group/msg ${isOwn ? "flex-row-reverse" : "flex-row"} gap-4 items-end`}>
                    {/* Avatar (only on last in group) */}
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold shadow-sm transition-all
                      ${isLastInGroup ? "opacity-100 scale-100" : "opacity-0 scale-90 select-none"}
                      ${isOwn ? "bg-primary text-primary-foreground" : "bg-card border border-border/60 text-muted-foreground"}`}>
                      {isOwn ? "ME" : "RP"}
                    </div>

                    <div className={`flex flex-col gap-1.5 max-w-[75%] ${isOwn ? "items-end" : "items-start"}`}>
                      <div className={`relative px-5 py-4 text-sm leading-relaxed shadow-sm transition-all hover:shadow-md
                        ${isOwn
                          ? "bg-gradient-to-br from-primary to-primary-glow text-primary-foreground rounded-[1.5rem] rounded-br-sm"
                          : "bg-white border border-border/40 text-foreground rounded-[1.5rem] rounded-bl-sm"
                        }`}>
                        {m.content}
                      </div>
                      <div className="flex items-center gap-2 px-1 text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest opacity-0 group-hover/msg:opacity-100 transition-opacity">
                        {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        {isOwn && <ShieldCheck className="h-2.5 w-2.5 text-primary/40" />}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Violation warning — Modernized */}
            <AnimatePresence>
              {violationWarning && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mx-8 mb-4 flex items-start gap-4 rounded-2xl border border-destructive/20 bg-destructive/5 p-5 text-xs text-destructive shadow-sm"
                >
                  <AlertTriangle className="h-5 w-5 shrink-0 opacity-70" />
                  <div className="flex-1 space-y-1">
                    <p className="font-bold uppercase tracking-widest text-[10px]">Security Violation Detected</p>
                    <p className="leading-relaxed font-medium">{violationWarning}</p>
                  </div>
                  <button onClick={() => setViolationWarning("")} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-destructive/10 transition-colors"><X className="h-4 w-4" /></button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input - Elite Interface */}
            <div className="p-6 border-t border-border/40 bg-white/40">
              <div className="relative group/input flex items-end gap-3 rounded-[2rem] bg-card border-2 border-border/40 p-2 pl-6 pr-2 focus-within:border-primary/40 transition-all focus-within:shadow-elegant">
                <Textarea
                  placeholder="Transmission protocol... (No external contact allowed)"
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
                  className="shrink-0 h-11 w-11 rounded-2xl bg-gradient-to-br from-primary to-primary-glow border-0 text-primary-foreground hover:scale-105 transition-transform shadow-elegant overflow-hidden p-0"
                >
                  {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </Button>
              </div>
              <p className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest text-center mt-3">
                Commercial communication is monitored for security and compliance.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Decorative background elements */}
        <div className="fixed -bottom-32 -left-32 h-[30rem] w-[30rem] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
        <div className="fixed -top-32 -right-32 h-[30rem] w-[30rem] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
      </div>
    </AppShell>
  );
};

export default OrderDetail;
