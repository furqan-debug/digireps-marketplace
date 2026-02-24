import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Code, Palette, Video, PenTool, Smartphone, ArrowRight, CheckCircle, Star, Zap, Lock, Quote, Users, Briefcase } from "lucide-react";
import { motion } from "framer-motion";

const services = [
  { name: "Web Development", icon: Code, color: "from-blue-500/20 to-blue-600/10" },
  { name: "UI/UX Design", icon: Palette, color: "from-purple-500/20 to-purple-600/10" },
  { name: "Video Editing", icon: Video, color: "from-pink-500/20 to-pink-600/10" },
  { name: "Copywriting", icon: PenTool, color: "from-amber-500/20 to-amber-600/10" },
  { name: "Mobile Development", icon: Smartphone, color: "from-green-500/20 to-green-600/10" },
];

const steps = [
  { step: "01", title: "Browse Categories", desc: "Select the service you need from our curated categories." },
  { step: "02", title: "Choose a Freelancer", desc: "View profiles of vetted, top-tier talent matched to your needs." },
  { step: "03", title: "Submit a Brief", desc: "Share your project details and budget. We handle the rest." },
];

const stats = [
  { value: "500+", label: "Vetted Freelancers" },
  { value: "Top 1%", label: "Talent Quality" },
  { value: "100%", label: "On-Platform" },
  { value: "Secure", label: "Escrow Payments" },
];

const benefits = [
  { icon: CheckCircle, text: "Vetted top 1% freelancers only" },
  { icon: Lock, text: "Secure on-platform communication" },
  { icon: Zap, text: "Simulated escrow payments" },
  { icon: Star, text: "Quality-controlled delivery" },
];

const trustedBy = ["TechCorp", "DesignLab", "StartupXYZ", "MediaPro", "CloudBase", "InnoVate"];

