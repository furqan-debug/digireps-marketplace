import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, MessageSquare, Clock, DollarSign } from "lucide-react";

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

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  pending:     { label: "Pending",     className: "bg-secondary text-secondary-foreground" },
  accepted:    { label: "Accepted",    className: "bg-primary/10 text-primary" },
  in_progress: { label: "In Progress", className: "bg-primary/10 text-primary" },
  delivered:   { label: "Delivered",   className: "bg-warning/15 text-warning" },
  completed:   { label: "Completed",   className: "bg-success/15 text-success" },
  disputed:    { label: "Disputed",    className: "bg-destructive/10 text-destructive" },
  refunded:    { label: "Refunded",    className: "bg-muted text-muted-foreground" },
};

const Orders = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold">My Orders</h1>
          <p className="text-muted-foreground mt-1">
            {role === "client" ? "Projects you have submitted" : "Incoming and active projects"}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              {role === "client"
                ? "No orders yet. Find talent to get started."
                : "No orders yet. Complete your profile to start receiving orders."}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const s = STATUS_BADGE[order.status] ?? STATUS_BADGE.pending;
              return (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium">{order.title}</h3>
                          <Badge className={s.className}>{s.label}</Badge>
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
                          <span>{new Date(order.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 shrink-0"
                        onClick={() => navigate(`/orders/${order.id}`)}
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        View & Chat
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default Orders;
