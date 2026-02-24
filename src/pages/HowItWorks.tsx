import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Search, UserCheck, FileText, CreditCard, ClipboardList, CheckCircle, Star, MessageSquare, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const clientSteps = [
  { step: "01", icon: Search, title: "Browse Vetted Talent", desc: "Explore our curated network of pre-screened freelancers across categories like design, development, video, and copywriting." },
  { step: "02", icon: UserCheck, title: "Review Profiles & Portfolios", desc: "Dive into detailed profiles with verified skills, portfolio work, client ratings, and availability status." },
  { step: "03", icon: FileText, title: "Submit a Project Brief", desc: "Share your project requirements, budget, and timeline. The freelancer receives your brief directly." },
  { step: "04", icon: CreditCard, title: "Collaborate & Pay Securely", desc: "Work together on-platform with built-in chat. Approve deliveries and release payment through secure escrow." },
];

const freelancerSteps = [
  { step: "01", icon: ClipboardList, title: "Apply & Build Your Profile", desc: "Create your professional profile with skills, experience, portfolio items, and set your hourly rate." },
  { step: "02", icon: CheckCircle, title: "Get Vetted & Approved", desc: "Our team reviews your application to ensure quality standards. Approved freelancers join the elite network." },
  { step: "03", icon: MessageSquare, title: "Receive Project Briefs", desc: "Clients submit briefs directly to you. Review requirements, budget, and timeline before accepting." },
  { step: "04", icon: Star, title: "Deliver, Get Rated & Earn", desc: "Complete the project, receive client ratings that boost your profile, and get paid securely." },
];

