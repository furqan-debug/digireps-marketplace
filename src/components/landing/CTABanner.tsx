import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { motion } from "framer-motion";

export const CTABanner = () => (
  <section className="container pb-24">
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="relative rounded-[3rem] bg-gradient-to-br from-foreground via-primary to-primary-glow py-24 px-12 text-center overflow-hidden flex flex-col items-center shadow-2xl relative z-10 box-border border-4 border-background/20"
    >
      <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-background/20 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-1/2 -left-1/4 w-[50rem] h-[50rem] bg-background/10 blur-[130px] pointer-events-none" />

      <div className="relative z-20 space-y-10 max-w-4xl">
        <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-primary-foreground tracking-tighter leading-none drop-shadow-md">Ready to scale?</h2>
        <p className="text-xl text-primary-foreground/90 font-medium max-w-2xl mx-auto drop-shadow-sm">Join the elite network connecting the world's best talent with visionary companies.</p>
        <Link to="/auth" className="inline-block pt-8">
          <Button size="lg" className="bg-background text-foreground hover:bg-background/90 px-12 h-16 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 hover-lift font-display font-bold text-sm uppercase tracking-[0.2em] border-0 group relative overflow-hidden">
            <span className="relative z-10 flex items-center">
              Join DigiReps Now <Zap className="h-5 w-5 text-primary ml-3 group-hover:scale-110 group-hover:animate-pulse transition-transform" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </Button>
        </Link>
      </div>
    </motion.div>
  </section>
);
