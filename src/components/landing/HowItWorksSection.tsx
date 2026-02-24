import { motion } from "framer-motion";

const steps = [
  { step: "01", title: "Browse Categories", desc: "Select the service you need from our curated categories." },
  { step: "02", title: "Choose a Freelancer", desc: "View profiles of vetted, top-tier talent matched to your needs." },
  { step: "03", title: "Submit a Brief", desc: "Share your project details and budget. We handle the rest." },
];

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

export const HowItWorksSection = () => (
  <section className="container py-24 relative">
    <div className="text-center mb-16 space-y-4">
      <h2 className="font-display text-4xl sm:text-5xl font-bold text-foreground tracking-tight">Seamless Collaboration</h2>
      <p className="text-muted-foreground text-lg max-w-xl mx-auto font-medium leading-relaxed">Built for clarity and efficiency, from initial brief to final delivery.</p>
    </div>
    <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid gap-8 md:grid-cols-3 max-w-7xl mx-auto">
      {steps.map(({ step, title, desc }) => (
        <motion.div key={step} variants={itemVariants} className="group relative p-10 bg-card border border-border/60 hover:border-primary/40 transition-all duration-500 rounded-3xl hover:shadow-2xl">
          <div className="absolute top-0 right-0 p-8 font-display text-7xl font-bold text-muted/10 group-hover:text-primary/10 transition-colors pointer-events-none select-none">
            {step}
          </div>
          <div className="relative z-10 h-full flex flex-col justify-end pt-12">
            <h3 className="font-display text-xl font-bold mb-3 tracking-tight group-hover:text-primary transition-colors">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  </section>
);
