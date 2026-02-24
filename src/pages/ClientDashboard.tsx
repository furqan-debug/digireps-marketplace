import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { ClientDashboardHeader } from "@/components/dashboard/client/ClientDashboardHeader";
import { ClientStatsGrid } from "@/components/dashboard/client/ClientStatsGrid";
import { RecommendedAction } from "@/components/dashboard/client/RecommendedAction";
import { RecentOrdersWidget } from "@/components/dashboard/client/RecentOrdersWidget";

const ClientDashboard = () => {
  const { profile, user } = useAuth();
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [hasDelivery, setHasDelivery] = useState(false);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("orders").select("id", { count: "exact", head: true }).eq("client_id", user.id),
      supabase.from("orders").select("id", { count: "exact", head: true }).eq("client_id", user.id).in("status", ["accepted", "in_progress", "delivered"]),
      supabase.from("orders").select("id", { count: "exact", head: true }).eq("client_id", user.id).eq("status", "completed"),
      supabase.from("orders").select("id, title, status, created_at, budget").eq("client_id", user.id).order("created_at", { ascending: false }).limit(3),
      supabase.from("orders").select("id", { count: "exact", head: true }).eq("client_id", user.id).eq("status", "delivered"),
    ]).then(([total, active, completed, recent, delivered]) => {
      setStats({ total: total.count ?? 0, active: active.count ?? 0, completed: completed.count ?? 0 });
      setRecentOrders(recent.data ?? []);
      setHasDelivery((delivered.count ?? 0) > 0);
    });
  }, [user]);

  const firstName = profile?.display_name?.split(" ")[0] || "Client";

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-12 pb-20">
        <ClientDashboardHeader firstName={firstName} />
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[minmax(160px,auto)]">
          <ClientStatsGrid stats={stats} />
          <RecommendedAction hasDelivery={hasDelivery} activeCount={stats.active} />
          <RecentOrdersWidget orders={recentOrders} />
        </div>
      </div>
    </AppShell>
  );
};

export default ClientDashboard;
