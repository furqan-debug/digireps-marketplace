import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Send, CheckCircle, Shield, Clock, Star, Sparkles, ShieldCheck, Zap, MessageSquare, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

type Category = { id: string; name: string };

const SubmitBrief = () => {
  const { freelancerId } = useParams<{ freelancerId: string }>();
  const [searchParams] = useSearchParams();
  const defaultCategoryId = searchParams.get("category") ?? "";
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [freelancerName, setFreelancerName] = useState("this freelancer");
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [categoryId, setCategoryId] = useState(defaultCategoryId);

  useEffect(() => {
    supabase.from("service_categories").select("id, name").then(({ data }) => setCategories(data ?? []));
    if (freelancerId) {
      supabase.from("profiles").select("display_name").eq("user_id", freelancerId).single()
        .then(({ data }) => { if (data) setFreelancerName(data.display_name); });
    }
  }, [freelancerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !freelancerId) return;

    const budgetNum = parseFloat(budget);
    if (isNaN(budgetNum) || budgetNum < 100) {
      toast({ title: "Minimum budget is $100", variant: "destructive" });
      return;
    }
    if (!categoryId) {
      toast({ title: "Please select a service category", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.from("orders").insert({
      client_id: user.id,
      freelancer_id: freelancerId,
      category_id: categoryId,
      title: title.trim(),
      description: description.trim(),
      budget: budgetNum,
      deadline: deadline ? new Date(deadline).toISOString() : null,
      status: "pending",
      escrow_status: "none",
      commission_rate: 10,
    }).select("id").single();

    setIsSubmitting(false);

    if (error) {
      toast({ title: "Failed to submit brief", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Project brief sent!", description: `${freelancerName} will review your request.` });
    navigate("/client/orders");
  };

  const nextSteps = [
    { icon: Clock, text: "Freelancer reviews your brief within 24h" },
    { icon: CheckCircle, text: "Accept → you confirm escrow payment" },
    { icon: Star, text: "Work begins and you get progress updates" },
    { icon: Shield, text: "Approve delivery to release payment" },
  ];

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-12 pb-20">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Retrace Steps
          </button>

          <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-muted/20 border border-border/20 backdrop-blur-sm">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-primary">Mission Configuration</span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          {/* Background Atmosphere Glow */}
          <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

          <div className="space-y-6 relative">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/5 border border-primary/20 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-4">
              <Sparkles className="h-3.5 w-3.5" /> Project Initiation
            </div>
            <h1 className="font-display text-5xl sm:text-7xl font-bold tracking-tight text-foreground leading-[1.1]">
              Deploy Engagement
            </h1>
            <p className="text-muted-foreground/50 text-base sm:text-lg font-medium leading-relaxed max-w-2xl italic">
              "Drafting a mission-critical strategic brief to align objectives with <strong className="text-primary font-bold">{freelancerName}</strong>'s expertise."
            </p>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-12 items-start">
          {/* Form */}
          <div className="space-y-10">
            <section className="space-y-8">
              <div className="flex items-center gap-6">
                <div className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">01</div>
                <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">Brief Parameters</h2>
                <div className="h-px flex-1 bg-border/40" />
              </div>

              <Card className="dossier-card rounded-[2.5rem] border border-border/40 bg-white shadow-2xl shadow-black/[0.02] overflow-hidden relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary/5" />
                <CardContent className="p-10 sm:p-14 space-y-12">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Strategic Service Domain</Label>
                    <Select value={categoryId} onValueChange={setCategoryId}>
                      <SelectTrigger className="h-16 rounded-2xl bg-muted/20 border-border/10 px-8 font-bold text-sm tracking-tight focus:ring-primary/10 transition-all">
                        <SelectValue placeholder="Define category" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-border/40 backdrop-blur-3xl">
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id} className="rounded-xl focus:bg-primary/5 py-3 font-medium">{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Engagement Title</Label>
                    <Input id="title" placeholder="e.g. Design Elite Visual Identity for FinTech Series A" value={title} onChange={(e) => setTitle(e.target.value)} required className="h-16 rounded-2xl bg-muted/20 border-border/10 px-8 font-bold text-sm tracking-tight focus:ring-primary/10 placeholder:text-muted-foreground/20" />
                  </div>

                  <div className="space-y-4">
                    <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Operational Scope & Objectives</Label>
                    <Textarea id="description" placeholder="Articulate the primary objectives, key deliverables, and critical success factors..." value={description} onChange={(e) => setDescription(e.target.value)} rows={8} required className="rounded-3xl bg-muted/20 border-border/10 p-8 font-medium text-sm resize-none focus:ring-primary/10 leading-relaxed placeholder:text-muted-foreground/20 italic" />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Allocated Capital (USD, min $100)</Label>
                      <div className="relative group">
                        <span className="absolute left-8 top-1/2 -translate-y-1/2 text-muted-foreground/30 font-bold text-lg pointer-events-none group-focus-within:text-primary transition-colors">$</span>
                        <Input id="budget" type="number" min="100" step="50" className="pl-14 h-16 rounded-2xl bg-muted/20 border-border/10 px-8 font-bold text-sm tracking-tight focus:ring-primary/10" placeholder="0.00" value={budget} onChange={(e) => setBudget(e.target.value)} required />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Deployment Deadline</Label>
                      <div className="relative">
                        <Input id="deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} min={new Date().toISOString().split("T")[0]} className="h-16 rounded-2xl bg-muted/20 border-border/10 px-8 font-bold text-sm tracking-tight focus:ring-primary/10 appearance-none w-full" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-10 border-t border-border/10 space-y-6">
                    <Button type="submit" onClick={handleSubmit} className="w-full h-20 rounded-[1.5rem] gap-4 bg-primary text-primary-foreground hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20 text-[10px] font-bold uppercase tracking-[0.25em]" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <><Loader2 className="h-6 w-6 animate-spin" /> Protocol Initiation...</>
                      ) : (
                        <><Zap className="h-6 w-6 fill-white" /> Dispatch Project Brief</>
                      )}
                    </Button>
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-[9px] font-bold text-muted-foreground/30 text-center uppercase tracking-[0.15em]">Security Protocol: 256-bit Encrypted Transaction Chain</p>
                      <div className="flex items-center gap-1.5 opacity-20 grayscale">
                        <Shield className="h-3 w-3" />
                        <span className="text-[8px] font-black uppercase tracking-widest">DigiReps Merchant Escrow Verified</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>

          {/* Side Info */}
          <div className="lg:sticky lg:top-12 space-y-6">
            <div className="flex items-center gap-6">
              <div className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">01</div>
              <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">Target Asset</h2>
              <div className="h-px flex-1 bg-border/40" />
            </div>

            <Card className="dossier-card rounded-[2.5rem] border border-border/40 bg-white overflow-hidden shadow-sm relative">
              <div className="absolute top-0 right-0 w-16 h-1 w-full bg-primary/10" />
              <CardContent className="p-8">
                <div className="flex items-center gap-5">
                  <div className="relative h-20 w-20 shrink-0 rounded-2xl bg-muted border-[4px] border-white shadow-lg flex items-center justify-center font-display font-bold text-primary text-3xl overflow-hidden ring-4 ring-primary/5 transition-transform hover:scale-105 duration-500">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
                    {freelancerName[0]?.toUpperCase()}
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-display font-bold text-xl tracking-tight leading-tight">{freelancerName}</h3>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-500/5 border border-blue-500/10">
                      <ShieldCheck className="h-3 w-3 text-blue-500" />
                      <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-blue-600">Verified Elite</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center gap-6">
              <div className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">02</div>
              <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">Governance Protocol</h2>
              <div className="h-px flex-1 bg-border/40" />
            </div>

            <Card className="dossier-card rounded-[2.5rem] border border-border/40 bg-white overflow-hidden p-10 shadow-sm">
              <CardContent className="p-0 space-y-8">
                {nextSteps.map(({ icon: Icon, text }, i) => (
                  <div key={i} className="flex gap-6 group">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-muted border border-border/20 text-muted-foreground/40 group-hover:bg-primary group-hover:text-white group-hover:border-primary group-hover:shadow-lg group-hover:shadow-primary/20 transition-all duration-500">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1.5 pt-1.5">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground transition-colors group-hover:text-primary">Phase 0{i + 1}</p>
                      <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.1em] leading-relaxed group-hover:text-muted-foreground transition-colors">{text}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex items-center gap-6">
              <div className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">03</div>
              <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">Security Protocol</h2>
              <div className="h-px flex-1 bg-border/40" />
            </div>

            <div className="dossier-card p-10 rounded-[2.5rem] bg-white border border-border/40 shadow-sm text-center space-y-4 relative overflow-hidden group">
              <div className="absolute inset-0 bg-primary/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="h-12 w-12 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center mx-auto shadow-inner group-hover:scale-110 transition-transform duration-500">
                <ShieldCheck className="h-6 w-6 text-primary shadow-sm" />
              </div>
              <div className="space-y-2 relative">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground">Merchant Escrow Guaranteed</p>
                <p className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-[0.1em] leading-relaxed italic px-4">Funds are held in high-security escrow until the final asset delivery is approved by the client.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default SubmitBrief;
