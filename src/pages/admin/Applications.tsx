import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, XCircle, MapPin, Briefcase, ShieldCheck, Eye, AlertTriangle, Ban, MessageSquare, DollarSign, Globe2 } from "lucide-react";
import { motion } from "framer-motion";
import { getVerifiedStatus } from "@/lib/verified-badge";

type AppStatus = "pending" | "approved" | "rejected" | "draft" | "submitted" | "under_review" | "revision_required" | "suspended";

type Applicant = {
  id: string;
  user_id: string;
  display_name: string;
  headline: string | null;
  country: string | null;
  bio: string | null;
  skills: string[] | null;
  experience_years: number | null;
  hourly_rate: number | null;
  application_status: AppStatus | null;
  freelancer_level: "verified" | "pro" | "elite" | null;
  is_suspended: boolean;
  profile_completion_score: number;
  work_experience: any[];
  languages: any[];
  admin_feedback: string | null;
};

const STATUS_BADGE: Record<string, { className: string; label: string }> = {
  pending:            { className: "bg-warning/15 text-warning border-warning/30", label: "Pending" },
  submitted:          { className: "bg-blue-500/15 text-blue-600 border-blue-500/30", label: "Submitted" },
  under_review:       { className: "bg-indigo-500/15 text-indigo-600 border-indigo-500/30", label: "Under Review" },
  revision_required:  { className: "bg-amber-500/15 text-amber-600 border-amber-500/30", label: "Revision Required" },
  approved:           { className: "bg-success/15 text-success border-success/30", label: "Approved" },
  rejected:           { className: "bg-destructive/10 text-destructive border-destructive/30", label: "Rejected" },
  suspended:          { className: "bg-destructive/15 text-destructive border-destructive/40", label: "Suspended" },
};

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

