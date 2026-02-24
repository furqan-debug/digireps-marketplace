import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

export const LandingNav = () => (
  <header className="fixed top-0 left-0 right-0 z-[100] glass border-b border-border/40 transition-all duration-300 shadow-sm">
    <div className="container flex h-20 items-center justify-between">
      <div className="flex items-center gap-3 group cursor-pointer hover-lift">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-glow shadow-md group-hover:shadow-glow transition-all duration-500">
          <Shield className="h-5 w-5 text-primary-foreground group-hover:scale-110 transition-transform duration-300" />
        </div>
        <span className="font-display text-2xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors duration-300">
          Digi<span className="text-primary group-hover:text-primary-glow transition-colors duration-300">Reps</span>
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
          <Button className="h-11 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-8 shadow-md hover-lift font-display font-bold text-xs uppercase tracking-widest border-0 btn-glow transition-all duration-300">
            Get Started
          </Button>
        </Link>
      </div>
    </div>
  </header>
);
