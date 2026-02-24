import { CheckCircle, Lock, Zap, Star } from "lucide-react";
import { motion } from "framer-motion";

const benefits = [
  { icon: CheckCircle, text: "Vetted top 1% freelancers only" },
  { icon: Lock, text: "Secure on-platform communication" },
  { icon: Zap, text: "Simulated escrow payments" },
  { icon: Star, text: "Quality-controlled delivery" },
];

export const Benefits = () => (
  <section className="bg-foreground text-background border-y border-border/5 relative overflow-hidden">
    <div className="container relative z-10 py-24">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
        {benefits.map(({ icon: Icon, text }, i) => (
          <motion.div
            key={text}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 * i, duration: 0.5 }}
            className="flex flex-col items-center text-center gap-6 rounded-3xl bg-background/[0.03] border border-background/10 p-8 hover:bg-background/[0.06] transition-all duration-500 group"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 group-hover:scale-110 transition-transform duration-500">
              <Icon className="h-7 w-7 text-primary" />
            </div>
            <span className="font-display font-bold text-sm leading-tight">{text}</span>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
