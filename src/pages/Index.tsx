import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Code, Palette, Video, PenTool, Smartphone, ArrowRight, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const services = [
  { name: "Web Development", icon: Code },
  { name: "UI/UX Design", icon: Palette },
  { name: "Video Editing", icon: Video },
  { name: "Copywriting", icon: PenTool },
  { name: "Mobile Development", icon: Smartphone },
];

const benefits = [
  "Vetted top 1% freelancers only",
  "Secure on-platform communication",
  "Simulated escrow payments",
  "Quality-controlled delivery",
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
              <Shield className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold">TopTier</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container py-20 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center space-y-6"
        >
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Hire the top{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              1% of freelancers
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            A curated marketplace where quality comes first. No endless scrolling — just vetted talent matched to your needs.
          </p>
          <div className="flex gap-3 justify-center">
            <Link to="/auth">
              <Button size="lg" className="gap-2">
                Start Hiring <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline">
                Apply as Freelancer
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Benefits */}
      <section className="border-y bg-card">
        <div className="container py-16">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit, i) => (
              <motion.div
                key={benefit}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i, duration: 0.5 }}
                className="flex items-start gap-3 p-4"
              >
                <CheckCircle className="h-5 w-5 text-accent mt-0.5 shrink-0" />
                <span className="text-sm font-medium">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="container py-20">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl font-bold mb-3">Service Categories</h2>
          <p className="text-muted-foreground">Select a service and we'll match you with the best talent</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 max-w-4xl mx-auto">
          {services.map(({ name, icon: Icon }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 * i, duration: 0.4 }}
              className="flex flex-col items-center gap-3 rounded-xl border bg-card p-6 transition-all hover:shadow-md hover:border-primary/30 cursor-pointer"
            >
              <Icon className="h-8 w-8 text-primary" />
              <span className="text-sm font-medium text-center">{name}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card">
        <div className="container py-8 text-center text-sm text-muted-foreground">
          <p>© 2026 TopTier. All rights reserved. Quality-first freelance marketplace.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
