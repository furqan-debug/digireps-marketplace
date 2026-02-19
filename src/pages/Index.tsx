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
      <header className="border-b card-glass sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-glow shadow-elegant">
              <Shield className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold gradient-text">TopTier</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button size="sm" className="bg-gradient-to-r from-primary to-primary-glow shadow-elegant border-0 text-primary-foreground hover:opacity-90">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative container py-24 lg:py-36 overflow-hidden">
        {/* Background orbs */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-primary/8 blur-[80px] pointer-events-none" />
        <div className="absolute top-10 right-10 w-[300px] h-[300px] rounded-full bg-accent/6 blur-[60px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl mx-auto text-center space-y-7 relative"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-1.5 text-sm font-medium text-primary">
            <Star className="h-3.5 w-3.5 fill-primary" /> Only the top 1% make it here
          </div>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
            Hire freelancers{" "}
            <span className="gradient-text">without the noise</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            A curated marketplace where quality comes first. Vetted talent, secure payments, and on-platform collaboration — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/auth">
              <Button size="lg" className="gap-2 bg-gradient-to-r from-primary to-primary-glow shadow-elegant border-0 text-primary-foreground hover:opacity-90 text-base px-7">
                Start Hiring <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline" className="text-base px-7 border-border/80">
                Apply as Freelancer
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Stats row */}
      <section className="border-y bg-card/60">
        <div className="container py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i, duration: 0.5 }}
                className="text-center"
              >
                <div className="font-display text-2xl font-bold gradient-text">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container py-24">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground text-base max-w-md mx-auto">Three steps to get your project delivered by world-class talent</p>
        </div>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid gap-8 sm:grid-cols-3 max-w-4xl mx-auto"
        >
          {steps.map(({ step, title, desc }) => (
            <motion.div key={step} variants={itemVariants} className="relative text-center space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl icon-gradient">
                <span className="font-display text-xl font-bold text-primary">{step}</span>
              </div>
              <h3 className="font-display text-lg font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Benefits */}
      <section className="border-y bg-card/50">
        <div className="container py-14">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 max-w-4xl mx-auto">
            {benefits.map(({ icon: Icon, text }, i) => (
              <motion.div
                key={text}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i, duration: 0.5 }}
                className="flex items-start gap-3 rounded-xl border border-border/60 bg-background/60 p-4"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                  <Icon className="h-4 w-4 text-accent" />
                </div>
                <span className="text-sm font-medium leading-snug mt-0.5">{text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="container py-24">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-3">Service Categories</h2>
          <p className="text-muted-foreground">Select a service and we'll match you with the best talent</p>
        </div>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 max-w-4xl mx-auto"
        >
          {services.map(({ name, icon: Icon, color }) => (
            <motion.div
              key={name}
              variants={itemVariants}
              className="group flex flex-col items-center gap-4 rounded-2xl border border-border/60 bg-card p-7 transition-all hover:shadow-elegant hover:border-primary/30 hover:-translate-y-1 cursor-pointer"
            >
              <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${color} border border-white/10`}>
                <Icon className="h-7 w-7 text-primary" />
              </div>
              <span className="text-sm font-semibold text-center leading-tight">{name}</span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA Banner */}
      <section className="container pb-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/8 via-background to-accent/8 p-12 text-center space-y-5"
        >
          <h2 className="font-display text-3xl sm:text-4xl font-bold">Ready to get started?</h2>
          <p className="text-muted-foreground max-w-sm mx-auto">Join hundreds of clients who trust TopTier for their most important projects.</p>
          <Link to="/auth">
            <Button size="lg" className="bg-gradient-to-r from-primary to-primary-glow shadow-elegant border-0 text-primary-foreground hover:opacity-90 gap-2 px-8">
              Create Free Account <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/60">
        <div className="container py-10">
          <div className="grid sm:grid-cols-3 gap-8 mb-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-glow">
                  <Shield className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-display font-bold gradient-text">TopTier</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Quality-first freelance marketplace. Only the top 1% of talent.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-display font-semibold text-sm">Platform</h4>
              <div className="space-y-1.5">
                <Link to="/auth" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Find Talent</Link>
                <Link to="/auth" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Apply as Freelancer</Link>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-display font-semibold text-sm">Company</h4>
              <div className="space-y-1.5">
                <span className="block text-sm text-muted-foreground">About</span>
                <span className="block text-sm text-muted-foreground">Terms of Service</span>
                <span className="block text-sm text-muted-foreground">Privacy Policy</span>
              </div>
            </div>
          </div>
          <div className="border-t pt-6 text-center text-xs text-muted-foreground">
            © 2026 TopTier. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
