import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Send, Sparkles, ShieldCheck, Eye, Users, Award } from "lucide-react";
import { motion } from "framer-motion";

type Category = { id: string; name: string };

// Client-side contact detection (defense in depth)
const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i;
const PHONE_RE = /(\+?\d[\s-.]?){7,15}/;
const URL_RE = /https?:\/\/|www\.[^\s]+|[^\s]+\.(com|net|org|io|co|app|dev|me)/i;
const BLOCKED = ["gmail", "yahoo", "hotmail", "outlook", "whatsapp", "telegram", "instagram", "skype", "discord", "snapchat", "wechat", "signal"];
const SOCIAL = ["contact me", "reach me", "call me", "text me", "dm me", "message me on", "hit me up", "hmu", "add me", "my number", "my email", "my insta", "my snap", "off platform", "outside the app", "outside platform"];

function hasContactInfo(text: string): boolean {
  if (EMAIL_RE.test(text) || PHONE_RE.test(text) || URL_RE.test(text)) return true;
  const lower = text.toLowerCase();
  return BLOCKED.some(w => lower.includes(w)) || SOCIAL.some(p => lower.includes(p));
}

const PostProject = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [categoryId, setCategoryId] = useState("");

  useEffect(() => {
    supabase.from("service_categories").select("id, name").then(({ data }) => setCategories(data ?? []));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const budgetNum = parseFloat(budget);
    if (isNaN(budgetNum) || budgetNum < 100) {
      toast({ title: "Minimum budget is $100", variant: "destructive" });
      return;
    }
    if (!categoryId) {
      toast({ title: "Please select a service category", variant: "destructive" });
      return;
    }
    if (!title.trim() || !description.trim()) {
      toast({ title: "Title and description are required", variant: "destructive" });
      return;
    }

    // Client-side contact info check
    if (hasContactInfo(title) || hasContactInfo(description)) {
      toast({ title: "Contact information detected", description: "Sharing personal contact info is against platform rules.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    const { data: session } = await supabase.auth.getSession();
    const { data, error } = await supabase.functions.invoke("post-project", {
      body: {
        title: title.trim(),
        description: description.trim(),
        category_id: categoryId,
        budget: budgetNum,
        deadline: deadline ? new Date(deadline).toISOString() : null,
      },
      headers: { Authorization: `Bearer ${session?.session?.access_token}` },
    });

    setIsSubmitting(false);

    if (error) {
      toast({ title: "Failed to post project", description: error.message, variant: "destructive" });
      return;
    }

    if (data?.error) {
      toast({ title: "Database Error", description: data.error, variant: "destructive" });
      return;
    }

    if (data?.blocked) {
      toast({ title: "Content blocked", description: data.message, variant: "destructive" });
      return;
    }

    toast({ title: "Project posted!", description: "Freelancers can now browse and bid on your project." });
    navigate("/client/projects");
  };

  const steps = [
    { icon: Eye, text: "Your project is visible to all approved freelancers" },
    { icon: Users, text: "Freelancers submit competitive bids" },
    { icon: Award, text: "Award the best bid to start the order" },
    { icon: ShieldCheck, text: "Payment protected by DigiReps Escrow" },
  ];

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-10 pb-20">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back
          </button>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/5 border border-primary/20 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-4">
              <Sparkles className="h-3.5 w-3.5" /> Post a Project
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground">Post a Project</h1>
            <p className="text-muted-foreground text-base font-medium leading-relaxed max-w-2xl">
              Describe your project and let approved freelancers compete for the job.
            </p>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-12 items-start">
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
                    {categories.map(c => (
                      <SelectItem key={c.id} value={c.id} className="rounded-lg focus:bg-primary/5 py-3 font-medium">{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Project Title</Label>
                <Input placeholder="e.g. Redesign company website landing page" value={title} onChange={e => setTitle(e.target.value)} required className="h-14 rounded-xl bg-muted/20 border-border/10 px-6 font-medium text-sm tracking-tight focus:ring-primary/10 placeholder:text-muted-foreground/30" />
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Project Description</Label>
                <Textarea placeholder="Describe the project goals, deliverables, and any specific requirements..." value={description} onChange={e => setDescription(e.target.value)} rows={6} required className="rounded-2xl bg-muted/20 border-border/10 p-6 font-medium text-sm resize-none focus:ring-primary/10 leading-relaxed placeholder:text-muted-foreground/30" />
              </div>

              <div className="grid sm:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Budget (USD, min $100)</Label>
                  <div className="relative group">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/30 font-bold text-lg pointer-events-none group-focus-within:text-primary transition-colors">$</span>
                    <Input type="number" min="100" step="50" className="pl-12 h-14 rounded-xl bg-muted/20 border-border/10 px-6 font-medium text-sm tracking-tight focus:ring-primary/10" placeholder="0.00" value={budget} onChange={e => setBudget(e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Deadline (optional)</Label>
                  <Input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} min={new Date().toISOString().split("T")[0]} className="h-14 rounded-xl bg-muted/20 border-border/10 px-6 font-medium text-sm tracking-tight focus:ring-primary/10 appearance-none w-full" />
                </div>
              </div>

              <div className="pt-8 border-t border-border/10 space-y-4">
                <Button onClick={handleSubmit} className="w-full h-16 rounded-2xl gap-3 bg-primary text-primary-foreground hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20 text-xs font-bold uppercase tracking-widest" disabled={isSubmitting}>
                  {isSubmitting ? <><Loader2 className="h-5 w-5 animate-spin" /> Posting...</> : <><Send className="h-5 w-5" /> Post Project</>}
                </Button>
                <p className="text-[10px] font-medium text-muted-foreground/40 text-center">
                  Do not include any personal contact information. Violations may result in account suspension.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="lg:sticky lg:top-28 space-y-6">
            <div className="flex items-center gap-6">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">How It Works</h2>
              <div className="h-px flex-1 bg-border/40" />
            </div>

            <Card className="dossier-card rounded-3xl border border-border/40 bg-card overflow-hidden p-8 shadow-sm">
              <CardContent className="p-0 space-y-6">
                {steps.map(({ icon: Icon, text }, i) => (
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

            <div className="dossier-card p-8 rounded-3xl bg-card border border-border/40 shadow-sm text-center space-y-3 relative overflow-hidden">
              <div className="h-10 w-10 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center mx-auto">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1.5">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground">Safety First</p>
                <p className="text-[10px] font-medium text-muted-foreground/50 leading-relaxed px-4">All project descriptions are automatically scanned to protect your privacy.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default PostProject;
