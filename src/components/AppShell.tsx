import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  LogOut, LayoutDashboard, Search, FileText,
  User, Users, AlertTriangle, ShieldCheck, Settings, DollarSign, Scale,
} from "lucide-react";
import logoNav from "@/assets/logo-nav.png";

interface NavItem {
  label: string;
  to: string;
  icon: React.ElementType;
}

const clientNav: NavItem[] = [
  { label: "Dashboard", to: "/client", icon: LayoutDashboard },
  { label: "Find Talent", to: "/client/discover", icon: Search },
  { label: "My Orders", to: "/client/orders", icon: FileText },
  { label: "Settings", to: "/client/settings", icon: Settings },
];

const freelancerNav: NavItem[] = [
  { label: "Dashboard", to: "/freelancer", icon: LayoutDashboard },
  { label: "My Orders", to: "/freelancer/orders", icon: FileText },
  { label: "Earnings", to: "/freelancer/earnings", icon: DollarSign },
  { label: "My Profile", to: "/freelancer/profile", icon: User },
];

const adminNav: NavItem[] = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard },
  { label: "Applications", to: "/admin/applications", icon: ShieldCheck },
  { label: "Users", to: "/admin/users", icon: Users },
  { label: "Orders", to: "/admin/orders", icon: FileText },
  { label: "Disputes", to: "/admin/disputes", icon: Scale },
  { label: "Violations", to: "/admin/violations", icon: AlertTriangle },
  { label: "Settings", to: "/admin/settings", icon: Settings },
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

  const isActive = (to: string) =>
    location.pathname === to || (to !== "/" && location.pathname.startsWith(to + "/"));

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background flex flex-col font-sans relative">
        {/* Subtle background glow */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/3 blur-[120px]" />
        </div>

        {/* Desktop Fixed Nav */}
        <div className="fixed top-0 left-0 right-0 w-full z-[100] hidden md:block glass shadow-sm border-b border-white/10 dark:border-white/5 transition-all duration-300">
          <header className="mx-auto w-full max-w-7xl px-6 sm:px-8">
            <div className="flex h-16 sm:h-20 items-center justify-between gap-4">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
                <img src={logoNav} alt="DigiReps" className="h-7 group-hover:scale-105 transition-transform duration-300" />
                {role === "admin" && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-primary/30 text-primary uppercase tracking-tighter ml-1">Admin</Badge>
                )}
              </Link>

              {/* Desktop Nav */}
              <nav className="flex items-center gap-1 bg-muted/40 p-1.5 rounded-2xl border border-border/50 shadow-inner overflow-x-auto">
                {nav.map(({ label, to, icon: Icon }) => {
                  const active = isActive(to);
                  return (
                    <Link
                      key={to}
                      to={to}
                      className={`relative flex items-center gap-2 rounded-xl px-4 py-2 text-[11px] font-bold uppercase tracking-[0.08em] transition-all duration-300 whitespace-nowrap
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

              {/* User + sign out */}
              <div className="flex items-center gap-3 shrink-0 pl-2 border-l border-border/40">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-bold text-foreground leading-none">{profile?.display_name}</span>
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{role}</span>
                </div>

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

        {/* Mobile Top Bar (minimal) */}
        <div className="md:hidden fixed top-0 left-0 right-0 w-full z-[100] glass border-b border-border/40 px-4 py-3 flex items-center justify-between shadow-sm">
          <Link to="/" className="flex items-center gap-2">
            <img src={logoNav} alt="DigiReps" className="h-6" />
            {role === "admin" && (
              <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5 border-primary/30 text-primary uppercase tracking-tighter">Admin</Badge>
            )}
          </Link>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 flex items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary-glow/10 border border-primary/20 text-primary text-xs font-bold">
              {initials}
            </div>
            <Button variant="ghost" size="icon" onClick={handleSignOut} className="h-8 w-8 rounded-xl text-muted-foreground hover:text-destructive">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Page content — add top padding for fixed nav and bottom padding on mobile for tab bar */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-24 md:pt-[104px] pb-24 md:pb-10 relative z-10">{children}</main>

        {/* Mobile Bottom Tab Bar */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/40 safe-area-bottom">
          <div className="flex items-stretch justify-around px-1 py-1">
            {nav.map(({ label, to, icon: Icon }) => {
              const active = isActive(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex flex-col items-center justify-center gap-0.5 py-2 px-2 min-w-0 flex-1 rounded-xl transition-all duration-200
                    ${active
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground"
                    }`}
                >
                  <Icon className={`h-5 w-5 shrink-0 ${active ? "text-primary" : ""}`} />
                  <span className="text-[9px] font-bold uppercase tracking-wider truncate max-w-full">{label.split(" ")[0]}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <footer className="hidden md:block border-t border-border/40 bg-card/40 py-8">
          <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-muted-foreground">
            <div className="flex items-center gap-2">
              <img src={logoNav} alt="DigiReps" className="h-4" />
              <span>© 2026 DigiReps — Elite Marketplace</span>
            </div>
            <div className="flex gap-6">
              <Link to="/help" className="hover:text-primary transition-colors">Help & FAQ</Link>
              <Link to="/how-it-works" className="hover:text-primary transition-colors">How It Works</Link>
              <a href="mailto:support@digireps.com" className="hover:text-primary transition-colors">Support</a>
            </div>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
};
