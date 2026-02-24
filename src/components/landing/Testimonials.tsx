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
        <motion.div key={i} variants={itemVariants} className="surface border border-border/60 rounded-3xl p-8 space-y-6 hover:border-primary/40 hover:shadow-elegant hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <Quote className="h-10 w-10 text-primary/20 group-hover:text-primary/40 transition-colors duration-500 relative z-10" />
          <p className="text-sm text-foreground/80 leading-relaxed italic relative z-10">"{t.quote}"</p>
          <div className="flex items-center gap-1.5 relative z-10">
            {[...Array(t.rating)].map((_, j) => (
              <Star key={j} className="h-4 w-4 fill-warning text-warning drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
            ))}
          </div>
          <div className="border-t border-border/40 pt-5 relative z-10 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
              <span className="font-display font-bold text-sm text-primary">{t.name.charAt(0)}</span>
            </div>
            <div>
              <p className="font-display font-bold text-sm text-foreground">{t.name}</p>
              <p className="text-xs text-muted-foreground font-medium">{t.role}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  </section>
);
