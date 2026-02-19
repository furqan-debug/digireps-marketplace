import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Shield, LogOut, LayoutDashboard, Search, FileText,
  User, Users, AlertTriangle, ShieldCheck,
} from "lucide-react";

interface NavItem {
  label: string;
  to: string;
  icon: React.ElementType;
}

const clientNav: NavItem[] = [
  { label: "Dashboard", to: "/client", icon: LayoutDashboard },
  { label: "Find Talent", to: "/client/discover", icon: Search },
  { label: "My Orders", to: "/client/orders", icon: FileText },
];

const freelancerNav: NavItem[] = [
  { label: "Dashboard", to: "/freelancer", icon: LayoutDashboard },
  { label: "My Orders", to: "/freelancer/orders", icon: FileText },
  { label: "My Profile", to: "/freelancer/profile", icon: User },
];

const adminNav: NavItem[] = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard },
  { label: "Applications", to: "/admin/applications", icon: ShieldCheck },
  { label: "Users", to: "/admin/users", icon: Users },
  { label: "Orders", to: "/admin/orders", icon: FileText },
  { label: "Violations", to: "/admin/violations", icon: AlertTriangle },
];

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const { profile, role, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const nav =
    role === "admin" ? adminNav :
      role === "freelancer" ? freelancerNav :
        clientNav;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const initials = profile?.display_name
    ? profile.display_name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background flex flex-col font-sans">
        {/* Top Nav */}
        <header className="sticky top-0 z-40 border-b border-border/40 card-glass h-18 backdrop-blur-xl">
          <div className="container flex h-16 items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-glow shadow-elegant group-hover:scale-105 transition-transform duration-300">
                <Shield className="h-4.5 w-4.5 text-primary-foreground" />
              </div>
              <div className="flex flex-col -gap-1">
                <span className="font-display font-bold text-lg leading-none gradient-text">DigiReps</span>
                <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground/60">Elite Network</span>
              </div>
              {role === "admin" && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 hidden sm:flex border-primary/30 text-primary uppercase tracking-tighter ml-1">Admin</Badge>
              )}
            </Link>

            {/* Nav links */}
            <nav className="hidden md:flex items-center gap-1 bg-muted/30 p-1 rounded-2xl border border-border/40">
              {nav.map(({ label, to, icon: Icon }) => {
                const active = location.pathname === to || location.pathname.startsWith(to + "/");
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all
                      ${active
                        ? "text-primary bg-background shadow-sm border border-border/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/40"
                      }`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${active ? "text-primary" : "text-muted-foreground/70"}`} />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Nav (simplified for now, using the same data) */}
            <div className="md:hidden flex items-center gap-1">
              {nav.map(({ label, to, icon: Icon }) => {
                const active = location.pathname === to || location.pathname.startsWith(to + "/");
                return (
                  <Link key={to} to={to} className={`p-2 rounded-xl transition-all ${active ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}>
                    <Icon className="h-5 w-5" />
                  </Link>
                );
              })}
            </div>

            {/* User + sign out */}
            <div className="flex items-center gap-3 shrink-0 pl-2 border-l border-border/40">
              <div className="hidden sm:flex flex-col items-end -gap-1">
                <span className="text-sm font-bold text-foreground leading-none">{profile?.display_name}</span>
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{role}</span>
              </div>

              {/* Avatar circle */}
              <div className="h-10 w-10 flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary-glow/10 border border-primary/20 text-primary text-sm font-bold shadow-sm">
                {initials}
              </div>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={handleSignOut} className="h-10 w-10 rounded-2xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                    <LogOut className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Sign Out</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 container py-10 max-w-7xl mx-auto">{children}</main>

        <footer className="border-t border-border/40 bg-card/40 py-8">
          <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary/40" />
              <span>© 2026 DigiReps — Elite Marketplace</span>
            </div>
            <div className="flex gap-6">
              <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
              <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
              <a href="#" className="hover:text-primary transition-colors">Support</a>
            </div>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
};
