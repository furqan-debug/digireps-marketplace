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
import { Loader2, Send, ArrowLeft, AlertTriangle, DollarSign, Clock, Star } from "lucide-react";

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

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending Review",
  accepted: "Accepted",
  in_progress: "In Progress",
  delivered: "Delivered",
  completed: "Completed",
  disputed: "Disputed",
  refunded: "Refunded",
};

const StarPicker = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((n) => (
      <button key={n} type="button" onClick={() => onChange(n)}>
        <Star className={`h-6 w-6 transition-colors ${n <= value ? "fill-warning text-warning" : "text-muted-foreground"}`} />
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

  // Rating state
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

    // Realtime subscription
    const channel = supabase
      .channel(`order-${orderId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `order_id=eq.${orderId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Orders
        </button>

        {/* Order Info */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle className="font-display text-xl">{order.title}</CardTitle>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1 flex-wrap">
                  <span className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" />${order.budget.toLocaleString()}</span>
                  {order.deadline && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />Due {new Date(order.deadline).toLocaleDateString()}</span>}
                </div>
              </div>
              <Badge className="capitalize">{STATUS_LABEL[order.status] ?? order.status}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{order.description}</p>

            {/* Action buttons based on role + status */}
            <div className="flex flex-wrap gap-2 pt-1">
              {isFreelancer && order.status === "pending" && (
                <>
                  <Button size="sm" onClick={() => updateStatus("accepted")} disabled={actionLoading}>
                    Accept Order
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => updateStatus("refunded")} disabled={actionLoading}>
                    Decline
                  </Button>
                </>
              )}
              {isClient && order.status === "accepted" && (
                <Button size="sm" onClick={() => updateStatus("in_progress", "held")} disabled={actionLoading}>
                  Confirm & Pay (Escrow)
                </Button>
              )}
              {isFreelancer && order.status === "in_progress" && (
                <Button size="sm" onClick={() => updateStatus("delivered")} disabled={actionLoading}>
                  Mark as Delivered
                </Button>
              )}
              {isClient && order.status === "delivered" && (
                <>
                  <Button size="sm" onClick={() => { updateStatus("completed", "released"); setShowRating(true); }} disabled={actionLoading}>
                    Approve & Complete
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => updateStatus("disputed")} disabled={actionLoading}>
                    Raise Dispute
                  </Button>
                </>
              )}
              {order.status === "completed" && (
                <Button size="sm" variant="outline" onClick={() => setShowRating(true)}>
                  Leave a Review
                </Button>
              )}
            </div>

            {/* Rating form */}
            {showRating && (
              <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
                <h3 className="font-medium text-sm">Leave a Rating</h3>
                <StarPicker value={ratingValue} onChange={setRatingValue} />
                <Textarea
                  placeholder="Optional review..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={submitRating} disabled={submittingRating}>
                    {submittingRating ? <Loader2 className="h-3 w-3 animate-spin" /> : "Submit Rating"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowRating(false)}>Cancel</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chat */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="font-display text-lg">Project Chat</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex flex-col">
            {/* Messages */}
            <div className="flex flex-col gap-3 p-4 min-h-[300px] max-h-[400px] overflow-y-auto">
              {messages.length === 0 && (
                <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
                  No messages yet. Start the conversation.
                </div>
              )}
              {messages.map((m) => {
                const isOwn = m.sender_id === user?.id;
                return (
                  <div key={m.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed
                      ${isOwn
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted text-foreground rounded-bl-sm"
                      }`}>
                      {m.content}
                      <div className={`text-[10px] mt-0.5 ${isOwn ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                        {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Violation warning */}
            {violationWarning && (
              <div className="mx-4 mb-2 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                {violationWarning}
              </div>
            )}

            {/* Input */}
            <div className="flex gap-2 p-4 pt-0">
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
              <Button onClick={handleSend} disabled={sending || !msgContent.trim()} className="shrink-0 h-auto">
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
