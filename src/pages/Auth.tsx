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
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden flex-col justify-between p-16 bg-slate-950">
        {/* Background Decorative patterns */}
        <div className="absolute top-0 right-0 w-full h-full pointer-events-none opacity-40">
          <div className="absolute top-[-10%] right-[-10%] w-[80%] h-[80%] rounded-full bg-primary/20 blur-[120px]" />
          <div className="absolute bottom-[-5%] left-[-5%] w-[60%] h-[60%] rounded-full bg-accent/10 blur-[100px]" />
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="font-display text-2xl font-bold tracking-tight text-white">Digi<span className="text-primary">Reps</span></span>
        </div>

        <div className="relative z-10 space-y-12">
          <div className="space-y-6">
            <h2 className="font-display text-6xl font-black text-white leading-[1.1] tracking-tight">
              Access the <br />
              <span className="text-primary">Elite Network</span>
            </h2>
            <p className="text-slate-400 text-xl leading-relaxed max-w-md font-medium">
              Join the premium marketplace where world-class talent meets visionary projects.
            </p>
          </div>
          <div className="space-y-5">
            {trustPoints.map((point) => (
              <div key={point} className="flex items-center gap-4">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                  <CheckCircle className="h-4 w-4 text-primary" />
                </div>
                <span className="text-slate-300 text-lg font-semibold">{point}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-slate-500 text-sm font-bold tracking-widest uppercase">
          © 2026 DigiReps. The Standard of Excellence.
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md space-y-10"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-2xl font-bold tracking-tight text-foreground">DigiReps</span>
          </div>

          <div className="space-y-2">
            <h1 className="font-display text-4xl font-black text-foreground tracking-tight">Welcome back</h1>
            <p className="text-muted-foreground text-lg font-medium">Secure access to your professional dashboard.</p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-10 p-1 bg-secondary/50 rounded-2xl h-14">
              <TabsTrigger value="login" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm font-bold text-base">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm font-bold text-base">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-0">
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="login-email" className="text-sm font-bold uppercase tracking-wider text-muted-foreground ml-1">Email Address</Label>
                  <Input id="login-email" type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required placeholder="name@company.com" className="h-14 rounded-2xl border-border/50 bg-secondary/20 px-5 focus:ring-primary/20 focus:border-primary transition-all text-base font-medium" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <Label htmlFor="login-password" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Password</Label>
                    <span className="text-xs font-bold text-primary cursor-pointer hover:underline underline-offset-4">Forgot?</span>
                  </div>
                  <Input id="login-password" type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required placeholder="••••••••" className="h-14 rounded-2xl border-border/50 bg-secondary/20 px-5 focus:ring-primary/20 focus:border-primary transition-all text-base font-medium" />
                </div>
                <Button type="submit" className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-bold rounded-2xl shadow-elegant transition-all hover:scale-[1.02] active:scale-100" disabled={isLoading}>
                  {isLoading ? "Verifying..." : "Sign In to Dashboard"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-0">
              <form onSubmit={handleSignup} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="signup-name" className="text-sm font-bold uppercase tracking-wider text-muted-foreground ml-1">Full Name</Label>
                  <Input id="signup-name" value={signupName} onChange={(e) => setSignupName(e.target.value)} required placeholder="John Doe" className="h-14 rounded-2xl border-border/50 bg-secondary/20 px-5 focus:ring-primary/20 focus:border-primary transition-all text-base font-medium" />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="signup-email" className="text-sm font-bold uppercase tracking-wider text-muted-foreground ml-1">Email Address</Label>
                  <Input id="signup-email" type="email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} required placeholder="name@company.com" className="h-14 rounded-2xl border-border/50 bg-secondary/20 px-5 focus:ring-primary/20 focus:border-primary transition-all text-base font-medium" />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="signup-password" className="text-sm font-bold uppercase tracking-wider text-muted-foreground ml-1">Create Password</Label>
                  <Input id="signup-password" type="password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} required placeholder="Min. 6 characters" className="h-14 rounded-2xl border-border/50 bg-secondary/20 px-5 focus:ring-primary/20 focus:border-primary transition-all text-base font-medium" />
                </div>

                {/* Role selector */}
                <div className="space-y-3">
                  <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground ml-1">Account Type</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setSignupRole("client")}
                      className={`rounded-2xl border-2 p-5 text-left transition-all ${signupRole === "client"
                          ? "border-primary bg-primary/5 shadow-md"
                          : "border-border/50 hover:border-primary/20 bg-card"
                        }`}
                    >
                      <Search className={`h-6 w-6 mb-3 ${signupRole === "client" ? "text-primary" : "text-muted-foreground"}`} />
                      <p className="font-bold text-base leading-none">Hire Talent</p>
                      <p className="text-sm text-muted-foreground mt-2 font-medium">I'm a Client</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSignupRole("freelancer")}
                      className={`rounded-2xl border-2 p-5 text-left transition-all ${signupRole === "freelancer"
                          ? "border-primary bg-primary/5 shadow-md"
                          : "border-border/50 hover:border-primary/20 bg-card"
                        }`}
                    >
                      <Briefcase className={`h-6 w-6 mb-3 ${signupRole === "freelancer" ? "text-primary" : "text-muted-foreground"}`} />
                      <p className="font-bold text-base leading-none">Find Work</p>
                      <p className="text-sm text-muted-foreground mt-2 font-medium">I'm a Freelancer</p>
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-bold rounded-2xl shadow-elegant transition-all hover:scale-[1.02] active:scale-100" disabled={isLoading}>
                  {isLoading ? "Creating Profile..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="text-center">
            <a href="/" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors underline underline-offset-8">Return to global marketplace</a>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
