import { motion } from "framer-motion";

const steps = [
  { step: "01", title: "Browse Categories", desc: "Select the service you need from our beautifully curated, intuitive category layouts." },
  { step: "02", title: "Choose a Freelancer", desc: "Review profiles of top-tier talent strictly matched to your specific industry needs." },
  { step: "03", title: "Submit a Brief", desc: "Share your project requirements, budget, and timeline. We handle all the rest." },
];

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.15 } } };
const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
};

export const HowItWorksSection = () => (
  <section className="container py-24 relative overflow-hidden">
    <div className="absolute top-1/2 left-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
    <div className="absolute top-1/2 right-0 w-80 h-80 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

    <div className="text-center mb-20 space-y-4">
      <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight drop-shadow-sm">
        Seamless <span className="text-primary">Collaboration</span>
      </h2>
      <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
        Built for clarity and absolute efficiency, from initial brief to final delivery.
      </p>
    </div>

    <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid gap-8 md:grid-cols-3 max-w-7xl mx-auto relative z-10 px-4 md:px-0">
      <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-transparent via-primary/20 to-transparent -translate-y-1/2 -z-10" />

      {steps.map(({ step, title, desc }, index) => (
        <motion.div key={step} variants={itemVariants} className="group relative transition-all duration-500 hover:-translate-y-4">
          <div className="relative p-10 surface border border-border/60 hover:border-primary/50 transition-all rounded-[2.5rem] bg-card h-full flex flex-col justify-end shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(29,69,151,0.12)] overflow-hidden">
            {/* Animated Glow on Hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${index === 2 ? 'from-accent/5' : 'from-primary/5'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />

            {/* Outline Glow inside */}
            <div className="absolute inset-0 border-2 border-primary/0 group-hover:border-primary/10 rounded-[2.5rem] transition-colors duration-500" />

            <div className="absolute -top-6 -right-6 font-display text-[10rem] font-bold text-muted/10 group-hover:text-primary/10 transition-colors pointer-events-none select-none tracking-tighter leading-none">
              {step}
            </div>

            <div className="relative z-10 pt-28 space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-display font-bold text-lg mb-2 border border-primary/20 shadow-sm group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-500">
                {step.replace("0", "")}
              </div>
              <h3 className="font-display text-2xl lg:text-3xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">{title}</h3>
              <p className="text-base text-muted-foreground leading-relaxed font-medium">{desc}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  </section>
);
