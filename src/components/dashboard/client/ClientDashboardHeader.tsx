import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface ClientDashboardHeaderProps {
  firstName: string;
}

export const ClientDashboardHeader = ({ firstName }: ClientDashboardHeaderProps) => {
  const navigate = useNavigate();

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-border/40">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/5 border border-primary/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Mission Control
          </div>
          <h1 className="font-display text-5xl sm:text-7xl font-bold tracking-tight text-foreground leading-[1.1]">
            Welcome, {firstName}
          </h1>
          <p className="text-muted-foreground/60 text-lg sm:text-xl font-medium max-w-2xl italic">
            Manage your active workstreams and discover elite talent for your next project.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button onClick={() => navigate("/client/discover")} className="h-14 px-8 rounded-2xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-[0.2em] hover:scale-[1.02] hover:shadow-glow transition-all duration-300">
            <Search className="h-4 w-4 mr-3 opacity-70" /> Find Talent
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
