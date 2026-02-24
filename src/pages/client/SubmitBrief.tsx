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
import { ArrowLeft, Loader2, Send, CheckCircle, Shield, Clock, Star, Sparkles, ShieldCheck, Zap } from "lucide-react";
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
      <div className="max-w-6xl mx-auto space-y-10 pb-20">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div className="space-y-4 relative">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/5 border border-primary/20 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-4">
              <Sparkles className="h-3.5 w-3.5" /> New Project
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Submit Project Brief
            </h1>
            <p className="text-muted-foreground text-base font-medium leading-relaxed max-w-2xl">
              Describe your project requirements for <strong className="text-primary font-bold">{freelancerName}</strong>.
            </p>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-12 items-start">
          {/* Form */}
          <div className="space-y-8">
            <Card className="dossier-card rounded-3xl border border-border/40 bg-card shadow-xl overflow-hidden relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary/5" />
              <CardContent className="p-8 sm:p-10 space-y-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Service Category</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger className="h-14 rounded-xl bg-muted/20 border-border/10 px-6 font-medium text-sm tracking-tight focus:ring-primary/10 transition-all">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border/40">
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id} className="rounded-lg focus:bg-primary/5 py-3 font-medium">{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Project Title</Label>
                  <Input id="title" placeholder="e.g. Redesign company website landing page" value={title} onChange={(e) => setTitle(e.target.value)} required className="h-14 rounded-xl bg-muted/20 border-border/10 px-6 font-medium text-sm tracking-tight focus:ring-primary/10 placeholder:text-muted-foreground/30" />
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Project Description</Label>
                  <Textarea id="description" placeholder="Describe the project goals, deliverables, and any specific requirements..." value={description} onChange={(e) => setDescription(e.target.value)} rows={6} required className="rounded-2xl bg-muted/20 border-border/10 p-6 font-medium text-sm resize-none focus:ring-primary/10 leading-relaxed placeholder:text-muted-foreground/30" />
                </div>

                <div className="grid sm:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Budget (USD, min $100)</Label>
                    <div className="relative group">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/30 font-bold text-lg pointer-events-none group-focus-within:text-primary transition-colors">$</span>
                      <Input id="budget" type="number" min="100" step="50" className="pl-12 h-14 rounded-xl bg-muted/20 border-border/10 px-6 font-medium text-sm tracking-tight focus:ring-primary/10" placeholder="0.00" value={budget} onChange={(e) => setBudget(e.target.value)} required />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Deadline</Label>
                    <Input id="deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} min={new Date().toISOString().split("T")[0]} className="h-14 rounded-xl bg-muted/20 border-border/10 px-6 font-medium text-sm tracking-tight focus:ring-primary/10 appearance-none w-full" />
                  </div>
                </div>

                <div className="pt-8 border-t border-border/10 space-y-4">
                  <Button type="submit" onClick={handleSubmit} className="w-full h-16 rounded-2xl gap-3 bg-primary text-primary-foreground hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20 text-xs font-bold uppercase tracking-widest" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <><Loader2 className="h-5 w-5 animate-spin" /> Submitting...</>
                    ) : (
                      <><Send className="h-5 w-5" /> Submit Brief</>
                    )}
                  </Button>
                  <p className="text-[10px] font-medium text-muted-foreground/40 text-center">
                    Your payment is protected by DigiReps Escrow until you approve delivery.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Side Info */}
          <div className="lg:sticky lg:top-12 space-y-6">
            <div className="flex items-center gap-6">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">Freelancer</h2>
              <div className="h-px flex-1 bg-border/40" />
            </div>

            <Card className="dossier-card rounded-3xl border border-border/40 bg-card overflow-hidden shadow-sm relative">
              <CardContent className="p-8">
                <div className="flex items-center gap-5">
                  <div className="relative h-16 w-16 shrink-0 rounded-2xl bg-muted border-[3px] border-card shadow-lg flex items-center justify-center font-display font-bold text-primary text-2xl overflow-hidden ring-4 ring-primary/5 transition-transform hover:scale-105 duration-500">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
                    {freelancerName[0]?.toUpperCase()}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-display font-bold text-lg tracking-tight leading-tight">{freelancerName}</h3>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-500/5 border border-blue-500/10">
                      <ShieldCheck className="h-3 w-3 text-blue-500" />
                      <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-blue-600">Verified</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center gap-6">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">How It Works</h2>
              <div className="h-px flex-1 bg-border/40" />
            </div>

            <Card className="dossier-card rounded-3xl border border-border/40 bg-card overflow-hidden p-8 shadow-sm">
              <CardContent className="p-0 space-y-6">
                {nextSteps.map(({ icon: Icon, text }, i) => (
                  <div key={i} className="flex gap-5 group">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted border border-border/20 text-muted-foreground/40 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-500">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="space-y-1 pt-1">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">Step {i + 1}</p>
                      <p className="text-[10px] font-medium text-muted-foreground/60 leading-relaxed">{text}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="dossier-card p-8 rounded-3xl bg-card border border-border/40 shadow-sm text-center space-y-3 relative overflow-hidden group">
              <div className="h-10 w-10 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center mx-auto">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1.5">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground">Escrow Protected</p>
                <p className="text-[10px] font-medium text-muted-foreground/50 leading-relaxed px-4">Funds are held securely until you approve the final delivery.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default SubmitBrief;
