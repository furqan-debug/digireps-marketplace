import { motion } from "framer-motion";

const stats = [
  { value: "500+", label: "Vetted Freelancers" },
  { value: "Top 1%", label: "Talent Quality" },
  { value: "100%", label: "On-Platform" },
  { value: "Secure", label: "Escrow Payments" },
];

export const StatsRow = () => (
  <section className="relative border-y border-border/40 glass z-20">
    <div className="absolute inset-0 bg-secondary/30 pointer-events-none" />
    <div className="container py-16">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 * i, duration: 0.6 }}
            className="text-center space-y-2 group"
          >
            <div className="font-display text-4xl sm:text-5xl font-bold text-foreground tracking-tighter group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-primary-glow transition-all duration-300">{s.value}</div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] group-hover:text-foreground transition-colors">{s.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
