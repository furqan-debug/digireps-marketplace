import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import logoNav from "@/assets/logo-nav.png";

export const LandingNav = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 border-b ${scrolled
        ? "glass border-border/40 bg-background/70 backdrop-blur-xl shadow-sm py-0"
        : "bg-transparent border-transparent shadow-none py-2"
        }`}
    >
      <div className="container flex h-20 items-center justify-between">
        <Link to="/" className="group cursor-pointer flex items-center gap-2">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <img src={logoNav} alt="DigiReps" className="h-8 sm:h-9 group-hover:scale-105 transition-transform duration-500 relative z-10" />
          </div>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-2 lg:gap-4">
          <Link to="/how-it-works">
            <Button variant="ghost" className="font-display font-bold text-[11px] lg:text-xs uppercase tracking-widest hover:bg-primary/5 hover:text-primary transition-all duration-300 h-11 px-4 lg:px-6 rounded-xl text-foreground/80 hover:scale-105">
              How It Works
            </Button>
          </Link>
          <Link to="/auth">
            <Button variant="ghost" className="font-display font-bold text-[11px] lg:text-xs uppercase tracking-widest hover:bg-primary/5 hover:text-primary transition-all duration-300 h-11 px-4 lg:px-6 rounded-xl text-foreground/80 hover:scale-105">
              Sign In
            </Button>
          </Link>
          <div className="w-px h-6 bg-border/60 mx-2" />
          <Link to="/auth" className="group ml-2">
            <Button className="h-11 lg:h-12 bg-primary hover:bg-primary-glow text-primary-foreground rounded-xl px-6 lg:px-8 shadow-md hover:shadow-lg hover:shadow-primary/20 font-display font-bold text-[11px] lg:text-xs uppercase tracking-widest border-0 transition-all duration-500 hover:-translate-y-0.5 relative overflow-hidden btn-glow">
              <span className="relative z-10">Get Started</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
            </Button>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-10 w-10 rounded-xl hover:bg-primary/5 hover:text-primary transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-background/95 backdrop-blur-2xl border-b border-border/40 shadow-xl overflow-hidden shadow-primary/5 transition-all animate-in slide-in-from-top-2 duration-300">
          <div className="container py-6 flex flex-col gap-3">
            <Link to="/how-it-works" onClick={() => setMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start font-display font-bold text-xs uppercase tracking-widest h-12 rounded-xl hover:bg-primary/5 hover:text-primary hover:translate-x-2 transition-all">How It Works</Button>
            </Link>
            <Link to="/auth" onClick={() => setMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start font-display font-bold text-xs uppercase tracking-widest h-12 rounded-xl hover:bg-primary/5 hover:text-primary hover:translate-x-2 transition-all">Sign In</Button>
            </Link>
            <div className="h-px bg-border/40 my-2" />
            <Link to="/auth" onClick={() => setMenuOpen(false)}>
              <Button className="w-full h-14 bg-primary hover:bg-primary-glow text-primary-foreground rounded-xl font-display font-bold text-xs uppercase tracking-widest border-0 shadow-md">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
