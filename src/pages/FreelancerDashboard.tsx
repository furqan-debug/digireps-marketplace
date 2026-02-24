import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { FreelancerDashboardHeader } from "@/components/dashboard/freelancer/FreelancerDashboardHeader";
import { StatusBanners } from "@/components/dashboard/freelancer/StatusBanners";
import { PerformanceGrid } from "@/components/dashboard/freelancer/PerformanceGrid";
import { RecentReviews } from "@/components/dashboard/freelancer/RecentReviews";
import { FreelancerSidebar } from "@/components/dashboard/freelancer/FreelancerSidebar";
import { motion } from "framer-motion";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending: { label: "Under Review", className: "bg-warning/15 text-warning border-warning/30" },
  submitted: { label: "Profile Submitted", className: "bg-blue-500/15 text-blue-600 border-blue-500/30" },
  under_review: { label: "Under Review", className: "bg-indigo-500/15 text-indigo-600 border-indigo-500/30" },
  revision_required: { label: "Revision Required", className: "bg-amber-500/15 text-amber-600 border-amber-500/30" },
  approved: { label: "Approved", className: "bg-success/15 text-success border-success/30" },
  rejected: { label: "Rejected", className: "bg-destructive/10 text-destructive border-destructive/30" },
  suspended: { label: "Suspended", className: "bg-destructive/15 text-destructive border-destructive/40" },
  onboarding: { label: "Incomplete", className: "bg-muted text-muted-foreground border-border" },
};

const FreelancerDashboard = () => {
  const { profile, user } = useAuth();
  const [stats, setStats] = useState({ totalJobs: 0, avgRating: null as number | null, totalEarned: 0 });
  const [recentReviews, setRecentReviews] = useState<any[]>([]);

  const status = profile?.application_status as keyof typeof STATUS_CONFIG | null;
  const statusCfg = status ? (STATUS_CONFIG[status] ?? STATUS_CONFIG.onboarding) : STATUS_CONFIG.onboarding;
  const isApproved = status === "approved" && !profile?.is_suspended;
  const isSuspended = status === "suspended" || profile?.is_suspended;
  const isRevisionRequired = status === "revision_required";
  const level = profile?.freelancer_level ?? "verified";
  const completionScore = (profile as any)?.profile_completion_score ?? 0;
  const adminFeedback = (profile as any)?.admin_feedback;

  useEffect(() => {
    if (!user || !isApproved) return;
    Promise.all([
      supabase.from("orders").select("id, budget", { count: "exact" }).eq("freelancer_id", user.id).eq("status", "completed"),
      supabase.from("ratings").select("rating, review_text, created_at").eq("reviewee_id", user.id).order("created_at", { ascending: false }).limit(3),
    ]).then(([jobs, ratings]) => {
      const ratingData = ratings.data ?? [];
      const avg = ratingData.length > 0 ? ratingData.reduce((s, r) => s + r.rating, 0) / ratingData.length : null;
      const totalEarned = (jobs.data ?? []).reduce((s, o) => s + (o.budget || 0), 0);
      setStats({ totalJobs: jobs.count ?? 0, avgRating: avg, totalEarned });
      setRecentReviews(ratingData);
    });
  }, [user, isApproved]);

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-12 pb-20">
        <FreelancerDashboardHeader
          displayName={profile?.display_name || ""}
          avatarUrl={profile?.avatar_url}
          userId={user?.id}
          statusLabel={statusCfg.label}
          statusClassName={statusCfg.className}
          hasProfile={!!profile}
        />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[minmax(160px,auto)]">
          {/* Main Status Area - Span 8 */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }} className="md:col-span-8 flex flex-col gap-6">
            <StatusBanners
              status={status}
              isSuspended={!!isSuspended}
              isRevisionRequired={isRevisionRequired}
              adminFeedback={adminFeedback}
            />
            {isApproved && <PerformanceGrid totalJobs={stats.totalJobs} avgRating={stats.avgRating} totalEarned={stats.totalEarned} />}
            {isApproved && <RecentReviews reviews={recentReviews} />}
          </motion.div>

          {/* Sidebar */}
          <FreelancerSidebar level={level} completionScore={completionScore} isApproved={isApproved} />
        </div>
      </div>

      <div className="fixed inset-0 bg-[radial-gradient(45%_40%_at_50%_0%,rgba(var(--primary),0.02)_0%,transparent_100%)] pointer-events-none" />
    </AppShell>
  );
};

export default FreelancerDashboard;
