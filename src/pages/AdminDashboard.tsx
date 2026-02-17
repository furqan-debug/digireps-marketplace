import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, Users, ShieldCheck, FileText, AlertTriangle } from "lucide-react";

const AdminDashboard = () => {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container flex h-16 items-center justify-between">
          <h1 className="font-display text-xl font-bold">TopTier <span className="text-xs text-muted-foreground ml-1">Admin</span></h1>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="container py-8">
        <div className="mb-8">
          <h2 className="font-display text-3xl font-bold">Admin Dashboard</h2>
          <p className="text-muted-foreground mt-1">Manage users, orders, and platform settings</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardHeader>
              <ShieldCheck className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="font-display text-lg">Applications</CardTitle>
              <CardDescription>Review freelancer applications</CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardHeader>
              <Users className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="font-display text-lg">Users</CardTitle>
              <CardDescription>Manage all platform users</CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardHeader>
              <FileText className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="font-display text-lg">Orders</CardTitle>
              <CardDescription>View and manage all orders</CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardHeader>
              <AlertTriangle className="h-8 w-8 text-destructive mb-2" />
              <CardTitle className="font-display text-lg">Violations</CardTitle>
              <CardDescription>Review chat violations</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