const Applications = () => {
  const { toast } = useToast();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState<string | null>(null);
  const [feedbackFor, setFeedbackFor] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackAction, setFeedbackAction] = useState<"revision_required" | "suspended" | null>(null);

  const fetchApplicants = () => {
    supabase
      .from("profiles")
      .select("id, user_id, display_name, headline, country, bio, skills, experience_years, hourly_rate, application_status, freelancer_level, is_suspended, profile_completion_score, work_experience, languages, admin_feedback" as any)
      .not("application_status", "is", null)
      .order("application_status", { ascending: true })
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setApplicants((data ?? []) as unknown as Applicant[]);
        setLoading(false);
      });
  };

  useEffect(() => { fetchApplicants(); }, []);

  const updateStatus = async (userId: string, status: AppStatus, feedback?: string) => {
    setActioning(userId);
    const updateData: any = { application_status: status };
    if (feedback !== undefined) updateData.admin_feedback = feedback;
    if (status === "suspended") updateData.is_suspended = true;
    if (status === "approved") updateData.is_suspended = false;

    const { error } = await supabase.from("profiles").update(updateData).eq("user_id", userId);
    setActioning(null);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Status updated to ${status}` });
      setApplicants((prev) => prev.map((a) => a.user_id === userId ? { ...a, application_status: status, admin_feedback: feedback ?? a.admin_feedback, is_suspended: status === "suspended" ? true : status === "approved" ? false : a.is_suspended } : a));
      setFeedbackFor(null);
      setFeedbackText("");
      setFeedbackAction(null);
    }
  };

  const openFeedbackDialog = (userId: string, action: "revision_required" | "suspended") => {
    setFeedbackFor(userId);
    setFeedbackAction(action);
    setFeedbackText("");
  };

  const submitFeedback = () => {
    if (!feedbackFor || !feedbackAction) return;
    updateStatus(feedbackFor, feedbackAction, feedbackText);
  };

  const counts = {
    pending: applicants.filter((a) => a.application_status === "pending" || a.application_status === "submitted").length,
    under_review: applicants.filter((a) => a.application_status === "under_review").length,
    revision_required: applicants.filter((a) => a.application_status === "revision_required").length,
    approved: applicants.filter((a) => a.application_status === "approved").length,
    rejected: applicants.filter((a) => a.application_status === "rejected").length,
    suspended: applicants.filter((a) => a.application_status === "suspended").length,
  };

  const renderActions = (a: Applicant) => {
    const st = a.application_status;
    const isLoading = actioning === a.user_id;

    if (st === "pending" || st === "submitted") {
      return (
        <div className="flex flex-col gap-2 shrink-0 sm:w-32">
          <Button size="sm" className="gap-1.5 bg-indigo-500 text-white hover:bg-indigo-600 w-full" disabled={isLoading} onClick={() => updateStatus(a.user_id, "under_review")}>
            <Eye className="h-3.5 w-3.5" /> Start Review
          </Button>
          <Button size="sm" className="gap-1.5 bg-gradient-to-r from-success to-success border-0 text-success-foreground hover:opacity-90 w-full" disabled={isLoading} onClick={() => updateStatus(a.user_id, "approved")}>
            <CheckCircle className="h-3.5 w-3.5" /> Approve
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10 w-full" disabled={isLoading} onClick={() => updateStatus(a.user_id, "rejected")}>
            <XCircle className="h-3.5 w-3.5" /> Reject
          </Button>
        </div>
      );
    }

    if (st === "under_review") {
      return (
        <div className="flex flex-col gap-2 shrink-0 sm:w-32">
          <Button size="sm" className="gap-1.5 bg-gradient-to-r from-success to-success border-0 text-success-foreground hover:opacity-90 w-full" disabled={isLoading} onClick={() => updateStatus(a.user_id, "approved")}>
            <CheckCircle className="h-3.5 w-3.5" /> Approve
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5 border-amber-500/40 text-amber-600 hover:bg-amber-50 w-full" disabled={isLoading} onClick={() => openFeedbackDialog(a.user_id, "revision_required")}>
            <MessageSquare className="h-3.5 w-3.5" /> Revision
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10 w-full" disabled={isLoading} onClick={() => updateStatus(a.user_id, "rejected")}>
            <XCircle className="h-3.5 w-3.5" /> Reject
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10 w-full" disabled={isLoading} onClick={() => openFeedbackDialog(a.user_id, "suspended")}>
            <Ban className="h-3.5 w-3.5" /> Suspend
          </Button>
        </div>
      );
    }

    if (st === "revision_required") {
      return (
        <div className="flex flex-col gap-2 shrink-0 sm:w-32">
          <Button size="sm" className="gap-1.5 bg-gradient-to-r from-success to-success border-0 text-success-foreground hover:opacity-90 w-full" disabled={isLoading} onClick={() => updateStatus(a.user_id, "approved")}>
            <CheckCircle className="h-3.5 w-3.5" /> Approve
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10 w-full" disabled={isLoading} onClick={() => updateStatus(a.user_id, "rejected")}>
            <XCircle className="h-3.5 w-3.5" /> Reject
          </Button>
        </div>
      );
    }

    if (st === "approved") {
      return (
        <div className="flex flex-col gap-2 shrink-0 sm:w-32">
          <Button size="sm" variant="outline" className="gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10 w-full" disabled={isLoading} onClick={() => openFeedbackDialog(a.user_id, "suspended")}>
            <Ban className="h-3.5 w-3.5" /> Suspend
          </Button>
        </div>
      );
    }

    return null;
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
              <p className="text-muted-foreground text-sm">Review and manage freelancer applications and profiles.</p>
            </div>
          </div>
        </motion.div>

        {/* Summary bar */}
        {!loading && applicants.length > 0 && (
          <div className="flex gap-3 flex-wrap">
            {counts.pending > 0 && <div className="inline-flex items-center gap-2 rounded-full border border-warning/30 bg-warning/10 px-4 py-1.5 text-sm font-medium text-warning">{counts.pending} pending</div>}
            {counts.under_review > 0 && <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-sm font-medium text-indigo-600">{counts.under_review} in review</div>}
            {counts.revision_required > 0 && <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-sm font-medium text-amber-600">{counts.revision_required} needs revision</div>}
            {counts.approved > 0 && <div className="inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-4 py-1.5 text-sm font-medium text-success">{counts.approved} approved</div>}
            {counts.suspended > 0 && <div className="inline-flex items-center gap-2 rounded-full border border-destructive/30 bg-destructive/10 px-4 py-1.5 text-sm font-medium text-destructive">{counts.suspended} suspended</div>}
          </div>
        )}

        {/* Feedback Dialog */}
        {feedbackFor && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-amber-700">
              <AlertTriangle className="h-4 w-4" />
              {feedbackAction === "revision_required" ? "Request Revision — Provide Feedback" : "Suspend Account — Provide Reason"}
            </div>
            <Textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder={feedbackAction === "revision_required" ? "Explain what needs to be changed..." : "Reason for suspension..."}
              className="min-h-[80px]"
            />
            <div className="flex gap-3 justify-end">
              <Button variant="outline" size="sm" onClick={() => { setFeedbackFor(null); setFeedbackAction(null); }}>Cancel</Button>
              <Button size="sm" onClick={submitFeedback} disabled={!feedbackText.trim()} className={feedbackAction === "suspended" ? "bg-destructive text-destructive-foreground" : "bg-amber-500 text-white hover:bg-amber-600"}>
                {feedbackAction === "revision_required" ? "Send Revision Request" : "Confirm Suspension"}
              </Button>
            </div>
          </motion.div>
        )}

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : applicants.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 py-16 text-center text-muted-foreground">No applications yet.</div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
            {applicants.map((a) => {
              const statusKey = a.application_status ?? "pending";
              const statusCfg = STATUS_BADGE[statusKey] ?? STATUS_BADGE.pending;
              const initials = a.display_name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
              const verified = getVerifiedStatus({ application_status: a.application_status, is_suspended: a.is_suspended, profile_completion_score: a.profile_completion_score });
              const workCount = Array.isArray(a.work_experience) ? a.work_experience.length : 0;
              const langCount = Array.isArray(a.languages) ? a.languages.length : 0;

              return (
                <motion.div key={a.id} variants={itemVariants}>
                  <Card className={`transition-all ${(statusKey === "pending" || statusKey === "submitted") ? "border-warning/20 hover:shadow-elegant" : statusKey === "under_review" ? "border-indigo-500/20" : ""}`}>
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
                            {verified.isVerified && (
                              <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[9px] gap-1">
                                <ShieldCheck className="h-3 w-3" /> Verified
                              </Badge>
                            )}
                            <Badge className={`${statusCfg.className} border text-xs`}>{statusCfg.label}</Badge>
                          </div>
                          {a.headline && <p className="text-xs text-muted-foreground font-medium">{a.headline}</p>}
                          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                            {a.country && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{a.country}</span>}
                            {a.experience_years != null && <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{a.experience_years}y exp</span>}
                            {a.hourly_rate != null && <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />${a.hourly_rate}/hr</span>}
                            {workCount > 0 && <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{workCount} roles</span>}
                            {langCount > 0 && <span className="flex items-center gap-1"><Globe2 className="h-3 w-3" />{langCount} lang</span>}
                          </div>
                          {a.bio && <p className="text-sm text-muted-foreground line-clamp-2">{a.bio}</p>}

                          {/* Completeness bar */}
                          <div className="flex items-center gap-3 pt-1">
                            <Progress value={a.profile_completion_score} className="h-1.5 flex-1 max-w-32" />
                            <span className="text-[10px] font-bold text-muted-foreground">{a.profile_completion_score}%</span>
                          </div>

                          {/* Admin feedback display */}
                          {a.admin_feedback && (statusKey === "revision_required" || statusKey === "suspended") && (
                            <div className="mt-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-700">
                              <span className="font-bold">Admin feedback:</span> {a.admin_feedback}
                            </div>
                          )}

                          <div className="flex flex-wrap gap-1.5">
                            {(a.skills ?? []).slice(0, 6).map((s) => (
                              <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                            ))}
                          </div>
                        </div>

                        {/* Actions */}
                        {renderActions(a)}
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
