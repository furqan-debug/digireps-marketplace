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
      <div className="min-h-screen bg-background flex flex-col">
        {/* Top Nav */}
        <header className="sticky top-0 z-40 border-b card-glass">
          <div className="container flex h-16 items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-glow shadow-elegant">
                <Shield className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-lg hidden sm:block gradient-text">TopTier</span>
              {role === "admin" && (
                <Badge variant="outline" className="text-xs hidden sm:flex border-primary/30 text-primary">Admin</Badge>
              )}
            </Link>

            {/* Nav links */}
            <nav className="flex items-center gap-0.5 overflow-x-auto">
              {nav.map(({ label, to, icon: Icon }) => {
                const active = location.pathname === to || location.pathname.startsWith(to + "/");
                return (
                  <Tooltip key={to}>
                    <TooltipTrigger asChild>
                      <Link
                        to={to}
                        className={`relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all whitespace-nowrap
                          ${active
                            ? "text-primary bg-primary/10"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                          }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="hidden sm:block">{label}</span>
                        {active && (
                          <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-gradient-to-r from-primary to-primary-glow" />
                        )}
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="sm:hidden">{label}</TooltipContent>
                  </Tooltip>
                );
              })}
            </nav>

            {/* User + sign out */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Avatar circle */}
              <div className="hidden md:flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-glow text-primary-foreground text-xs font-bold shadow-elegant">
                {initials}
              </div>
              <span className="hidden lg:block text-sm text-muted-foreground truncate max-w-[120px]">
                {profile?.display_name}
              </span>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-1.5 text-muted-foreground hover:text-foreground">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:block">Sign Out</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 container py-8">{children}</main>

        <footer className="border-t bg-card/60 py-4">
          <div className="container text-center text-xs text-muted-foreground">
            © 2026 TopTier — Quality-first freelance marketplace
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
};