const faqs = [
  { q: "How long does freelancer vetting take?", a: "Our team typically reviews applications within 24–72 hours. You'll receive an email notification once your profile has been approved or if revisions are needed." },
  { q: "What fees does DigiReps charge?", a: "DigiReps charges a small commission on completed projects. The exact rate is visible on each order. There are no upfront fees for clients or freelancers." },
  { q: "How does escrow payment work?", a: "When a client submits a brief, the budget is held in escrow. Once the client approves the delivery, the payment is released to the freelancer. This protects both parties." },
  { q: "Can I dispute a project?", a: "Yes. If there's a disagreement about delivery quality, either party can raise a dispute. Our admin team will review the case and mediate a resolution." },
  { q: "What categories of freelancers are available?", a: "We currently support Web Development, UI/UX Design, Video Editing, Copywriting, and Mobile Development — with more categories coming soon." },
  { q: "Is my data and communication secure?", a: "All communication happens on-platform. We enforce strict policies against sharing personal contact information to protect both clients and freelancers." },
  { q: "How do I get paid as a freelancer?", a: "Payments are processed through the platform once a client approves your delivery. Earnings are tracked in your dashboard and can be withdrawn to your linked account." },
  { q: "Can I hire multiple freelancers?", a: "Absolutely. You can submit briefs to as many freelancers as you need and manage all projects from your client dashboard." },
];

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-[100] bg-background/60 backdrop-blur-xl border-b border-border/40">
        <div className="container flex h-20 items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg group-hover:scale-105 transition-all duration-500">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-2xl font-bold tracking-tight text-foreground">
              Digi<span className="text-primary">Reps</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" className="font-display font-bold text-xs uppercase tracking-widest hover:bg-primary/5 hover:text-primary h-11 px-6 rounded-xl">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button className="h-11 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-8 shadow-lg shadow-primary/20 font-display font-bold text-xs uppercase tracking-widest border-0">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-40 pb-20 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[140px] pointer-events-none" />
        <div className="container relative z-10 text-center max-w-4xl mx-auto space-y-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter leading-[0.9] text-foreground">
              How <span className="text-primary">DigiReps</span> Works
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-6 leading-relaxed font-medium">
              Whether you're hiring elite talent or offering your skills, our platform makes collaboration seamless, secure, and professional.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
              <Link to="/auth">
                <Button size="lg" className="w-full sm:w-auto h-14 gap-3 bg-primary hover:bg-primary/90 text-primary-foreground px-10 rounded-2xl shadow-xl shadow-primary/20 font-display font-bold text-xs uppercase tracking-widest border-0">
                  Hire Talent <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 border-2 border-border/60 hover:border-primary/40 hover:bg-primary/5 text-foreground px-10 rounded-2xl font-display font-bold text-xs uppercase tracking-widest">
                  Join as Freelancer
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* For Clients */}
      <section className="container py-24">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/5 border border-primary/10 px-5 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
            For Clients
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight">Hire With Confidence</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto font-medium">Four simple steps to find and work with top-tier talent.</p>
        </div>
        <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
          {clientSteps.map(({ step, icon: Icon, title, desc }) => (
            <motion.div key={step} variants={itemVariants} className="group relative p-8 bg-card border border-border/60 hover:border-primary/40 transition-all duration-500 rounded-3xl hover:shadow-xl">
              <div className="absolute top-0 right-0 p-6 font-display text-6xl font-bold text-muted/10 group-hover:text-primary/10 transition-colors pointer-events-none select-none">{step}</div>
              <div className="relative z-10 space-y-5">
                <div className="h-14 w-14 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground text-primary transition-all duration-500">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="font-display text-lg font-bold tracking-tight group-hover:text-primary transition-colors">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* For Freelancers */}
      <section className="bg-foreground text-background py-24">
        <div className="container">
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-background/10 border border-background/20 px-5 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-background/80">
              For Freelancers
            </div>
            <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight">Grow Your Career</h2>
            <p className="text-background/60 text-lg max-w-xl mx-auto font-medium">Join the elite network and get access to premium clients.</p>
          </div>
          <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
            {freelancerSteps.map(({ step, icon: Icon, title, desc }) => (
              <motion.div key={step} variants={itemVariants} className="group relative p-8 bg-background/[0.03] border border-background/10 hover:bg-background/[0.08] transition-all duration-500 rounded-3xl">
                <div className="absolute top-0 right-0 p-6 font-display text-6xl font-bold text-background/5 group-hover:text-background/10 transition-colors pointer-events-none select-none">{step}</div>
                <div className="relative z-10 space-y-5">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="font-display text-lg font-bold tracking-tight">{title}</h3>
                  <p className="text-sm text-background/50 leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container py-24 max-w-3xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight">Frequently Asked Questions</h2>
          <p className="text-muted-foreground text-lg font-medium">Everything you need to know about using DigiReps.</p>
        </div>
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="border border-border/60 rounded-2xl px-6 bg-card data-[state=open]:border-primary/30 transition-colors">
              <AccordionTrigger className="text-left font-display font-bold text-base tracking-tight hover:no-underline py-5">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-5">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Bottom CTA */}
      <section className="container pb-24">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
          className="relative rounded-3xl bg-primary py-20 px-12 text-center overflow-hidden flex flex-col items-center">
          <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-background/10 blur-[140px] pointer-events-none" />
          <div className="relative z-10 space-y-8 max-w-3xl">
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-primary-foreground tracking-tighter leading-none">Ready to get started?</h2>
            <p className="text-lg text-primary-foreground/80 font-medium max-w-2xl mx-auto">Join thousands of clients and freelancers already using DigiReps.</p>
            <Link to="/auth" className="inline-block">
              <Button size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 px-12 h-14 rounded-2xl shadow-2xl font-display font-bold text-xs uppercase tracking-[0.2em] border-0">
                Get Started Now <ArrowRight className="h-5 w-5 ml-3" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border/40">
        <div className="container py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-muted-foreground font-medium text-xs uppercase tracking-[0.2em]">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary/40" />
              <span>© 2026 DigiReps. All rights reserved.</span>
            </div>
            <div className="flex gap-6">
              <Link to="/help" className="hover:text-primary transition-colors">Help</Link>
              <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HowItWorks;
