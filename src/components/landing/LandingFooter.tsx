import { Link } from "react-router-dom";
import logoFullWhite from "@/assets/logo-full-white.png";

export const LandingFooter = () => (
  <footer className="relative bg-[#0b1221] text-white border-t border-border/10 overflow-hidden">
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[400px] bg-primary/10 blur-[150px] pointer-events-none" />
    <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent/5 blur-[150px] pointer-events-none" />

    <div className="container relative z-10 py-24">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-20">
        <div className="md:col-span-5 space-y-8">
          <Link to="/" className="inline-block group">
            <img src={logoFullWhite} alt="DigiReps" className="h-10 transition-transform duration-500 group-hover:scale-105" />
          </Link>
          <p className="text-white/60 text-lg leading-relaxed max-w-md font-medium">
            The premium standard for digital services. Vetted professional talent, flawlessly managed delivery, guaranteed results.
          </p>
        </div>

        <div className="md:col-span-3 space-y-6 lg:ml-auto">
          <h4 className="font-display font-bold text-xs text-white uppercase tracking-[0.25em]">Platform</h4>
          <nav className="flex flex-col gap-4">
            <Link to="/how-it-works" className="text-white/60 font-medium text-[15px] hover:text-white transition-colors hover:translate-x-1 duration-300">How It Works</Link>
            <Link to="/auth" className="text-white/60 font-medium text-[15px] hover:text-white transition-colors hover:translate-x-1 duration-300">Hire Talent</Link>
            <Link to="/auth" className="text-white/60 font-medium text-[15px] hover:text-white transition-colors hover:translate-x-1 duration-300">Freelancer Portal</Link>
          </nav>
        </div>

        <div className="md:col-span-4 space-y-6 lg:ml-auto">
          <h4 className="font-display font-bold text-xs text-white uppercase tracking-[0.25em]">Support</h4>
          <nav className="flex flex-col gap-4">
            <Link to="/help" className="text-white/60 font-medium text-[15px] hover:text-white transition-colors hover:translate-x-1 duration-300">Help & FAQ</Link>
            <a href="mailto:support@digireps.com" className="text-white/60 font-medium text-[15px] hover:text-white transition-colors hover:translate-x-1 duration-300">Contact Support</a>
          </nav>
        </div>
      </div>

      <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-white/40 font-medium text-xs uppercase tracking-[0.15em]">
        <p>© {new Date().getFullYear()} DigiReps. All rights reserved.</p>
        <div className="flex gap-6">
          <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
        </div>
      </div>
    </div>
  </footer>
);
