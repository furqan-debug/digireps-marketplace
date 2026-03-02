import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Zap, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export const CTABanner = () => (
  <section className="container pb-24 lg:pb-32 px-4 md:px-8">
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="relative rounded-[3rem] bg-gradient-to-br from-foreground via-[#1c2e4a] to-primary py-24 px-8 sm:px-12 lg:px-20 text-center overflow-hidden flex flex-col items-center shadow-[0_30px_60px_-15px_rgba(29,69,151,0.3)] border border-primary/20"
    >
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay pointer-events-none" />
      <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-accent/10 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute -bottom-1/2 -left-1/4 w-[50rem] h-[50rem] bg-primary-glow/20 blur-[130px] pointer-events-none" />

      <div className="relative z-20 space-y-10 max-w-4xl mx-auto">
        <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tighter leading-[1.1] drop-shadow-md">
          Ready to Scale With <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/70">Elite Talent?</span>
        </h2>

        <p className="text-lg md:text-xl text-white/80 font-medium max-w-2xl mx-auto leading-relaxed">
          Join the exclusive network connecting the world's best professionals with visionary companies. Secure, fast, and guaranteed.
        </p>

        <Link to="/auth" className="inline-block pt-8 group cursor-pointer">
          <Button size="lg" className="bg-white text-primary hover:bg-white/95 px-10 h-16 sm:h-20 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] transition-all duration-500 hover:scale-105 hover:-translate-y-2 font-display font-bold text-sm sm:text-base uppercase tracking-[0.2em] border-0 relative overflow-hidden">
            <span className="relative z-10 flex items-center font-bold">
              Join DigiReps Now <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-accent ml-3 drop-shadow-sm group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-300" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
          </Button>
        </Link>
      </div>
    </motion.div>
  </section>
);
