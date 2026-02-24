import { useNavigate } from "react-router-dom";
import { Briefcase, Star, DollarSign } from "lucide-react";

interface PerformanceGridProps {
  totalJobs: number;
  avgRating: number | null;
  totalEarned: number;
}

export const PerformanceGrid = ({ totalJobs, avgRating, totalEarned }: PerformanceGridProps) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="dossier-card p-8 group hover:border-primary/30 transition-colors duration-500">
        <div className="flex justify-between items-start mb-6">
          <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-500">
            <Briefcase className="h-6 w-6" />
          </div>
        </div>
        <div className="text-5xl font-display font-bold mb-2 tracking-tighter text-foreground">{totalJobs}</div>
        <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">Completed</div>
      </div>

      <div className="dossier-card p-8 group hover:border-warning/30 transition-colors duration-500">
        <div className="flex justify-between items-start mb-6">
          <div className="h-12 w-12 rounded-2xl bg-warning/10 flex items-center justify-center text-warning group-hover:bg-warning group-hover:text-primary-foreground transition-colors duration-500">
            <Star className="h-6 w-6" />
          </div>
        </div>
        <div className="text-5xl font-display font-bold mb-2 tracking-tighter text-foreground">{avgRating != null ? avgRating.toFixed(1) : "5.0"}</div>
        <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">Rating</div>
      </div>

      <div className="dossier-card p-8 group hover:border-accent/30 transition-colors duration-500 cursor-pointer" onClick={() => navigate("/freelancer/earnings")}>
        <div className="flex justify-between items-start mb-6">
          <div className="h-12 w-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-primary-foreground transition-colors duration-500">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>
        <div className="text-5xl font-display font-bold mb-2 tracking-tighter text-foreground">${totalEarned.toLocaleString()}</div>
        <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">Total Earned</div>
      </div>
    </div>
  );
};
