import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Briefcase, Users } from "lucide-react";
import { motion } from "framer-motion";

export const DualAudience = () => (
  <section className="container py-24">
    <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
        className="surface border border-border/60 rounded-[2.5rem] p-10 lg:p-12 space-y-8 hover:border-primary/40 hover:shadow-elegant transition-all duration-500 group relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-primary/5 to-transparent blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-500 relative z-10">
          <Briefcase className="h-8 w-8" />
        </div>
        <div className="space-y-4 relative z-10">
          <h3 className="font-display text-3xl font-bold tracking-tight">For Clients</h3>
          <p className="text-muted-foreground font-medium">Scale your business with elite, vetted professionals ready to execute.</p>
        </div>
        <ul className="space-y-4 relative z-10">
          <li className="flex items-start gap-4 text-sm text-foreground/80 font-medium"><CheckCircle className="h-5 w-5 text-primary shrink-0 drop-shadow-sm" /> Access pre-vetted, top 1% freelancers</li>
          <li className="flex items-start gap-4 text-sm text-foreground/80 font-medium"><CheckCircle className="h-5 w-5 text-primary shrink-0 drop-shadow-sm" /> Secure escrow payments for every project</li>
          <li className="flex items-start gap-4 text-sm text-foreground/80 font-medium"><CheckCircle className="h-5 w-5 text-primary shrink-0 drop-shadow-sm" /> On-platform communication and delivery</li>
          <li className="flex items-start gap-4 text-sm text-foreground/80 font-medium"><CheckCircle className="h-5 w-5 text-primary shrink-0 drop-shadow-sm" /> Quality-controlled results with ratings</li>
        </ul>
        <div className="pt-4 relative z-10">
          <Link to="/auth">
            <Button className="h-14 px-8 rounded-2xl bg-primary text-primary-foreground font-display font-bold text-xs uppercase tracking-widest border-0 gap-3 shadow-lg hover-lift btn-glow">
              Hire Talent <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
        className="bg-foreground text-background rounded-[2.5rem] p-10 lg:p-12 space-y-8 hover:shadow-2xl transition-all duration-500 group relative overflow-hidden">
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-gradient-to-br from-background/10 to-transparent blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        <div className="h-16 w-16 rounded-2xl bg-background/10 border border-background/20 flex items-center justify-center text-background shadow-sm group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-500 relative z-10">
          <Users className="h-8 w-8" />
        </div>
        <div className="space-y-4 relative z-10">
          <h3 className="font-display text-3xl font-bold tracking-tight">For Freelancers</h3>
          <p className="text-background/70 font-medium">Join an exclusive network and work with premium clients globally.</p>
        </div>
        <ul className="space-y-4 relative z-10">
          <li className="flex items-start gap-4 text-sm text-background/90 font-medium"><CheckCircle className="h-5 w-5 text-primary shrink-0 drop-shadow-sm" /> Get matched with premium clients</li>
          <li className="flex items-start gap-4 text-sm text-background/90 font-medium"><CheckCircle className="h-5 w-5 text-primary shrink-0 drop-shadow-sm" /> Guaranteed payments through escrow</li>
          <li className="flex items-start gap-4 text-sm text-background/90 font-medium"><CheckCircle className="h-5 w-5 text-primary shrink-0 drop-shadow-sm" /> Build your reputation with verified reviews</li>
          <li className="flex items-start gap-4 text-sm text-background/90 font-medium"><CheckCircle className="h-5 w-5 text-primary shrink-0 drop-shadow-sm" /> Track earnings and grow your career</li>
        </ul>
        <div className="pt-4 relative z-10">
          <Link to="/auth">
            <Button className="h-14 px-8 rounded-2xl bg-background text-foreground hover:bg-background/90 font-display font-bold text-xs uppercase tracking-widest border-0 gap-3 shadow-lg hover-lift">
              Join as Freelancer <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  </section>
);
