import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Loader2, X, Plus, Upload, Trash2, User, Sparkles, ShieldCheck, Globe,
  Send, Award, CheckCircle, ChevronLeft, ChevronRight, ZoomIn, Move,
  Clock, Briefcase, ArrowRight, Image as ImageIcon, AlertCircle, Save,
  GraduationCap, Languages as LanguagesIcon, DollarSign, FolderOpen
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getActivityStatus } from "@/lib/activity-status";
import { PortfolioProjectForm } from "@/components/freelancer/PortfolioProjectForm";
import { useIsMobile } from "@/hooks/use-mobile";

// ─── Types ───
type PortfolioItem = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  role?: string | null;
  skills_deliverables?: string[];
  project_data?: Record<string, unknown>[];
};
type WorkExperience = { title: string; company: string; description: string; start_year: number; end_year: number | null; is_current: boolean };
type Education = { degree: string; institution: string; year: number };
type Language = { language: string; proficiency: "native" | "fluent" | "conversational" | "basic" };
type Certification = { name: string; issuer: string; year: number; verified: boolean };

// ─── Constants ───
const WIZARD_STEPS = [
  { key: "identity", label: "Identity", icon: User },
  { key: "expertise", label: "Expertise", icon: Sparkles },
  { key: "work", label: "Work", icon: Briefcase },
  { key: "education", label: "Education", icon: GraduationCap },
  { key: "languages", label: "Languages", icon: LanguagesIcon },
  { key: "pricing", label: "Pricing", icon: DollarSign },
  { key: "portfolio", label: "Portfolio", icon: FolderOpen },
  { key: "review", label: "Review", icon: ShieldCheck },
];
const PROFICIENCY_LEVELS = ["native", "fluent", "conversational", "basic"] as const;

// ─── Completeness scoring (mirrors DB trigger exactly) ───
function calculateCompleteness(data: {
  displayName: string; avatarUrl: string; bio: string; headline: string;
  skills: string[]; workExperience: WorkExperience[]; education: Education[];
  languages: Language[]; certifications: Certification[]; portfolioCount: number;
}): number {
  let score = 0;
  if (data.displayName.trim()) score += 10;
  if (data.avatarUrl.trim()) score += 10;
  if (data.bio.trim().length >= 50) score += 15;
  if (data.headline.trim()) score += 5;
  if (data.skills.length >= 3) score += 15;
  if (data.workExperience.length > 0) score += 15;
  if (data.education.length > 0) score += 5;
  if (data.languages.length > 0) score += 5;
  if (data.certifications.length > 0) score += 5;
  if (data.portfolioCount > 0) score += 15;
  return score;
}

// ─── Section wrapper for edit mode ───
const SectionHeader = ({ title }: { title: string }) => (
  <div className="flex items-center gap-4 mb-4">
    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border/40 to-transparent" />
    <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-primary whitespace-nowrap">{title}</h2>
    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border/40 to-transparent" />
  </div>
);

