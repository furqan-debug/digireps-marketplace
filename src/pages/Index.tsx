import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Code, Palette, Video, PenTool, Smartphone, ArrowRight, CheckCircle, Star, Zap, Lock } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

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

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const Index = () => {
  const containerRef = useRef(null);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/10 selection:text-primary">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-[100] bg-background/60 backdrop-blur-xl border-b border-border/40">
        <div className="container flex h-20 items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] group-hover:scale-105 transition-all duration-500">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-2xl font-black tracking-tighter text-foreground uppercase italic">
              Digi<span className="text-primary not-italic">Reps</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
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

      {/* Kinetic Hero */}
      <section className="relative pt-40 pb-32 lg:pt-56 lg:pb-48 overflow-hidden min-h-[90vh] flex items-center">
        {/* Advanced Decorative elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[800px] h-[800px] rounded-full bg-primary/5 blur-[140px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full border border-primary/10 animate-[spin_100s_linear_infinite] border-dashed" />
        </div>

        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-5xl mx-auto text-center space-y-12 relative"
          >
            <div className="inline-flex items-center gap-3 rounded-full border border-primary/20 bg-primary/5 px-6 py-2 shadow-sm">
              <Star className="h-3.5 w-3.5 fill-primary text-primary animate-pulse" />
              <span className="font-display text-[10px] font-black uppercase tracking-[0.3em] text-primary">Trusted by top-performing enterprises</span>
            </div>

            <h1 className="font-display text-7xl sm:text-8xl lg:text-[10rem] font-black tracking-tighter leading-[0.85] text-foreground uppercase">
              Marketplace for <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-primary/40 italic">Elite Talent</span>
            </h1>

            <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
              Transform your digital operations. Access a curated network of vetted professionals, secure workflows, and guaranteed results—all in one premium workspace.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center pt-8">
              <Link to="/auth">
                <Button size="lg" className="w-full sm:w-auto h-16 gap-3 bg-primary hover:bg-primary/90 text-primary-foreground px-12 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:-translate-y-1 font-display font-black text-xs uppercase tracking-widest border-0">
                  Hire Elite Talent <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-16 bg-background border-2 border-border/60 hover:border-primary/40 hover:bg-primary/5 text-foreground px-12 rounded-2xl transition-all font-display font-black text-xs uppercase tracking-widest">
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
                <div className="font-display text-5xl font-black text-foreground tracking-tighter group-hover:text-primary transition-colors">{s.value}</div>
                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Bento UI */}
      <section className="container py-40 relative">
        <div className="text-center mb-24 space-y-6">
          <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl font-black text-foreground tracking-tighter uppercase italic">Seamless Collaboration</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto font-medium leading-relaxed">Built for clarity and efficiency, from initial brief to final delivery.</p>
        </div>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid gap-8 md:grid-cols-3 xl:gap-12 max-w-7xl mx-auto"
        >
          {steps.map(({ step, title, desc }) => (
            <motion.div key={step} variants={itemVariants} className="group relative p-12 bg-card border border-border/60 hover:border-primary/40 transition-all duration-500 rounded-[2.5rem] hover:shadow-2xl">
              <div className="absolute top-0 right-0 p-10 font-display text-8xl font-black text-muted/10 group-hover:text-primary/10 transition-colors pointer-events-none select-none">
                {step}
              </div>
              <div className="relative z-10 h-full flex flex-col justify-end pt-16">
                <h3 className="font-display text-2xl font-black mb-4 tracking-tight group-hover:text-primary transition-colors uppercase italic">{title}</h3>
                <p className="text-base text-muted-foreground leading-relaxed font-medium">{desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Benefits */}
      <section className="bg-[#020617] text-white border-y border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 blur-[120px] -translate-x-1/2" />
        <div className="container relative z-10 py-32">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
            {benefits.map(({ icon: Icon, text }, i) => (
              <motion.div
                key={text}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i, duration: 0.5 }}
                className="flex flex-col items-center text-center gap-8 rounded-[3rem] bg-white/[0.03] border border-white/10 p-10 shadow-lg hover:bg-white/[0.06] transition-all duration-500 group"
              >
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.5rem] bg-primary/10 border border-primary/20 group-hover:scale-110 transition-transform duration-500">
                  <Icon className="h-8 w-8 text-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.4)]" />
                </div>
                <span className="font-display font-black text-sm uppercase tracking-widest leading-tight">{text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Categories - Dossier Style */}
      <section className="container py-40 bg-secondary/20 rounded-[4rem] border border-border/40 my-20">
        <div className="text-center mb-24 space-y-6">
          <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl font-black text-foreground tracking-tighter uppercase italic">Specialized Expertise</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto font-medium">Curated talent across high-impact digital sectors.</p>
        </div>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid gap-6 grid-cols-2 lg:grid-cols-5 px-4"
        >
          {services.map(({ name, icon: Icon, color }) => (
            <motion.div
              key={name}
              variants={itemVariants}
              className="group flex flex-col items-center gap-10 rounded-[2.5rem] border border-border/60 bg-background p-12 transition-all duration-500 hover:shadow-xl hover:border-primary/40 hover:-translate-y-2 cursor-pointer relative overflow-hidden text-center"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className={`relative flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-gradient-to-br ${color} transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-sm`}>
                <Icon className="h-9 w-9 text-primary" />
              </div>
              <span className="relative font-display text-xs font-black uppercase tracking-widest text-foreground group-hover:text-primary transition-colors">{name}</span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA Banner */}
      <section className="container pb-40">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative rounded-[4rem] bg-primary py-32 px-12 text-center overflow-hidden flex flex-col items-center"
        >
          <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-white/10 blur-[140px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-black/10 blur-[120px] pointer-events-none" />

          <div className="relative z-10 space-y-12 max-w-4xl">
            <h2 className="font-display text-6xl sm:text-8xl lg:text-9xl font-black text-primary-foreground tracking-tighter leading-none uppercase">Ready to <br /><span className="italic opacity-50">scale?</span></h2>
            <p className="text-xl lg:text-2xl text-primary-foreground/80 font-medium max-w-2xl mx-auto">Join the elite network connecting the world's best talent with visionary companies.</p>
            <Link to="/auth" className="inline-block pt-4">
              <Button size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 px-16 h-20 rounded-2xl shadow-2xl transition-all hover:scale-105 active:scale-100 font-display font-black text-xs uppercase tracking-[0.2em] border-0">
                Join DigiReps Now <Zap className="h-6 w-6 fill-primary ml-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border/40">
        <div className="container py-24">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-20 mb-20">
            <div className="md:col-span-2 space-y-8">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary">
                  <Shield className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="font-display text-3xl font-black tracking-tighter text-foreground uppercase italic">Digi<span className="text-primary not-italic">Reps</span></span>
              </div>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-sm font-medium">The premium standard for digital services. Vetted talent, professional delivery.</p>
            </div>
            <div className="space-y-8">
              <h4 className="font-display font-black text-xs text-foreground uppercase tracking-[0.3em]">Solution</h4>
              <nav className="flex flex-col gap-5">
                <Link to="/auth" className="text-muted-foreground font-bold text-sm hover:text-primary transition-colors">Hire Talent</Link>
                <Link to="/auth" className="text-muted-foreground font-bold text-sm hover:text-primary transition-colors">Freelancer Portal</Link>
                <Link to="/auth" className="text-muted-foreground font-bold text-sm hover:text-primary transition-colors">Success Stories</Link>
              </nav>
            </div>
            <div className="space-y-8">
              <h4 className="font-display font-black text-xs text-foreground uppercase tracking-[0.3em]">Help</h4>
              <nav className="flex flex-col gap-5">
                <span className="text-muted-foreground font-bold text-sm hover:text-primary cursor-pointer transition-colors">Terms of Service</span>
                <span className="text-muted-foreground font-bold text-sm hover:text-primary cursor-pointer transition-colors">Privacy Shield</span>
                <span className="text-muted-foreground font-bold text-sm hover:text-primary cursor-pointer transition-colors">Contact Support</span>
              </nav>
            </div>
          </div>
          <div className="border-t border-border/40 pt-10 flex flex-col md:flex-row justify-between items-center gap-6 text-muted-foreground font-black text-[10px] uppercase tracking-[0.2em]">
            <p>© 2026 DigiReps. All rights reserved.</p>
            <div className="flex gap-10">
              <span className="hover:text-primary cursor-pointer transition-colors">Twitter</span>
              <span className="hover:text-primary cursor-pointer transition-colors">LinkedIn</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;