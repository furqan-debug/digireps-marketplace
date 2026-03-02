import { motion } from "framer-motion";

const trustedBy = ["TechCorp", "DesignLab", "StartupXYZ", "MediaPro", "CloudBase", "InnoVate"];

export const TrustedBy = () => (
  <section className="container py-16 lg:py-20 relative overflow-hidden bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-blend-overlay">
    <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
    <div className="absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

    <div className="flex flex-col items-center justify-center space-y-10 relative z-20">
      <div className="inline-flex items-center gap-4 px-4">
        <div className="h-px w-12 bg-border/80"></div>
        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground/80">
          Trusted by modern teams at
        </p>
        <div className="h-px w-12 bg-border/80"></div>
      </div>

      <div className="flex flex-wrap justify-center items-center gap-10 md:gap-20 opacity-70 hover:opacity-100 transition-opacity duration-700 w-full max-w-5xl mx-auto">
        {trustedBy.map((name, i) => (
          <motion.div
            key={name}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="group relative flex items-center justify-center p-2"
          >
            <span className="font-display text-xl sm:text-2xl font-bold text-muted-foreground/50 group-hover:text-foreground group-hover:scale-110 transition-all duration-300 cursor-default tracking-tight filter drop-shadow-sm">
              {name}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
