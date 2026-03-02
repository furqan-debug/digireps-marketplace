import { CheckCircle, Lock, Zap, Star } from "lucide-react";
import { motion } from "framer-motion";

const benefits = [
  { icon: CheckCircle, title: "Top 1% Talent", text: "Vetted top 1% freelancers only, strictly curated for excellence." },
  { icon: Lock, title: "Secure Workflow", text: "End-to-end encrypted on-platform communication and file sharing." },
  { icon: Zap, title: "Fast Delivery", text: "Simulated escrow payments ensure timeline commitments are met." },
  { icon: Star, title: "Quality Guaranteed", text: "Strict quality-controlled delivery with built-in revision cycles." },
];

export const Benefits = () => (
  <section className="bg-foreground text-background border-y border-border/10 relative overflow-hidden">
    {/* Animated background beams */}
    <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-30 pointer-events-none blur-3xl"></div>
    <div className="absolute bottom-0 right-0 w-full h-[500px] bg-gradient-to-tl from-accent/5 via-transparent to-transparent opacity-20 pointer-events-none blur-3xl"></div>

    <div className="container relative z-10 py-24 lg:py-32">
      <div className="text-center mb-16 space-y-4 max-w-3xl mx-auto">
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-background">
          The <span className="text-primary-glow">DigiReps</span> Advantage
        </h2>
        <p className="text-background/70 text-lg font-medium leading-relaxed">
          We've eliminated the friction of traditional hiring so you can focus on building something extraordinary.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
        {benefits.map(({ icon: Icon, title, text }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 * i, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-start gap-5 rounded-[2rem] bg-background/[0.03] border border-background/10 backdrop-blur-md p-8 sm:p-10 hover:bg-background/[0.06] hover:border-primary/40 hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            <div className="flex h-14 w-14 lg:h-16 lg:w-16 shrink-0 items-center justify-center rounded-2xl bg-background/5 border border-background/10 group-hover:scale-110 group-hover:bg-primary/20 group-hover:border-primary/30 transition-all duration-500 relative z-10 shadow-lg">
              <Icon className="h-6 w-6 lg:h-7 lg:w-7 text-background/80 group-hover:text-primary-glow transition-colors" />
            </div>

            <div className="space-y-2 relative z-10">
              <h3 className="font-display font-bold text-xl text-background/90 group-hover:text-background transition-colors">{title}</h3>
              <p className="font-sans font-normal text-sm sm:text-base leading-relaxed text-background/60 group-hover:text-background/80 transition-colors">{text}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
