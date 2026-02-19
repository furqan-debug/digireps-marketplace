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
import { ArrowLeft, Loader2, Send, CheckCircle, Shield, Clock, Star } from "lucide-react";
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
      <div className="max-w-5xl mx-auto space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Progress indicator */}
          <div className="flex items-center gap-2 mb-4">
            <div className="h-7 w-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">1</div>
            <div className="h-0.5 flex-1 bg-border" />
            <div className="h-7 w-7 rounded-full bg-muted text-muted-foreground text-xs font-bold flex items-center justify-center">2</div>
          </div>

          <h1 className="font-display text-3xl font-bold">Submit Project Brief</h1>
          <p className="text-muted-foreground mt-1">Send a project invitation to <strong>{freelancerName}</strong></p>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Project Details</CardTitle>
              <CardDescription>Describe what you need. Be specific to get the best results.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label>Service Category</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Project Title</Label>
                  <Input id="title" placeholder="e.g. Build a landing page for my SaaS" value={title} onChange={(e) => setTitle(e.target.value)} required className="h-11" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Project Description</Label>
                  <Textarea id="description" placeholder="Describe the scope, requirements, expected deliverables..." value={description} onChange={(e) => setDescription(e.target.value)} rows={5} required />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget <span className="text-muted-foreground">(USD, min $100)</span></Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">$</span>
                      <Input id="budget" type="number" min="100" step="50" className="pl-7 h-11" placeholder="500" value={budget} onChange={(e) => setBudget(e.target.value)} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deadline">Deadline <span className="text-muted-foreground">(optional)</span></Label>
                    <Input id="deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} min={new Date().toISOString().split("T")[0]} className="h-11" />
                  </div>
                </div>

                <Button type="submit" className="w-full h-11 gap-2 bg-gradient-to-r from-primary to-primary-glow border-0 text-primary-foreground hover:opacity-90 shadow-elegant" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</>
                  ) : (
                    <><Send className="h-4 w-4" /> Send Project Brief</>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Summary panel */}
          <div className="space-y-4">
            <Card className="bg-muted/30 border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="font-display text-base">Sending to</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary-glow/20 font-display font-bold text-primary text-base">
                    {freelancerName[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{freelancerName}</p>
                    <p className="text-xs text-muted-foreground">Vetted Freelancer</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="font-display text-base">What happens next?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {nextSteps.map(({ icon: Icon, text }, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 mt-0.5">
                      <Icon className="h-3 w-3 text-primary" />
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{text}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default SubmitBrief;
