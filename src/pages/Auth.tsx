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
    <div className="min-h-screen flex">
      {/* Left panel — brand */}
      <div className="hidden lg:flex lg:w-[42%] relative overflow-hidden flex-col justify-between p-12 bg-gradient-to-br from-primary via-primary-glow to-accent">
        {/* Background orbs */}
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-black/10 blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="font-display text-xl font-bold text-white">TopTier</span>
        </div>

        <div className="relative z-10 space-y-8">
          <div className="space-y-3">
            <h2 className="font-display text-4xl font-bold text-white leading-tight">
              The world's top freelancers, curated for you
            </h2>
            <p className="text-white/75 text-base leading-relaxed">
              Join a quality-first marketplace where every freelancer is hand-verified.
            </p>
          </div>
          <div className="space-y-3">
            {trustPoints.map((point) => (
              <div key={point} className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-white/90 shrink-0" />
                <span className="text-white/90 text-sm">{point}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-white/50 text-xs">
          © 2026 TopTier. Quality-first freelance marketplace.
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-7"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-glow">
              <Shield className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold gradient-text">TopTier</span>
          </div>

          <div>
            <h1 className="font-display text-2xl font-bold">Welcome</h1>
            <p className="text-muted-foreground text-sm mt-1">Sign in or create your account below.</p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input id="login-email" type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required placeholder="you@example.com" className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input id="login-password" type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required placeholder="••••••••" className="h-11" />
                </div>
                <Button type="submit" className="w-full h-11 bg-gradient-to-r from-primary to-primary-glow border-0 text-primary-foreground hover:opacity-90 shadow-elegant" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Display Name</Label>
                  <Input id="signup-name" value={signupName} onChange={(e) => setSignupName(e.target.value)} required placeholder="Your name or alias" className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input id="signup-email" type="email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} required placeholder="you@example.com" className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input id="signup-password" type="password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} required placeholder="Min 6 characters" className="h-11" />
                </div>

                {/* Role selector */}
                <div className="space-y-2">
                  <Label>I want to</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSignupRole("client")}
                      className={`rounded-xl border-2 p-4 text-left transition-all ${
                        signupRole === "client"
                          ? "border-primary bg-primary/8 shadow-elegant"
                          : "border-border hover:border-primary/40 bg-card"
                      }`}
                    >
                      <Search className={`h-5 w-5 mb-2 ${signupRole === "client" ? "text-primary" : "text-muted-foreground"}`} />
                      <p className="font-semibold text-sm">Hire talent</p>
                      <p className="text-xs text-muted-foreground mt-0.5">I'm a client</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSignupRole("freelancer")}
                      className={`rounded-xl border-2 p-4 text-left transition-all ${
                        signupRole === "freelancer"
                          ? "border-primary bg-primary/8 shadow-elegant"
                          : "border-border hover:border-primary/40 bg-card"
                      }`}
                    >
                      <Briefcase className={`h-5 w-5 mb-2 ${signupRole === "freelancer" ? "text-primary" : "text-muted-foreground"}`} />
                      <p className="font-semibold text-sm">Work freelance</p>
                      <p className="text-xs text-muted-foreground mt-0.5">I'm a freelancer</p>
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full h-11 bg-gradient-to-r from-primary to-primary-glow border-0 text-primary-foreground hover:opacity-90 shadow-elegant" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="text-center text-xs text-muted-foreground">
            <a href="/" className="hover:text-foreground transition-colors underline underline-offset-2">← Back to home</a>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
