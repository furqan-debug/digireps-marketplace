import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Public
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Shared redirector
import Dashboard from "./pages/Dashboard";

// Client
import ClientDashboard from "./pages/ClientDashboard";
import Discover from "./pages/client/Discover";
import FreelancerProfile from "./pages/client/FreelancerProfile";
import SubmitBrief from "./pages/client/SubmitBrief";

// Shared (client + freelancer)
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";

// Freelancer
import FreelancerDashboard from "./pages/FreelancerDashboard";
import EditProfile from "./pages/freelancer/EditProfile";

// Admin
import AdminDashboard from "./pages/AdminDashboard";
import Applications from "./pages/admin/Applications";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminOrders from "./pages/admin/AdminOrders";
import Violations from "./pages/admin/Violations";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />

            {/* Role redirect */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

            {/* Client */}
            <Route path="/client" element={<ProtectedRoute allowedRoles={["client"]}><ClientDashboard /></ProtectedRoute>} />
            <Route path="/client/discover" element={<ProtectedRoute allowedRoles={["client"]}><Discover /></ProtectedRoute>} />
            <Route path="/client/freelancer/:freelancerId" element={<ProtectedRoute allowedRoles={["client"]}><FreelancerProfile /></ProtectedRoute>} />
            <Route path="/client/brief/:freelancerId" element={<ProtectedRoute allowedRoles={["client"]}><SubmitBrief /></ProtectedRoute>} />
            <Route path="/client/orders" element={<ProtectedRoute allowedRoles={["client"]}><Orders /></ProtectedRoute>} />

            {/* Shared: Order detail + chat */}
            <Route path="/orders/:orderId" element={<ProtectedRoute allowedRoles={["client", "freelancer", "admin"]}><OrderDetail /></ProtectedRoute>} />

            {/* Freelancer */}
            <Route path="/freelancer" element={<ProtectedRoute allowedRoles={["freelancer"]}><FreelancerDashboard /></ProtectedRoute>} />
            <Route path="/freelancer/profile" element={<ProtectedRoute allowedRoles={["freelancer"]}><EditProfile /></ProtectedRoute>} />
            <Route path="/freelancer/orders" element={<ProtectedRoute allowedRoles={["freelancer"]}><Orders /></ProtectedRoute>} />

            {/* Admin */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/applications" element={<ProtectedRoute allowedRoles={["admin"]}><Applications /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute allowedRoles={["admin"]}><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/orders" element={<ProtectedRoute allowedRoles={["admin"]}><AdminOrders /></ProtectedRoute>} />
            <Route path="/admin/violations" element={<ProtectedRoute allowedRoles={["admin"]}><Violations /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
