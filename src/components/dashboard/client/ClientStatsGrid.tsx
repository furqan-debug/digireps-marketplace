import { useNavigate } from "react-router-dom";
import { Search, MessageSquare, ArrowRight, TrendingUp, CheckCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface ClientStatsGridProps {
  stats: { total: number; active: number; completed: number };
}

export const ClientStatsGrid = ({ stats }: ClientStatsGridProps) => {
  const navigate = useNavigate();

  return (
    <>
      {/* Main Stats - Span 8 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}
        className="md:col-span-8 row-span-2 dossier-card p-10 flex flex-col justify-between group cursor-pointer hover:border-primary/30 transition-colors duration-500"
        onClick={() => navigate("/client/orders")}
      >
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" /> Active Workstreams
            </div>
            <h2 className="font-display text-3xl font-bold tracking-tight">Project Overview</h2>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
            <ArrowRight className="h-5 w-5 -rotate-45 group-hover:rotate-0 transition-transform duration-500" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8 pt-8 border-t border-border/40">
          <div>
            <div className="text-5xl font-display font-bold tracking-tighter text-foreground mb-2">{stats.active}</div>
            <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground/60 flex items-center gap-2">
              <Clock className="h-3 w-3" /> In Progress
            </div>
          </div>
          <div>
            <div className="text-5xl font-display font-bold tracking-tighter text-foreground mb-2">{stats.completed}</div>
            <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground/60 flex items-center gap-2">
              <CheckCircle className="h-3 w-3" /> Delivered
            </div>
          </div>
          <div>
            <div className="text-5xl font-display font-bold tracking-tighter text-primary mb-2">{stats.total}</div>
            <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-primary/60 flex items-center gap-2">
              <TrendingUp className="h-3 w-3" /> Total Engagements
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Action: Find Talent - Span 4 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}
        className="md:col-span-4 row-span-1 rounded-[2rem] bg-gradient-to-br from-primary to-primary-glow p-8 text-white flex flex-col justify-between group cursor-pointer hover:shadow-glow-lg transition-all duration-500 relative overflow-hidden"
        onClick={() => navigate("/client/discover")}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform duration-700 group-hover:scale-150" />
        <div className="h-10 w-10 text-white/80 mb-4 z-10">
          <Search className="h-8 w-8" />
        </div>
        <div className="z-10">
          <h3 className="font-display text-xl font-bold tracking-tight mb-1">Source Elite Talent</h3>
          <p className="text-xs text-white/70 font-medium">Access the top 1% network &rarr;</p>
        </div>
      </motion.div>

      {/* Quick Action: Messages - Span 4 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}
        className="md:col-span-4 row-span-1 border border-border/40 bg-card rounded-[2rem] p-8 flex flex-col justify-between group cursor-pointer hover:border-primary/30 hover:shadow-elegant transition-all duration-500"
        onClick={() => navigate("/client/orders")}
      >
        <div className="flex justify-between items-start">
          <div className="h-10 w-10 text-muted-foreground/40 group-hover:text-primary transition-colors duration-300">
            <MessageSquare className="h-8 w-8" />
          </div>
          {stats.active > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
              {stats.active}
            </span>
          )}
        </div>
        <div>
          <h3 className="font-display text-lg font-bold tracking-tight mb-1 text-foreground">Communications</h3>
          <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground/50">Active Channels &rarr;</p>
        </div>
      </motion.div>
    </>
  );
};
