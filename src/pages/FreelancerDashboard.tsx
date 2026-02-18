import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, User, Star, ArrowRight, Clock } from "lucide-react";

const STATUS_CONFIG = {
  pending:  { label: "Under Review",  className: "bg-warning/15 text-warning" },
  approved: { label: "Approved",      className: "bg-success/15 text-success" },
  rejected: { label: "Rejected",      className: "bg-destructive/10 text-destructive" },
};

const FreelancerDashboard = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const status = profile?.application_status as keyof typeof STATUS_CONFIG | null;
  const statusCfg = status ? STATUS_CONFIG[status] : STATUS_CONFIG.pending;
  const isApproved = status === "approved" && !profile?.is_suspended;

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold">
              Welcome, {profile?.display_name?.split(" ")[0] || "Freelancer"} 👋
            </h1>
            <p className="text-muted-foreground mt-1">Manage your profile and incoming projects.</p>
          </div>
          <Badge className={statusCfg.className}>{statusCfg.label}</Badge>
        </div>

        {/* Status alerts */}
        {(!status || status === "pending") && (
          <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 text-sm">
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-warning mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-warning">Application Under Review</p>
                <p className="text-muted-foreground mt-0.5">
                  An admin will review your profile and approve or reject it. Keep your profile complete to improve your chances.
                </p>
              </div>
            </div>
          </div>
        )}
        {status === "rejected" && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
            <p className="font-medium text-destructive">Application Rejected</p>
            <p className="text-muted-foreground mt-0.5">
              Your application was not approved. Please update your profile and contact support if needed.
            </p>
          </div>
        )}
        {profile?.is_suspended && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
            <p className="font-medium text-destructive">Account Suspended</p>
            <p className="text-muted-foreground mt-0.5">Your account has been suspended due to policy violations.</p>
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-3">
          <Card
            className="cursor-pointer hover:shadow-md hover:border-primary/30 transition-all group"
            onClick={() => navigate("/freelancer/profile")}
          >
            <CardHeader>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 mb-1">
                <User className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="font-display text-lg flex items-center justify-between">
                My Profile
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </CardTitle>
              <CardDescription>Edit your profile, bio, skills, and portfolio</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" className="w-full">Edit Profile</Button>
            </CardContent>
          </Card>

          <Card
            className={`transition-all ${isApproved ? "cursor-pointer hover:shadow-md hover:border-primary/30 group" : "opacity-50"}`}
            onClick={() => isApproved && navigate("/freelancer/orders")}
          >
            <CardHeader>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 mb-1">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="font-display text-lg flex items-center justify-between">
                My Orders
                {isApproved && <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />}
              </CardTitle>
              <CardDescription>Incoming briefs and active projects</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" className="w-full" disabled={!isApproved}>
                {isApproved ? "View Orders" : "Approval required"}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-muted bg-muted/30">
            <CardHeader>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted mb-1">
                <Star className="h-5 w-5 text-muted-foreground" />
              </div>
              <CardTitle className="font-display text-lg text-muted-foreground">
                {profile?.freelancer_level
                  ? profile.freelancer_level.charAt(0).toUpperCase() + profile.freelancer_level.slice(1)
                  : "Verified"}{" "}
                Level
              </CardTitle>
              <CardDescription>Complete orders and earn great reviews to level up</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </AppShell>
  );
};

export default FreelancerDashboard;
