import { motion } from "framer-motion";

const stats = [
  { value: "500+", label: "Vetted Freelancers" },
  { value: "Top 1%", label: "Talent Quality" },
  { value: "100%", label: "On-Platform" },
  { value: "Secure", label: "Escrow Payments" },
];

export const StatsRow = () => (
  <section className="bg-secondary/30 border-y border-border/40 backdrop-blur-sm">
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
            <div className="font-display text-4xl sm:text-5xl font-bold text-foreground tracking-tighter group-hover:text-primary transition-colors">{s.value}</div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{s.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
