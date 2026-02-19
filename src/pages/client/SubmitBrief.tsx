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
import { ArrowLeft, Loader2, Send, CheckCircle, Shield, Clock, Star, Sparkles, ShieldCheck } from "lucide-react";
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

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary mb-2">
              <Sparkles className="h-3 w-3" /> Project Initiation
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight">Deploy Engagement</h1>
            <p className="text-muted-foreground/60 text-sm font-medium">Drafting a strategic project brief for <strong className="text-foreground">{freelancerName}</strong></p>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-12 items-start">
          {/* Form */}
          <div className="space-y-10">
            <section className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="h-px w-8 bg-primary/40" />
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-primary">Brief Parameters</h2>
              </div>

              <Card className="rounded-[2.5rem] border-border/40 bg-card/60 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-10 space-y-8">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Service Domain</Label>
                    <Select value={categoryId} onValueChange={setCategoryId}>
                      <SelectTrigger className="h-14 rounded-2xl bg-muted/20 border-border/40 px-6 font-medium focus:ring-primary/20">
                        <SelectValue placeholder="Define category" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-border/40 backdrop-blur-xl">
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id} className="rounded-xl focus:bg-primary/5">{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Engagement Title</Label>
                    <Input id="title" placeholder="e.g. Design Elite Visual Identity for FinTech Series A" value={title} onChange={(e) => setTitle(e.target.value)} required className="h-14 rounded-2xl bg-muted/20 border-border/40 px-6 font-medium focus:ring-primary/20" />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Operational Scope</Label>
                    <Textarea id="description" placeholder="Articulate the primary objectives, key deliverables, and critical success factors..." value={description} onChange={(e) => setDescription(e.target.value)} rows={6} required className="rounded-2xl bg-muted/20 border-border/40 p-6 font-medium resize-none focus:ring-primary/20 leading-relaxed" />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Allocated Capital (USD, min $100)</Label>
                      <div className="relative">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/40 font-bold">$</span>
                        <Input id="budget" type="number" min="100" step="50" className="pl-10 h-14 rounded-2xl bg-muted/20 border-border/40 px-6 font-medium focus:ring-primary/20" placeholder="0.00" value={budget} onChange={(e) => setBudget(e.target.value)} required />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Target Completion</Label>
                      <Input id="deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} min={new Date().toISOString().split("T")[0]} className="h-14 rounded-2xl bg-muted/20 border-border/40 px-6 font-medium focus:ring-primary/20 appearance-none" />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-border/20">
                    <Button type="submit" onClick={handleSubmit} className="w-full h-16 rounded-[1.5rem] gap-3 bg-gradient-to-r from-primary to-primary-glow border-0 text-primary-foreground hover:scale-[1.02] transition-transform shadow-elegant text-sm font-bold uppercase tracking-widest" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <><Loader2 className="h-5 w-5 animate-spin" /> Transmitting...</>
                      ) : (
                        <><Send className="h-5 w-5" /> Dispatch Project Brief</>
                      )}
                    </Button>
                    <p className="text-[9px] font-bold text-muted-foreground/40 text-center uppercase tracking-widest mt-4">Security Protocol: Secured by DigiReps Merchant Escrow</p>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>

          {/* Side Info */}
          <div className="lg:sticky lg:top-12 space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-px w-6 bg-primary/40" />
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-primary">Engagement Target</h2>
            </div>

            <Card className="rounded-[2.5rem] border-primary/20 bg-gradient-to-b from-card to-muted/20 overflow-hidden shadow-elegant border-2 border-dashed">
              <CardContent className="p-8">
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 shrink-0 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center font-display font-bold text-primary text-2xl shadow-sm overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
                    {freelancerName[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg leading-tight">{freelancerName}</h3>
                    <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-primary mt-1">
                      <ShieldCheck className="h-3 w-3" />
                      Verified Elite
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center gap-3">
              <div className="h-px w-6 bg-primary/40" />
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-primary">Operational Protocol</h2>
            </div>

            <Card className="rounded-[2.5rem] border-border/40 bg-card/60 backdrop-blur-sm overflow-hidden p-8">
              <CardContent className="p-0 space-y-6">
                {nextSteps.map(({ icon: Icon, text }, i) => (
                  <div key={i} className="flex gap-4 group">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/10 text-primary group-hover:scale-110 transition-transform">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="space-y-1 pt-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-foreground">Phase {i + 1}</p>
                      <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest leading-relaxed">{text}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="p-8 rounded-[2rem] border-2 border-dashed border-border/20 text-center space-y-4">
              <div className="h-10 w-10 rounded-full bg-success/10 border border-success/20 flex items-center justify-center mx-auto">
                <ShieldCheck className="h-5 w-5 text-success" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-foreground">Payment Protection</p>
                <p className="text-[10px] font-medium text-muted-foreground/40 uppercase tracking-widest leading-relaxed italic">Funds are held in high-security escrow until you approve the final delivery.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default SubmitBrief;
