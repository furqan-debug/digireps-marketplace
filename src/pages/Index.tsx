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
      <header className="border-b card-glass sticky top-0 z-50 transition-all duration-300">
        <div className="container flex h-18 items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary shadow-elegant">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-2xl font-bold tracking-tight text-foreground">
              Digi<span className="text-primary">Reps</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/auth">
              <Button variant="ghost" className="font-medium hover:bg-primary/5 transition-colors">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button className="font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6 shadow-elegant transition-all hover:-translate-y-0.5 active:translate-y-0">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative container pt-24 pb-32 lg:pt-40 lg:pb-48 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
          <div className="absolute top-20 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] animate-pulse" />
          <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] rounded-full bg-accent/5 blur-[100px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl mx-auto text-center space-y-8 relative"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-4 py-1.5 text-sm font-semibold text-primary">
            <Star className="h-4 w-4 fill-primary animate-pulse" /> Trusted by top-performing businesses
          </div>
          <h1 className="font-display text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95] text-foreground">
            Marketplace for{" "}
            <span className="gradient-text">Elite Talent</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
            Skip the noise. Access a curated network of vetted professionals, secure workflows, and guaranteed results—all in one premium workspace.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link to="/auth">
              <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-10 h-14 rounded-2xl shadow-elegant transition-all hover:scale-[1.02] active:scale-100">
                Hire Talent <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline" className="text-lg px-10 h-14 rounded-2xl border-border/80 hover:bg-background/80 hover:border-primary/20 transition-all">
                Become a Rep
              </Button>
            </Link>
          </div>
        </motion.div>
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

      {/* How It Works */}
      <section className="container py-32">
        <div className="text-center mb-20 space-y-4">
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-foreground">Seamless Collaboration</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto font-medium">Built for clarity and efficiency, from initial brief to final delivery.</p>
        </div>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid gap-12 md:grid-cols-3 max-w-6xl mx-auto"
        >
          {steps.map(({ step, title, desc }) => (
            <motion.div key={step} variants={itemVariants} className="group relative p-8 rounded-3xl bg-card border border-border/50 hover:border-primary/20 transition-all hover:shadow-elegant">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/5 text-primary font-display text-2xl font-black mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                {step}
              </div>
              <h3 className="font-display text-2xl font-bold mb-4">{title}</h3>
              <p className="text-muted-foreground leading-relaxed font-medium">{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Benefits */}
      <section className="bg-secondary/30 border-y border-border/50">
        <div className="container py-20">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
            {benefits.map(({ icon: Icon, text }, i) => (
              <motion.div
                key={text}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i, duration: 0.5 }}
                className="flex items-center gap-4 rounded-2xl bg-background border border-border/40 p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10">
                  <Icon className="h-6 w-6 text-accent" />
                </div>
                <span className="font-bold text-foreground leading-tight">{text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="container py-32">
        <div className="text-center mb-20 space-y-4">
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-foreground">Specialized Expertise</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto font-medium">Curated talent across high-impact digital sectors.</p>
        </div>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid gap-6 grid-cols-2 lg:grid-cols-5"
        >
          {services.map(({ name, icon: Icon, color }) => (
            <motion.div
              key={name}
              variants={itemVariants}
              className="group flex flex-col items-center gap-6 rounded-3xl border border-border/40 bg-card p-10 transition-all hover:shadow-elegant hover:border-primary/30 hover:-translate-y-2 cursor-pointer"
            >
              <div className={`flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${color} transition-transform group-hover:scale-110 duration-300`}>
                <Icon className="h-10 w-10 text-primary" />
              </div>
              <span className="text-lg font-bold text-center text-foreground leading-tight">{name}</span>
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
          className="relative rounded-[3rem] border border-primary/20 bg-primary/5 py-24 px-12 text-center overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/5 blur-[80px] pointer-events-none" />

          <div className="relative z-10 space-y-8">
            <h2 className="font-display text-5xl sm:text-6xl font-black text-foreground">Ready to scale?</h2>
            <p className="text-xl text-muted-foreground max-w-xl mx-auto font-medium">Join the elite network connecting the world's best talent with visionary companies.</p>
            <Link to="/auth">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-xl px-12 h-16 rounded-[1.25rem] shadow-elegant gap-3 transition-transform hover:scale-105 active:scale-100">
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
