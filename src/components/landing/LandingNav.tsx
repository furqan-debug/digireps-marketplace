import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

export const LandingNav = () => (
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
);
