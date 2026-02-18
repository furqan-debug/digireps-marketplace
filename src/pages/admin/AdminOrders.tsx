import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, RotateCcw, MessageSquare, DollarSign, Clock } from "lucide-react";

type Order = {
  id: string;
  title: string;
  budget: number;
  status: string;
  escrow_status: string;
  deadline: string | null;
  created_at: string;
  client_id: string;
  freelancer_id: string;
};

const STATUS_BADGE: Record<string, string> = {
  pending:     "bg-secondary text-secondary-foreground",
  accepted:    "bg-primary/10 text-primary",
  in_progress: "bg-primary/10 text-primary",
  delivered:   "bg-warning/15 text-warning",
  completed:   "bg-success/15 text-success",
  disputed:    "bg-destructive/10 text-destructive",
  refunded:    "bg-muted text-muted-foreground",
};

const AdminOrders = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actioning, setActioning] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setOrders((data ?? []) as Order[]);
        setLoading(false);
      });
  }, []);

  const triggerRefund = async (orderId: string) => {
    setActioning(orderId);
    const { error } = await supabase
      .from("orders")
      .update({ status: "refunded", escrow_status: "refunded" })
      .eq("id", orderId);
    setActioning(null);
    if (error) {
      toast({ title: "Failed to trigger refund", description: error.message, variant: "destructive" });
    } else {
      setOrders((prev) =>
        prev.map((o) => o.id === orderId ? { ...o, status: "refunded", escrow_status: "refunded" } : o)
      );
      toast({ title: "Refund triggered" });
    }
  };

  const filtered = orders.filter((o) =>
    o.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold">All Orders</h1>
            <p className="text-muted-foreground mt-1">Oversee all platform orders and trigger refunds.</p>
          </div>
          <Input
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="space-y-3">
            {filtered.map((o) => (
              <Card key={o.id}>
                <CardContent className="py-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{o.title}</span>
                        <Badge className={STATUS_BADGE[o.status] ?? ""}>
                          {o.status.replace("_", " ")}
                        </Badge>
                        {o.escrow_status !== "none" && (
                          <Badge variant="outline" className="text-xs">
                            Escrow: {o.escrow_status}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />${o.budget.toLocaleString()}</span>
                        {o.deadline && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(o.deadline).toLocaleDateString()}</span>}
                        <span>{new Date(o.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {["pending", "accepted", "in_progress", "delivered", "disputed"].includes(o.status) && (
                        <Button
                          size="sm"
                          variant="destructive"
                          className="gap-1.5"
                          disabled={actioning === o.id}
                          onClick={() => triggerRefund(o.id)}
                        >
                          {actioning === o.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
                          Refund
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5"
                        onClick={() => navigate(`/orders/${o.id}`)}
                      >
                        <MessageSquare className="h-3.5 w-3.5" /> View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filtered.length === 0 && (
              <Card><CardContent className="py-12 text-center text-muted-foreground">No orders found.</CardContent></Card>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default AdminOrders;
