import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";

const testimonials = [
  { name: "Sarah Chen", role: "CTO, TechCorp", quote: "DigiReps connected us with a senior developer who delivered our platform redesign in half the expected timeline. The vetting process ensures top quality.", rating: 5 },
  { name: "Marcus Johnson", role: "Freelance Designer", quote: "Since joining DigiReps, I've had a steady stream of premium clients. The escrow system gives me confidence that I'll always be paid for my work.", rating: 5 },
  { name: "Elena Rodriguez", role: "Product Manager, StartupXYZ", quote: "The brief submission process is seamless. We've hired three freelancers through DigiReps and every experience has been exceptional.", rating: 5 },
];

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

export const Testimonials = () => (
  <section className="container py-24">
    <div className="text-center mb-16 space-y-4">
      <h2 className="font-display text-4xl sm:text-5xl font-bold text-foreground tracking-tight">What People Say</h2>
      <p className="text-muted-foreground text-lg max-w-xl mx-auto font-medium">Hear from clients and freelancers who use DigiReps.</p>
    </div>
    <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
      {testimonials.map((t, i) => (
        <motion.div key={i} variants={itemVariants} className="bg-card border border-border/60 rounded-3xl p-8 space-y-6 hover:border-primary/30 hover:shadow-xl transition-all duration-500">
          <Quote className="h-8 w-8 text-primary/20" />
          <p className="text-sm text-muted-foreground leading-relaxed italic">"{t.quote}"</p>
          <div className="flex items-center gap-1">
            {[...Array(t.rating)].map((_, j) => (
              <Star key={j} className="h-4 w-4 fill-warning text-warning" />
            ))}
          </div>
          <div className="border-t border-border/40 pt-4">
            <p className="font-display font-bold text-sm text-foreground">{t.name}</p>
            <p className="text-xs text-muted-foreground">{t.role}</p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  </section>
);
