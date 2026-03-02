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
      className={`fixed top-0 left-0 right-0 z-[100] border-b transition-all duration-500 ${
        scrolled
          ? "glass border-border/40 shadow-sm"
          : "bg-transparent border-transparent shadow-none"
      }`}
    >
      <div className="container flex h-20 items-center justify-between">
        <Link to="/" className="group cursor-pointer hover-lift">
          <img src={logoNav} alt="DigiReps" className="h-9 group-hover:scale-105 transition-all duration-500" />
        </Link>

        {/* Desktop links */}
        <div className="hidden sm:flex items-center gap-3">
          <Link to="/how-it-works">
            <Button variant="ghost" className="font-display font-bold text-xs uppercase tracking-widest hover:bg-primary/5 hover:text-primary transition-colors h-11 px-6 rounded-xl">How It Works</Button>
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

        {/* Mobile hamburger */}
        <Button
          variant="ghost"
          size="icon"
          className="sm:hidden h-10 w-10 rounded-xl"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden glass border-t border-border/40 animate-fade-in">
          <div className="container py-6 flex flex-col gap-3">
            <Link to="/how-it-works" onClick={() => setMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start font-display font-bold text-xs uppercase tracking-widest h-12 rounded-xl">How It Works</Button>
            </Link>
            <Link to="/auth" onClick={() => setMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start font-display font-bold text-xs uppercase tracking-widest h-12 rounded-xl">Sign In</Button>
            </Link>
            <Link to="/auth" onClick={() => setMenuOpen(false)}>
              <Button className="w-full h-12 bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl font-display font-bold text-xs uppercase tracking-widest border-0">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
