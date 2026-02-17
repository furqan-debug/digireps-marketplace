import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogOut, Briefcase, User, Star } from "lucide-react";

const FreelancerDashboard = () => {
  const { profile, signOut } = useAuth();

  const statusBadge = () => {
    if (!profile?.application_status || profile.application_status === "pending") {
      return <Badge variant="secondary">Pending Review</Badge>;
    }
    if (profile.application_status === "approved") {
      return <Badge className="bg-success text-success-foreground">Approved</Badge>;
    }
    return <Badge variant="destructive">Rejected</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container flex h-16 items-center justify-between">
          <h1 className="font-display text-xl font-bold">TopTier</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {profile?.display_name || "Freelancer"}
            </span>
            {statusBadge()}
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="mb-8">
          <h2 className="font-display text-3xl font-bold">Freelancer Dashboard</h2>
          <p className="text-muted-foreground mt-1">Manage your profile and projects</p>
        </div>

        {(!profile?.application_status || profile.application_status === "pending") && (
          <Card className="mb-6 border-warning/30 bg-warning/5">
            <CardContent className="pt-6">
              <p className="text-sm">
                Your application is <strong>under review</strong>. An admin will review your profile and approve or reject your application. You'll be notified once a decision is made.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardHeader>
              <User className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="font-display">My Profile</CardTitle>
              <CardDescription>Edit your profile and portfolio</CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardHeader>
              <Briefcase className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="font-display">My Projects</CardTitle>
              <CardDescription>View incoming and active orders</CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardHeader>
              <Star className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="font-display">Reviews</CardTitle>
              <CardDescription>See your ratings and feedback</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default FreelancerDashboard;
