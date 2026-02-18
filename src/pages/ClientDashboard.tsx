import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, FileText, MessageSquare, ArrowRight } from "lucide-react";

const ClientDashboard = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold">
            Welcome back, {profile?.display_name?.split(" ")[0] || "Client"} 👋
          </h1>
          <p className="text-muted-foreground mt-1">Find and hire top freelancers for your next project.</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <Card
            className="cursor-pointer hover:shadow-md hover:border-primary/30 transition-all group"
            onClick={() => navigate("/client/discover")}
          >
            <CardHeader>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 mb-1">
                <Search className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="font-display text-lg flex items-center justify-between">
                Find Talent
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </CardTitle>
              <CardDescription>Browse vetted freelancers by service category</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" className="w-full">Start Discovery</Button>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-md hover:border-primary/30 transition-all group"
            onClick={() => navigate("/client/orders")}
          >
            <CardHeader>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 mb-1">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="font-display text-lg flex items-center justify-between">
                My Orders
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </CardTitle>
              <CardDescription>View and manage your active projects</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" className="w-full">View Orders</Button>
            </CardContent>
          </Card>

          <Card className="border-muted bg-muted/30">
            <CardHeader>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted mb-1">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
              </div>
              <CardTitle className="font-display text-lg text-muted-foreground">Chat</CardTitle>
              <CardDescription>Chat is available inside each order</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" size="sm" className="w-full" onClick={() => navigate("/client/orders")}>
                Go to Orders
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
};

export default ClientDashboard;