const testimonials = [
  { name: "Sarah Chen", role: "CTO, TechCorp", quote: "DigiReps connected us with a senior developer who delivered our platform redesign in half the expected timeline. The vetting process ensures top quality.", rating: 5 },
  { name: "Marcus Johnson", role: "Freelance Designer", quote: "Since joining DigiReps, I've had a steady stream of premium clients. The escrow system gives me confidence that I'll always be paid for my work.", rating: 5 },
  { name: "Elena Rodriguez", role: "Product Manager, StartupXYZ", quote: "The brief submission process is seamless. We've hired three freelancers through DigiReps and every experience has been exceptional.", rating: 5 },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/10 selection:text-primary">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-[100] bg-background/60 backdrop-blur-xl border-b border-border/40">
        <div className="container flex h-20 items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg group-hover:scale-105 transition-all duration-500">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-2xl font-bold tracking-tight text-foreground">
              Digi<span className="text-primary">Reps</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/how-it-works">
              <Button variant="ghost" className="font-display font-bold text-xs uppercase tracking-widest hover:bg-primary/5 hover:text-primary transition-colors h-11 px-6 rounded-xl hidden sm:inline-flex">How It Works</Button>
            </Link>
            <Link to="/auth">
              <Button variant="ghost" className="font-display font-bold text-xs uppercase tracking-widest hover:bg-primary/5 hover:text-primary transition-colors h-11 px-6 rounded-xl">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button className="h-11 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-8 shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 active:translate-y-0 font-display font-bold text-xs uppercase tracking-widest border-0">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-40 pb-24 lg:pt-48 lg:pb-32 overflow-hidden min-h-[85vh] flex items-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[140px]" />
        </div>

        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] as const }}
            className="max-w-5xl mx-auto text-center space-y-10 relative"
          >
            <div className="inline-flex items-center gap-3 rounded-full border border-primary/20 bg-primary/5 px-6 py-2 shadow-sm">
              <Star className="h-3.5 w-3.5 fill-primary text-primary" />
              <span className="font-display text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Trusted by top-performing enterprises</span>
            </div>

            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter leading-[0.9] text-foreground">
              The Marketplace for <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-primary/50">Elite Talent</span>
            </h1>

            <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
              Transform your digital operations. Access a curated network of vetted professionals, secure workflows, and guaranteed results—all in one premium workspace.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center pt-4">
              <Link to="/auth">
                <Button size="lg" className="w-full sm:w-auto h-14 gap-3 bg-primary hover:bg-primary/90 text-primary-foreground px-10 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:-translate-y-1 font-display font-bold text-xs uppercase tracking-widest border-0">
                  Hire Elite Talent <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 bg-background border-2 border-border/60 hover:border-primary/40 hover:bg-primary/5 text-foreground px-10 rounded-2xl transition-all font-display font-bold text-xs uppercase tracking-widest">
                  Join as a Rep
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats row */}
      <section className="bg-secondary/30 border-y border-border/40 backdrop-blur-sm">
        <div className="container py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i, duration: 0.6 }}
                className="text-center space-y-2 group"
              >
                <div className="font-display text-4xl sm:text-5xl font-bold text-foreground tracking-tighter group-hover:text-primary transition-colors">{s.value}</div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted By */}
      <section className="container py-12">
        <div className="text-center mb-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/50">Trusted by teams at</p>
        </div>
        <div className="flex flex-wrap justify-center gap-8 md:gap-16">
          {trustedBy.map((name) => (
            <span key={name} className="font-display text-lg sm:text-xl font-bold text-muted-foreground/20 hover:text-muted-foreground/40 transition-colors cursor-default tracking-tight">
              {name}
            </span>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="container py-24 relative">
        <div className="text-center mb-16 space-y-4">
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-foreground tracking-tight">Seamless Collaboration</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto font-medium leading-relaxed">Built for clarity and efficiency, from initial brief to final delivery.</p>
        </div>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid gap-8 md:grid-cols-3 max-w-7xl mx-auto"
        >
          {steps.map(({ step, title, desc }) => (
            <motion.div key={step} variants={itemVariants} className="group relative p-10 bg-card border border-border/60 hover:border-primary/40 transition-all duration-500 rounded-3xl hover:shadow-2xl">
              <div className="absolute top-0 right-0 p-8 font-display text-7xl font-bold text-muted/10 group-hover:text-primary/10 transition-colors pointer-events-none select-none">
                {step}
              </div>
              <div className="relative z-10 h-full flex flex-col justify-end pt-12">
                <h3 className="font-display text-xl font-bold mb-3 tracking-tight group-hover:text-primary transition-colors">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Benefits */}
      <section className="bg-foreground text-background border-y border-border/5 relative overflow-hidden">
        <div className="container relative z-10 py-24">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
            {benefits.map(({ icon: Icon, text }, i) => (
              <motion.div
                key={text}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i, duration: 0.5 }}
                className="flex flex-col items-center text-center gap-6 rounded-3xl bg-background/[0.03] border border-background/10 p-8 hover:bg-background/[0.06] transition-all duration-500 group"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 group-hover:scale-110 transition-transform duration-500">
                  <Icon className="h-7 w-7 text-primary" />
                </div>
                <span className="font-display font-bold text-sm leading-tight">{text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="container py-24 bg-secondary/20 rounded-3xl border border-border/40 my-16">
        <div className="text-center mb-16 space-y-4">
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-foreground tracking-tight">Specialized Expertise</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto font-medium">Curated talent across high-impact digital sectors.</p>
        </div>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-5 px-4"
        >
          {services.map(({ name, icon: Icon, color }) => (
            <motion.div
              key={name}
              variants={itemVariants}
              className="group flex flex-col items-center gap-8 rounded-3xl border border-border/60 bg-background p-10 transition-all duration-500 hover:shadow-xl hover:border-primary/40 hover:-translate-y-2 cursor-pointer relative overflow-hidden text-center"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className={`relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${color} transition-all duration-500 group-hover:scale-110 shadow-sm`}>
                <Icon className="h-8 w-8 text-primary" />
              </div>
              <span className="relative font-display text-xs font-bold uppercase tracking-widest text-foreground group-hover:text-primary transition-colors">{name}</span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Testimonials */}
      <section className="container py-24">
        <div className="text-center mb-16 space-y-4">
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-foreground tracking-tight">What People Say</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto font-medium">Hear from clients and freelancers who use DigiReps.</p>
        </div>
        <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div key={i} variants={itemVariants} className="bg-card border border-border/60 rounded-3xl p-8 space-y-6 hover:border-primary/30 hover:shadow-xl transition-all duration-500">
              <Quote className="h-8 w-8 text-primary/20" />
              <p className="text-sm text-muted-foreground leading-relaxed italic">"{t.quote}"</p>
              <div className="flex items-center gap-1">
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-warning text-warning" />
                ))}
              </div>
              <div className="border-t border-border/40 pt-4">
                <p className="font-display font-bold text-sm text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* For Clients vs For Freelancers */}
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

      {/* CTA Banner */}
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

      {/* Footer */}
      <footer className="bg-card border-t border-border/40">
        <div className="container py-20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-16">
            <div className="md:col-span-2 space-y-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary">
                  <Shield className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="font-display text-2xl font-bold tracking-tight text-foreground">Digi<span className="text-primary">Reps</span></span>
              </div>
              <p className="text-muted-foreground text-base leading-relaxed max-w-sm font-medium">The premium standard for digital services. Vetted talent, professional delivery.</p>
            </div>
            <div className="space-y-6">
              <h4 className="font-display font-bold text-xs text-foreground uppercase tracking-[0.3em]">Platform</h4>
              <nav className="flex flex-col gap-4">
                <Link to="/how-it-works" className="text-muted-foreground font-medium text-sm hover:text-primary transition-colors">How It Works</Link>
                <Link to="/auth" className="text-muted-foreground font-medium text-sm hover:text-primary transition-colors">Hire Talent</Link>
                <Link to="/auth" className="text-muted-foreground font-medium text-sm hover:text-primary transition-colors">Freelancer Portal</Link>
              </nav>
            </div>
            <div className="space-y-6">
              <h4 className="font-display font-bold text-xs text-foreground uppercase tracking-[0.3em]">Support</h4>
              <nav className="flex flex-col gap-4">
                <Link to="/help" className="text-muted-foreground font-medium text-sm hover:text-primary transition-colors">Help & FAQ</Link>
                <a href="mailto:support@digireps.com" className="text-muted-foreground font-medium text-sm hover:text-primary transition-colors">Contact Support</a>
              </nav>
            </div>
          </div>
          <div className="border-t border-border/40 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-muted-foreground font-medium text-xs uppercase tracking-[0.2em]">
            <p>© 2026 DigiReps. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
