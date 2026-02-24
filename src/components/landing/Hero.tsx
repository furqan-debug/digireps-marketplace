import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Star, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export const Hero = () => (
  <section className="relative pt-40 pb-24 lg:pt-48 lg:pb-32 overflow-hidden min-h-[85vh] flex items-center">
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden">
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] rounded-full bg-primary/10 blur-[120px]"
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-1/2 -left-1/4 w-[600px] h-[600px] rounded-full bg-accent/10 blur-[120px]"
      />
    </div>

    <div className="container relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] as const }}
        className="max-w-5xl mx-auto text-center space-y-10 relative"
      >
        <div className="inline-flex items-center gap-3 rounded-full border border-primary/20 bg-primary/5 px-6 py-2 shadow-sm glass">
          <Star className="h-3.5 w-3.5 fill-primary text-primary animate-pulse" />
          <span className="font-display text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Trusted by top-performing enterprises</span>
        </div>

        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter leading-[0.9] text-foreground">
          The Marketplace for <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-glow to-primary/70 animate-pulse-slow">Elite Talent</span>
        </h1>

        <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
          Transform your digital operations. Access a curated network of vetted professionals, secure workflows, and guaranteed results—all in one premium workspace.
        </p>

        <div className="flex flex-col sm:flex-row gap-5 justify-center pt-8">
          <Link to="/auth">
            <Button size="lg" className="w-full sm:w-auto h-14 gap-3 bg-primary hover:bg-primary/90 text-primary-foreground px-10 rounded-2xl shadow-lg shadow-primary/25 hover-lift font-display font-bold text-xs uppercase tracking-widest border-0 btn-glow">
              Hire Elite Talent <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link to="/auth">
            <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 bg-background/50 backdrop-blur-sm border-2 border-border/60 hover:border-primary/40 hover:bg-primary/5 text-foreground px-10 rounded-2xl hover-lift font-display font-bold text-xs uppercase tracking-widest transition-all duration-300">
              Join as a Rep
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  </section>
);