const EditProfile = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // ─── Form state ───
  const [displayName, setDisplayName] = useState("");
  const [headline, setHeadline] = useState("");
  const [country, setCountry] = useState("");
  const [timezone, setTimezone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bio, setBio] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [workExperience, setWorkExperience] = useState<WorkExperience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [availabilityStatus, setAvailabilityStatus] = useState("available");
  const [preferredPricingModel, setPreferredPricingModel] = useState("");
  const [responseTimeExpectation, setResponseTimeExpectation] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");

  // ─── UI state ───
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isAdjustingAvatar, setIsAdjustingAvatar] = useState(false);
  const [tempAvatarFile, setTempAvatarFile] = useState<File | null>(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const avatarFileRef = useRef<HTMLInputElement>(null);
  const [wizardStep, setWizardStep] = useState(0);

  // ─── Controlled "add" form states (replaces getElementById) ───
  const [weForm, setWeForm] = useState({ title: "", company: "", description: "", start_year: "", end_year: "", is_current: false });
  const [eduForm, setEduForm] = useState({ degree: "", institution: "", year: "" });
  const [langForm, setLangForm] = useState({ language: "", proficiency: "fluent" as Language["proficiency"] });
  const [certName, setCertName] = useState("");
  const [certIssuer, setCertIssuer] = useState("");
  const [certYear, setCertYear] = useState(new Date().getFullYear().toString());

  // ─── Categories & portfolio ───
  const [allCategories, setAllCategories] = useState<{ id: string; name: string }[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [isPortfolioFormOpen, setIsPortfolioFormOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // ─── Wizard mode detection (Bug #3 fix) ───
  const isWizardMode = !profile?.application_status ||
    profile.application_status === "draft" ||
    profile.application_status === "revision_required";

  // ─── Sync state from profile ───
  useEffect(() => {
    if (!profile) {
      if (!timezone) setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
      return;
    }
    setDisplayName(profile.display_name ?? "");
    setHeadline(profile.headline ?? "");
    setBio(profile.bio ?? "");
    setExperienceYears(profile.experience_years?.toString() ?? "");
    setSkills(profile.skills ?? []);
    setCertifications(profile.certifications ?? []);
    setWorkExperience(profile.work_experience ?? []);
    setEducation(profile.education ?? []);
    setLanguages(profile.languages ?? []);
    setAvailabilityStatus(profile.availability_status ?? "available");
    setPreferredPricingModel(profile.preferred_pricing_model ?? "");
    setResponseTimeExpectation(profile.response_time_expectation ?? "");
    setHourlyRate(profile.hourly_rate?.toString() ?? "");
    if (profile.avatar_url) setAvatarUrl(profile.avatar_url);
    setTimezone(profile.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone);
    setCountry(profile.country ?? "");

    // Auto-detect country if missing
    if (!profile.country) {
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
        const countryMap: Record<string, string> = {
          Karachi: "Pakistan", Islamabad: "Pakistan", Dubai: "United Arab Emirates",
          London: "United Kingdom", Riyadh: "Saudi Arabia", Singapore: "Singapore",
          Sydney: "Australia", Mumbai: "India", Berlin: "Germany", Paris: "France",
          Tokyo: "Japan", Seoul: "South Korea", Toronto: "Canada",
        };
        const city = tz.split("/").pop()?.replace("_", " ");
        if (city) {
          for (const [key, value] of Object.entries(countryMap)) {
            if (city.includes(key)) { setCountry(value); break; }
          }
        }
      } catch { /* ignore */ }
    }
  }, [profile]);

  // ─── Fetch categories & portfolio ───
  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("portfolio_items").select("*").eq("freelancer_id", user.id),
      supabase.from("service_categories").select("id, name"),
      supabase.from("freelancer_services").select("category_id").eq("freelancer_id", user.id),
    ]).then(([portRes, catRes, servRes]) => {
      setPortfolio((portRes.data ?? []) as unknown as PortfolioItem[]);
      setAllCategories(catRes.data ?? []);
      setSelectedCategories(servRes.data?.map(s => s.category_id) ?? []);
    });
  }, [user]);

  // ─── Computed completeness ───
  const completeness = calculateCompleteness({
    displayName, avatarUrl, bio, headline, skills,
    workExperience, education, languages, certifications,
    portfolioCount: portfolio.length,
  });

  // ─── Skill helpers ───
  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) setSkills([...skills, s]);
    setSkillInput("");
  };
  const removeSkill = (s: string) => setSkills(skills.filter(x => x !== s));
  const toggleCategory = (catId: string) => {
    setSelectedCategories(prev => prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]);
  };

  // ─── Add helpers (controlled forms) ───
  const addWorkExperience = () => {
    if (!weForm.title.trim() || !weForm.company.trim() || !weForm.start_year) return;
    setWorkExperience(prev => [...prev, {
      title: weForm.title.trim(), company: weForm.company.trim(),
      description: weForm.description.trim(), start_year: parseInt(weForm.start_year),
      end_year: weForm.is_current ? null : (weForm.end_year ? parseInt(weForm.end_year) : null),
      is_current: weForm.is_current,
    }]);
    setWeForm({ title: "", company: "", description: "", start_year: "", end_year: "", is_current: false });
  };

  const addEducation = () => {
    if (!eduForm.degree.trim() || !eduForm.institution.trim() || !eduForm.year) return;
    setEducation(prev => [...prev, { degree: eduForm.degree.trim(), institution: eduForm.institution.trim(), year: parseInt(eduForm.year) }]);
    setEduForm({ degree: "", institution: "", year: "" });
  };

  const addLanguage = () => {
    if (!langForm.language.trim()) return;
    setLanguages(prev => [...prev, { language: langForm.language.trim(), proficiency: langForm.proficiency }]);
    setLangForm({ language: "", proficiency: "fluent" });
  };

  const addCertification = () => {
    if (!certName.trim() || !certIssuer.trim()) return;
    setCertifications(prev => [...prev, { name: certName.trim(), issuer: certIssuer.trim(), year: parseInt(certYear) || new Date().getFullYear(), verified: false }]);
    setCertName(""); setCertIssuer(""); setCertYear(new Date().getFullYear().toString());
  };

  // ─── Save profile (Bug #2 fix: uses user_id) ───
  const handleSaveProfile = async (silent = false) => {
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
        certifications: certifications as unknown as Record<string, unknown>[],
        work_experience: workExperience as unknown as Record<string, unknown>[],
        education: education as unknown as Record<string, unknown>[],
        languages: languages as unknown as Record<string, unknown>[],
        hourly_rate: hourlyRate ? parseFloat(hourlyRate) : null,
        availability_status: availabilityStatus,
        preferred_pricing_model: preferredPricingModel || null,
        response_time_expectation: responseTimeExpectation || null,
      } as Record<string, unknown>).eq("user_id", user.id);

      if (profErr) throw profErr;

      // Sync categories
      await supabase.from("freelancer_services").delete().eq("freelancer_id", user.id);
      if (selectedCategories.length > 0) {
        const { error: catErr } = await supabase.from("freelancer_services").insert(
          selectedCategories.map(catId => ({ freelancer_id: user.id as string, category_id: catId }))
        );
        if (catErr) throw catErr;
      }

      await refreshProfile();
      if (!silent) toast({ title: "Profile saved!" });
    } catch (error) {
      toast({ title: "Failed to save profile", description: error instanceof Error ? error.message : "An unknown error occurred", variant: "destructive" });
      throw error;
    } finally {
      setSaving(false);
    }
  };

  // ─── Submit application (Bug #1 & #2 fix) ───
  const handleSubmitApplication = async () => {
    if (!user) return;

    // Validate blocking requirements (Bug #4 fix)
    const blocking = getBlockingRequirements();
    if (!blocking.every(b => b.pass)) {
      toast({ title: "Profile Incomplete", description: "Please complete all required fields.", variant: "destructive" });
      return;
    }
    if (completeness < 60) {
      toast({ title: "Score too low", description: "Your profile completeness must be at least 60%.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      await handleSaveProfile(true);

      // Now update status in same query (Bug #2: user_id, not id)
      const { error } = await supabase
        .from("profiles")
        .update({ application_status: "submitted" } as Record<string, unknown>)
        .eq("user_id", user.id);

      if (error) throw error;

      await refreshProfile();
      setShowCelebration(true);
      toast({ title: "Application Submitted!", description: "Your profile is now under review." });

      setTimeout(() => {
        setShowCelebration(false);
        navigate("/freelancer/dashboard", { state: { celebration: true } });
      }, 3000);
    } catch (error) {
      toast({ title: "Submission failed", description: error instanceof Error ? error.message : "An unknown error occurred", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Wizard navigation ───
  const handleNextStep = async () => {
    try {
      await handleSaveProfile(true);
      setWizardStep(prev => Math.min(prev + 1, WIZARD_STEPS.length - 1));
    } catch { /* handled */ }
  };

  const handleSaveDraft = async () => {
    try {
      await handleSaveProfile(false);
    } catch { /* handled */ }
  };

  // ─── Avatar handling ───
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
    setZoom(1);
    setPosition({ x: 50, y: 50 });
  };

  const saveAvatarAdjusted = async () => {
    if (!tempAvatarFile || !user) return;
    setIsAdjustingAvatar(false);
    setUploadingAvatar(true);

    const fileName = `${user.id}/avatar-${Date.now()}-${tempAvatarFile.name}`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(fileName, tempAvatarFile, { upsert: true });
    if (upErr) {
      toast({ title: "Upload failed", description: upErr.message, variant: "destructive" });
      setUploadingAvatar(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(fileName);
    const newAvatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;

    await supabase.from("profiles").update({ avatar_url: newAvatarUrl } as Record<string, unknown>).eq("user_id", user.id);
    setAvatarUrl(newAvatarUrl);
    setAvatarPreview(null);
    setTempAvatarFile(null);
    await refreshProfile();
    setUploadingAvatar(false);
    toast({ title: "Profile photo updated!" });
  };

  // ─── Portfolio handling ───
  const deletePortfolioItem = async (item: PortfolioItem) => {
    if (!user) return;
    await supabase.from("portfolio_items").delete().eq("id", item.id);
    setPortfolio(prev => prev.filter(p => p.id !== item.id));
    toast({ title: "Item removed" });
  };

  // ─── Validation helpers ───
  const getBlockingRequirements = () => [
    { label: "Display name", pass: displayName.trim().length > 0 },
    { label: "Bio ≥ 50 characters", pass: bio.trim().length >= 50 },
    { label: "≥ 3 skills", pass: skills.length >= 3 },
    { label: "≥ 1 service category", pass: selectedCategories.length > 0 },
  ];

  const getWarnings = () => [
    { label: "Profile photo uploaded", pass: !!avatarUrl },
    { label: "Work experience added", pass: workExperience.length > 0 },
    { label: "Education entry added", pass: education.length > 0 },
    { label: "Certification added", pass: certifications.length > 0 },
    { label: "Language added", pass: languages.length > 0 },
    { label: "Portfolio project added", pass: portfolio.length > 0 },
    { label: "Professional headline", pass: !!headline.trim() },
  ];

  const canProceedStep = () => {
    if (wizardStep === 0) return displayName.trim().length > 0;
    if (wizardStep === 1) return skills.length > 0 && selectedCategories.length > 0;
    return true;
  };

  const activityStatus = getActivityStatus(profile?.last_active_at ?? null);

  // ─── Celebration screen ───
  if (showCelebration) {
    return (
      <AppShell>
        <div className="min-h-[90vh] flex flex-col items-center justify-center overflow-hidden relative">
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", damping: 15 }} className="relative z-10 text-center space-y-8">
            <div className="h-32 w-32 rounded-[2.5rem] bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto shadow-2xl">
              <ShieldCheck className="h-16 w-16 text-primary" />
            </div>
            <div className="space-y-4">
              <h1 className="font-display text-5xl font-black tracking-tight">Application Submitted</h1>
              <p className="text-muted-foreground text-lg font-medium max-w-md mx-auto">Your profile is now under review. We'll notify you once approved.</p>
            </div>
          </motion.div>
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div key={i} initial={{ x: "50%", y: "50%", scale: 0, opacity: 1 }} animate={{ x: `${Math.random() * 100}%`, y: `${Math.random() * 100}%`, scale: Math.random() * 2 + 1, opacity: 0 }} transition={{ duration: 2, delay: Math.random() * 0.5, ease: "easeOut" }} className="absolute h-2 w-2 rounded-full bg-primary" />
            ))}
          </div>
        </div>
      </AppShell>
    );
  }

  // ─── Shared sub-components ───
  const AvatarSection = ({ size = "lg" }: { size?: "sm" | "lg" }) => {
    const dim = size === "lg" ? "h-44 w-44" : "h-40 w-40";
    const rounded = size === "lg" ? "rounded-[2rem]" : "rounded-[2rem]";
    return (
      <div className="relative group cursor-pointer" onClick={() => avatarFileRef.current?.click()}>
        <input ref={avatarFileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
        <div className={`${dim} ${rounded} bg-card border border-border/40 shadow-sm overflow-hidden group-hover:shadow-elegant transition-all duration-300`}>
          {(avatarPreview || avatarUrl) ? (
            <img src={avatarPreview || avatarUrl} alt="Avatar" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" style={{ transform: `scale(${zoom})`, objectPosition: `${position.x}% ${position.y}%` }} />
          ) : (
            <div className="h-full w-full bg-primary/5 flex items-center justify-center font-display font-bold text-primary text-5xl">{(displayName || "?")[0]?.toUpperCase()}</div>
          )}
          {uploadingAvatar && <div className="absolute inset-0 bg-card/60 backdrop-blur-sm flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
        </div>
        <div className="absolute -bottom-3 -right-3 h-12 w-12 rounded-[1.25rem] bg-primary text-primary-foreground shadow-glow flex items-center justify-center group-hover:scale-110 transition-transform"><Plus className="h-6 w-6" /></div>
      </div>
    );
  };

  const WorkExperienceList = () => (
    <div className="space-y-4">
      {workExperience.map((we, idx) => (
        <div key={idx} className="flex items-start justify-between p-6 rounded-2xl border border-border/40 bg-card shadow-sm hover:shadow-elegant hover:border-primary/30 transition-all">
          <div className="space-y-1">
            <p className="font-display text-lg font-bold tracking-tight">{we.title}</p>
            <p className="text-xs font-bold text-muted-foreground">{we.company} · {we.start_year} – {we.is_current ? "Present" : we.end_year}</p>
            {we.description && <p className="text-sm text-muted-foreground/80 mt-2 leading-relaxed">{we.description}</p>}
          </div>
          <button onClick={() => setWorkExperience(prev => prev.filter((_, i) => i !== idx))} className="p-2 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors"><X className="h-4 w-4" /></button>
        </div>
      ))}
    </div>
  );

  const WorkExperienceForm = () => (
    <div className="space-y-4 pt-4 border-t border-border/20">
      <div className="grid sm:grid-cols-2 gap-4">
        <Input value={weForm.title} onChange={e => setWeForm(f => ({ ...f, title: e.target.value }))} placeholder="Job Title *" className="h-14 rounded-2xl border-border/30 px-5 font-bold" />
        <Input value={weForm.company} onChange={e => setWeForm(f => ({ ...f, company: e.target.value }))} placeholder="Company *" className="h-14 rounded-2xl border-border/30 px-5 font-bold" />
      </div>
      <Textarea value={weForm.description} onChange={e => setWeForm(f => ({ ...f, description: e.target.value }))} placeholder="Description (optional)" className="rounded-2xl border-border/30 p-5" rows={3} />
      <div className="grid sm:grid-cols-3 gap-4 items-end">
        <Input type="number" value={weForm.start_year} onChange={e => setWeForm(f => ({ ...f, start_year: e.target.value }))} placeholder="Start Year *" className="h-14 rounded-2xl border-border/30 px-5 font-bold" />
        <Input type="number" value={weForm.end_year} onChange={e => setWeForm(f => ({ ...f, end_year: e.target.value }))} placeholder="End Year" disabled={weForm.is_current} className="h-14 rounded-2xl border-border/30 px-5 font-bold disabled:opacity-50" />
        <Button type="button" onClick={addWorkExperience} className="h-14 rounded-2xl bg-primary/10 text-primary hover:bg-primary/20 border-0 font-black text-xs uppercase tracking-widest">
          <Plus className="h-5 w-5 mr-2" /> Add
        </Button>
      </div>
      <div className="flex items-center gap-3 pt-1">
        <Checkbox checked={weForm.is_current} onCheckedChange={(v) => setWeForm(f => ({ ...f, is_current: !!v, end_year: v ? "" : f.end_year }))} id="is-current" />
        <label htmlFor="is-current" className="text-sm font-bold text-muted-foreground cursor-pointer">I currently work here</label>
      </div>
    </div>
  );

  const EducationList = () => (
    <div className="space-y-3">
      {education.map((ed, idx) => (
        <div key={idx} className="flex items-center justify-between p-5 rounded-xl border border-border/40 bg-card shadow-sm hover:shadow-elegant hover:border-primary/30 transition-all">
          <div className="flex gap-4 items-center">
            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-primary/5 text-primary">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display font-bold text-sm tracking-tight">{ed.degree}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{ed.institution} · {ed.year}</p>
            </div>
          </div>
          <button onClick={() => setEducation(prev => prev.filter((_, i) => i !== idx))} className="p-2 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors"><X className="h-4 w-4" /></button>
        </div>
      ))}
    </div>
  );

  const EducationForm = () => (
    <div className="grid sm:grid-cols-3 gap-4">
      <Input value={eduForm.degree} onChange={e => setEduForm(f => ({ ...f, degree: e.target.value }))} placeholder="Degree *" className="h-14 rounded-2xl border-border/30 px-5 font-bold" />
      <Input value={eduForm.institution} onChange={e => setEduForm(f => ({ ...f, institution: e.target.value }))} placeholder="Institution *" className="h-14 rounded-2xl border-border/30 px-5 font-bold" />
      <div className="flex gap-3">
        <Input type="number" value={eduForm.year} onChange={e => setEduForm(f => ({ ...f, year: e.target.value }))} placeholder="Year" className="h-14 rounded-2xl border-border/30 px-5 font-bold" />
        <Button type="button" onClick={addEducation} className="h-14 w-14 rounded-2xl shrink-0 bg-primary/10 text-primary hover:bg-primary/20 border-0"><Plus className="h-5 w-5" /></Button>
      </div>
    </div>
  );

  const LanguageList = () => (
    <div className="space-y-3">
      {languages.map((lang, idx) => (
        <div key={idx} className="flex items-center justify-between p-5 rounded-xl border border-border/40 bg-card shadow-sm hover:shadow-elegant hover:border-primary/30 transition-all">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-primary/5 text-primary">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display font-bold text-sm tracking-tight">{lang.language}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest capitalize">{lang.proficiency}</p>
            </div>
          </div>
          <button onClick={() => setLanguages(prev => prev.filter((_, i) => i !== idx))} className="p-2 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors"><X className="h-4 w-4" /></button>
        </div>
      ))}
    </div>
  );

  const LanguageForm = () => (
    <div className="grid sm:grid-cols-3 gap-4 items-end">
      <Input value={langForm.language} onChange={e => setLangForm(f => ({ ...f, language: e.target.value }))} placeholder="Language *" className="h-14 rounded-2xl border-border/30 px-5 font-bold" />
      <select value={langForm.proficiency} onChange={e => setLangForm(f => ({ ...f, proficiency: e.target.value as Language["proficiency"] }))} className="h-14 rounded-2xl bg-card border border-border/30 px-5 font-bold text-sm">
        {PROFICIENCY_LEVELS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
      </select>
      <Button type="button" onClick={addLanguage} className="h-14 rounded-2xl bg-primary/10 text-primary hover:bg-primary/20 border-0 font-black text-xs uppercase tracking-widest">
        <Plus className="h-5 w-5 mr-2" /> Add
      </Button>
    </div>
  );

  const CertificationList = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {certifications.map((c, i) => (
        <div key={i} className="flex items-center justify-between p-5 rounded-xl bg-card border border-border/40 shadow-sm hover:shadow-elegant hover:border-primary/30 transition-all">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary"><Award className="h-5 w-5" /></div>
            <div>
              <p className="font-display font-bold text-sm tracking-tight truncate max-w-[120px]">{c.name}</p>
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{c.issuer}</p>
            </div>
          </div>
          <button onClick={() => setCertifications(prev => prev.filter((_, idx) => idx !== i))} className="p-2 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors"><X className="h-4 w-4" /></button>
        </div>
      ))}
    </div>
  );

  const CertificationForm = () => (
    <div className="grid sm:grid-cols-3 gap-4">
      <Input value={certName} onChange={e => setCertName(e.target.value)} placeholder="Certification Name" className="h-14 rounded-2xl border-border/30 px-5 font-bold" />
      <Input value={certIssuer} onChange={e => setCertIssuer(e.target.value)} placeholder="Issuing Authority" className="h-14 rounded-2xl border-border/30 px-5 font-bold" />
      <div className="flex gap-3">
        <Input type="number" value={certYear} onChange={e => setCertYear(e.target.value)} placeholder="Year" className="h-14 rounded-2xl border-border/30 px-5 font-bold" />
        <Button type="button" onClick={addCertification} className="h-14 w-14 rounded-2xl shrink-0 bg-primary/10 text-primary hover:bg-primary/20 border-0"><Plus className="h-5 w-5" /></Button>
      </div>
    </div>
  );

  const PortfolioSection = () => (
    <div className="space-y-6">
      <button onClick={() => setIsPortfolioFormOpen(true)} className="w-full group relative rounded-[1.5rem] border-2 border-dashed border-border/40 bg-card/40 hover:bg-white hover:border-primary/40 hover:shadow-elegant transition-all duration-300 py-16 flex flex-col items-center gap-4">
        <div className="h-14 w-14 rounded-2xl bg-white border border-border/40 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-500 group-hover:bg-primary/5">
          <Plus className="h-6 w-6 text-primary" />
        </div>
        <span className="font-display text-sm font-bold uppercase tracking-[0.2em] text-primary">Add Project</span>
      </button>
      {portfolio.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2">
          {portfolio.map(item => (
            <div key={item.id} className="relative group aspect-video rounded-2xl overflow-hidden border border-border/40 shadow-sm bg-card hover:shadow-elegant transition-all duration-300">
              {item.image_url ? (
                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-primary/20 bg-muted/20"><ImageIcon className="h-16 w-16" /></div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 p-6 flex flex-col justify-between">
                <div className="flex justify-end">
                  <Button size="icon" variant="destructive" onClick={e => { e.stopPropagation(); deletePortfolioItem(item); }} className="h-10 w-10 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-colors border-0"><Trash2 className="h-5 w-5" /></Button>
                </div>
                <p className="font-display font-bold text-xl text-white tracking-tight truncate drop-shadow-md">{item.title}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const PricingSection = () => (
    <div className="space-y-10">
      <div className="space-y-3">
        <Label className="font-display text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Hourly Rate (USD)</Label>
        <div className="relative">
          <Input type="number" min="0" value={hourlyRate} onChange={e => setHourlyRate(e.target.value)} placeholder="0.00" className="h-16 rounded-[1.25rem] border-border/40 px-6 font-display font-bold text-2xl transition-all hover:border-primary/30 focus-visible:border-primary/50" />
          <div className="absolute right-6 top-1/2 -translate-y-1/2 font-display text-sm font-bold uppercase tracking-widest text-primary/40">$/hr</div>
        </div>
      </div>
      <div className="space-y-3">
        <Label className="font-display text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Preferred Pricing Model</Label>
        <div className="grid grid-cols-3 gap-4">
          {["hourly", "fixed", "both"].map(model => (
            <button key={model} onClick={() => setPreferredPricingModel(model)} className={`p-4 rounded-[1.25rem] border-2 font-display text-xs font-bold uppercase tracking-[0.1em] transition-all duration-300 ${preferredPricingModel === model ? "bg-primary text-white border-primary shadow-sm scale-[1.02]" : "bg-white border-border/40 text-muted-foreground hover:border-primary/40 hover:-translate-y-0.5"}`}>
              {model === "both" ? "Both" : model.charAt(0).toUpperCase() + model.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <Label className="font-display text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Availability</Label>
        <div className="grid grid-cols-3 gap-4">
          {[{ key: "available", label: "Available" }, { key: "limited", label: "Limited" }, { key: "unavailable", label: "Unavailable" }].map(opt => (
            <button key={opt.key} onClick={() => setAvailabilityStatus(opt.key)} className={`p-4 rounded-[1.25rem] border-2 font-display text-xs font-bold uppercase tracking-[0.1em] transition-all duration-300 ${availabilityStatus === opt.key ? "bg-primary text-white border-primary shadow-sm scale-[1.02]" : "bg-white border-border/40 text-muted-foreground hover:border-primary/40 hover:-translate-y-0.5"}`}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <Label className="font-display text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Response Time</Label>
        <div className="grid grid-cols-3 gap-4">
          {["<1h", "<24h", "2-3 days"].map(rt => (
            <button key={rt} onClick={() => setResponseTimeExpectation(rt)} className={`p-4 rounded-[1.25rem] border-2 font-display text-xs font-bold uppercase tracking-[0.1em] transition-all duration-300 ${responseTimeExpectation === rt ? "bg-primary text-white border-primary shadow-sm scale-[1.02]" : "bg-white border-border/40 text-muted-foreground hover:border-primary/40 hover:-translate-y-0.5"}`}>
              {rt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════
  // WIZARD MODE
  // ═══════════════════════════════════════════
  if (isWizardMode) {
    const progress = ((wizardStep + 1) / WIZARD_STEPS.length) * 100;
    const blocking = getBlockingRequirements();
    const warnings = getWarnings();
    const allBlockingPass = blocking.every(b => b.pass);

    const renderWizardStep = () => {
      switch (wizardStep) {
        case 0: // Identity
          return (
            <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
              <div className="space-y-2">
                <h2 className="text-3xl font-black tracking-tight">Personal Information</h2>
                <p className="text-muted-foreground font-medium">Your name and photo help clients recognize you.</p>
              </div>
              <div className="grid md:grid-cols-[180px_1fr] gap-10 items-start">
                <div className="flex flex-col items-center gap-4">
                  <AvatarSection />
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary">Profile Photo</p>
                </div>
                <div className="space-y-6 bg-card/60 backdrop-blur-md rounded-3xl p-8 border border-border/30 shadow-sm">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Full Name *</Label>
                    <Input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Enter your full name" className="h-14 rounded-2xl border-border/30 px-5 font-bold text-lg" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Professional Title</Label>
                    <Input value={headline} onChange={e => setHeadline(e.target.value)} placeholder="e.g. Lead Content Strategist" className="h-14 rounded-2xl border-border/30 px-5 font-bold text-lg" />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-border/20">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 flex items-center gap-2"><Globe className="h-3 w-3" /> Location</Label>
                      <Input value={country} readOnly className="h-12 rounded-2xl bg-muted/30 border-border/20 px-5 font-bold text-muted-foreground cursor-not-allowed" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 flex items-center gap-2"><Clock className="h-3 w-3" /> Timezone</Label>
                      <Input value={timezone} readOnly className="h-12 rounded-2xl bg-muted/30 border-border/20 px-5 font-bold text-muted-foreground cursor-not-allowed" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );

        case 1: // Expertise
          return (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
              <div className="space-y-2">
                <h2 className="text-3xl font-black tracking-tight">Expertise & Skills</h2>
                <p className="text-muted-foreground font-medium">Tell us about your background and skills.</p>
              </div>
              <div className="space-y-8 bg-card/60 backdrop-blur-md rounded-3xl p-8 border border-border/30 shadow-sm">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Years of Experience</Label>
                    <Input type="number" min="0" max="50" value={experienceYears} onChange={e => setExperienceYears(e.target.value)} placeholder="5" className="h-14 rounded-2xl border-border/30 px-5 font-bold text-lg" />
                  </div>
                  <div className="h-14 flex items-center px-5 rounded-2xl bg-primary/5 border border-primary/10 italic text-xs font-medium text-primary/60 self-end">
                    Helps clients gauge seniority
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Professional Summary</Label>
                  <Textarea value={bio} onChange={e => setBio(e.target.value)} rows={5} placeholder="Describe your expertise (min 50 chars)..." className="rounded-2xl border-border/30 p-5 font-medium resize-none leading-relaxed" />
                  <p className={`text-[10px] font-bold ${bio.trim().length >= 50 ? "text-accent" : "text-muted-foreground"}`}>{bio.trim().length}/50 characters minimum</p>
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Key Skills *</Label>
                  <div className="flex gap-3">
                    <Input value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }} placeholder="Add a skill (e.g. React, Writing)" className="h-14 rounded-2xl border-border/30 px-5 font-bold" />
                    <Button type="button" onClick={addSkill} className="h-14 w-14 rounded-2xl shrink-0 bg-primary/10 text-primary hover:bg-primary/20 border-0"><Plus className="h-6 w-6" /></Button>
                  </div>
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {skills.map(s => (
                        <div key={s} className="flex items-center gap-2 rounded-xl border border-primary/10 bg-card px-4 py-2.5 text-xs font-black uppercase tracking-widest text-primary shadow-sm">
                          {s}
                          <button onClick={() => removeSkill(s)} className="text-primary/20 hover:text-destructive"><X className="h-3 w-3" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-3 pt-6 border-t border-border/20">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Service Categories *</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {allCategories.map(cat => (
                      <button key={cat.id} onClick={() => toggleCategory(cat.id)} className={`group relative p-4 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center text-center ${selectedCategories.includes(cat.id) ? "bg-primary text-primary-foreground border-primary shadow-lg -translate-y-0.5" : "bg-card border-border/30 text-muted-foreground hover:border-primary/40"}`}>
                        {selectedCategories.includes(cat.id) && <CheckCircle className="h-3 w-3 mr-2 shrink-0" />}
                        <span className="leading-tight">{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          );

        case 2: // Work Experience
          return (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
              <div className="space-y-2">
                <h2 className="text-3xl font-black tracking-tight">Work Experience</h2>
                <p className="text-muted-foreground font-medium">Add your professional history.</p>
              </div>
              <div className="space-y-6 bg-card/60 backdrop-blur-md rounded-3xl p-8 border border-border/30 shadow-sm">
                <WorkExperienceList />
                <WorkExperienceForm />
              </div>
            </motion.div>
          );

        case 3: // Education & Certs
          return (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
              <div className="space-y-2">
                <h2 className="text-3xl font-black tracking-tight">Education & Certifications</h2>
                <p className="text-muted-foreground font-medium">Add educational background and certifications.</p>
              </div>
              <div className="space-y-8 bg-card/60 backdrop-blur-md rounded-3xl p-8 border border-border/30 shadow-sm">
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Education</Label>
                  <EducationList />
                  <EducationForm />
                </div>
                <div className="space-y-4 pt-6 border-t border-border/20">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Certifications</Label>
                  <CertificationList />
                  <CertificationForm />
                </div>
              </div>
            </motion.div>
          );

        case 4: // Languages
          return (
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
              <div className="space-y-2">
                <h2 className="text-3xl font-black tracking-tight">Languages</h2>
                <p className="text-muted-foreground font-medium">What languages do you speak?</p>
              </div>
              <div className="space-y-6 bg-card/60 backdrop-blur-md rounded-3xl p-8 border border-border/30 shadow-sm">
                <LanguageList />
                <LanguageForm />
              </div>
            </motion.div>
          );

        case 5: // Pricing
          return (
            <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
              <div className="space-y-2">
                <h2 className="text-3xl font-black tracking-tight">Pricing & Availability</h2>
                <p className="text-muted-foreground font-medium">Set your rates so clients know what to expect.</p>
              </div>
              <div className="bg-card/60 backdrop-blur-md rounded-3xl p-8 border border-border/30 shadow-sm">
                <PricingSection />
              </div>
            </motion.div>
          );

        case 6: // Portfolio
          return (
            <motion.div key="step6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
              <div className="space-y-2">
                <h2 className="text-3xl font-black tracking-tight">Portfolio</h2>
                <p className="text-muted-foreground font-medium">Showcase your most impactful projects.</p>
              </div>
              <PortfolioSection />
            </motion.div>
          );

        case 7: // Review
          return (
            <motion.div key="step7" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
              <div className="space-y-2">
                <h2 className="text-3xl font-black tracking-tight">Review & Submit</h2>
                <p className="text-muted-foreground font-medium">Review your profile before submitting for verification.</p>
              </div>
              <div className="space-y-8 bg-card/60 backdrop-blur-md rounded-3xl p-8 border border-border/30 shadow-sm">
                {/* Completeness Score (Bug #5 fix: client-side calculation) */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm font-bold">
                    <span>Profile Completeness</span>
                    <span className="text-primary">{completeness}%</span>
                  </div>
                  <Progress value={completeness} className="h-3" />
                  {completeness < 60 && (
                    <p className="text-xs font-bold text-destructive">Minimum 60% required to submit.</p>
                  )}
                </div>

                <div className="space-y-3">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Required</h3>
                  {blocking.map((b, i) => (
                    <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${b.pass ? "bg-accent/10 text-accent" : "bg-destructive/5 text-destructive"}`}>
                      {b.pass ? <CheckCircle className="h-4 w-4" /> : <X className="h-4 w-4" />}
                      <span className="text-sm font-bold">{b.label}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Recommended</h3>
                  {warnings.map((w, i) => (
                    <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${w.pass ? "bg-accent/10 text-accent" : "bg-warning/10 text-warning"}`}>
                      {w.pass ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                      <span className="text-sm font-bold">{w.label}</span>
                    </div>
                  ))}
                </div>

                {!allBlockingPass && (
                  <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20 text-sm font-bold text-destructive">
                    Please complete all required fields before submitting.
                  </div>
                )}
              </div>
            </motion.div>
          );

        default:
          return null;
      }
    };

    return (
      <AppShell>
        <div className="relative isolate min-h-screen">
          <div className="absolute inset-x-0 top-0 -z-10 h-[600px] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
            <div className="absolute top-[5%] left-[20%] h-64 w-64 rounded-full bg-primary/5 blur-[100px]" />
            <div className="absolute top-[15%] right-[25%] h-80 w-80 rounded-full bg-primary/3 blur-[120px]" />
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-12 py-10 space-y-10 pb-24">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              {/* Progress header */}
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="inline-flex items-center gap-2 rounded-xl bg-card border border-primary/20 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-primary shadow-sm">
                    <Sparkles className="h-3.5 w-3.5" />
                    {isMobile ? WIZARD_STEPS[wizardStep].label : `Step ${wizardStep + 1} of ${WIZARD_STEPS.length} · ${WIZARD_STEPS[wizardStep].label}`}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{completeness}%</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className={`h-1.5 w-6 rounded-full transition-all duration-500 ${completeness >= i * 20 ? "bg-primary" : "bg-muted/40"}`} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Step dots (mobile-friendly) */}
                <div className="space-y-3">
                  {!isMobile && (
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/40">
                      {WIZARD_STEPS.map((s, i) => (
                        <span key={s.key} className={`transition-colors duration-300 ${i <= wizardStep ? "text-primary" : ""} ${i === wizardStep ? "text-primary font-black" : ""}`}>
                          {s.label}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="h-2 rounded-full bg-muted/40 overflow-hidden">
                    <motion.div className="h-full bg-gradient-to-r from-primary to-primary/70" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.8, ease: "easeOut" }} />
                  </div>
                  {isMobile && (
                    <div className="flex justify-center gap-1.5">
                      {WIZARD_STEPS.map((s, i) => (
                        <div key={s.key} className={`h-2 w-2 rounded-full transition-all ${i === wizardStep ? "bg-primary w-6" : i < wizardStep ? "bg-primary/40" : "bg-muted"}`} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            <AnimatePresence mode="wait">
              {renderWizardStep()}
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t border-border/20">
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setWizardStep(Math.max(0, wizardStep - 1))} disabled={wizardStep === 0} className="rounded-2xl h-12 px-6 gap-2 font-black text-xs uppercase tracking-widest">
                  <ChevronLeft className="h-4 w-4" /> Back
                </Button>
                <Button variant="outline" onClick={handleSaveDraft} disabled={saving} className="rounded-2xl h-12 px-6 gap-2 font-black text-xs uppercase tracking-widest">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Draft
                </Button>
              </div>

              {wizardStep < WIZARD_STEPS.length - 1 ? (
                <Button onClick={handleNextStep} disabled={!canProceedStep() || saving} className="rounded-2xl h-14 px-10 gap-3 shadow-lg font-black uppercase tracking-[0.15em] text-xs">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Continue <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmitApplication}
                  disabled={submitting || !allBlockingPass || completeness < 60}
                  className="rounded-2xl h-14 px-10 gap-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg font-black uppercase tracking-[0.15em] text-xs border-0"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
                  Submit for Review
                </Button>
              )}
            </div>
          </div>
        </div>

        {user && <PortfolioProjectForm isOpen={isPortfolioFormOpen} onClose={() => setIsPortfolioFormOpen(false)} onSave={item => setPortfolio([...portfolio, item])} userId={user.id} />}

        {/* Avatar adjust dialog */}
        <Dialog open={isAdjustingAvatar} onOpenChange={setIsAdjustingAvatar}>
          <DialogContent className="sm:max-w-md rounded-3xl border-0 shadow-2xl p-0 overflow-hidden">
            <div className="p-8 space-y-8">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black tracking-tight text-center">Adjust Photo</DialogTitle>
              </DialogHeader>
              <div className="flex justify-center">
                <div className="h-48 w-48 rounded-3xl overflow-hidden border-4 border-muted shadow-inner relative">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Crop" className="w-full h-full object-cover" style={{ transform: `scale(${zoom})`, objectPosition: `${position.x}% ${position.y}%` }} />
                  ) : (
                    <div className="h-full w-full bg-muted flex items-center justify-center text-muted-foreground">No image</div>
                  )}
                </div>
              </div>
              {avatarPreview && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      <span className="flex items-center gap-2"><ZoomIn className="h-3 w-3" /> Zoom</span>
                      <span>{Math.round(zoom * 100)}%</span>
                    </div>
                    <Slider value={[zoom]} min={1} max={3} step={0.01} onValueChange={([v]) => setZoom(v)} />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      <span className="flex items-center gap-2"><Move className="h-3 w-3" /> Horizontal</span><span>{position.x}%</span>
                    </div>
                    <Slider value={[position.x]} min={0} max={100} step={1} onValueChange={([v]) => setPosition(p => ({ ...p, x: v }))} />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      <span className="flex items-center gap-2"><Move className="h-3 w-3" /> Vertical</span><span>{position.y}%</span>
                    </div>
                    <Slider value={[position.y]} min={0} max={100} step={1} onValueChange={([v]) => setPosition(p => ({ ...p, y: v }))} />
                  </div>
                </div>
              )}
            </div>
            <div className="flex p-4 gap-2 bg-muted/30">
              <Button variant="ghost" onClick={() => setIsAdjustingAvatar(false)} className="flex-1 h-12 rounded-2xl font-black uppercase tracking-widest text-[10px]">Cancel</Button>
              <Button onClick={saveAvatarAdjusted} disabled={!avatarPreview} className="flex-[2] h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg">Save Changes</Button>
            </div>
          </DialogContent>
        </Dialog>
      </AppShell>
    );
  }

  // ═══════════════════════════════════════════
  // EDIT MODE (approved / submitted / under_review)
  // ═══════════════════════════════════════════
  return (
    <AppShell>
      <div className="relative min-h-screen bg-background">
        <div className="fixed inset-0 pointer-events-none overflow-hidden isolate">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
          <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-primary/3 blur-[150px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 space-y-10 pb-24 pt-10">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-border/20">
              <div className="space-y-2">
                <h1 className="text-4xl font-black tracking-tight">Edit Profile</h1>
                <p className="text-muted-foreground font-medium text-lg">Update your professional presence and portfolio.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button onClick={() => handleSaveProfile()} disabled={saving} className="h-14 px-10 rounded-2xl shadow-lg font-black uppercase tracking-widest text-xs gap-3">
                  {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
                  Save Changes
                </Button>
              </div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-[1fr_380px] gap-10 items-start">
            <div className="space-y-10">
              {/* Profile Info */}
              <section className="space-y-6">
                <SectionHeader title="Profile Information" />
                <div className="grid gap-8 bg-card/60 backdrop-blur-xl rounded-3xl p-8 md:p-10 border border-border/30 shadow-sm">
                  <div className="flex flex-col sm:flex-row items-center gap-8 pb-8 border-b border-border/20">
                    <AvatarSection size="sm" />
                    <div className="space-y-3 text-center sm:text-left flex-1">
                      <h3 className="text-xl font-black tracking-tight">Profile Photo</h3>
                      <p className="text-muted-foreground text-sm font-medium">A professional photo builds trust with clients.</p>
                      <div className="flex gap-3 justify-center sm:justify-start pt-2">
                        <Button variant="ghost" size="sm" onClick={() => avatarFileRef.current?.click()} className="rounded-xl font-black text-[10px] uppercase tracking-widest h-10 px-6 border border-border/30">Upload New</Button>
                        {(avatarPreview || avatarUrl) && (
                          <Button variant="ghost" size="sm" onClick={() => { if (avatarUrl && !avatarPreview) { setAvatarPreview(avatarUrl); } setIsAdjustingAvatar(true); }} className="rounded-xl font-black text-[10px] uppercase tracking-widest h-10 px-6 border border-border/30">Adjust Photo</Button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Full Name</Label>
                      <Input value={displayName} onChange={e => setDisplayName(e.target.value)} className="h-14 rounded-2xl border-border/30 px-5 font-bold text-lg" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Professional Title</Label>
                      <Input value={headline} onChange={e => setHeadline(e.target.value)} placeholder="e.g. Lead Architect" className="h-14 rounded-2xl border-border/30 px-5 font-bold text-lg" />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Location</Label>
                      <Input value={country} onChange={e => setCountry(e.target.value)} className="h-14 rounded-2xl border-border/30 px-5 font-bold text-lg" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Timezone</Label>
                      <div className="h-14 rounded-2xl bg-muted/30 border border-border/20 px-5 flex items-center font-bold text-muted-foreground">{timezone}</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Years of Experience</Label>
                    <Input type="number" min="0" max="50" value={experienceYears} onChange={e => setExperienceYears(e.target.value)} className="h-14 rounded-2xl border-border/30 px-5 font-bold text-lg" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Professional Summary</Label>
                    <Textarea value={bio} onChange={e => setBio(e.target.value)} rows={6} className="rounded-2xl border-border/30 p-6 font-medium resize-none leading-relaxed" />
                  </div>
                </div>
              </section>

              {/* Skills & Categories & Certifications */}
              <section className="space-y-6">
                <SectionHeader title="Skills & Categories" />
                <div className="bg-card/60 backdrop-blur-xl rounded-3xl p-8 md:p-10 border border-border/30 shadow-sm space-y-8">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Skills</Label>
                    <div className="flex gap-3">
                      <Input value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }} placeholder="Add Skill" className="h-14 rounded-2xl border-border/30 px-5 font-bold" />
                      <Button onClick={addSkill} className="h-14 w-14 rounded-2xl bg-primary/5 text-primary hover:bg-primary/10 border-0"><Plus /></Button>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {skills.map(s => (
                        <div key={s} className="flex items-center gap-3 rounded-xl bg-card border border-border/30 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-primary shadow-sm">
                          {s}
                          <button onClick={() => removeSkill(s)} className="text-primary/20 hover:text-destructive"><X className="h-3 w-3" /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3 pt-6 border-t border-border/20">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Service Categories</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {allCategories.map(cat => (
                        <button key={cat.id} onClick={() => toggleCategory(cat.id)} className={`p-4 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${selectedCategories.includes(cat.id) ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border/30 text-muted-foreground hover:border-primary/40"}`}>
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="pt-6 border-t border-border/20 space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Certifications</Label>
                    <CertificationList />
                    <CertificationForm />
                  </div>
                </div>
              </section>

              {/* Work Experience */}
              <section className="space-y-6">
                <SectionHeader title="Work Experience" />
                <div className="bg-card/60 backdrop-blur-xl rounded-3xl p-8 md:p-10 border border-border/30 shadow-sm space-y-6">
                  <WorkExperienceList />
                  <WorkExperienceForm />
                </div>
              </section>

              {/* Education */}
              <section className="space-y-6">
                <SectionHeader title="Education" />
                <div className="bg-card/60 backdrop-blur-xl rounded-3xl p-8 md:p-10 border border-border/30 shadow-sm space-y-6">
                  <EducationList />
                  <EducationForm />
                </div>
              </section>

              {/* Languages */}
              <section className="space-y-6">
                <SectionHeader title="Languages" />
                <div className="bg-card/60 backdrop-blur-xl rounded-3xl p-8 md:p-10 border border-border/30 shadow-sm space-y-6">
                  <LanguageList />
                  <LanguageForm />
                </div>
              </section>

              {/* Pricing */}
              <section className="space-y-6">
                <SectionHeader title="Pricing & Availability" />
                <div className="bg-card/60 backdrop-blur-xl rounded-3xl p-8 md:p-10 border border-border/30 shadow-sm">
                  <PricingSection />
                </div>
              </section>

              {/* Portfolio */}
              <section className="space-y-6">
                <SectionHeader title="Portfolio" />
                <div className="bg-card/60 backdrop-blur-xl rounded-3xl p-8 md:p-10 border border-border/30 shadow-sm">
                  <PortfolioSection />
                </div>
              </section>
            </div>

            {/* Live Preview Sidebar */}
            <div className="lg:sticky lg:top-12 space-y-6">
              <SectionHeader title="Live Preview" />
              <Card className="relative rounded-[2.5rem] border border-border/60 bg-card/40 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
                <div className="h-32 bg-gradient-to-r from-primary via-primary/80 to-accent relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                </div>
                <CardContent className="px-8 pb-10 relative z-10">
                  <div className="-mt-16 mb-6 flex justify-center">
                    <div className="inline-block relative">
                      <div className="h-32 w-32 rounded-[2rem] bg-card border-[6px] border-card shadow-xl overflow-hidden relative group-hover:scale-105 transition-transform duration-500">
                        {(avatarPreview || avatarUrl) ? (
                          <img src={avatarPreview || avatarUrl} alt="Preview" className="w-full h-full object-cover" style={{ transform: `scale(${zoom})`, objectPosition: `${position.x}% ${position.y}%` }} />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-display font-black text-primary text-4xl">{(displayName || "?")[0]?.toUpperCase()}</div>
                        )}
                      </div>
                      <div className={`absolute bottom-1 right-1 h-6 w-6 rounded-full ${activityStatus.color} border-[3px] border-card shadow-md`} />
                    </div>
                  </div>

                  <div className="space-y-6 text-center">
                    <div className="space-y-1.5">
                      <h3 className="font-display text-2xl font-bold tracking-tight text-foreground drop-shadow-sm">{displayName || "Your Name"}</h3>
                      <p className="font-medium text-primary text-sm">{headline || "Professional Headline"}</p>
                      <div className="flex items-center justify-center gap-3 pt-2 font-display text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                        <span className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" />{country || "Location"}</span>
                        <span className="h-1 w-1 rounded-full bg-border/60" />
                        <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{timezone}</span>
                      </div>
                    </div>

                    {/* Preview stats */}
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-muted/30 to-muted/10 border border-border/40 hover:border-border/80 transition-colors">
                        <p className="font-display text-2xl font-bold text-foreground drop-shadow-sm">{workExperience.length}</p>
                        <p className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mt-1">Experience</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-muted/30 to-muted/10 border border-border/40 hover:border-border/80 transition-colors">
                        <p className="font-display text-2xl font-bold text-foreground drop-shadow-sm">{languages.length}</p>
                        <p className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mt-1">Languages</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-muted/30 to-muted/10 border border-border/40 hover:border-border/80 transition-colors">
                        <p className="font-display text-2xl font-bold text-accent drop-shadow-sm">{hourlyRate ? `$${hourlyRate}` : "—"}</p>
                        <p className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mt-1">Per Hour</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-muted/30 to-muted/10 border border-border/40 hover:border-border/80 transition-colors">
                        <p className="font-display text-base font-bold text-primary capitalize mt-1 truncate">{availabilityStatus}</p>
                        <p className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mt-1">Status</p>
                      </div>
                    </div>

                    {selectedCategories.length > 0 && (
                      <div className="space-y-3 pt-6 border-t border-border/40 text-left">
                        <h4 className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Categories</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedCategories.map(id => (
                            <Badge key={id} className="bg-primary/5 text-primary border border-primary/20 rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest hover:bg-primary/10 transition-colors">
                              {allCategories.find(c => c.id === id)?.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-6 border-t border-border/40 bg-card/20 -mx-8 px-8 pb-2 rounded-b-[2.5rem]">
                      <div className="flex items-center justify-between mb-3 text-sm">
                        <span className="font-bold text-muted-foreground flex items-center gap-2"><Sparkles className="h-4 w-4 text-accent" /> Profile Strength</span>
                        <span className="font-black text-foreground">{completeness}%</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${completeness}%` }} className="h-full bg-gradient-to-r from-primary to-accent" />
                      </div>
                    </div>

                    <Button onClick={() => window.open(`/client/freelancer/${user?.id}`, '_blank')} className="w-full h-14 rounded-2xl bg-foreground text-background font-display font-bold uppercase tracking-[0.1em] text-xs mt-6 group hover:bg-primary hover:text-primary-foreground hover:shadow-lg transition-all duration-300 border-0">
                      View Public Profile <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {user && <PortfolioProjectForm isOpen={isPortfolioFormOpen} onClose={() => setIsPortfolioFormOpen(false)} onSave={item => setPortfolio([...portfolio, item])} userId={user.id} />}

      {/* Avatar adjust dialog */}
      <Dialog open={isAdjustingAvatar} onOpenChange={setIsAdjustingAvatar}>
        <DialogContent className="sm:max-w-md rounded-3xl border-0 shadow-2xl p-0 overflow-hidden">
          <div className="p-8 space-y-8">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black tracking-tight text-center">Adjust Photo</DialogTitle>
            </DialogHeader>
            <div className="flex justify-center">
              <div className="h-48 w-48 rounded-3xl overflow-hidden border-4 border-muted shadow-inner relative">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Crop" className="w-full h-full object-cover" style={{ transform: `scale(${zoom})`, objectPosition: `${position.x}% ${position.y}%` }} />
                ) : (
                  <div className="h-full w-full bg-muted flex items-center justify-center text-muted-foreground">No image</div>
                )}
              </div>
            </div>
            {avatarPreview && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground"><span className="flex items-center gap-2"><ZoomIn className="h-3 w-3" /> Zoom</span><span>{Math.round(zoom * 100)}%</span></div>
                  <Slider value={[zoom]} min={1} max={3} step={0.01} onValueChange={([v]) => setZoom(v)} />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground"><span className="flex items-center gap-2"><Move className="h-3 w-3" /> Horizontal</span><span>{position.x}%</span></div>
                  <Slider value={[position.x]} min={0} max={100} step={1} onValueChange={([v]) => setPosition(p => ({ ...p, x: v }))} />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground"><span className="flex items-center gap-2"><Move className="h-3 w-3" /> Vertical</span><span>{position.y}%</span></div>
                  <Slider value={[position.y]} min={0} max={100} step={1} onValueChange={([v]) => setPosition(p => ({ ...p, y: v }))} />
                </div>
              </div>
            )}
          </div>
          <div className="flex p-4 gap-2 bg-muted/30">
            <Button variant="ghost" onClick={() => setIsAdjustingAvatar(false)} className="flex-1 h-12 rounded-2xl font-black uppercase tracking-widest text-[10px]">Cancel</Button>
            <Button onClick={saveAvatarAdjusted} disabled={!avatarPreview} className="flex-[2] h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg">Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
};

export default EditProfile;
