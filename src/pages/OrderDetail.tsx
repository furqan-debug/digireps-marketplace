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
import { Loader2, Send, ArrowLeft, AlertTriangle, DollarSign, Clock, Star, X, CheckCircle, RotateCcw } from "lucide-react";
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
  pending:     { label: "Pending Review", className: "bg-secondary text-secondary-foreground" },
  accepted:    { label: "Accepted",       className: "bg-primary/10 text-primary" },
  in_progress: { label: "In Progress",    className: "bg-primary/10 text-primary" },
  delivered:   { label: "Delivered",      className: "bg-warning/15 text-warning" },
  completed:   { label: "Completed",      className: "bg-success/15 text-success" },
  disputed:    { label: "Disputed",       className: "bg-destructive/10 text-destructive" },
  refunded:    { label: "Refunded",       className: "bg-muted text-muted-foreground" },
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
      <div className="max-w-4xl mx-auto space-y-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Orders
        </button>

        {/* Order Header — split layout */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card>
            <CardContent className="pt-6 pb-5">
              <div className="flex flex-col lg:flex-row lg:items-start gap-5 justify-between">
                {/* Left: Info */}
                <div className="space-y-3 flex-1">
                  <div>
                    <h1 className="font-display text-2xl font-bold">{order.title}</h1>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1.5 flex-wrap">
                      <span className="flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs">
                        <DollarSign className="h-3 w-3" />${order.budget.toLocaleString()}
                      </span>
                      {order.deadline && (
                        <span className="flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs">
                          <Clock className="h-3 w-3" />Due {new Date(order.deadline).toLocaleDateString()}
                        </span>
                      )}
                      {order.escrow_status !== "none" && (
                        <span className="flex items-center gap-1.5 rounded-full border border-warning/30 bg-warning/10 px-3 py-1 text-xs text-warning">
                          Escrow: {order.escrow_status}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{order.description}</p>
                </div>

                {/* Right: Status + Actions */}
                <div className="lg:w-56 space-y-3 shrink-0">
                  <div className="flex lg:justify-end">
                    <Badge className={`${statusCfg.className} text-sm px-3 py-1`}>{statusCfg.label}</Badge>
                  </div>

                  {/* Step label */}
                  {stepLabel && (
                    <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-primary leading-relaxed">
                      {stepLabel}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex flex-col gap-2">
                    {isFreelancer && order.status === "pending" && (
                      <>
                        <Button size="sm" className="w-full gap-1.5 bg-gradient-to-r from-primary to-primary-glow border-0 text-primary-foreground hover:opacity-90" onClick={() => updateStatus("accepted")} disabled={actionLoading}>
                          <CheckCircle className="h-3.5 w-3.5" /> Accept Order
                        </Button>
                        <Button size="sm" variant="outline" className="w-full" onClick={() => updateStatus("refunded")} disabled={actionLoading}>
                          Decline
                        </Button>
                      </>
                    )}
                    {isClient && order.status === "accepted" && (
                      <Button size="sm" className="w-full gap-1.5 bg-gradient-to-r from-primary to-primary-glow border-0 text-primary-foreground hover:opacity-90" onClick={() => updateStatus("in_progress", "held")} disabled={actionLoading}>
                        <DollarSign className="h-3.5 w-3.5" /> Confirm & Pay
                      </Button>
                    )}
                    {isFreelancer && order.status === "in_progress" && (
                      <Button size="sm" className="w-full gap-1.5 bg-gradient-to-r from-primary to-primary-glow border-0 text-primary-foreground hover:opacity-90" onClick={() => updateStatus("delivered")} disabled={actionLoading}>
                        <CheckCircle className="h-3.5 w-3.5" /> Mark as Delivered
                      </Button>
                    )}
                    {isClient && order.status === "delivered" && (
                      <>
                        <Button size="sm" className="w-full gap-1.5 bg-gradient-to-r from-primary to-primary-glow border-0 text-primary-foreground hover:opacity-90" onClick={() => { updateStatus("completed", "released"); setShowRating(true); }} disabled={actionLoading}>
                          <CheckCircle className="h-3.5 w-3.5" /> Approve & Complete
                        </Button>
                        <Button size="sm" variant="destructive" className="w-full" onClick={() => updateStatus("disputed")} disabled={actionLoading}>
                          <AlertTriangle className="h-3.5 w-3.5" /> Raise Dispute
                        </Button>
                      </>
                    )}
                    {order.status === "completed" && (
                      <Button size="sm" variant="outline" className="w-full gap-1.5" onClick={() => setShowRating(true)}>
                        <Star className="h-3.5 w-3.5" /> Leave a Review
                      </Button>
                    )}
                  </div>
                  {actionLoading && <div className="flex justify-center"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>}
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
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-md rounded-2xl border border-border/60 bg-card shadow-elegant p-6 space-y-5"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-semibold">Leave a Rating</h3>
                  <button onClick={() => setShowRating(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="text-center py-2">
                    <StarPicker value={ratingValue} onChange={setRatingValue} />
                    <p className="text-sm text-muted-foreground mt-2">
                      {ratingValue === 5 ? "Excellent!" : ratingValue === 4 ? "Great!" : ratingValue === 3 ? "Good" : ratingValue === 2 ? "Fair" : "Poor"}
                    </p>
                  </div>
                  <Textarea
                    placeholder="Optional review message..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                  <div className="flex gap-3">
                    <Button className="flex-1 bg-gradient-to-r from-primary to-primary-glow border-0 text-primary-foreground hover:opacity-90" onClick={submitRating} disabled={submittingRating}>
                      {submittingRating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Rating"}
                    </Button>
                    <Button variant="ghost" onClick={() => setShowRating(false)}>Cancel</Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="font-display text-lg">Project Chat</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex flex-col">
            {/* Messages */}
            <div className="chat-scroll flex flex-col gap-3 p-5 min-h-[320px] max-h-[420px] overflow-y-auto">
              {messages.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center text-sm text-muted-foreground gap-2 py-8">
                  <Send className="h-8 w-8 text-muted-foreground/30" />
                  <p>No messages yet. Start the conversation.</p>
                </div>
              )}
              {messages.map((m) => {
                const isOwn = m.sender_id === user?.id;
                const initials = isOwn ? "Me" : "TM";
                return (
                  <div key={m.id} className={`flex gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
                    {/* Avatar */}
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold mt-1 ${isOwn ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      {initials}
                    </div>
                    <div className={`flex flex-col gap-1 max-w-[72%] ${isOwn ? "items-end" : "items-start"}`}>
                      <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed
                        ${isOwn
                          ? "bg-gradient-to-br from-primary to-primary-glow text-primary-foreground rounded-br-sm"
                          : "bg-muted text-foreground rounded-bl-sm"
                        }`}>
                        {m.content}
                      </div>
                      <div className="text-[10px] text-muted-foreground/60 px-1">
                        {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Violation warning — dismissible */}
            <AnimatePresence>
              {violationWarning && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mx-4 mb-2 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/8 px-4 py-3 text-xs text-destructive"
                >
                  <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span className="flex-1">{violationWarning}</span>
                  <button onClick={() => setViolationWarning("")} className="shrink-0 hover:opacity-70"><X className="h-3.5 w-3.5" /></button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input */}
            <div className="flex gap-2 p-4 pt-2 border-t">
              <Textarea
                placeholder="Type a message... (no external contact info)"
                value={msgContent}
                onChange={(e) => setMsgContent(e.target.value)}
                rows={2}
                className="resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
                }}
              />
              <Button
                onClick={handleSend}
                disabled={sending || !msgContent.trim()}
                className="shrink-0 h-auto self-end bg-gradient-to-br from-primary to-primary-glow border-0 text-primary-foreground hover:opacity-90 shadow-elegant"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
};

export default OrderDetail;
