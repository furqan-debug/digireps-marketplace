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
import { ArrowLeft, Loader2, Send } from "lucide-react";

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
    supabase.from("service_categories").select("id, name").then(({ data }) =>
      setCategories(data ?? [])
    );
    if (freelancerId) {
      supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", freelancerId)
        .single()
        .then(({ data }) => {
          if (data) setFreelancerName(data.display_name);
        });
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
    const { data, error } = await supabase
      .from("orders")
      .insert({
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
      })
      .select("id")
      .single();

    setIsSubmitting(false);

    if (error) {
      toast({ title: "Failed to submit brief", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Project brief sent!", description: `${freelancerName} will review your request.` });
    navigate(`/client/orders`);
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div>
          <h1 className="font-display text-3xl font-bold">Submit Project Brief</h1>
          <p className="text-muted-foreground mt-1">Send a project invitation to {freelancerName}</p>
        </div>

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
                  <SelectTrigger>
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
                <Input
                  id="title"
                  placeholder="e.g. Build a landing page for my SaaS"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Project Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the scope, requirements, expected deliverables..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  required
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budget">Budget (USD, min $100)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                    <Input
                      id="budget"
                      type="number"
                      min="100"
                      step="50"
                      className="pl-7"
                      placeholder="500"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline">Deadline (optional)</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
                {isSubmitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</>
                ) : (
                  <><Send className="h-4 w-4" /> Send Project Brief</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
};

export default SubmitBrief;
