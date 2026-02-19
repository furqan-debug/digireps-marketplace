import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, XCircle, MapPin, Briefcase, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

type Applicant = {
  id: string;
  user_id: string;
  display_name: string;
  country: string | null;
  bio: string | null;
  skills: string[] | null;
  experience_years: number | null;
  application_status: "pending" | "approved" | "rejected" | null;
  freelancer_level: "verified" | "pro" | "elite" | null;
};

const STATUS_BADGE: Record<string, { className: string; label: string }> = {
  pending:  { className: "bg-warning/15 text-warning border-warning/30", label: "Pending" },
  approved: { className: "bg-success/15 text-success border-success/30", label: "Approved" },
  rejected: { className: "bg-destructive/10 text-destructive border-destructive/30", label: "Rejected" },
};

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const Applications = () => {
  const { toast } = useToast();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState<string | null>(null);

  const fetchApplicants = () => {
    supabase
      .from("profiles")
      .select("id, user_id, display_name, country, bio, skills, experience_years, application_status, freelancer_level")
      .not("application_status", "is", null)
      .order("application_status", { ascending: true })
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setApplicants((data ?? []) as Applicant[]);
        setLoading(false);
      });
  };

  useEffect(() => { fetchApplicants(); }, []);

  const updateStatus = async (userId: string, status: "approved" | "rejected") => {
    setActioning(userId);
    const { error } = await supabase.from("profiles").update({ application_status: status }).eq("user_id", userId);
    setActioning(null);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Application ${status}` });
      setApplicants((prev) => prev.map((a) => a.user_id === userId ? { ...a, application_status: status } : a));
    }
  };

  const counts = {
    pending: applicants.filter((a) => a.application_status === "pending").length,
    approved: applicants.filter((a) => a.application_status === "approved").length,
    rejected: applicants.filter((a) => a.application_status === "rejected").length,
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-7">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl icon-gradient">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold">Freelancer Applications</h1>
              <p className="text-muted-foreground text-sm">Review and approve or reject freelancer applications.</p>
            </div>
          </div>
        </motion.div>

        {/* Summary bar */}
        {!loading && applicants.length > 0 && (
          <div className="flex gap-3 flex-wrap">
            <div className="inline-flex items-center gap-2 rounded-full border border-warning/30 bg-warning/10 px-4 py-1.5 text-sm font-medium text-warning">
              {counts.pending} pending
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-4 py-1.5 text-sm font-medium text-success">
              {counts.approved} approved
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-destructive/30 bg-destructive/10 px-4 py-1.5 text-sm font-medium text-destructive">
              {counts.rejected} rejected
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : applicants.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 py-16 text-center text-muted-foreground">
            No applications yet.
          </div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
            {applicants.map((a) => {
              const statusKey = a.application_status ?? "pending";
              const statusCfg = STATUS_BADGE[statusKey] ?? STATUS_BADGE.pending;
              const initials = a.display_name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
              return (
                <motion.div key={a.id} variants={itemVariants}>
                  <Card className={`transition-all ${statusKey === "pending" ? "border-warning/20 hover:shadow-elegant" : ""}`}>
                    <CardContent className="pt-5 pb-5">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-primary-glow blur-sm opacity-30" />
                          <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary-glow/15 border-2 border-primary/20 font-display font-bold text-primary text-xl">
                            {initials}
                          </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-base">{a.display_name}</span>
                            <Badge className={`${statusCfg.className} border text-xs`}>
                              {statusCfg.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                            {a.country && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{a.country}</span>}
                            {a.experience_years != null && <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{a.experience_years}y exp</span>}
                          </div>
                          {a.bio && <p className="text-sm text-muted-foreground line-clamp-2">{a.bio}</p>}
                          <div className="flex flex-wrap gap-1.5">
                            {(a.skills ?? []).slice(0, 6).map((s) => (
                              <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                            ))}
                          </div>
                        </div>

                        {/* Actions — only for pending */}
                        {a.application_status === "pending" && (
                          <div className="flex flex-col gap-2 shrink-0 sm:w-28">
                            <Button
                              size="sm"
                              className="gap-1.5 bg-gradient-to-r from-success to-success border-0 text-success-foreground hover:opacity-90 w-full"
                              disabled={actioning === a.user_id}
                              onClick={() => updateStatus(a.user_id, "approved")}
                            >
                              {actioning === a.user_id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10 w-full"
                              disabled={actioning === a.user_id}
                              onClick={() => updateStatus(a.user_id, "rejected")}
                            >
                              <XCircle className="h-3.5 w-3.5" /> Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </AppShell>
  );
};

export default Applications;
