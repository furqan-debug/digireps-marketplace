import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Star, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { motion } from "framer-motion";

export const Hero = () => (
  <section className="relative pt-40 pb-24 lg:pt-52 lg:pb-32 overflow-hidden min-h-[90vh] flex items-center">
    {/* Sophisticated Animated Background Elements */}
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>

      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.15, 0.25, 0.15],
          rotate: [0, 45, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-1/4 -right-1/4 w-[900px] h-[900px] rounded-full bg-gradient-to-br from-primary/30 to-primary-glow/10 blur-[120px]"
      />

      <motion.div
        animate={{
          scale: [1, 1.25, 1],
          opacity: [0.1, 0.2, 0.1],
          x: [0, -50, 0]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-1/2 -left-1/4 w-[800px] h-[800px] rounded-full bg-gradient-to-tr from-accent/20 to-transparent blur-[120px]"
      />
    </div>

    <div className="container relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-5xl mx-auto text-center space-y-10 relative"
      >
        {/* Refined Pill Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="inline-flex items-center gap-3 rounded-full border border-primary/20 bg-background/50 backdrop-blur-md px-5 py-2 shadow-[0_0_20px_rgba(29,69,151,0.1)] transition-all hover:bg-background/80 hover:border-primary/30"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          <span className="font-display text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-foreground/80">
            Trusted by top-performing enterprises
          </span>
        </motion.div>

        {/* Premium Typography */}
        <div className="space-y-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-[5rem] font-bold tracking-tighter leading-[1.05] text-foreground drop-shadow-sm"
          >
            The Marketplace for <br className="hidden sm:block" />
            <span className="relative inline-block mt-2">
              <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-glow to-accent py-2 pr-2">Elite Talent</span>
              <span className="absolute -bottom-2 left-0 w-full h-[0.15em] bg-accent/30 blur-sm rounded-full -z-10"></span>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="text-lg md:text-xl text-muted-foreground/90 max-w-2xl mx-auto leading-relaxed font-medium"
          >
            Transform your digital operations. Access a curated network of vetted professionals, secure workflows, and guaranteed results—all in one premium workspace.
          </motion.p>
        </div>

        {/* Value Props under description */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-foreground/70"
        >
          <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Top 1% Vetted Talent</div>
          <div className="flex items-center gap-2"><Zap className="h-4 w-4 text-accent" /> Fast Onboarding</div>
        </motion.div>

        {/* Elevated Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-5 justify-center pt-6"
        >
          <Link to="/auth" className="group">
            <Button size="lg" className="w-full sm:w-auto h-16 gap-3 bg-primary hover:bg-primary/90 text-primary-foreground px-10 rounded-2xl shadow-[0_8px_30px_rgba(29,69,151,0.25)] hover:shadow-[0_12px_40px_rgba(29,69,151,0.35)] hover:-translate-y-1 transition-all duration-300 font-display font-bold text-sm uppercase tracking-widest border-0 flex items-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
              Hire Elite Talent <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link to="/auth" className="group">
            <Button size="lg" variant="outline" className="w-full sm:w-auto h-16 bg-background/50 backdrop-blur-md border-2 border-border hover:border-primary/50 hover:bg-primary/5 text-foreground px-10 rounded-2xl hover:-translate-y-1 font-display font-bold text-sm uppercase tracking-widest transition-all duration-300 shadow-sm hover:shadow-md">
              Join as a Rep
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  </section>
);

