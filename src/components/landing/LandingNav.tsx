import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import logoNav from "@/assets/logo-nav.png";

export const LandingNav = () => (
  <header className="fixed top-0 left-0 right-0 z-[100] glass border-b border-border/40 transition-all duration-300 shadow-sm">
    <div className="container flex h-20 items-center justify-between">
      <Link to="/" className="group cursor-pointer hover-lift">
        <img src={logoNav} alt="DigiReps" className="h-9 brightness-0 dark:brightness-100 group-hover:scale-105 transition-all duration-500" />
      </Link>
      <div className="flex items-center gap-3">
        <Link to="/how-it-works">
          <Button variant="ghost" className="font-display font-bold text-xs uppercase tracking-widest hover:bg-primary/5 hover:text-primary transition-colors h-11 px-6 rounded-xl hidden sm:inline-flex">How It Works</Button>
        </Link>
        <Link to="/auth">
          <Button variant="ghost" className="font-display font-bold text-xs uppercase tracking-widest hover:bg-primary/5 hover:text-primary transition-colors h-11 px-6 rounded-xl">Sign In</Button>
        </Link>
        <Link to="/auth">
          <Button className="h-11 bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl px-8 shadow-md hover-lift font-display font-bold text-xs uppercase tracking-widest border-0 btn-glow transition-all duration-300">
            Get Started
          </Button>
        </Link>
      </div>
    </div>
  </header>
);
