import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Clock, MessageSquare, Ban, Edit, User, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface StatusBannersProps {
  status: string | null;
  isSuspended: boolean;
  isRevisionRequired: boolean;
  adminFeedback: string | null;
}

export const StatusBanners = ({ status, isSuspended, isRevisionRequired, adminFeedback }: StatusBannersProps) => {
  const navigate = useNavigate();

  return (
    <AnimatePresence mode="wait">
      {isSuspended && (
        <motion.div key="suspended" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-destructive/5 rounded-[2rem] border border-destructive/20 p-8 shadow-sm">
          <div className="flex items-start gap-6">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-destructive/10 text-destructive shadow-inner">
              <Ban className="h-7 w-7" />
            </div>
            <div className="space-y-3">
              <h4 className="font-display text-2xl font-bold text-destructive tracking-tight">Account Suspended</h4>
              {adminFeedback && <p className="text-destructive/80 text-sm font-medium bg-destructive/5 rounded-xl p-4 border border-destructive/10">{adminFeedback}</p>}
              <p className="text-muted-foreground text-sm font-medium">Please contact support if you believe this is an error.</p>
            </div>
          </div>
        </motion.div>
      )}

      {isRevisionRequired && !isSuspended && (
        <motion.div key="revision" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-amber-500/5 rounded-[2rem] border border-amber-500/20 p-8 shadow-sm">
          <div className="flex items-start gap-6">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 shadow-inner">
              <MessageSquare className="h-7 w-7" />
            </div>
            <div className="space-y-4">
              <h4 className="font-display text-2xl font-bold text-amber-700 tracking-tight">Revision Required</h4>
              {adminFeedback && <p className="text-amber-700/80 text-sm font-medium bg-card rounded-xl p-4 border border-amber-200 shadow-sm">{adminFeedback}</p>}
              <Button onClick={() => navigate("/freelancer/profile")} className="h-12 px-8 rounded-xl bg-amber-500 text-white hover:bg-amber-600 font-bold uppercase tracking-[0.2em] text-[10px] shadow-sm">
                <Edit className="h-4 w-4 mr-3" /> Update Profile
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {(status === "under_review" || status === "submitted" || status === "pending") && !isSuspended && (
        <motion.div key="review" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="dossier-card p-10 bg-primary/5">
          <div className="flex items-start gap-8">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
              <Clock className="h-8 w-8 animate-pulse-slow" />
            </div>
            <div className="space-y-3">
              <h4 className="font-display text-3xl font-bold text-primary-glow tracking-tight">Profile Under Review</h4>
              <p className="text-muted-foreground/80 text-base font-medium max-w-lg leading-relaxed">Our evaluation team typically completes reviews within 24–72 hours. You will be notified immediately upon decision.</p>
              <Button onClick={() => navigate("/freelancer/profile")} variant="ghost" className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-primary/10 h-10 px-4 rounded-xl">
                Preview Application
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {(!status || status === "onboarding") && !isSuspended && (
        <motion.div key="onboarding" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="dossier-card p-12 text-center space-y-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-primary/10 text-primary mx-auto shadow-inner">
            <User className="h-10 w-10" />
          </div>
          <div className="space-y-3">
            <h2 className="font-display text-4xl font-bold text-foreground tracking-tight">Complete Your Profile</h2>
            <p className="text-muted-foreground/80 text-lg font-medium max-w-md mx-auto leading-relaxed">
              Finalize your portfolio and credentials to activate your account and receive project briefs.
            </p>
          </div>
          <Button onClick={() => navigate("/freelancer/profile")} className="h-14 px-10 rounded-2xl bg-primary text-white font-bold uppercase tracking-[0.2em] text-[11px] hover:scale-[1.02] hover:shadow-glow transition-all duration-300">
            Finish Setup <ArrowRight className="h-4 w-4 ml-3" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
