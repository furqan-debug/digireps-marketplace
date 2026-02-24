import { useNavigate, Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface RecentOrdersWidgetProps {
  orders: any[];
}

export const RecentOrdersWidget = ({ orders }: RecentOrdersWidgetProps) => {
  const navigate = useNavigate();

  if (orders.length === 0) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }}
      className="md:col-span-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-bold tracking-tight">Recent Orders</h2>
        <Link to="/client/orders" className="text-xs font-bold uppercase tracking-widest text-primary hover:underline">View All</Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {orders.map((order) => (
          <div key={order.id} onClick={() => navigate(`/orders/${order.id}`)}
            className="bg-card border border-border/60 rounded-2xl p-6 cursor-pointer hover:border-primary/30 hover:shadow-elegant transition-all duration-300 space-y-3">
            <div className="flex items-start justify-between">
              <h4 className="font-display font-bold text-sm text-foreground line-clamp-1">{order.title}</h4>
              <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-wider shrink-0 ml-2">{order.status.replace("_", " ")}</Badge>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>${order.budget?.toLocaleString()}</span>
              <span className="flex items-center gap-1"><ArrowRight className="h-3 w-3" /> View</span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
