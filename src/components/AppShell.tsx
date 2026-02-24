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
      <div className="min-h-screen bg-background flex flex-col font-sans relative">
        {/* Subtle background glow */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/3 blur-[120px]" />
        </div>

        {/* Floating Nav */}
        <div className="pt-6 px-6 sm:px-8 w-full z-50 sticky top-0">
          <header className="mx-auto w-full max-w-7xl glass-panel rounded-2xl transition-all duration-300 shadow-xl shadow-black/[0.03]">
            <div className="px-6 flex h-16 sm:h-18 items-center justify-between gap-4">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-glow shadow-elegant group-hover:scale-105 transition-transform duration-300">
                  <Shield className="h-4.5 w-4.5 text-primary-foreground" />
                </div>
                <div className="flex flex-col">
                  <span className="font-display font-bold text-lg leading-none gradient-text">DigiReps</span>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground/60">Elite Network</span>
                </div>
                {role === "admin" && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 hidden sm:flex border-primary/30 text-primary uppercase tracking-tighter ml-1">Admin</Badge>
                )}
              </Link>

              {/* Desktop Nav */}
              <nav className="hidden md:flex items-center gap-1.5 bg-muted/40 p-1.5 rounded-2xl border border-border/50 shadow-inner">
                {nav.map(({ label, to, icon: Icon }) => {
                  const active = location.pathname === to || (to !== "/" && location.pathname.startsWith(to + "/"));
                  return (
                    <Link
                      key={to}
                      to={to}
                      className={`relative flex items-center gap-2.5 rounded-xl px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] transition-all duration-300
                      ${active
                          ? "text-primary bg-card shadow-sm border border-border/40"
                          : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                        }`}
                    >
                      <Icon className={`h-4 w-4 shrink-0 transition-colors ${active ? "text-primary" : "text-muted-foreground/50"}`} />
                      <span>{label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Mobile Nav with labels */}
              <div className="md:hidden flex items-center gap-1">
                {nav.map(({ label, to, icon: Icon }) => {
                  const active = location.pathname === to || location.pathname.startsWith(to + "/");
                  return (
                    <Link key={to} to={to} className={`flex flex-col items-center gap-0.5 p-2 rounded-xl transition-all ${active ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}>
                      <Icon className="h-5 w-5" />
                      <span className="text-[8px] font-bold uppercase tracking-wider">{label.split(" ")[0]}</span>
                    </Link>
                  );
                })}
              </div>

              {/* User + sign out */}
              <div className="flex items-center gap-3 shrink-0 pl-2 border-l border-border/40">
                <div className="hidden sm:flex flex-col items-end">
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
        </div>

        {/* Page content */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-6 sm:px-8 py-10 relative z-10">{children}</main>

        <footer className="border-t border-border/40 bg-card/40 py-8">
          <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary/40" />
              <span>© 2026 DigiReps — Elite Marketplace</span>
            </div>
            <div className="flex gap-6">
              <Link to="/" className="hover:text-primary transition-colors">Terms of Service</Link>
              <Link to="/" className="hover:text-primary transition-colors">Privacy Policy</Link>
              <a href="mailto:support@digireps.com" className="hover:text-primary transition-colors">Support</a>
            </div>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
};
