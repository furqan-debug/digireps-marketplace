import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, XCircle, MapPin, Briefcase } from "lucide-react";

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
    const { error } = await supabase
      .from("profiles")
      .update({ application_status: status })
      .eq("user_id", userId);
    setActioning(null);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Application ${status}` });
      setApplicants((prev) =>
        prev.map((a) => a.user_id === userId ? { ...a, application_status: status } : a)
      );
    }
  };

  const STATUS_BADGE: Record<string, string> = {
    pending:  "bg-warning/15 text-warning",
    approved: "bg-success/15 text-success",
    rejected: "bg-destructive/10 text-destructive",
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold">Freelancer Applications</h1>
          <p className="text-muted-foreground mt-1">Review and approve or reject freelancer applications.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : applicants.length === 0 ? (
          <Card><CardContent className="py-16 text-center text-muted-foreground">No applications yet.</CardContent></Card>
        ) : (
          <div className="space-y-4">
            {applicants.map((a) => (
              <Card key={a.id}>
                <CardContent className="pt-5 pb-5">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 font-display font-bold text-primary text-lg">
                      {a.display_name[0].toUpperCase()}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold">{a.display_name}</span>
                        <Badge className={STATUS_BADGE[a.application_status ?? "pending"] ?? ""}>
                          {a.application_status ?? "pending"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        {a.country && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{a.country}</span>}
                        {a.experience_years != null && <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{a.experience_years}y exp</span>}
                      </div>
                      {a.bio && <p className="text-sm text-muted-foreground line-clamp-2">{a.bio}</p>}
                      <div className="flex flex-wrap gap-1.5">
                        {(a.skills ?? []).map((s) => (
                          <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                        ))}
                      </div>
                    </div>
                    {a.application_status === "pending" && (
                      <div className="flex gap-2 shrink-0">
                        <Button
                          size="sm"
                          className="gap-1.5"
                          disabled={actioning === a.user_id}
                          onClick={() => updateStatus(a.user_id, "approved")}
                        >
                          {actioning === a.user_id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="gap-1.5"
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
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default Applications;
