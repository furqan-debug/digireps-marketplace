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
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 * i, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center text-center gap-6 rounded-3xl bg-background/[0.02] border border-background/10 backdrop-blur-md p-8 hover:bg-background/[0.05] hover:border-primary/30 hover:shadow-glow transition-all duration-500 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-500 relative z-10 shadow-sm">
              <Icon className="h-7 w-7 text-primary group-hover:text-primary-glow transition-colors" />
            </div>
            <span className="font-display font-medium text-sm leading-relaxed relative z-10 text-background/90 group-hover:text-background transition-colors">{text}</span>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
