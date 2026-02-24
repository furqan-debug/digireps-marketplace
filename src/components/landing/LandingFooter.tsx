import { Link } from "react-router-dom";
import { Shield } from "lucide-react";

export const LandingFooter = () => (
  <footer className="relative bg-background border-t border-border/40 overflow-hidden">
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-primary/5 blur-[120px] pointer-events-none" />
    <div className="container relative z-10 py-20">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-16">
        <div className="md:col-span-2 space-y-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-glow shadow-md">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-display text-3xl font-bold tracking-tight text-foreground">Digi<span className="text-primary">Reps</span></span>
          </div>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-md font-medium">The premium standard for digital services. Vetted professional talent, managed delivery.</p>
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
      <div className="border-t border-border/40 pt-10 flex flex-col md:flex-row justify-between items-center gap-4 text-muted-foreground font-medium text-xs uppercase tracking-[0.2em]">
        <p>© 2026 DigiReps. All rights reserved.</p>
      </div>
    </div>
  </footer>
);
