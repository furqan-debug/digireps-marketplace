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
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Loader2, X, Plus, Upload, Trash2, User, Eye, Sparkles, ShieldCheck, Globe, Crown, Send, Award, CheckCircle, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Move, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getActivityStatus } from "@/lib/activity-status";
import { PortfolioProjectForm } from "@/components/freelancer/PortfolioProjectForm";

type PortfolioItem = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  role?: string | null;
  skills_deliverables?: string[];
  project_data?: any[];
};
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
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [experienceYears, setExperienceYears] = useState(profile?.experience_years?.toString() ?? "");
  const [skills, setSkills] = useState<string[]>(profile?.skills ?? []);
  const [skillInput, setSkillInput] = useState("");
  const [certifications, setCertifications] = useState<Certification[]>((profile as any)?.certifications ?? []);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isAdjustingAvatar, setIsAdjustingAvatar] = useState(false);
  const [tempAvatarFile, setTempAvatarFile] = useState<File | null>(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const avatarFileRef = useRef<HTMLInputElement>(null);

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
  const [isPortfolioFormOpen, setIsPortfolioFormOpen] = useState(false);
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Sync state with profile when it loads or changes
  useEffect(() => {
    if (profile) {
      if (!displayName) setDisplayName(profile.display_name ?? "");
      if (!headline) setHeadline((profile as any).headline ?? "");
      if (!bio) setBio(profile.bio ?? "");
      if (!experienceYears) setExperienceYears(profile.experience_years?.toString() ?? "");
      if (skills.length === 0) setSkills(profile.skills ?? []);
      if (certifications.length === 0) setCertifications((profile as any).certifications ?? []);
      if (profile.avatar_url && avatarUrl !== profile.avatar_url && !avatarPreview && !uploadingAvatar) {
        setAvatarUrl(profile.avatar_url);
      }

      // Handle timezone/country detection if they are still missing
      if (!timezone && profile.timezone) setTimezone(profile.timezone);
      if (!country && profile.country) setCountry(profile.country);

      if (!timezone && !profile.timezone) {
        setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
      }

      if (!country && !profile.country) {
        try {
          const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
          const locale = Intl.DateTimeFormat().resolvedOptions().locale;
          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";

          let detectedCountry = null;

          // 1. Priority: Guess from Timezone city (often more accurate for physical location than language)
          const countryMap: Record<string, string> = {
            'Karachi': 'Pakistan',
            'Islamabad': 'Pakistan',
            'Lahore': 'Pakistan',
            'Dubai': 'United Arab Emirates',
            'Abu_Dhabi': 'United Arab Emirates',
            'London': 'United Kingdom',
            'Riyadh': 'Saudi Arabia',
            'Singapore': 'Singapore',
            'Sydney': 'Australia',
            'Melbourne': 'Australia',
            'Mumbai': 'India',
            'Kolkata': 'India',
            'Delhi': 'India',
            'Berlin': 'Germany',
            'Paris': 'France',
            'Tokyo': 'Japan',
            'Seoul': 'South Korea',
            'Toronto': 'Canada',
            'Vancouver': 'Canada',
          };

          const city = tz.split('/').pop()?.replace('_', ' ');
          if (city) {
            for (const [key, value] of Object.entries(countryMap)) {
              if (city.includes(key)) {
                detectedCountry = value;
                break;
              }
            }
          }

          // 2. Fallback: Use locale region if timezone detection failed
          if (!detectedCountry) {
            const parts = locale.split(/[-_]/);
            const countryCode = parts.length > 1 ? parts[parts.length - 1].toUpperCase() : null;
            if (countryCode && countryCode.length === 2) {
              try {
                detectedCountry = regionNames.of(countryCode);
              } catch (e) { }
            }
          }

          if (detectedCountry) {
            console.log("✅ Country Auto-Detected:", detectedCountry, "from Timezone:", tz);
            setCountry(detectedCountry);
          } else {
            console.warn("❌ Country Auto-Detection Failed. Locale:", locale, "TZ:", tz);
          }
        } catch (e) {
          console.error("Failed to detect country", e);
        }
      }
    } else {
      // Still load defaults if user just landed
      if (!timezone) {
        const detectedTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        console.log("Detecting initial TZ:", detectedTz);
        setTimezone(detectedTz);
      }
    }
  }, [profile]);

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
        avatar_url: avatarUrl,
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

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Only image files are allowed", variant: "destructive" });
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setAvatarPreview(localUrl);
    setTempAvatarFile(file);
    setIsAdjustingAvatar(true);
    // Reset adjustments
    setZoom(1);
    setPosition({ x: 50, y: 50 });
  };

  const saveAvatarAdjusted = async () => {
    if (!tempAvatarFile || !user) return;

    // Clear adjusting state immediately
    setIsAdjustingAvatar(false);

    const fileName = `${user.id}/avatar-${Date.now()}-${tempAvatarFile.name}`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(fileName, tempAvatarFile, { upsert: true });

    if (upErr) {
      toast({ title: "Upload failed", description: upErr.message, variant: "destructive" });
      setUploadingAvatar(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(fileName);
    const newAvatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;

    console.log("✅ Avatar Uploaded Successfully. URL:", newAvatarUrl);

    // Update DB first
    await supabase.from("profiles").update({
      avatar_url: newAvatarUrl
    } as any).eq("user_id", user.id);

    // Explicitly update local state BEFORE refreshing profile to prevent flicker
    setAvatarUrl(newAvatarUrl);
    setAvatarPreview(null);
    setTempAvatarFile(null);

    // Refresh context
    await refreshProfile();

    setUploadingAvatar(false);
    toast({ title: "Profile photo updated!" });
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
                <div className="flex flex-col items-center gap-4 mb-8">
                  <input ref={avatarFileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                  <div className="relative group cursor-pointer" onClick={() => avatarFileRef.current?.click()}>
                    <div className="h-32 w-32 rounded-3xl bg-muted/20 border-2 border-dashed border-border/40 flex items-center justify-center overflow-hidden group-hover:border-primary/40 transition-all">
                      {(avatarPreview || avatarUrl) ? (
                        <img
                          src={avatarPreview || avatarUrl}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                          style={{
                            transform: `scale(${zoom})`,
                            objectPosition: `${position.x}% ${position.y}%`
                          }}
                          onError={(e) => {
                            const src = (e.target as HTMLImageElement).src;
                            console.error("❌ Identity Avatar Failed to Load. Src:", src);
                          }}
                          onLoad={() => {
                            console.log("🖼️ Identity Avatar Loaded Successfully");
                          }}
                        />
                      ) : (
                        <User className="h-12 w-12 text-muted-foreground/40" />
                      )}
                      {uploadingAvatar && (
                        <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-xl bg-primary text-primary-foreground shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Plus className="h-5 w-5" />
                    </div>
                  </div>
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Profile Photo</Label>
                </div>
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
                    <Input value={country} readOnly className="h-14 rounded-2xl bg-muted/10 border-border/20 px-6 font-medium text-muted-foreground" />
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
              <button onClick={() => setIsPortfolioFormOpen(true)} className="w-full rounded-2xl border-2 border-dashed border-border/40 hover:border-primary/40 bg-muted/10 hover:bg-primary/5 transition-all py-16 flex flex-col items-center gap-4 text-muted-foreground hover:text-primary">
                <div className="h-14 w-14 rounded-2xl bg-background border border-border/20 flex items-center justify-center">
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Plus className="h-5 w-5" />
                  </div>
                </div>
                <span className="text-sm font-bold">Add Portfolio Project</span>
              </button>
              {portfolio.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {portfolio.map((item) => (
                    <div key={item.id} className="relative group rounded-2xl overflow-hidden border border-border/40 aspect-video bg-muted/20">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/40">
                          <ImageIcon className="h-10 w-10" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all p-4 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <Badge className="bg-white/20 hover:bg-white/30 text-white border-0">{item.role || "Project"}</Badge>
                          <Button size="icon" variant="destructive" onClick={() => deletePortfolioItem(item)} className="h-8 w-8 rounded-lg">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="text-white">
                          <p className="font-bold text-sm truncate">{item.title}</p>
                          <p className="text-[10px] text-white/60 line-clamp-1">{item.description}</p>
                        </div>
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
                    {(avatarPreview || avatarUrl) ? (
                      <div className="h-16 w-16 rounded-2xl bg-background border-4 border-background overflow-hidden shadow-sm">
                        <img
                          src={avatarPreview || avatarUrl}
                          alt={displayName}
                          className="w-full h-full object-cover"
                          style={{
                            transform: `scale(${zoom})`,
                            objectPosition: `${position.x}% ${position.y}%`
                          }}
                          onError={(e) => {
                            const src = (e.target as HTMLImageElement).src;
                            console.error("❌ Review Avatar Failed to Load. Src:", src);
                          }}
                        />
                      </div>
                    ) : (
                      <div className="h-16 w-16 rounded-2xl bg-background border-4 border-background flex items-center justify-center font-display font-bold text-primary text-2xl shadow-sm">
                        {(displayName || "?")[0]?.toUpperCase()}
                      </div>
                    )}
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

        {/* Avatar Adjustment Dialog */}
        <Dialog open={isAdjustingAvatar} onOpenChange={setIsAdjustingAvatar}>
          <DialogContent className="sm:max-w-md rounded-[2rem]">
            <DialogHeader>
              <DialogTitle className="font-display">Adjust Profile Photo</DialogTitle>
            </DialogHeader>
            <div className="space-y-8 py-4">
              <div className="flex justify-center">
                <div className="h-48 w-48 rounded-full overflow-hidden border-4 border-primary/20 bg-muted/20 relative">
                  {avatarPreview && (
                    <img
                      src={avatarPreview}
                      alt="Crop Preview"
                      className="w-full h-full object-cover"
                      style={{
                        transform: `scale(${zoom})`,
                        objectPosition: `${position.x}% ${position.y}%`
                      }}
                    />
                  )}
                </div>
              </div>
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                    <div className="flex items-center gap-2"><ZoomOut className="h-3 w-3" /> Zoom</div>
                    <span>{Math.round(zoom * 100)}%</span>
                  </div>
                  <Slider value={[zoom]} min={1} max={3} step={0.1} onValueChange={([v]) => setZoom(v)} />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                    <div className="flex items-center gap-2"><Move className="h-3 w-3" /> Center (Horizontal)</div>
                    <span>{position.x}%</span>
                  </div>
                  <Slider value={[position.x]} min={0} max={100} step={1} onValueChange={([v]) => setPosition(p => ({ ...p, x: v }))} />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                    <div className="flex items-center gap-2"><Move className="h-3 w-3" /> Center (Vertical)</div>
                    <span>{position.y}%</span>
                  </div>
                  <Slider value={[position.y]} min={0} max={100} step={1} onValueChange={([v]) => setPosition(p => ({ ...p, y: v }))} />
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="ghost" onClick={() => { setIsAdjustingAvatar(false); setAvatarPreview(null); }} className="rounded-xl">Cancel</Button>
              <Button onClick={saveAvatarAdjusted} className="rounded-xl px-8">Save & Upload</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
                  <div className="flex flex-col sm:flex-row items-center gap-8 pb-8 border-b border-border/10">
                    <input ref={avatarFileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                    <div className="relative group cursor-pointer" onClick={() => avatarFileRef.current?.click()}>
                      <div className="h-32 w-32 rounded-3xl bg-muted/20 border-2 border-dashed border-border/40 flex items-center justify-center overflow-hidden group-hover:border-primary/40 transition-all">
                        {(avatarPreview || avatarUrl) ? (
                          <img
                            src={avatarPreview || avatarUrl}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                            style={{
                              transform: `scale(${zoom})`,
                              objectPosition: `${position.x}% ${position.y}%`
                            }}
                          />
                        ) : (
                          <User className="h-16 w-16 text-muted-foreground/40" />
                        )}
                        {uploadingAvatar && (
                          <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin" />
                          </div>
                        )}
                      </div>
                      <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-xl bg-primary text-primary-foreground shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Plus className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="space-y-2 text-center sm:text-left">
                      <h3 className="font-bold">Profile Photo</h3>
                      <p className="text-xs text-muted-foreground max-w-[200px]">Help clients recognize you. Upload a professional headshot.</p>
                      <Button variant="outline" size="sm" onClick={() => avatarFileRef.current?.click()} className="rounded-xl h-9 text-xs font-bold gap-2">
                        <Upload className="h-3.5 w-3.5" /> Replace Photo
                      </Button>
                    </div>
                  </div>
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
                  <button onClick={() => setIsPortfolioFormOpen(true)} className="w-full rounded-[2rem] border-2 border-dashed border-border/40 hover:border-primary/40 bg-muted/10 hover:bg-primary/5 transition-all py-16 flex flex-col items-center gap-4 text-muted-foreground hover:text-primary group">
                    <div className="h-16 w-16 rounded-2xl bg-background border border-border/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Plus className="h-8 w-8" />
                    </div>
                    <span className="text-sm font-bold uppercase tracking-widest text-primary">Add Portfolio Project</span>
                  </button>
                  <div className="grid gap-6 sm:grid-cols-2">
                    {portfolio.map((item) => (
                      <div key={item.id} className="relative group rounded-3xl overflow-hidden border border-border/40 shadow-sm bg-muted/20 aspect-video">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                            <ImageIcon className="h-12 w-12" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all p-6 flex flex-col justify-between">
                          <div className="flex justify-between items-start">
                            <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 text-[10px] uppercase font-bold tracking-wider">{item.role || "Project"}</Badge>
                            <Button size="icon" variant="destructive" onClick={() => deletePortfolioItem(item)} className="h-10 w-10 rounded-xl">
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>
                          <div className="text-white space-y-1">
                            <p className="font-display font-bold text-lg truncate">{item.title}</p>
                            <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">{item.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>

          {user && (
            <PortfolioProjectForm
              isOpen={isPortfolioFormOpen}
              onClose={() => setIsPortfolioFormOpen(false)}
              onSave={(item) => setPortfolio([...portfolio, item])}
              userId={user.id}
            />
          )}

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
                    {(avatarPreview || avatarUrl) ? (
                      <div className="h-20 w-20 rounded-[1.5rem] bg-background border-4 border-background overflow-hidden shadow-sm">
                        <img
                          src={avatarPreview || avatarUrl}
                          alt={displayName}
                          className="w-full h-full object-cover"
                          style={{
                            transform: `scale(${zoom})`,
                            objectPosition: `${position.x}% ${position.y}%`
                          }}
                        />
                      </div>
                    ) : (
                      <div className="h-20 w-20 rounded-[1.5rem] bg-background border-4 border-background flex items-center justify-center font-display font-bold text-primary text-3xl shadow-sm">
                        {(displayName || "?")[0]?.toUpperCase()}
                      </div>
                    )}
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
