import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";

const testimonials = [
  { name: "Sarah Chen", role: "CTO, TechCorp", quote: "DigiReps connected us with a senior developer who delivered our platform redesign in half the expected timeline. The vetting process ensures top quality.", rating: 5 },
  { name: "Marcus Johnson", role: "Freelance Designer", quote: "Since joining DigiReps, I've had a steady stream of premium clients. The escrow system gives me confidence that I'll always be paid for my work.", rating: 5 },
  { name: "Elena Rodriguez", role: "Product Manager, StartupXYZ", quote: "The brief submission process is seamless. We've hired three freelancers through DigiReps and every experience has been exceptional.", rating: 5 },
];

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.15 } } };
const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
};

export const Testimonials = () => (
  <section className="container py-24 relative">
    <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
    <div className="text-center mb-16 space-y-4">
      <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight">What People Say</h2>
      <p className="text-muted-foreground text-lg sm:text-xl max-w-xl mx-auto font-medium">Hear directly from the visionary clients and elite freelancers who use DigiReps.</p>
    </div>

    <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid gap-8 md:grid-cols-3 max-w-7xl mx-auto">
      {testimonials.map((t, i) => (
        <motion.div key={i} variants={itemVariants} className="surface border border-border/80 rounded-[2rem] p-8 lg:p-10 space-y-8 hover:border-primary/40 hover:shadow-[0_20px_50px_-12px_rgba(29,69,151,0.12)] hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden bg-card/60 backdrop-blur-sm flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/10 to-transparent blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

          <div className="space-y-6 relative z-10">
            <Quote className="h-10 w-10 text-primary/20 group-hover:text-primary transition-colors duration-500" />
            <p className="text-lg text-foreground/80 leading-relaxed font-medium group-hover:text-foreground transition-colors duration-300">"{t.quote}"</p>
          </div>

          <div className="space-y-6 relative z-10 mt-6">
            <div className="flex items-center gap-1.5 flex-wrap">
              {[...Array(t.rating)].map((_, j) => (
                <Star key={j} className="h-5 w-5 fill-accent text-accent drop-shadow-[0_0_8px_rgba(254,180,21,0.5)] group-hover:scale-110 transition-transform duration-300" style={{ transitionDelay: `${j * 50}ms` }} />
              ))}
            </div>
            <div className="border-t border-border/60 pt-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
                <span className="font-display font-bold text-lg text-primary">{t.name.charAt(0)}</span>
              </div>
              <div>
                <p className="font-display font-bold text-base text-foreground tracking-tight">{t.name}</p>
                <p className="text-sm text-primary font-medium">{t.role}</p>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  </section>
);
