import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Briefcase, Users } from "lucide-react";
import { motion } from "framer-motion";

export const DualAudience = () => (
  <section className="container py-24">
    <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
        className="bg-card border border-border/60 rounded-3xl p-10 space-y-6 hover:border-primary/30 transition-colors duration-500">
        <div className="h-14 w-14 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary">
          <Briefcase className="h-7 w-7" />
        </div>
        <h3 className="font-display text-2xl font-bold tracking-tight">For Clients</h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-3 text-sm text-muted-foreground"><CheckCircle className="h-4 w-4 text-accent shrink-0 mt-0.5" /> Access pre-vetted, top 1% freelancers</li>
          <li className="flex items-start gap-3 text-sm text-muted-foreground"><CheckCircle className="h-4 w-4 text-accent shrink-0 mt-0.5" /> Secure escrow payments for every project</li>
          <li className="flex items-start gap-3 text-sm text-muted-foreground"><CheckCircle className="h-4 w-4 text-accent shrink-0 mt-0.5" /> On-platform communication and delivery</li>
          <li className="flex items-start gap-3 text-sm text-muted-foreground"><CheckCircle className="h-4 w-4 text-accent shrink-0 mt-0.5" /> Quality-controlled results with ratings</li>
        </ul>
        <Link to="/auth">
          <Button className="h-12 px-8 rounded-xl bg-primary text-primary-foreground font-display font-bold text-xs uppercase tracking-widest border-0 gap-2 mt-2">
            Hire Talent <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </motion.div>

      <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
        className="bg-foreground text-background rounded-3xl p-10 space-y-6">
        <div className="h-14 w-14 rounded-2xl bg-background/10 border border-background/20 flex items-center justify-center text-background">
          <Users className="h-7 w-7" />
        </div>
        <h3 className="font-display text-2xl font-bold tracking-tight">For Freelancers</h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-3 text-sm text-background/70"><CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" /> Get matched with premium clients</li>
          <li className="flex items-start gap-3 text-sm text-background/70"><CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" /> Guaranteed payments through escrow</li>
          <li className="flex items-start gap-3 text-sm text-background/70"><CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" /> Build your reputation with verified reviews</li>
          <li className="flex items-start gap-3 text-sm text-background/70"><CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" /> Track earnings and grow your career</li>
        </ul>
        <Link to="/auth">
          <Button className="h-12 px-8 rounded-xl bg-background text-foreground hover:bg-background/90 font-display font-bold text-xs uppercase tracking-widest border-0 gap-2 mt-2">
            Join as Freelancer <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </motion.div>
    </div>
  </section>
);
