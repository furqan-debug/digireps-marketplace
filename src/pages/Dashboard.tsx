import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const { role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Redirect based on role
  if (role === "admin") return <Navigate to="/admin" replace />;
  if (role === "freelancer") return <Navigate to="/freelancer" replace />;
  return <Navigate to="/client" replace />;
};

export default Dashboard;
