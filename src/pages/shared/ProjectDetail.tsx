import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Send, DollarSign, Calendar, User, Award, ShieldCheck, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

// Client-side contact detection
const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i;
const PHONE_RE = /(\+?\d[\s-.]?){7,15}/;
const URL_RE = /https?:\/\/|www\.[^\s]+|[^\s]+\.(com|net|org|io|co|app|dev|me)/i;
const BLOCKED = ["gmail","yahoo","hotmail","outlook","whatsapp","telegram","instagram","skype","discord","snapchat","wechat","signal"];
const SOCIAL = ["contact me","reach me","call me","text me","dm me","message me on","hit me up","hmu","add me","my number","my email","my insta","my snap","off platform","outside the app","outside platform"];
function hasContactInfo(text: string): boolean {
  if (EMAIL_RE.test(text) || PHONE_RE.test(text) || URL_RE.test(text)) return true;
  const lower = text.toLowerCase();
  return BLOCKED.some(w => lower.includes(w)) || SOCIAL.some(p => lower.includes(p));
}

interface Bid {
  id: string;
  freelancer_id: string;
  amount: number;
  message: string;
  created_at: string;
  freelancer_name?: string;
  freelancer_level?: string;
}

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const { toast } = useToast();

  const [project, setProject] = useState<any>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState("");
  const [clientName, setClientName] = useState("");

  // Bid form state (freelancer only)
  const [bidAmount, setBidAmount] = useState("");
  const [bidMessage, setBidMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [alreadyBid, setAlreadyBid] = useState(false);
  const [awarding, setAwarding] = useState<string | null>(null);

  const isOwner = project?.client_id === user?.id;
  const isFreelancer = role === "freelancer";

  useEffect(() => {
    if (!projectId) return;
    const load = async () => {
      const { data: proj } = await supabase.from("projects").select("*").eq("id", projectId).single();
      if (!proj) { setLoading(false); return; }
      setProject(proj);

      // Category
      const { data: cat } = await supabase.from("service_categories").select("name").eq("id", proj.category_id).single();
      setCategoryName(cat?.name ?? "");

      // Client name
      const { data: prof } = await supabase.from("profiles").select("display_name").eq("user_id", proj.client_id).single();
      setClientName(prof?.display_name ?? "Client");

      // Bids (visible to project owner and admin, each freelancer sees own)
      const { data: bidsData } = await supabase.from("project_bids").select("*").eq("project_id", projectId).order("created_at", { ascending: true });

      if (bidsData && bidsData.length > 0) {
        const fIds = [...new Set(bidsData.map(b => b.freelancer_id))];
        const { data: fProfiles } = await supabase.from("profiles").select("user_id, display_name, freelancer_level").in("user_id", fIds);
        const fMap = Object.fromEntries((fProfiles ?? []).map(p => [p.user_id, p]));

        setBids(bidsData.map(b => ({
          ...b,
          freelancer_name: fMap[b.freelancer_id]?.display_name ?? "Freelancer",
          freelancer_level: fMap[b.freelancer_id]?.freelancer_level ?? undefined,
        })));

        if (user && bidsData.some(b => b.freelancer_id === user.id)) {
          setAlreadyBid(true);
        }
      }

      setLoading(false);
    };
    load();
  }, [projectId, user]);

  const handleBidSubmit = async () => {
    if (!user || !projectId) return;
    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount < 100) {
      toast({ title: "Minimum bid is $100", variant: "destructive" });
      return;
    }
    if (!bidMessage.trim()) {
      toast({ title: "Please include a message with your bid", variant: "destructive" });
      return;
    }
    if (hasContactInfo(bidMessage)) {
      toast({ title: "Contact information detected", description: "Sharing personal contact info is against platform rules.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const { data: session } = await supabase.auth.getSession();
    const { data, error } = await supabase.functions.invoke("submit-bid", {
      body: { project_id: projectId, amount, message: bidMessage.trim() },
      headers: { Authorization: `Bearer ${session?.session?.access_token}` },
    });
    setSubmitting(false);

    if (error) {
      toast({ title: "Failed to submit bid", description: error.message, variant: "destructive" });
      return;
    }
    if (data?.blocked) {
      toast({ title: "Content blocked", description: data.message, variant: "destructive" });
      return;
    }
    if (data?.error) {
      toast({ title: "Error", description: data.error, variant: "destructive" });
      return;
    }

    toast({ title: "Bid submitted!" });
    setAlreadyBid(true);
    setBids(prev => [...prev, { id: data.bid.id, freelancer_id: user.id, amount, message: bidMessage.trim(), created_at: new Date().toISOString(), freelancer_name: "You", freelancer_level: undefined }]);
    setBidAmount("");
    setBidMessage("");
  };

  const handleAward = async (bid: Bid) => {
    if (!project || !user) return;
    setAwarding(bid.id);

    // Create order from this bid
    const { error } = await supabase.from("orders").insert({
      client_id: user.id,
      freelancer_id: bid.freelancer_id,
      category_id: project.category_id,
      title: project.title,
      description: project.description,
      budget: bid.amount,
      deadline: project.deadline,
      status: "pending",
      escrow_status: "none",
      commission_rate: 10,
    });

    if (error) {
      toast({ title: "Failed to create order", description: error.message, variant: "destructive" });
      setAwarding(null);
      return;
    }

    // Close the project
    await supabase.from("projects").update({ status: "awarded" }).eq("id", project.id);

    toast({ title: "Bid awarded!", description: `Order created with ${bid.freelancer_name}.` });
    navigate("/client/orders");
  };

  if (loading) {
    return <AppShell><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div></AppShell>;
  }

  if (!project) {
    return <AppShell><div className="text-center py-20 text-muted-foreground">Project not found.</div></AppShell>;
  }

  const statusColor = project.status === "open" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : project.status === "awarded" ? "bg-blue-500/10 text-blue-600 border-blue-500/20" : "bg-muted text-muted-foreground border-border/20";

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-8 pb-20">
        <button onClick={() => navigate(-1)} className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back
        </button>

        <div className="grid lg:grid-cols-[1fr_360px] gap-10 items-start">
          {/* Main */}
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="rounded-3xl border border-border/40 bg-card shadow-xl overflow-hidden">
                <CardContent className="p-8 sm:p-10 space-y-6">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge variant="outline" className={`text-[9px] uppercase tracking-wider ${statusColor}`}>{project.status}</Badge>
                        <Badge variant="outline" className="text-[9px] uppercase tracking-wider">{categoryName}</Badge>
                      </div>
                      <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{project.title}</h1>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-foreground">${project.budget.toLocaleString()}</p>
                      <p className="text-[10px] font-medium text-muted-foreground uppercase">Budget</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-xs text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> {clientName}</span>
                    {project.deadline && <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {format(new Date(project.deadline), "MMM d, yyyy")}</span>}
                    <span className="text-muted-foreground/40">Posted {format(new Date(project.created_at), "MMM d, yyyy")}</span>
                  </div>

                  <div className="border-t border-border/20 pt-6">
                    <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{project.description}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Bids section */}
            <div className="space-y-4">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">
                {isOwner ? `Bids (${bids.length})` : isFreelancer ? "Your Bid" : "Bids"}
              </h2>

              {(isOwner || role === "admin") && bids.length > 0 && (
                <div className="space-y-3">
                  {bids.map(bid => (
                    <Card key={bid.id} className="rounded-2xl border border-border/40 bg-card">
                      <CardContent className="p-6 space-y-3">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                              {bid.freelancer_name?.[0]?.toUpperCase() ?? "?"}
                            </div>
                            <div>
                              <p className="font-bold text-sm">{bid.freelancer_name}</p>
                              {bid.freelancer_level && <Badge variant="outline" className="text-[8px] uppercase tracking-wider">{bid.freelancer_level}</Badge>}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">${bid.amount.toLocaleString()}</p>
                            <p className="text-[10px] text-muted-foreground">{format(new Date(bid.created_at), "MMM d")}</p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{bid.message}</p>
                        {isOwner && project.status === "open" && (
                          <div className="flex gap-2 pt-2">
                            <Button asChild variant="outline" size="sm" className="rounded-xl text-xs">
                              <Link to={`/client/freelancer/${bid.freelancer_id}`}>View Profile</Link>
                            </Button>
                            <Button size="sm" className="rounded-xl text-xs gap-1.5" onClick={() => handleAward(bid)} disabled={!!awarding}>
                              {awarding === bid.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Award className="h-3 w-3" />}
                              Award
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Freelancer sees own bid */}
              {isFreelancer && !isOwner && alreadyBid && (
                <Card className="rounded-2xl border border-primary/20 bg-primary/5">
                  <CardContent className="p-6 flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
                    <p className="text-sm font-medium text-foreground">You've already submitted a bid for this project.</p>
                  </CardContent>
                </Card>
              )}

              {/* Bid form for freelancers */}
              {isFreelancer && !isOwner && !alreadyBid && project.status === "open" && (
                <Card className="rounded-2xl border border-border/40 bg-card">
                  <CardContent className="p-6 space-y-5">
                    <h3 className="font-bold text-sm">Submit Your Bid</h3>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Bid Amount (min $100)</Label>
                      <div className="relative group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/30 font-bold pointer-events-none group-focus-within:text-primary transition-colors">$</span>
                        <Input type="number" min="100" step="50" placeholder="0.00" value={bidAmount} onChange={e => setBidAmount(e.target.value)} className="pl-10 h-12 rounded-xl" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Message</Label>
                      <Textarea placeholder="Describe your approach, timeline, and why you're the right fit..." value={bidMessage} onChange={e => setBidMessage(e.target.value)} rows={4} className="rounded-xl resize-none" />
                    </div>
                    <div className="flex items-start gap-2 text-[10px] text-muted-foreground/50">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      <span>Do not include personal contact information. Violations may result in account suspension.</span>
                    </div>
                    <Button onClick={handleBidSubmit} disabled={submitting} className="w-full h-12 rounded-xl gap-2 text-xs font-bold uppercase tracking-widest">
                      {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</> : <><Send className="h-4 w-4" /> Submit Bid</>}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Non-freelancer, non-owner sees nothing */}
              {!isOwner && !isFreelancer && bids.length === 0 && (
                <p className="text-sm text-muted-foreground">No bids yet.</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:sticky lg:top-28 space-y-6">
            <Card className="rounded-3xl border border-border/40 bg-card p-6 shadow-sm space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">Project Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Category</span><span className="font-medium">{categoryName}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Budget</span><span className="font-bold">${project.budget.toLocaleString()}</span></div>
                {project.deadline && <div className="flex justify-between"><span className="text-muted-foreground">Deadline</span><span className="font-medium">{format(new Date(project.deadline), "MMM d, yyyy")}</span></div>}
                <div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge variant="outline" className={`text-[9px] uppercase ${statusColor}`}>{project.status}</Badge></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Bids</span><span className="font-bold">{bids.length}</span></div>
              </div>
            </Card>

            <div className="dossier-card p-6 rounded-3xl bg-card border border-border/40 shadow-sm text-center space-y-3">
              <ShieldCheck className="h-8 w-8 text-primary mx-auto" />
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground">Escrow Protected</p>
              <p className="text-[10px] font-medium text-muted-foreground/50 leading-relaxed">Payments are held securely until work is approved.</p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default ProjectDetail;
