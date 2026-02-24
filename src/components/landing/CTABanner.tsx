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
      className="relative rounded-3xl bg-primary py-24 px-12 text-center overflow-hidden flex flex-col items-center"
    >
      <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-background/10 blur-[140px] pointer-events-none" />

      <div className="relative z-10 space-y-10 max-w-4xl">
        <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-primary-foreground tracking-tighter leading-none">Ready to scale?</h2>
        <p className="text-xl text-primary-foreground/80 font-medium max-w-2xl mx-auto">Join the elite network connecting the world's best talent with visionary companies.</p>
        <Link to="/auth" className="inline-block pt-4">
          <Button size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 px-12 h-16 rounded-2xl shadow-2xl transition-all hover:scale-105 active:scale-100 font-display font-bold text-xs uppercase tracking-[0.2em] border-0">
            Join DigiReps Now <Zap className="h-5 w-5 fill-primary ml-3" />
          </Button>
        </Link>
      </div>
    </motion.div>
  </section>
);
