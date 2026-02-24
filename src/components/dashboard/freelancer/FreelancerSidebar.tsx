import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { User, Briefcase, ArrowRight, Star, Crown, Shield } from "lucide-react";
import { motion } from "framer-motion";

interface FreelancerSidebarProps {
  level: string;
  completionScore: number;
  isApproved: boolean;
}

const LEVEL_CONFIG: Record<string, { icon: React.ElementType; label: string; progress: number; color: string; bg: string }> = {
  verified: { icon: Shield, label: "Verified", progress: 33, color: "text-muted-foreground", bg: "bg-secondary" },
  pro: { icon: Star, label: "Pro", progress: 66, color: "text-primary", bg: "bg-primary/10" },
  elite: { icon: Crown, label: "Elite", progress: 100, color: "text-warning", bg: "bg-warning/15" },
};

export const FreelancerSidebar = ({ level, completionScore, isApproved }: FreelancerSidebarProps) => {
  const navigate = useNavigate();
  const levelCfg = LEVEL_CONFIG[level] ?? LEVEL_CONFIG.verified;
  const LevelIcon = levelCfg.icon;

  return (
    <div className="md:col-span-4 flex flex-col gap-6">
      {/* Rank Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="dossier-card p-8 space-y-8">
          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-primary/5 text-primary shadow-inner">
              <LevelIcon className={`h-7 w-7 ${levelCfg.color}`} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">Current Status</p>
              <h3 className="font-display text-2xl font-bold capitalize leading-tight tracking-tight">{levelCfg.label} Member</h3>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between text-[11px] font-bold uppercase tracking-[0.2em]">
              <span className="text-muted-foreground/60">Rank Progression</span>
              <span className="text-primary">{levelCfg.progress}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted/50 overflow-hidden border border-border/50">
              <motion.div initial={{ width: 0 }} animate={{ width: `${levelCfg.progress}%` }} transition={{ duration: 1.5, ease: "easeOut" }} className="h-full bg-gradient-to-r from-primary to-primary-glow" />
            </div>
          </div>

          <div className="space-y-4 pt-8 border-t border-border/20">
            <div className="flex justify-between text-[11px] font-bold uppercase tracking-[0.2em]">
              <span className="text-muted-foreground/60">Profile Depth</span>
              <span className="text-primary">{completionScore}%</span>
            </div>
            <Progress value={completionScore} className="h-2 rounded-full bg-muted/50 border border-border/50" />
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="grid grid-cols-1 gap-4">
        <div
          onClick={() => navigate("/freelancer/profile")}
          className="group p-6 rounded-2xl bg-card border border-border/40 hover:border-primary/30 hover:shadow-elegant cursor-pointer flex items-center justify-between transition-all duration-300"
        >
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300">
              <User className="h-5 w-5" />
            </div>
            <span className="font-display font-bold text-base tracking-tight">Edit Profile</span>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </div>

        <div
          onClick={() => isApproved && navigate("/freelancer/orders")}
          className={`group p-6 rounded-2xl bg-card border border-border/40 flex items-center justify-between transition-all duration-300 ${isApproved ? 'hover:border-indigo-500/30 hover:shadow-elegant cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
        >
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/5 text-indigo-500 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-colors duration-300">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <span className="font-display font-bold text-base tracking-tight block">Project Briefs</span>
              {!isApproved && <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Requires Approval</span>}
            </div>
          </div>
          {isApproved && <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />}
        </div>
      </motion.div>
    </div>
  );
};
