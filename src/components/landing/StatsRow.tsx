import { motion } from "framer-motion";
import { Users, Shield, Zap, Lock } from "lucide-react";

const stats = [
  { value: "500+", label: "Vetted Freelancers", icon: Users },
  { value: "Top 1%", label: "Talent Quality", icon: Zap },
  { value: "100%", label: "On-Platform", icon: Shield },
  { value: "Secure", label: "Escrow Payments", icon: Lock },
];

export const StatsRow = () => (
  <section className="relative border-y border-border/40 bg-card/30 backdrop-blur-sm z-20">
    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 pointer-events-none" />
    <div className="container py-12 lg:py-16 relative">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * i, duration: 0.6, ease: "easeOut" }}
              className="relative flex flex-col items-center justify-center p-6 rounded-3xl group"
            >
              {/* Elegant Hover Background */}
              <div className="absolute inset-0 bg-primary/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-primary/10" />

              <div className="relative z-10 flex flex-col items-center space-y-3">
                <div className="p-3 bg-primary/10 rounded-2xl mb-2 group-hover:scale-110 transition-transform duration-500 group-hover:bg-primary/20">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="font-display text-4xl sm:text-5xl font-bold text-foreground tracking-tighter group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-accent transition-all duration-300 drop-shadow-sm">
                  {s.value}
                </div>
                <div className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] group-hover:text-foreground/80 transition-colors text-center">
                  {s.label}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  </section>
);
