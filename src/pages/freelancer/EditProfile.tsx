import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Loader2, X, Plus, Upload, Trash2, User, Eye, Sparkles, ShieldCheck, Globe, Crown, Send, Award, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getActivityStatus } from "@/lib/activity-status";

type PortfolioItem = { id: string; title: string; description: string | null; image_url: string };
type Certification = { name: string; issuer: string; year: number; verified: boolean };

const WIZARD_STEPS = ["Identity", "Expertise", "Credentials", "Portfolio", "Review"];

const EditProfile = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [headline, setHeadline] = useState((profile as any)?.headline ?? "");
  const [country, setCountry] = useState(profile?.country ?? "");
  const [timezone, setTimezone] = useState(profile?.timezone ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [experienceYears, setExperienceYears] = useState(profile?.experience_years?.toString() ?? "");
  const [skills, setSkills] = useState<string[]>(profile?.skills ?? []);
  const [skillInput, setSkillInput] = useState("");
  const [certifications, setCertifications] = useState<Certification[]>((profile as any)?.certifications ?? []);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Wizard state
  const isNewProfile = !profile?.bio && (!profile?.skills || profile.skills.length === 0);
  const [wizardStep, setWizardStep] = useState(0);

  // Cert form
  const [certName, setCertName] = useState("");
  const [certIssuer, setCertIssuer] = useState("");
  const [certYear, setCertYear] = useState(new Date().getFullYear().toString());

  const [allCategories, setAllCategories] = useState<{ id: string; name: string }[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Auto-detect timezone if empty
  useEffect(() => {
    if (!timezone) {
      setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("portfolio_items").select("*").eq("freelancer_id", user.id),
      supabase.from("service_categories").select("id, name"),
      supabase.from("freelancer_services").select("category_id").eq("freelancer_id", user.id),
    ]).then(([portRes, catRes, servRes]) => {
      setPortfolio(portRes.data ?? []);
      setAllCategories(catRes.data ?? []);
      setSelectedCategories(servRes.data?.map(s => s.category_id) ?? []);
    });
  }, [user]);

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) setSkills([...skills, s]);
    setSkillInput("");
  };
  const removeSkill = (s: string) => setSkills(skills.filter((x) => x !== s));

  const toggleCategory = (catId: string) => {
    setSelectedCategories(prev =>
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
  };

  const addCertification = () => {
    if (!certName.trim() || !certIssuer.trim()) return;
    setCertifications(prev => [...prev, { name: certName.trim(), issuer: certIssuer.trim(), year: parseInt(certYear) || new Date().getFullYear(), verified: false }]);
    setCertName("");
    setCertIssuer("");
    setCertYear(new Date().getFullYear().toString());
  };
  const removeCertification = (idx: number) => setCertifications(prev => prev.filter((_, i) => i !== idx));

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);

    try {
      const { error: profErr } = await supabase.from("profiles").update({
        display_name: displayName.trim(),
        headline: headline.trim() || null,
        country: country.trim(),
        timezone: timezone.trim(),
        bio: bio.trim(),
        experience_years: experienceYears ? parseInt(experienceYears) : null,
        skills,
        certifications: certifications as any,
      } as any).eq("user_id", user.id);

      if (profErr) throw profErr;

      await supabase.from("freelancer_services").delete().eq("freelancer_id", user.id);
      if (selectedCategories.length > 0) {
        const { error: catErr } = await supabase.from("freelancer_services").insert(
          selectedCategories.map(catId => ({ freelancer_id: user.id as string, category_id: catId }))
        );
        if (catErr) throw catErr;
      }

      await refreshProfile();
      toast({ title: "Profile saved!" });
    } catch (error: any) {
      toast({ title: "Failed to save profile", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitApplication = async () => {
    if (!user) return;
    if (!displayName.trim() || !bio.trim() || skills.length === 0 || selectedCategories.length === 0) {
      toast({ title: "Profile Incomplete", description: "Please provide a name, bio, skills, and at least one category.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    await handleSaveProfile();
    const { error } = await supabase.from("profiles").update({ application_status: "pending" }).eq("user_id", user.id);
    if (error) {
      toast({ title: "Submission failed", description: error.message, variant: "destructive" });
    } else {
      await refreshProfile();
      toast({ title: "Application Submitted!", description: "An elite specialist will review your credentials shortly." });
      navigate("/freelancer");
    }
    setSubmitting(false);
  };

  const handlePortfolioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Only image files are allowed", variant: "destructive" });
      return;
    }
    setUploadingPortfolio(true);
    const fileName = `${user.id}/${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase.storage.from("portfolio").upload(fileName, file, { upsert: false });
    if (upErr) {
      toast({ title: "Upload failed", description: upErr.message, variant: "destructive" });
      setUploadingPortfolio(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("portfolio").getPublicUrl(fileName);
    const { data: item, error: insErr } = await supabase.from("portfolio_items").insert({
      freelancer_id: user.id,
      image_url: urlData.publicUrl,
      title: file.name.replace(/\.[^.]+$/, ""),
    }).select().single();
    setUploadingPortfolio(false);
    if (insErr) {
      toast({ title: "Failed to save portfolio item", description: insErr.message, variant: "destructive" });
    } else {
      setPortfolio((prev) => [...prev, item as PortfolioItem]);
      toast({ title: "Image uploaded!" });
    }
  };

  const deletePortfolioItem = async (item: PortfolioItem) => {
    if (!user) return;
    await supabase.from("portfolio_items").delete().eq("id", item.id);
    setPortfolio((prev) => prev.filter((p) => p.id !== item.id));
    toast({ title: "Item removed" });
  };

  const activityStatus = getActivityStatus((profile as any)?.last_active_at ?? null);

  // === WIZARD MODE ===
  if (isNewProfile) {
    const progress = ((wizardStep + 1) / WIZARD_STEPS.length) * 100;

    const canProceed = () => {
      if (wizardStep === 0) return displayName.trim().length > 0;
      if (wizardStep === 1) return skills.length > 0 && selectedCategories.length > 0;
      return true;
    };

    const renderStep = () => {
      switch (wizardStep) {
        case 0:
          return (
            <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
              <div className="space-y-2">
                <h2 className="font-display text-3xl font-bold">Your Identity</h2>
                <p className="text-muted-foreground">Tell us who you are.</p>
              </div>
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Display Name *</Label>
                  <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your professional name" className="h-14 rounded-2xl bg-muted/20 border-border/40 px-6 font-medium" />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Professional Headline</Label>
                  <Input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="e.g. Senior Full-Stack Engineer" className="h-14 rounded-2xl bg-muted/20 border-border/40 px-6 font-medium" />
                </div>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Country</Label>
                    <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g. United Kingdom" className="h-14 rounded-2xl bg-muted/20 border-border/40 px-6 font-medium" />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Timezone (auto-detected)</Label>
                    <Input value={timezone} readOnly className="h-14 rounded-2xl bg-muted/10 border-border/20 px-6 font-medium text-muted-foreground" />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        case 1:
          return (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
              <div className="space-y-2">
                <h2 className="font-display text-3xl font-bold">Your Expertise</h2>
                <p className="text-muted-foreground">Define your skills and service areas.</p>
              </div>
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Experience Years</Label>
                  <Input type="number" min="0" max="50" value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} placeholder="e.g. 8" className="h-14 rounded-2xl bg-muted/20 border-border/40 px-6 font-medium" />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Bio</Label>
                  <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} placeholder="Describe your expertise..." className="rounded-2xl bg-muted/20 border-border/40 p-6 font-medium resize-none" />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Skills *</Label>
                  <div className="flex gap-3">
                    <Input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }} placeholder="Add skill and press Enter" className="h-14 rounded-2xl bg-muted/20 border-border/40 px-6 font-medium" />
                    <Button type="button" variant="outline" onClick={addSkill} className="h-14 w-14 rounded-2xl shrink-0"><Plus className="h-5 w-5" /></Button>
                  </div>
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {skills.map((s) => (
                        <div key={s} className="flex items-center gap-2 rounded-xl border border-border/40 bg-card px-4 py-2 text-xs font-bold">
                          {s}
                          <button onClick={() => removeSkill(s)} className="text-muted-foreground/40 hover:text-destructive"><X className="h-3 w-3" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Marketplace Segments *</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {allCategories.map((cat) => (
                      <button key={cat.id} onClick={() => toggleCategory(cat.id)} className={`p-4 rounded-2xl border-2 text-xs font-bold uppercase tracking-wider transition-all ${selectedCategories.includes(cat.id) ? "bg-primary/10 border-primary text-primary" : "bg-muted/10 border-border/40 text-muted-foreground hover:border-primary/20"}`}>
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        case 2:
          return (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
              <div className="space-y-2">
                <h2 className="font-display text-3xl font-bold">Credentials</h2>
                <p className="text-muted-foreground">Add certifications to boost your credibility.</p>
              </div>
              <div className="space-y-6">
                <Card className="rounded-2xl border-border/40">
                  <CardContent className="p-6 space-y-4">
                    <div className="grid sm:grid-cols-3 gap-4">
                      <Input value={certName} onChange={(e) => setCertName(e.target.value)} placeholder="Certification name" className="h-12 rounded-xl bg-muted/20 border-border/40 px-4 font-medium" />
                      <Input value={certIssuer} onChange={(e) => setCertIssuer(e.target.value)} placeholder="Issuing organization" className="h-12 rounded-xl bg-muted/20 border-border/40 px-4 font-medium" />
                      <div className="flex gap-2">
                        <Input type="number" value={certYear} onChange={(e) => setCertYear(e.target.value)} placeholder="Year" className="h-12 rounded-xl bg-muted/20 border-border/40 px-4 font-medium" />
                        <Button type="button" onClick={addCertification} className="h-12 rounded-xl shrink-0"><Plus className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {certifications.length > 0 && (
                  <div className="space-y-3">
                    {certifications.map((cert, idx) => (
                      <div key={idx} className="flex items-center justify-between p-5 rounded-2xl border border-border/40 bg-card">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            {cert.verified ? <CheckCircle className="h-5 w-5 text-primary" /> : <Award className="h-5 w-5 text-muted-foreground" />}
                          </div>
                          <div>
                            <p className="font-bold text-sm">{cert.name}</p>
                            <p className="text-xs text-muted-foreground">{cert.issuer} · {cert.year}</p>
                          </div>
                        </div>
                        <button onClick={() => removeCertification(idx)} className="text-muted-foreground/40 hover:text-destructive"><X className="h-4 w-4" /></button>
                      </div>
                    ))}
                  </div>
                )}

                {certifications.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground/40">
                    <Award className="h-10 w-10 mx-auto mb-3 opacity-40" />
                    <p className="text-sm font-bold">No certifications yet</p>
                    <p className="text-xs mt-1">This step is optional — you can add them later.</p>
                  </div>
                )}
              </div>
            </motion.div>
          );
        case 3:
          return (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
              <div className="space-y-2">
                <h2 className="font-display text-3xl font-bold">Portfolio</h2>
                <p className="text-muted-foreground">Showcase your best work.</p>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePortfolioUpload} />
              <button onClick={() => fileRef.current?.click()} disabled={uploadingPortfolio} className="w-full rounded-2xl border-2 border-dashed border-border/40 hover:border-primary/40 bg-muted/10 hover:bg-primary/5 transition-all py-16 flex flex-col items-center gap-4 text-muted-foreground hover:text-primary">
                <div className="h-14 w-14 rounded-2xl bg-background border border-border/20 flex items-center justify-center">
                  {uploadingPortfolio ? <Loader2 className="h-7 w-7 animate-spin" /> : <Upload className="h-7 w-7" />}
                </div>
                <span className="text-sm font-bold">{uploadingPortfolio ? "Uploading..." : "Upload Image"}</span>
              </button>
              {portfolio.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {portfolio.map((item) => (
                    <div key={item.id} className="relative group rounded-2xl overflow-hidden border border-border/40 aspect-video">
                      <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                        <Button size="sm" variant="destructive" onClick={() => deletePortfolioItem(item)} className="rounded-xl gap-2 text-xs font-bold">
                          <Trash2 className="h-4 w-4" /> Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          );
        case 4:
          return (
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
              <div className="space-y-2">
                <h2 className="font-display text-3xl font-bold">Review & Submit</h2>
                <p className="text-muted-foreground">Review your profile before submitting for approval.</p>
              </div>
              <Card className="rounded-2xl border-border/40 overflow-hidden">
                <div className="h-20 bg-gradient-to-r from-primary to-primary/60" />
                <CardContent className="px-8 pb-8">
                  <div className="-mt-8 mb-6">
                    <div className="h-16 w-16 rounded-2xl bg-background border-4 border-background flex items-center justify-center font-display font-bold text-primary text-2xl shadow-sm">
                      {(displayName || "?")[0]?.toUpperCase()}
                    </div>
                  </div>
                  <h3 className="font-display text-2xl font-bold">{displayName}</h3>
                  {headline && <p className="text-muted-foreground font-medium">{headline}</p>}
                  {country && <p className="text-xs text-muted-foreground/60 mt-1">{country} · {timezone}</p>}
                  {bio && <p className="text-sm text-muted-foreground mt-4 italic line-clamp-3">"{bio}"</p>}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {skills.slice(0, 5).map(s => <Badge key={s} variant="secondary" className="rounded-lg text-[10px]">{s}</Badge>)}
                    {skills.length > 5 && <Badge variant="secondary" className="rounded-lg text-[10px]">+{skills.length - 5}</Badge>}
                  </div>
                  {certifications.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border/20">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-2">Certifications</p>
                      {certifications.map((c, i) => <p key={i} className="text-xs text-foreground">{c.name} — {c.issuer} ({c.year})</p>)}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground/60 mt-4">{portfolio.length} portfolio item(s) · {selectedCategories.length} segment(s)</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        default:
          return null;
      }
    };

    return (
      <AppShell>
        <div className="max-w-3xl mx-auto space-y-8 pb-20">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
                <Sparkles className="h-3 w-3" /> Profile Setup
              </div>
              <Progress value={progress} className="h-2 rounded-full" />
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                {WIZARD_STEPS.map((s, i) => (
                  <span key={s} className={i <= wizardStep ? "text-primary" : ""}>{s}</span>
                ))}
              </div>
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setWizardStep(Math.max(0, wizardStep - 1))} disabled={wizardStep === 0} className="rounded-2xl h-12 gap-2">
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>
            {wizardStep < WIZARD_STEPS.length - 1 ? (
              <Button onClick={() => setWizardStep(wizardStep + 1)} disabled={!canProceed()} className="rounded-2xl h-12 gap-2">
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmitApplication} disabled={submitting} className="rounded-2xl h-12 gap-2 bg-gradient-to-r from-primary to-primary/80">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Submit Application
              </Button>
            )}
          </div>
        </div>
      </AppShell>
    );
  }

  // === RETURNING FREELANCER — FULL EDIT MODE ===
  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-12 pb-20">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/40">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary mb-2">
                <Sparkles className="h-3 w-3" /> Identity Office
              </div>
              <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight">Elite Profile</h1>
              <p className="text-muted-foreground/60 text-sm font-medium">Refine your commercial presence to attract high-tier engagements.</p>
            </div>
            <div className="flex flex-wrap gap-4">
              {!profile?.application_status && (
                <Button onClick={handleSubmitApplication} disabled={submitting} variant="outline" className="rounded-2xl h-14 px-8 gap-3 border-primary/30 text-primary hover:bg-primary/5 shadow-sm text-sm font-bold">
                  {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  Submit Application
                </Button>
              )}
              <Button onClick={handleSaveProfile} disabled={saving} className="rounded-2xl h-14 px-10 gap-3 bg-gradient-to-r from-primary to-primary/80 border-0 text-primary-foreground hover:scale-[1.02] transition-transform shadow-elegant text-sm font-bold">
                {saving ? <><Loader2 className="h-5 w-5 animate-spin" />Saving...</> : <><ShieldCheck className="h-5 w-5" /> Save Changes</>}
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-12 items-start">
          {/* Left: Form */}
          <div className="space-y-10">
            <section className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="h-px w-8 bg-primary/40" />
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-primary">Core Identity</h2>
              </div>
              <Card className="rounded-[2.5rem] border-border/40 bg-card/60 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-10 space-y-8">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Marketplace Segments</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {allCategories.map((cat) => (
                        <button key={cat.id} onClick={() => toggleCategory(cat.id)} className={`flex items-center justify-center p-4 rounded-2xl border-2 transition-all text-xs font-bold uppercase tracking-wider ${selectedCategories.includes(cat.id) ? "bg-primary/10 border-primary text-primary shadow-sm" : "bg-muted/10 border-border/40 text-muted-foreground hover:border-primary/20"}`}>
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3 pt-4 border-t border-border/10">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Display Name</Label>
                    <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" className="h-14 rounded-2xl bg-muted/20 border-border/40 px-6 font-medium" />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Professional Headline</Label>
                    <Input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="e.g. Senior Full-Stack Engineer" className="h-14 rounded-2xl bg-muted/20 border-border/40 px-6 font-medium" />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Country</Label>
                      <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g. United Kingdom" className="h-14 rounded-2xl bg-muted/20 border-border/40 px-6 font-medium" />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Timezone</Label>
                      <Input value={timezone} readOnly className="h-14 rounded-2xl bg-muted/10 border-border/20 px-6 font-medium text-muted-foreground" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Experience Years</Label>
                    <Input type="number" min="0" max="50" value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} className="h-14 rounded-2xl bg-muted/20 border-border/40 px-6 font-medium" />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Bio</Label>
                    <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={5} placeholder="Your professional narrative..." className="rounded-2xl bg-muted/20 border-border/40 p-6 font-medium resize-none" />
                  </div>
                  <div className="space-y-6 pt-4 border-t border-border/20">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Skills</Label>
                      {skills.length > 0 && <Badge className="bg-primary/10 text-primary border-0 rounded-lg px-2 text-[10px] font-bold">{skills.length} skills</Badge>}
                    </div>
                    <div className="flex gap-3">
                      <Input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }} placeholder="Add skill" className="h-14 rounded-2xl bg-muted/20 border-border/40 px-6 font-medium" />
                      <Button type="button" variant="outline" onClick={addSkill} className="h-14 w-14 rounded-2xl shrink-0"><Plus className="h-6 w-6" /></Button>
                    </div>
                    {skills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {skills.map((s) => (
                          <div key={s} className="flex items-center gap-3 rounded-xl border border-border/40 bg-card px-4 py-2 text-xs font-bold">
                            {s}
                            <button onClick={() => removeSkill(s)} className="text-muted-foreground/40 hover:text-destructive"><X className="h-3 w-3" /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Certifications Section */}
            <section className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="h-px w-8 bg-primary/40" />
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-primary">Certifications</h2>
              </div>
              <Card className="rounded-[2.5rem] border-border/40 bg-card/60 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-10 space-y-6">
                  <div className="grid sm:grid-cols-3 gap-4">
                    <Input value={certName} onChange={(e) => setCertName(e.target.value)} placeholder="Certification name" className="h-12 rounded-xl bg-muted/20 border-border/40 px-4 font-medium" />
                    <Input value={certIssuer} onChange={(e) => setCertIssuer(e.target.value)} placeholder="Issuer" className="h-12 rounded-xl bg-muted/20 border-border/40 px-4 font-medium" />
                    <div className="flex gap-2">
                      <Input type="number" value={certYear} onChange={(e) => setCertYear(e.target.value)} placeholder="Year" className="h-12 rounded-xl bg-muted/20 border-border/40 px-4 font-medium" />
                      <Button onClick={addCertification} className="h-12 rounded-xl shrink-0"><Plus className="h-4 w-4" /></Button>
                    </div>
                  </div>
                  {certifications.map((cert, idx) => (
                    <div key={idx} className="flex items-center justify-between p-5 rounded-2xl border border-border/40 bg-muted/10">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          {cert.verified ? <CheckCircle className="h-5 w-5 text-primary" /> : <Award className="h-5 w-5 text-muted-foreground" />}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{cert.name}</p>
                          <p className="text-xs text-muted-foreground">{cert.issuer} · {cert.year}</p>
                        </div>
                        {cert.verified && <Badge className="bg-primary/10 text-primary border-0 rounded-lg text-[10px] font-bold ml-2">Verified</Badge>}
                      </div>
                      <button onClick={() => removeCertification(idx)} className="text-muted-foreground/40 hover:text-destructive"><X className="h-4 w-4" /></button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </section>

            {/* Portfolio */}
            <section className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="h-px w-8 bg-primary/40" />
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-primary">Portfolio</h2>
              </div>
              <Card className="rounded-[2.5rem] border-border/40 bg-card/60 backdrop-blur-sm overflow-hidden p-10">
                <CardContent className="p-0 space-y-8">
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePortfolioUpload} />
                  <button onClick={() => fileRef.current?.click()} disabled={uploadingPortfolio} className="w-full rounded-[2rem] border-2 border-dashed border-border/40 hover:border-primary/40 bg-muted/10 hover:bg-primary/5 transition-all py-16 flex flex-col items-center gap-4 text-muted-foreground hover:text-primary group">
                    <div className="h-16 w-16 rounded-2xl bg-background border border-border/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      {uploadingPortfolio ? <Loader2 className="h-8 w-8 animate-spin" /> : <Upload className="h-8 w-8" />}
                    </div>
                    <span className="text-sm font-bold uppercase tracking-widest">{uploadingPortfolio ? "Uploading..." : "Upload Case Study"}</span>
                  </button>
                  <div className="grid gap-6 sm:grid-cols-2">
                    {portfolio.map((item) => (
                      <div key={item.id} className="relative group rounded-3xl overflow-hidden border border-border/40 shadow-sm bg-muted/20 aspect-video">
                        <img src={item.image_url} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                          <Button size="sm" variant="destructive" onClick={() => deletePortfolioItem(item)} className="rounded-xl px-6 gap-2 font-bold text-xs">
                            <Trash2 className="h-4 w-4" /> Remove
                          </Button>
                        </div>
                        {item.title && (
                          <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-background/80 backdrop-blur-md border border-white/20 text-[10px] font-bold uppercase tracking-widest truncate">
                            {item.title}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>

          {/* Right: Identity Preview */}
          <div className="lg:sticky lg:top-12 space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-px w-6 bg-primary/40" />
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-primary">Identity Preview</h2>
            </div>
            <Card className="rounded-[2.5rem] border-primary/20 bg-gradient-to-b from-card to-muted/20 overflow-hidden shadow-elegant border-2 border-dashed">
              <div className="h-24 bg-gradient-to-br from-primary via-primary/60 to-accent relative isolate">
                <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />
              </div>
              <CardContent className="px-8 pb-10">
                <div className="-mt-12 mb-6">
                  <div className="relative inline-block">
                    <div className="h-20 w-20 rounded-[1.5rem] bg-background border-4 border-background flex items-center justify-center font-display font-bold text-primary text-3xl shadow-sm">
                      {(displayName || "?")[0]?.toUpperCase()}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 h-6 w-6 rounded-lg ${activityStatus.color} border-2 border-background shadow-sm flex items-center justify-center`}>
                      <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="space-y-1">
                    <h3 className="font-display font-bold text-2xl tracking-tight">{displayName || "Elite Partner"}</h3>
                    {headline && <p className="text-sm text-muted-foreground font-medium">{headline}</p>}
                    {country && (
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                        <Globe className="h-3.5 w-3.5" />{country}
                      </div>
                    )}
                  </div>
                  {bio && <p className="text-xs text-muted-foreground font-medium leading-relaxed italic line-clamp-4">"{bio}"</p>}
                  <div className="space-y-4 pt-4 border-t border-border/10">
                    <div className="flex flex-wrap gap-1.5">
                      {selectedCategories.map((catId) => {
                        const cat = allCategories.find(c => c.id === catId);
                        return cat ? <div key={cat.id} className="px-2.5 py-1 rounded-lg bg-primary text-primary-foreground text-[8px] font-bold uppercase tracking-widest">{cat.name}</div> : null;
                      })}
                      {skills.slice(0, 3).map((s) => <div key={s} className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest">{s}</div>)}
                      {skills.length > 3 && <div className="px-2.5 py-1 rounded-lg bg-muted text-muted-foreground text-[10px] font-bold uppercase tracking-widest">+{skills.length - 3}</div>}
                    </div>
                    {certifications.length > 0 && (
                      <div className="pt-2 border-t border-border/10">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-2">Credentials</p>
                        {certifications.slice(0, 2).map((c, i) => (
                          <div key={i} className="flex items-center gap-2 text-[10px] mb-1">
                            {c.verified ? <CheckCircle className="h-3 w-3 text-primary" /> : <Award className="h-3 w-3 text-muted-foreground/40" />}
                            <span className="font-bold">{c.name}</span>
                          </div>
                        ))}
                        {certifications.length > 2 && <p className="text-[9px] text-muted-foreground/40">+{certifications.length - 2} more</p>}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center">
                        <Crown className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-foreground">
                          {profile?.application_status === "approved" ? "Elite Verified" : "Awaiting Vetting"}
                        </p>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">
                          {activityStatus.label}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default EditProfile;
