import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, AlertCircle, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";

interface RecommendedActionProps {
  hasDelivery: boolean;
  activeCount: number;
}

export const RecommendedAction = ({ hasDelivery, activeCount }: RecommendedActionProps) => {
  const navigate = useNavigate();

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.5 }}
      className="md:col-span-12">
      <div className="bg-card border border-border/60 rounded-[2rem] p-8 flex items-center gap-6">
        <div className="h-12 w-12 shrink-0 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary">
          {hasDelivery ? <AlertCircle className="h-6 w-6" /> : <Lightbulb className="h-6 w-6" />}
        </div>
        <div className="flex-1">
          <h3 className="font-display font-bold text-base tracking-tight text-foreground">
            {hasDelivery ? "You have a delivery waiting for review" : activeCount === 0 ? "No active projects" : `You have ${activeCount} active project${activeCount > 1 ? 's' : ''}`}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {hasDelivery
              ? "A freelancer has submitted their work. Review it and approve to release payment."
              : activeCount === 0
                ? "Start by browsing our vetted freelancers and submitting a project brief."
                : "Keep track of your projects from the orders page."}
          </p>
        </div>
        <Button onClick={() => navigate(hasDelivery ? "/client/orders" : "/client/discover")} variant="outline" className="shrink-0 h-10 px-6 rounded-xl font-bold text-xs uppercase tracking-widest">
          {hasDelivery ? "Review Now" : activeCount === 0 ? "Find Talent" : "View Orders"} <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
};
