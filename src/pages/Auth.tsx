import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Shield, CheckCircle, Search, Briefcase } from "lucide-react";
import { motion } from "framer-motion";

const trustPoints = [
  "Vetted top 1% freelancers only",
  "Secure escrow-based payments",
  "On-platform communication only",
];

const Auth = () => {
  const { user, loading, signIn, signUp } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupRole, setSignupRole] = useState<"client" | "freelancer">("client");

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (user) return <Navigate to="/dashboard" replace />;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signIn(loginEmail, loginPassword);
      toast({ title: "Welcome back!" });
    } catch (error: any) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupPassword.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      await signUp(signupEmail, signupPassword, signupName, signupRole);
      toast({ title: "Account created!", description: "Check your email to verify your account." });
    } catch (error: any) {
      toast({ title: "Signup failed", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex selection:bg-primary/20">
      {/* Left panel — brand */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden flex-col justify-between p-16 bg-foreground text-background">
        <div className="absolute top-0 right-0 w-full h-full pointer-events-none opacity-30">
          <div className="absolute top-[-10%] right-[-10%] w-[80%] h-[80%] rounded-full bg-primary/20 blur-[120px]" />
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-glow shadow-elegant">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="font-display text-2xl font-bold tracking-tight">Digi<span className="text-primary">Reps</span></span>
        </div>

        <div className="relative z-10 space-y-12">
          <div className="space-y-6">
            <h2 className="font-display text-4xl xl:text-5xl font-bold leading-[1.1] tracking-tight">
              Access the <br />
              <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">Elite Network</span>
            </h2>
            <p className="text-background/60 text-lg leading-relaxed max-w-md font-medium">
              Join the premium marketplace where world-class talent meets visionary projects.
            </p>
          </div>
          <div className="space-y-5">
            {trustPoints.map((point) => (
              <div key={point} className="flex items-center gap-4 group">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors">
                  <CheckCircle className="h-4 w-4 text-primary" />
                </div>
                <span className="font-display text-background/80 text-base font-medium tracking-tight group-hover:text-background transition-colors">{point}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-background/30 font-display text-sm font-medium tracking-widest uppercase">
          © 2026 DigiReps
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 bg-background relative selection:bg-primary/20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }}
          className="w-full max-w-md space-y-10 relative z-10"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-glow shadow-elegant">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-2xl font-bold tracking-tight text-foreground">DigiReps</span>
          </div>

          <div className="space-y-3">
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground tracking-tight">Welcome back</h1>
            <p className="text-muted-foreground text-base font-medium">Secure access to your professional workspace.</p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-10 p-1.5 bg-muted/50 rounded-2xl h-[3.5rem] border border-border/40 shadow-inner">
              <TabsTrigger value="login" className="rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm font-display font-bold text-sm uppercase tracking-widest">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm font-display font-bold text-sm uppercase tracking-widest">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-0">
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="login-email" className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Email Address</Label>
                  <Input id="login-email" type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required placeholder="name@company.com" className="h-[3.5rem] rounded-xl border-border/40 bg-muted/20 px-6 focus:ring-primary/20 focus:border-primary/50 transition-all font-display font-medium text-base hover:border-primary/30" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <Label htmlFor="login-password" className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Password</Label>
                    <button type="button" onClick={() => toast({ title: "Contact support to reset your password" })} className="font-display text-[10px] font-bold uppercase tracking-widest text-primary hover:text-primary/80 transition-colors">Forgot?</button>
                  </div>
                  <Input id="login-password" type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required placeholder="••••••••" className="h-[3.5rem] rounded-xl border-border/40 bg-muted/20 px-6 focus:ring-primary/20 focus:border-primary/50 transition-all font-display font-medium text-base hover:border-primary/30" />
                </div>
                <Button type="submit" className="w-full h-14 bg-gradient-to-r from-primary to-primary-glow hover:brightness-110 text-primary-foreground text-sm uppercase tracking-widest font-bold rounded-xl shadow-elegant transition-all hover:scale-[1.02] active:scale-100 border-0 mt-2" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-0">
              <form onSubmit={handleSignup} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="signup-name" className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Full Name</Label>
                  <Input id="signup-name" value={signupName} onChange={(e) => setSignupName(e.target.value)} required placeholder="John Doe" className="h-[3.5rem] rounded-xl border-border/40 bg-muted/20 px-6 focus:ring-primary/20 focus:border-primary/50 transition-all font-display font-medium text-base hover:border-primary/30" />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="signup-email" className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Email Address</Label>
                  <Input id="signup-email" type="email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} required placeholder="name@company.com" className="h-[3.5rem] rounded-xl border-border/40 bg-muted/20 px-6 focus:ring-primary/20 focus:border-primary/50 transition-all font-display font-medium text-base hover:border-primary/30" />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="signup-password" className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Create Password</Label>
                  <Input id="signup-password" type="password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} required placeholder="Min. 6 characters" className="h-[3.5rem] rounded-xl border-border/40 bg-muted/20 px-6 focus:ring-primary/20 focus:border-primary/50 transition-all font-display font-medium text-base hover:border-primary/30" />
                </div>

                {/* Role selector */}
                <div className="space-y-3 pt-2">
                  <Label className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Account Type</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setSignupRole("client")}
                      className={`rounded-xl border-2 p-5 text-left transition-all duration-300 ${signupRole === "client"
                        ? "border-primary bg-primary text-primary-foreground shadow-elegant scale-[1.02]"
                        : "border-border/40 hover:border-primary/30 bg-card"
                        }`}
                    >
                      <Search className={`h-6 w-6 mb-3 ${signupRole === "client" ? "text-primary-foreground" : "text-primary"}`} />
                      <p className="font-display font-bold text-base leading-none tracking-tight">Hire Talent</p>
                      <p className={`text-xs mt-2 font-medium ${signupRole === "client" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>I need freelancers for my projects</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSignupRole("freelancer")}
                      className={`rounded-xl border-2 p-5 text-left transition-all duration-300 ${signupRole === "freelancer"
                        ? "border-primary bg-primary text-primary-foreground shadow-elegant scale-[1.02]"
                        : "border-border/40 hover:border-primary/30 bg-card"
                        }`}
                    >
                      <Briefcase className={`h-6 w-6 mb-3 ${signupRole === "freelancer" ? "text-primary-foreground" : "text-primary"}`} />
                      <p className="font-display font-bold text-base leading-none tracking-tight">Find Work</p>
                      <p className={`text-xs mt-2 font-medium ${signupRole === "freelancer" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>I want to offer my services</p>
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full h-14 bg-gradient-to-r from-primary to-primary-glow hover:brightness-110 text-primary-foreground text-sm uppercase tracking-widest font-bold rounded-xl shadow-elegant transition-all hover:scale-[1.02] active:scale-100 border-0 mt-4" disabled={isLoading}>
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="text-center">
            <a href="/" className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors">Return to homepage</a>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
