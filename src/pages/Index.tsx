import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Code, Palette, Video, PenTool, Smartphone, ArrowRight, CheckCircle, Star, Zap, Lock } from "lucide-react";
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

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40 transition-all duration-300">
        <div className="container flex h-20 items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="flex h-11 w-11 items-center justify-center rounded-[1.25rem] bg-gradient-to-br from-primary to-primary-glow shadow-elegant group-hover:scale-105 transition-transform duration-300">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-2xl font-bold tracking-tight text-foreground">
              Digi<span className="text-primary">Reps</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/auth">
              <Button variant="ghost" className="font-display font-bold text-sm uppercase tracking-widest hover:bg-primary/5 hover:text-primary transition-colors h-12 px-6 rounded-[1.25rem]">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button className="h-12 bg-gradient-to-r from-primary to-primary-glow hover:brightness-110 text-primary-foreground rounded-[1.25rem] px-8 shadow-elegant transition-all hover:scale-[1.02] active:scale-100 font-display font-bold text-sm uppercase tracking-widest border-0">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Kinetic Hero */}
      <section className="relative pt-40 pb-32 lg:pt-56 lg:pb-48 overflow-hidden min-h-screen flex items-center">
        {/* Decorative elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px] mix-blend-multiply animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[120px] mix-blend-multiply" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-primary/5 animate-[spin_60s_linear_infinite] border-dashed" />
        </div>

        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-5xl mx-auto text-center space-y-10 relative"
          >
            <div className="inline-flex items-center gap-3 rounded-full border border-primary/20 bg-primary/5 px-5 py-2 shadow-inner">
              <Star className="h-4 w-4 fill-primary text-primary animate-pulse" />
              <span className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Trusted by top-performing enterprises</span>
            </div>

            <h1 className="font-display text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95] text-foreground">
              Marketplace for <br />
              <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent italic pr-4">Elite Talent</span>
            </h1>

            <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-medium">
              Transform your digital operations. Access a curated network of vetted professionals, secure workflows, and guaranteed results—all in one premium workspace.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center pt-8">
              <Link to="/auth">
                <Button size="lg" className="w-full sm:w-auto h-16 gap-3 bg-gradient-to-r from-primary to-primary-glow hover:brightness-110 text-primary-foreground px-12 rounded-[1.5rem] shadow-elegant transition-all hover:scale-[1.02] active:scale-100 font-display font-bold text-sm uppercase tracking-widest border-0">
                  Hire Elite Talent <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-16 bg-white border-2 border-border/40 hover:border-primary/40 hover:bg-muted/5 text-foreground px-12 rounded-[1.5rem] transition-all font-display font-bold text-sm uppercase tracking-widest shadow-sm hover:shadow-md">
                  Join as a Rep
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats row */}
      <section className="bg-white/50 dark:bg-black/20 border-y border-border/50 backdrop-blur-sm">
        <div className="container py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i, duration: 0.6 }}
                className="text-center space-y-1"
              >
                <div className="font-display text-4xl font-black text-foreground">{s.value}</div>
                <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Bento UI */}
      <section className="container py-32 relative">
        <div className="text-center mb-24 space-y-4">
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-foreground tracking-tight">Seamless Collaboration</h2>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto font-medium">Built for clarity and efficiency, from initial brief to final delivery.</p>
        </div>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid gap-8 md:grid-cols-3 xl:gap-12 max-w-7xl mx-auto"
        >
          {steps.map(({ step, title, desc }) => (
            <motion.div key={step} variants={itemVariants} className="dossier-card group relative p-10 bg-white border border-border/40 hover:border-primary/30 transition-all hover:shadow-elegant">
              <div className="absolute top-0 right-0 p-8 font-display text-7xl font-black text-muted/30 group-hover:text-primary/10 transition-colors pointer-events-none select-none">
                {step}
              </div>
              <div className="relative z-10 h-full flex flex-col justify-end pt-12">
                <h3 className="font-display text-3xl font-bold mb-4 tracking-tight group-hover:text-primary transition-colors">{title}</h3>
                <p className="text-lg text-muted-foreground leading-relaxed font-medium">{desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Benefits */}
      <section className="bg-[#0f172a] text-white border-y border-border/10">
        <div className="container py-24">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
            {benefits.map(({ icon: Icon, text }, i) => (
              <motion.div
                key={text}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i, duration: 0.5 }}
                className="flex flex-col items-center text-center gap-6 rounded-[2rem] bg-white/5 border border-white/10 p-8 shadow-sm hover:bg-white/10 transition-colors"
              >
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.25rem] bg-gradient-to-br from-primary/20 to-primary-glow/10 border border-primary/20">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
                <span className="font-display font-bold text-lg leading-tight tracking-tight">{text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Categories - Dossier Style */}
      <section className="container py-32 bg-secondary/20 rounded-[4rem] border border-border/40 my-20">
        <div className="text-center mb-24 space-y-4">
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-foreground tracking-tight">Specialized Expertise</h2>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto font-medium">Curated talent across high-impact digital sectors.</p>
        </div>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid gap-6 grid-cols-2 lg:grid-cols-5 px-8"
        >
          {services.map(({ name, icon: Icon, color }) => (
            <motion.div
              key={name}
              variants={itemVariants}
              className="group flex flex-col items-center gap-8 rounded-[2rem] border border-border/40 bg-white p-10 transition-all hover:shadow-elegant hover:border-primary/30 hover:-translate-y-2 cursor-pointer shadow-sm relative overflow-hidden text-center"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className={`relative flex h-24 w-24 items-center justify-center rounded-[1.5rem] bg-gradient-to-br ${color} transition-transform group-hover:scale-[1.15] group-hover:rotate-3 duration-500 shadow-inner`}>
                <Icon className="h-10 w-10 text-primary" />
              </div>
              <span className="relative font-display text-xl font-bold text-foreground leading-tight tracking-tight group-hover:text-primary transition-colors">{name}</span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA Banner */}
      <section className="container pb-32">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative dossier-card rounded-[4rem] border-primary/20 bg-primary/5 py-24 px-12 text-center overflow-hidden flex flex-col items-center"
        >
          <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-primary/10 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-indigo-500/10 blur-[100px] pointer-events-none" />

          <div className="relative z-10 space-y-10 max-w-3xl">
            <h2 className="font-display text-5xl sm:text-7xl font-black text-foreground tracking-tight leading-[1.1]">Ready to <span className="italic text-primary">scale?</span></h2>
            <p className="text-xl lg:text-2xl text-muted-foreground/80 font-medium">Join the elite network connecting the world's best talent with visionary companies.</p>
            <Link to="/auth" className="inline-block pt-4">
              <Button size="lg" className="bg-gradient-to-r from-primary to-primary-glow hover:brightness-110 text-primary-foreground px-14 h-16 rounded-[1.5rem] shadow-elegant gap-4 transition-transform hover:scale-105 active:scale-100 font-display font-bold text-base uppercase tracking-widest border-0">
                Join DigiReps Now <Zap className="h-6 w-6 fill-primary-foreground text-primary-foreground" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border/50">
        <div className="container py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-16">
            <div className="md:col-span-2 space-y-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary">
                  <Shield className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="font-display text-2xl font-bold tracking-tight text-foreground">DigiReps</span>
              </div>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-sm font-medium">The premium standard for digital services. Vetted talent, professional delivery.</p>
            </div>
            <div className="space-y-6">
              <h4 className="font-display font-bold text-lg text-foreground uppercase tracking-wider">Solution</h4>
              <nav className="flex flex-col gap-4">
                <Link to="/auth" className="text-muted-foreground font-medium hover:text-primary transition-colors">Hire Talent</Link>
                <Link to="/auth" className="text-muted-foreground font-medium hover:text-primary transition-colors">Freelancer Portal</Link>
                <Link to="/auth" className="text-muted-foreground font-medium hover:text-primary transition-colors">Success Stories</Link>
              </nav>
            </div>
            <div className="space-y-6">
              <h4 className="font-display font-bold text-lg text-foreground uppercase tracking-wider">Help</h4>
              <nav className="flex flex-col gap-4">
                <span className="text-muted-foreground font-medium hover:text-primary cursor-pointer transition-colors">Terms of Service</span>
                <span className="text-muted-foreground font-medium hover:text-primary cursor-pointer transition-colors">Privacy Shield</span>
                <span className="text-muted-foreground font-medium hover:text-primary cursor-pointer transition-colors">Contact Support</span>
              </nav>
            </div>
          </div>
          <div className="border-t border-border/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-muted-foreground font-medium">
            <p>© 2026 DigiReps. All rights reserved.</p>
            <div className="flex gap-8">
              <span className="hover:text-primary cursor-pointer">Twitter</span>
              <span className="hover:text-primary cursor-pointer">LinkedIn</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
