import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, Briefcase, Users } from "lucide-react";
import { motion } from "framer-motion";

export const DualAudience = () => (
  <section className="container py-24 relative">
    <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 max-w-7xl mx-auto items-stretch">
      {/* Client Side */}
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
        className="surface border border-border/80 rounded-[3rem] p-10 lg:p-14 space-y-10 hover:border-primary/50 hover:shadow-[0_20px_60px_-15px_rgba(29,69,151,0.15)] transition-all duration-700 group relative overflow-hidden bg-card/50 flex flex-col justify-between">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay pointer-events-none" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-primary/10 via-primary/5 to-transparent blur-[100px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />

        <div className="space-y-8 relative z-10">
          <div className="inline-flex h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-700 ease-out">
            <Briefcase className="h-7 w-7 text-primary" />
          </div>
          <div className="space-y-4">
            <h3 className="font-display text-4xl lg:text-5xl font-bold tracking-tight text-foreground">For Clients</h3>
            <p className="text-muted-foreground font-medium text-lg leading-relaxed max-w-md">Scale your business instantly with elite, pre-vetted professionals ready to execute.</p>
          </div>
          <ul className="space-y-4 pt-2">
            {[
              "Access pre-vetted, top 1% freelancers instantly",
              "Secure escrow payments ensure risk-free projects",
              "Built-in seamless communication & milestones",
              "Rigorous quality control with guaranteed results"
            ].map((text, i) => (
              <li key={i} className="flex items-center gap-4 text-[15px] sm:text-base text-foreground/80 font-medium">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 drop-shadow-sm" /> {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-8 relative z-10 mt-auto">
          <Link to="/auth" className="inline-block w-full sm:w-auto mt-4">
            <Button className="w-full sm:w-auto h-16 px-10 rounded-2xl bg-primary text-primary-foreground font-display font-bold text-sm uppercase tracking-widest border-0 gap-3 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-500 hover:-translate-y-1 overflow-hidden relative btn-glow">
              <span className="relative z-10 flex items-center">Hire Talent <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" /></span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Freelancer Side */}
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-foreground text-background rounded-[3rem] p-10 lg:p-14 space-y-10 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] transition-all duration-700 group relative overflow-hidden flex flex-col justify-between">
        <div className="absolute top-0 right-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-[500px] h-[500px] bg-gradient-to-tr from-accent/20 via-background/10 to-transparent blur-[100px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />

        <div className="space-y-8 relative z-10">
          <div className="inline-flex h-16 w-16 rounded-2xl bg-background/10 border border-background/20 items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-700 ease-out">
            <Users className="h-7 w-7 text-accent" />
          </div>
          <div className="space-y-4">
            <h3 className="font-display text-4xl lg:text-5xl font-bold tracking-tight text-background">For Freelancers</h3>
            <p className="text-background/70 font-medium text-lg leading-relaxed max-w-md">Join an exclusive network and work with premium clients on high-impact projects.</p>
          </div>
          <ul className="space-y-4 pt-2">
            {[
              "Get matched directly with premium enterprise clients",
              "Guaranteed payments through secure simulated escrow",
              "Build global reputation with verified 5-star reviews",
              "Focus strictly on work, not on finding clients"
            ].map((text, i) => (
              <li key={i} className="flex items-center gap-4 text-[15px] sm:text-base text-background/90 font-medium">
                <CheckCircle2 className="h-5 w-5 text-accent shrink-0 drop-shadow-sm" /> {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-8 relative z-10 mt-auto">
          <Link to="/auth" className="inline-block w-full sm:w-auto mt-4">
            <Button className="w-full sm:w-auto h-16 px-10 rounded-2xl bg-background text-foreground hover:bg-background/90 font-display font-bold text-sm uppercase tracking-widest border-0 gap-3 shadow-xl transition-all duration-500 hover:-translate-y-1 overflow-hidden relative">
              <span className="relative z-10 flex items-center">Join as Freelancer <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" /></span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  </section>
);
