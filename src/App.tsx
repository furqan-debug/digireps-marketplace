import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Public
// Public
import Index from "./pages/public/Index";
import Auth from "./pages/public/Auth";
import NotFound from "./pages/public/NotFound";

// Shared redirector
import Dashboard from "./pages/shared/Dashboard";

// Client
import ClientDashboard from "./pages/client/ClientDashboard";
import Discover from "./pages/client/Discover";
import FreelancerProfile from "./pages/client/FreelancerProfile";
import SubmitBrief from "./pages/client/SubmitBrief";
import PostProject from "./pages/client/PostProject";
import ClientProjects from "./pages/client/ClientProjects";

// Shared (client + freelancer)
import Orders from "./pages/shared/Orders";
import OrderDetail from "./pages/shared/OrderDetail";
import ProjectDetail from "./pages/shared/ProjectDetail";

// Freelancer
import FreelancerDashboard from "./pages/freelancer/FreelancerDashboard";
import EditProfile from "./pages/freelancer/EditProfile";
import Earnings from "./pages/freelancer/Earnings";
import ProjectBoard from "./pages/freelancer/ProjectBoard";

// Admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import Applications from "./pages/admin/Applications";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminOrders from "./pages/admin/AdminOrders";
import Violations from "./pages/admin/Violations";
import AdminDisputes from "./pages/admin/AdminDisputes";
import PlatformSettings from "./pages/admin/PlatformSettings";

// New public pages
import HowItWorks from "./pages/public/HowItWorks";
import Help from "./pages/public/Help";

// Client settings
import ClientSettings from "./pages/client/ClientSettings";

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
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/help" element={<Help />} />

            {/* Role redirect */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

            {/* Client */}
            <Route path="/client" element={<ProtectedRoute allowedRoles={["client"]}><ClientDashboard /></ProtectedRoute>} />
            <Route path="/client/discover" element={<ProtectedRoute allowedRoles={["client"]}><Discover /></ProtectedRoute>} />
            <Route path="/client/freelancer/:freelancerId" element={<ProtectedRoute allowedRoles={["client"]}><FreelancerProfile /></ProtectedRoute>} />
            <Route path="/client/brief/:freelancerId" element={<ProtectedRoute allowedRoles={["client"]}><SubmitBrief /></ProtectedRoute>} />
            <Route path="/client/orders" element={<ProtectedRoute allowedRoles={["client"]}><Orders /></ProtectedRoute>} />
            <Route path="/client/projects" element={<ProtectedRoute allowedRoles={["client"]}><ClientProjects /></ProtectedRoute>} />
            <Route path="/client/projects/new" element={<ProtectedRoute allowedRoles={["client"]}><PostProject /></ProtectedRoute>} />
            <Route path="/client/settings" element={<ProtectedRoute allowedRoles={["client"]}><ClientSettings /></ProtectedRoute>} />

            {/* Shared: Order detail + chat */}
            {/* Shared: Order detail + chat + project detail */}
            <Route path="/orders/:orderId" element={<ProtectedRoute allowedRoles={["client", "freelancer", "admin"]}><OrderDetail /></ProtectedRoute>} />
            <Route path="/projects/:projectId" element={<ProtectedRoute allowedRoles={["client", "freelancer", "admin"]}><ProjectDetail /></ProtectedRoute>} />

            {/* Freelancer */}
            <Route path="/freelancer" element={<ProtectedRoute allowedRoles={["freelancer"]}><FreelancerDashboard /></ProtectedRoute>} />
            <Route path="/freelancer/profile" element={<ProtectedRoute allowedRoles={["freelancer"]}><EditProfile /></ProtectedRoute>} />
            <Route path="/freelancer/projects" element={<ProtectedRoute allowedRoles={["freelancer"]}><ProjectBoard /></ProtectedRoute>} />
            <Route path="/freelancer/orders" element={<ProtectedRoute allowedRoles={["freelancer"]}><Orders /></ProtectedRoute>} />
            <Route path="/freelancer/earnings" element={<ProtectedRoute allowedRoles={["freelancer"]}><Earnings /></ProtectedRoute>} />

            {/* Admin */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/applications" element={<ProtectedRoute allowedRoles={["admin"]}><Applications /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute allowedRoles={["admin"]}><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/orders" element={<ProtectedRoute allowedRoles={["admin"]}><AdminOrders /></ProtectedRoute>} />
            <Route path="/admin/violations" element={<ProtectedRoute allowedRoles={["admin"]}><Violations /></ProtectedRoute>} />
            <Route path="/admin/disputes" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDisputes /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={["admin"]}><PlatformSettings /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
