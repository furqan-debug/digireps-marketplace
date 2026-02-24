import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Eye } from "lucide-react";
import { motion } from "framer-motion";

interface FreelancerDashboardHeaderProps {
  displayName: string;
  userId?: string;
  statusLabel: string;
  statusClassName: string;
  hasProfile: boolean;
}

export const FreelancerDashboardHeader = ({ displayName, userId, statusLabel, statusClassName, hasProfile }: FreelancerDashboardHeaderProps) => {
  const firstName = displayName?.split(" ")[0] || "Partner";

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-border/40">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/5 border border-primary/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Operations Center
          </div>
          <h1 className="font-display text-5xl sm:text-7xl font-bold tracking-tight text-foreground leading-[1.1]">
            Welcome, {firstName}
          </h1>
          <p className="text-muted-foreground/60 text-lg sm:text-xl font-medium max-w-2xl italic">
            Manage your professional portfolio and active client engagements.
          </p>
        </div>

        <div className="flex flex-col md:items-end gap-4">
          <Badge className={`${statusClassName} rounded-full border px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] shadow-sm`}>
            {statusLabel}
          </Badge>
          {hasProfile && userId && (
            <Button onClick={() => window.open(`/client/freelancer/${userId}`, '_blank')} variant="outline" className="h-14 px-8 rounded-2xl border-border/50 hover:bg-muted/50 transition-all font-bold text-[11px] uppercase tracking-[0.2em] gap-3">
              <Eye className="h-4 w-4" /> View Public Profile
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
