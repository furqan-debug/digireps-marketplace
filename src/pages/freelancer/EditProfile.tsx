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
import { Loader2, X, Plus, Upload, Trash2, User, Eye, Sparkles, ShieldCheck, Globe, Crown, Send, Award, CheckCircle, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Move, Clock, Briefcase, ArrowRight, Image as ImageIcon, AlertCircle } from "lucide-react";
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
type WorkExperience = { title: string; company: string; description: string; start_year: number; end_year: number | null; is_current: boolean };
type Education = { degree: string; institution: string; year: number };
type Language = { language: string; proficiency: "native" | "fluent" | "conversational" | "basic" };
type Certification = { name: string; issuer: string; year: number; verified: boolean };

const WIZARD_STEPS = ["Identity", "Expertise", "Work Experience", "Education", "Languages", "Pricing", "Portfolio", "Review"];
const PROFICIENCY_LEVELS = ["native", "fluent", "conversational", "basic"] as const;

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
  const [workExperience, setWorkExperience] = useState<WorkExperience[]>((profile as any)?.work_experience ?? []);
  const [education, setEducation] = useState<Education[]>((profile as any)?.education ?? []);
  const [languages, setLanguages] = useState<Language[]>((profile as any)?.languages ?? []);
  const [availabilityStatus, setAvailabilityStatus] = useState<string>((profile as any)?.availability_status ?? "available");
  const [preferredPricingModel, setPreferredPricingModel] = useState<string>((profile as any)?.preferred_pricing_model ?? "");
  const [responseTimeExpectation, setResponseTimeExpectation] = useState<string>((profile as any)?.response_time_expectation ?? "");
  const [hourlyRate, setHourlyRate] = useState<string>((profile as any)?.hourly_rate?.toString() ?? "");
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
      if (workExperience.length === 0) setWorkExperience((profile as any).work_experience ?? []);
      if (education.length === 0) setEducation((profile as any).education ?? []);
      if (languages.length === 0) setLanguages((profile as any).languages ?? []);
      if (!availabilityStatus || availabilityStatus === "available") setAvailabilityStatus((profile as any).availability_status ?? "available");
      if (!preferredPricingModel) setPreferredPricingModel((profile as any).preferred_pricing_model ?? "");
      if (!responseTimeExpectation) setResponseTimeExpectation((profile as any).response_time_expectation ?? "");
      if (!hourlyRate) setHourlyRate((profile as any).hourly_rate?.toString() ?? "");
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
      setPortfolio((portRes.data ?? []) as unknown as PortfolioItem[]);
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
        certifications: certifications as any,
        work_experience: workExperience as any,
        education: education as any,
        languages: languages as any,
        hourly_rate: hourlyRate ? parseFloat(hourlyRate) : null,
        availability_status: availabilityStatus,
        preferred_pricing_model: preferredPricingModel || null,
        response_time_expectation: responseTimeExpectation || null,
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
      if (!silent) {
        toast({ title: "Profile saved!" });
      }
    } catch (error: any) {
      toast({ title: "Failed to save profile", description: error.message, variant: "destructive" });
      throw error;
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
    try {
      await handleSaveProfile(true); // Save current profile data first
      const { error } = await supabase
        .from('profiles')
        .update({
          application_status: 'submitted',
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      await refreshProfile(); // Refresh profile after status update

      setShowCelebration(true);
      toast({
        title: "Protocol Engaged",
        description: "Your elite presence is now being vetted by the commercial network.",
      });

      // Reset and redirect after a delay
      setTimeout(() => {
        setShowCelebration(false);
        navigate("/freelancer/dashboard", {
          state: { celebration: true }
        });
      }, 3000);
    } catch (error: any) {
      toast({ title: "Submission failed", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextStep = async () => {
    try {
      await handleSaveProfile(true);
      setWizardStep(wizardStep + 1);
    } catch (error) {
      // Error handled in handleSaveProfile
    }
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

  const calculateProfileStrength = () => {
    let score = 0;
    if (displayName) score += 10;
    if (avatarUrl) score += 20;
    if (bio) score += 20;
    if (headline) score += 10;
    if (skills.length >= 3) score += 20;
    else if (skills.length > 0) score += 10;
    if (portfolio.length > 0) score += 20;
    return score;
  };

  const strength = calculateProfileStrength();
  const strengthConfig = {
    0: { label: "Elite Identity Missing", color: "bg-muted" },
    30: { label: "Foundational Specialist", color: "bg-warning" },
    60: { label: "High-Tier Strategist", color: "bg-primary" },
    90: { label: "Master-Class Profile", color: "bg-emerald-500" },
  };
  const currentStrength = Object.entries(strengthConfig).reverse().find(([s]) => strength >= parseInt(s))?.[1] || strengthConfig[0];

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
            <motion.div key="step0" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-12">
              <div className="space-y-3">
                <h2 className="font-display text-4xl font-black tracking-tight leading-[1.1]">Personal Information</h2>
                <p className="text-muted-foreground font-medium text-lg leading-relaxed max-w-xl">Start by introducing yourself to the community. Your name and photo help clients recognize you.</p>
              </div>

              <div className="grid md:grid-cols-[200px_1fr] gap-12 items-start pt-4">
                {/* Photo Section */}
                <div className="flex flex-col items-center gap-6">
                  <input ref={avatarFileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                  <div className="relative group cursor-pointer" onClick={() => avatarFileRef.current?.click()}>
                    <div className="absolute -inset-1 rounded-[2.8rem] bg-gradient-to-br from-primary to-primary/40 blur-md opacity-0 group-hover:opacity-30 transition-opacity" />
                    <div className="relative h-44 w-44 rounded-[2.5rem] bg-card border-4 border-white shadow-2xl overflow-hidden ring-1 ring-border/20">
                      {(avatarPreview || avatarUrl) ? (
                        <img
                          src={avatarPreview || avatarUrl}
                          alt="Avatar"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          style={{
                            transform: `scale(${zoom})`,
                            objectPosition: `${position.x}% ${position.y}%`
                          }}
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center font-display font-bold text-primary text-5xl">
                          {(displayName || "E")[0]?.toUpperCase()}
                        </div>
                      )}
                      {uploadingAvatar && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-3 -right-3 h-12 w-12 rounded-2xl bg-primary text-primary-foreground shadow-elegant flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Plus className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">Profile Photo</p>
                    <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest leading-relaxed">JPG/PNG &bull; Max 5MB</p>
                  </div>
                </div>

                {/* Fields Section */}
                <div className="space-y-8 bg-white/40 backdrop-blur-md rounded-[2.5rem] p-10 border border-white/60 shadow-sm">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Full Name *</Label>
                    <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Enter your full name" className="h-16 rounded-2xl bg-white border-border/40 px-6 font-bold text-lg focus:ring-primary/20" />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Professional Title</Label>
                    <Input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="e.g. Lead Content Strategist" className="h-16 rounded-2xl bg-white border-border/40 px-6 font-bold text-lg focus:ring-primary/20" />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-6 pt-4 border-t border-border/5">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 ml-1">
                        <Globe className="h-3.5 w-3.5 text-primary/40" />
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Location</Label>
                      </div>
                      <Input value={country} readOnly className="h-14 rounded-2xl bg-muted/30 border-border/20 px-6 font-bold text-muted-foreground/60 cursor-not-allowed" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 ml-1">
                        <Clock className="h-3.5 w-3.5 text-primary/40" />
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Timezone</Label>
                      </div>
                      <Input value={timezone} readOnly className="h-14 rounded-2xl bg-muted/30 border-border/20 px-6 font-bold text-muted-foreground/60 cursor-not-allowed" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        case 1:
          return (
            <motion.div key="step1" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-12">
              <div className="space-y-3">
                <h2 className="font-display text-4xl font-black tracking-tight leading-[1.1]">Expertise & Skills</h2>
                <p className="text-muted-foreground font-medium text-lg leading-relaxed max-w-xl">Tell us about your background and the skills you bring to the table.</p>
              </div>

              <div className="space-y-10 bg-white/40 backdrop-blur-md rounded-[2.5rem] p-10 border border-white/60 shadow-sm">
                <div className="grid sm:grid-cols-2 gap-8 items-end">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Years of Experience</Label>
                    <div className="relative">
                      <Input type="number" min="0" max="50" value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} placeholder="5" className="h-16 rounded-2xl bg-white border-border/40 px-6 font-bold text-xl focus:ring-primary/20" />
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-widest text-primary/40">Years</div>
                    </div>
                  </div>
                  <div className="h-16 flex items-center px-6 rounded-2xl bg-primary/5 border border-primary/10 italic text-xs font-medium text-primary/60">
                    "Highlighting your experience helps clients understand your seniority."
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Professional Summary</Label>
                  <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={5} placeholder="Briefly describe your expertise and the value you provide..." className="rounded-2xl bg-white border-border/40 p-6 font-medium text-lg resize-none focus:ring-primary/20 leading-relaxed" />
                </div>

                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Key Skills *</Label>
                  <div className="flex gap-3">
                    <Input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }} placeholder="Add a skill (e.g. Next.js, Strategic Writing)" className="h-16 rounded-2xl bg-white border-border/40 px-6 font-bold text-lg focus:ring-primary/20" />
                    <Button type="button" onClick={addSkill} className="h-16 w-16 rounded-2xl shrink-0 bg-primary/10 text-primary hover:bg-primary/20 border-0 shadow-none"><Plus className="h-6 w-6" /></Button>
                  </div>
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {skills.map((s) => (
                        <div key={s} className="flex items-center gap-2 rounded-xl border border-primary/10 bg-white/80 backdrop-blur-sm px-4 py-2.5 text-xs font-black uppercase tracking-widest text-primary shadow-sm group">
                          {s}
                          <button onClick={() => removeSkill(s)} className="text-primary/20 hover:text-destructive transition-colors"><X className="h-3 w-3" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-4 pt-6 border-t border-border/5">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Service Categories *</Label>
                    <span className="text-[9px] font-bold text-primary uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded-md">Required</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {allCategories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => toggleCategory(cat.id)}
                        className={`group relative p-6 rounded-[1.8rem] border-2 text-[10px] font-black uppercase tracking-widest transition-all h-28 flex flex-col items-center justify-center gap-2 shadow-sm ${selectedCategories.includes(cat.id) ? "bg-primary text-white border-primary shadow-elegant -translate-y-1" : "bg-white border-border/40 text-muted-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-primary"}`}
                      >
                        {selectedCategories.includes(cat.id) && <motion.div layoutId="check" className="absolute top-3 right-3 h-5 w-5 bg-white/20 rounded-full flex items-center justify-center"><CheckCircle className="h-3 w-3" /></motion.div>}
                        <span className="text-center leading-tight">{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        case 2:
          return (
            <motion.div key="step2" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-12">
              <div className="space-y-3">
                <h2 className="font-display text-4xl font-black tracking-tight leading-[1.1]">Work Experience</h2>
                <p className="text-muted-foreground font-medium text-lg leading-relaxed max-w-xl">Add your professional history to showcase your background.</p>
              </div>
              <div className="space-y-6 bg-white/40 backdrop-blur-md rounded-[2.5rem] p-10 border border-white/60 shadow-sm">
                {workExperience.map((we, idx) => (
                  <div key={idx} className="flex items-start justify-between p-6 rounded-[2rem] border border-white/60 bg-white/40 shadow-sm">
                    <div className="space-y-1">
                      <p className="font-black text-lg tracking-tight">{we.title}</p>
                      <p className="text-xs font-bold text-muted-foreground/60">{we.company} &bull; {we.start_year} – {we.is_current ? "Present" : we.end_year}</p>
                      {we.description && <p className="text-sm text-muted-foreground mt-2">{we.description}</p>}
                    </div>
                    <button onClick={() => setWorkExperience(prev => prev.filter((_, i) => i !== idx))} className="p-2 text-muted-foreground/40 hover:text-destructive"><X className="h-4 w-4" /></button>
                  </div>
                ))}
                <div className="space-y-4 pt-4 border-t border-border/5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input id="we-title" placeholder="Job Title *" className="h-14 rounded-2xl bg-white border-border/40 px-5 font-bold" />
                    <Input id="we-company" placeholder="Company *" className="h-14 rounded-2xl bg-white border-border/40 px-5 font-bold" />
                  </div>
                  <Textarea id="we-desc" placeholder="Description (optional)" className="rounded-2xl bg-white border-border/40 p-5" rows={3} />
                  <div className="grid sm:grid-cols-3 gap-4 items-end">
                    <Input id="we-start" type="number" placeholder="Start Year" className="h-14 rounded-2xl bg-white border-border/40 px-5 font-bold" />
                    <Input id="we-end" type="number" placeholder="End Year" className="h-14 rounded-2xl bg-white border-border/40 px-5 font-bold" />
                    <Button type="button" onClick={() => {
                      const title = (document.getElementById("we-title") as HTMLInputElement)?.value?.trim();
                      const company = (document.getElementById("we-company") as HTMLInputElement)?.value?.trim();
                      const desc = (document.getElementById("we-desc") as HTMLTextAreaElement)?.value?.trim();
                      const startYear = parseInt((document.getElementById("we-start") as HTMLInputElement)?.value);
                      const endYear = (document.getElementById("we-end") as HTMLInputElement)?.value?.trim();
                      if (!title || !company || !startYear) return;
                      setWorkExperience(prev => [...prev, { title, company, description: desc || "", start_year: startYear, end_year: endYear ? parseInt(endYear) : null, is_current: !endYear }]);
                      (document.getElementById("we-title") as HTMLInputElement).value = "";
                      (document.getElementById("we-company") as HTMLInputElement).value = "";
                      (document.getElementById("we-desc") as HTMLTextAreaElement).value = "";
                      (document.getElementById("we-start") as HTMLInputElement).value = "";
                      (document.getElementById("we-end") as HTMLInputElement).value = "";
                    }} className="h-14 rounded-2xl bg-primary/10 text-primary hover:bg-primary/20 border-0 font-black text-xs uppercase tracking-widest">
                      <Plus className="h-5 w-5 mr-2" /> Add
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        case 3:
          return (
            <motion.div key="step3" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-12">
              <div className="space-y-3">
                <h2 className="font-display text-4xl font-black tracking-tight leading-[1.1]">Education & Certifications</h2>
                <p className="text-muted-foreground font-medium text-lg leading-relaxed max-w-xl">Add your educational background and professional certifications.</p>
              </div>
              <div className="space-y-10 bg-white/40 backdrop-blur-md rounded-[2.5rem] p-10 border border-white/60 shadow-sm">
                {/* Education */}
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Education</Label>
                  {education.map((ed, idx) => (
                    <div key={idx} className="flex items-center justify-between p-5 rounded-[1.5rem] border border-white/60 bg-white/40">
                      <div><p className="font-black text-sm">{ed.degree}</p><p className="text-[10px] font-bold text-muted-foreground/60 uppercase">{ed.institution} &bull; {ed.year}</p></div>
                      <button onClick={() => setEducation(prev => prev.filter((_, i) => i !== idx))} className="p-2 text-muted-foreground/40 hover:text-destructive"><X className="h-4 w-4" /></button>
                    </div>
                  ))}
                  <div className="grid sm:grid-cols-3 gap-4">
                    <Input id="edu-degree" placeholder="Degree *" className="h-14 rounded-2xl bg-white border-border/40 px-5 font-bold" />
                    <Input id="edu-institution" placeholder="Institution *" className="h-14 rounded-2xl bg-white border-border/40 px-5 font-bold" />
                    <div className="flex gap-3">
                      <Input id="edu-year" type="number" placeholder="Year" className="h-14 rounded-2xl bg-white border-border/40 px-5 font-bold" />
                      <Button type="button" onClick={() => {
                        const degree = (document.getElementById("edu-degree") as HTMLInputElement)?.value?.trim();
                        const institution = (document.getElementById("edu-institution") as HTMLInputElement)?.value?.trim();
                        const year = parseInt((document.getElementById("edu-year") as HTMLInputElement)?.value);
                        if (!degree || !institution || !year) return;
                        setEducation(prev => [...prev, { degree, institution, year }]);
                        (document.getElementById("edu-degree") as HTMLInputElement).value = "";
                        (document.getElementById("edu-institution") as HTMLInputElement).value = "";
                        (document.getElementById("edu-year") as HTMLInputElement).value = "";
                      }} className="h-14 w-14 rounded-2xl shrink-0 bg-primary/10 text-primary hover:bg-primary/20 border-0"><Plus className="h-5 w-5" /></Button>
                    </div>
                  </div>
                </div>

                {/* Certifications */}
                <div className="space-y-4 pt-6 border-t border-border/5">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Certifications</Label>
                  {certifications.map((cert, idx) => (
                    <div key={idx} className="flex items-center justify-between p-5 rounded-[1.5rem] border border-white/60 bg-white/40">
                      <div className="flex items-center gap-4">
                        <Award className="h-6 w-6 text-primary/40" />
                        <div><p className="font-black text-sm">{cert.name}</p><p className="text-[10px] font-bold text-muted-foreground/60 uppercase">{cert.issuer} &bull; {cert.year}</p></div>
                      </div>
                      <button onClick={() => removeCertification(idx)} className="p-2 text-muted-foreground/40 hover:text-destructive"><X className="h-4 w-4" /></button>
                    </div>
                  ))}
                  <div className="grid sm:grid-cols-3 gap-4">
                    <Input value={certName} onChange={(e) => setCertName(e.target.value)} placeholder="Certification Name" className="h-14 rounded-2xl bg-white border-border/40 px-5 font-bold" />
                    <Input value={certIssuer} onChange={(e) => setCertIssuer(e.target.value)} placeholder="Issuing Authority" className="h-14 rounded-2xl bg-white border-border/40 px-5 font-bold" />
                    <div className="flex gap-3">
                      <Input type="number" value={certYear} onChange={(e) => setCertYear(e.target.value)} placeholder="Year" className="h-14 rounded-2xl bg-white border-border/40 px-5 font-bold" />
                      <Button type="button" onClick={addCertification} className="h-14 w-14 rounded-2xl shrink-0 bg-primary/10 text-primary hover:bg-primary/20 border-0"><Plus className="h-5 w-5" /></Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        case 4:
          return (
            <motion.div key="step4" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-12">
              <div className="space-y-3">
                <h2 className="font-display text-4xl font-black tracking-tight leading-[1.1]">Languages</h2>
                <p className="text-muted-foreground font-medium text-lg leading-relaxed max-w-xl">What languages do you speak? This helps match you with global clients.</p>
              </div>
              <div className="space-y-6 bg-white/40 backdrop-blur-md rounded-[2.5rem] p-10 border border-white/60 shadow-sm">
                {languages.map((lang, idx) => (
                  <div key={idx} className="flex items-center justify-between p-5 rounded-[1.5rem] border border-white/60 bg-white/40">
                    <div className="flex items-center gap-4">
                      <Globe className="h-5 w-5 text-primary/40" />
                      <div>
                        <p className="font-black text-sm">{lang.language}</p>
                        <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest capitalize">{lang.proficiency}</p>
                      </div>
                    </div>
                    <button onClick={() => setLanguages(prev => prev.filter((_, i) => i !== idx))} className="p-2 text-muted-foreground/40 hover:text-destructive"><X className="h-4 w-4" /></button>
                  </div>
                ))}
                <div className="grid sm:grid-cols-3 gap-4 items-end">
                  <Input id="lang-name" placeholder="Language *" className="h-14 rounded-2xl bg-white border-border/40 px-5 font-bold" />
                  <select id="lang-prof" className="h-14 rounded-2xl bg-white border border-border/40 px-5 font-bold text-sm">
                    {PROFICIENCY_LEVELS.map(p => <option key={p} value={p} className="capitalize">{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                  </select>
                  <Button type="button" onClick={() => {
                    const language = (document.getElementById("lang-name") as HTMLInputElement)?.value?.trim();
                    const proficiency = (document.getElementById("lang-prof") as HTMLSelectElement)?.value as Language["proficiency"];
                    if (!language) return;
                    setLanguages(prev => [...prev, { language, proficiency }]);
                    (document.getElementById("lang-name") as HTMLInputElement).value = "";
                  }} className="h-14 rounded-2xl bg-primary/10 text-primary hover:bg-primary/20 border-0 font-black text-xs uppercase tracking-widest">
                    <Plus className="h-5 w-5 mr-2" /> Add Language
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        case 5:
          return (
            <motion.div key="step5" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-12">
              <div className="space-y-3">
                <h2 className="font-display text-4xl font-black tracking-tight leading-[1.1]">Pricing & Availability</h2>
                <p className="text-muted-foreground font-medium text-lg leading-relaxed max-w-xl">Set your rates and availability so clients know what to expect.</p>
              </div>
              <div className="space-y-8 bg-white/40 backdrop-blur-md rounded-[2.5rem] p-10 border border-white/60 shadow-sm">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Hourly Rate (USD)</Label>
                  <div className="relative">
                    <Input type="number" min="0" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} placeholder="75" className="h-16 rounded-2xl bg-white border-border/40 px-6 font-bold text-xl" />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-widest text-primary/40">$/hr</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Preferred Pricing Model</Label>
                  <div className="grid grid-cols-3 gap-4">
                    {["hourly", "fixed", "both"].map(model => (
                      <button key={model} onClick={() => setPreferredPricingModel(model)} className={`p-6 rounded-[1.5rem] border-2 text-xs font-black uppercase tracking-widest transition-all ${preferredPricingModel === model ? "bg-primary text-primary-foreground border-primary" : "bg-white border-border/40 text-muted-foreground hover:border-primary/40"}`}>
                        {model === "both" ? "Both" : model.charAt(0).toUpperCase() + model.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Availability Status</Label>
                  <div className="grid grid-cols-3 gap-4">
                    {[{ key: "available", label: "Available", color: "text-emerald-600" }, { key: "limited", label: "Limited", color: "text-amber-600" }, { key: "unavailable", label: "Unavailable", color: "text-muted-foreground" }].map(opt => (
                      <button key={opt.key} onClick={() => setAvailabilityStatus(opt.key)} className={`p-6 rounded-[1.5rem] border-2 text-xs font-black uppercase tracking-widest transition-all ${availabilityStatus === opt.key ? "bg-primary text-primary-foreground border-primary" : "bg-white border-border/40 text-muted-foreground hover:border-primary/40"}`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Typical Response Time</Label>
                  <div className="grid grid-cols-3 gap-4">
                    {["<1h", "<24h", "2-3 days"].map(rt => (
                      <button key={rt} onClick={() => setResponseTimeExpectation(rt)} className={`p-6 rounded-[1.5rem] border-2 text-xs font-black uppercase tracking-widest transition-all ${responseTimeExpectation === rt ? "bg-primary text-primary-foreground border-primary" : "bg-white border-border/40 text-muted-foreground hover:border-primary/40"}`}>
                        {rt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        case 6:
          return (
            <motion.div key="step6" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-12">
              <div className="space-y-3">
                <h2 className="font-display text-4xl font-black tracking-tight leading-[1.1]">Portfolio</h2>
                <p className="text-muted-foreground font-medium text-lg leading-relaxed max-w-xl">Showcase your most impactful projects. Visual proof builds trust.</p>
              </div>
              <div className="space-y-10">
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePortfolioUpload} />
                <button onClick={() => setIsPortfolioFormOpen(true)} className="w-full group relative rounded-[2.5rem] border-2 border-dashed border-primary/20 bg-white/40 hover:bg-primary/5 transition-all py-24 flex flex-col items-center gap-6 shadow-sm overflow-hidden">
                  <div className="relative h-20 w-20 rounded-[2rem] bg-white border border-primary/10 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-500">
                    <Plus className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-lg font-black uppercase tracking-[0.2em] text-primary">Add Project</span>
                </button>
                {portfolio.length > 0 && (
                  <div className="grid gap-8 sm:grid-cols-2">
                    {portfolio.map((item) => (
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} key={item.id} className="relative group aspect-video rounded-[2rem] overflow-hidden border border-white/60 shadow-elegant bg-card/60">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.title} className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-primary/20"><ImageIcon className="h-16 w-16" /></div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 p-8 flex flex-col justify-between">
                          <div className="flex justify-end">
                            <Button size="icon" variant="destructive" onClick={(e) => { e.stopPropagation(); deletePortfolioItem(item); }} className="h-10 w-10 rounded-xl"><Trash2 className="h-5 w-5" /></Button>
                          </div>
                          <p className="font-black text-xl text-white tracking-tight truncate">{item.title}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          );
        case 7:
          {
            const completionScore = (profile as any)?.profile_completion_score ?? 0;
            const blocking = [
              { label: "Display name", pass: displayName.trim().length > 0 },
              { label: "Bio ≥ 50 characters", pass: bio.trim().length >= 50 },
              { label: "≥ 3 skills", pass: skills.length >= 3 },
              { label: "≥ 1 service category", pass: selectedCategories.length > 0 },
              { label: "Work experience or 2+ years", pass: workExperience.length > 0 || parseInt(experienceYears) >= 2 },
            ];
            const warnings = [
              { label: "Profile photo", pass: !!avatarUrl },
              { label: "Education entries", pass: education.length > 0 },
              { label: "Certifications", pass: certifications.length > 0 },
              { label: "Languages", pass: languages.length > 0 },
              { label: "Portfolio items", pass: portfolio.length > 0 },
            ];
            const allBlockingPass = blocking.every(b => b.pass);

            return (
              <motion.div key="step7" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-12">
                <div className="space-y-3">
                  <h2 className="font-display text-4xl font-black tracking-tight leading-[1.1]">Review & Submit</h2>
                  <p className="text-muted-foreground font-medium text-lg leading-relaxed max-w-xl">Review your profile before submitting for verification.</p>
                </div>
                <div className="space-y-8 bg-white/40 backdrop-blur-md rounded-[2.5rem] p-10 border border-white/60 shadow-sm">
                  {/* Completeness Score */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm font-bold">
                      <span>Profile Completeness</span>
                      <span className="text-primary">{completionScore}%</span>
                    </div>
                    <Progress value={completionScore} className="h-3" />
                  </div>

                  {/* Blocking Requirements */}
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Required</h3>
                    {blocking.map((b, i) => (
                      <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${b.pass ? "bg-success/5 text-success" : "bg-destructive/5 text-destructive"}`}>
                        {b.pass ? <CheckCircle className="h-4 w-4" /> : <X className="h-4 w-4" />}
                        <span className="text-sm font-bold">{b.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Warnings */}
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Recommended</h3>
                    {warnings.map((w, i) => (
                      <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${w.pass ? "bg-success/5 text-success" : "bg-amber-50 text-amber-600"}`}>
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
          }
        default:
          return null;
      }
    };

    return (
      <AppShell>
        <div className="relative isolate min-h-screen">
          {/* Premium Mesh Background */}
          <div className="absolute inset-x-0 top-0 -z-10 h-[600px] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
            <div className="absolute top-[5%] left-[20%] h-64 w-64 rounded-full bg-primary/5 blur-[100px]" />
            <div className="absolute top-[15%] right-[25%] h-80 w-80 rounded-full bg-indigo-500/5 blur-[120px]" />
          </div>

          <div className="max-w-4xl mx-auto px-6 lg:px-12 py-10 space-y-12 pb-24">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <div className="space-y-8">
                <div className="flex flex-wrap items-center justify-between gap-6">
                  <div className="inline-flex items-center gap-2 rounded-xl bg-white/60 backdrop-blur-sm border border-primary/20 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-primary shadow-sm">
                    <Sparkles className="h-3.5 w-3.5" /> Discovery Phase &bull; {WIZARD_STEPS[wizardStep]}
                  </div>

                  {/* Profile Strength Meter */}
                  <div className="flex flex-col items-end gap-2 group cursor-help">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{currentStrength.label}</span>
                      <span className="text-[11px] font-black text-primary">{strength}%</span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`h-1.5 w-8 rounded-full transition-all duration-500 ${strength >= i * 20 ? currentStrength.color : "bg-muted/40"}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
                    {WIZARD_STEPS.map((s, i) => (
                      <span key={s} className={`transition-colors duration-500 ${i <= wizardStep ? "text-primary" : ""}`}>{s}</span>
                    ))}
                  </div>
                  <div className="h-2 rounded-full bg-white/40 border border-white/60 overflow-hidden shadow-inner">
                    <motion.div
                      className="h-full bg-gradient-to-r from-primary to-indigo-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            <AnimatePresence mode="wait">
              {renderStep()}
            </AnimatePresence>

            <div className="flex justify-between items-center pt-10 border-t border-border/5">
              <Button variant="ghost" onClick={() => setWizardStep(Math.max(0, wizardStep - 1))} disabled={wizardStep === 0} className="rounded-2xl h-14 px-8 gap-3 font-black text-xs uppercase tracking-widest hover:bg-white/50 backdrop-blur-sm">
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>
              {wizardStep < WIZARD_STEPS.length - 1 ? (
                <Button onClick={handleNextStep} disabled={!canProceed() || saving} className="rounded-[1.5rem] h-16 px-12 gap-3 bg-primary text-primary-foreground shadow-elegant hover:scale-[1.03] transition-all font-black uppercase tracking-[0.2em] text-xs">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Execute Next Phase <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmitApplication} disabled={submitting} className="rounded-[1.5rem] h-16 px-12 gap-3 bg-gradient-to-r from-primary to-indigo-600 text-white shadow-elegant hover:scale-[1.03] transition-all font-black uppercase tracking-[0.2em] text-xs border-0">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
                  Engage Elite Network
                </Button>
              )}
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  // Loading state (if needed, though profile should be loaded by AuthContext)
  // This block was added in the diff, but the original code didn't have a `loading` state.
  // Assuming `profile` is available or `user` is null, so this might not be strictly necessary
  // unless there's an explicit `loading` state in AuthContext.
  // For now, I'll include it as per the diff, assuming `loading` is a variable that needs to be defined
  // or removed if not used. Since it's not defined, I'll comment it out or remove it if it causes issues.
  // For this task, I'll assume it's a placeholder and remove it as it's not part of the original code.

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
              <p className="text-muted-foreground/60 text-lg font-medium max-w-md mx-auto">Your profile has been submitted for review. We'll notify you once you're approved.</p>
            </div>
          </motion.div>

          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: "50%",
                  y: "50%",
                  scale: 0,
                  opacity: 1
                }}
                animate={{
                  x: `${Math.random() * 100}%`,
                  y: `${Math.random() * 100}%`,
                  scale: Math.random() * 2 + 1,
                  opacity: 0
                }}
                transition={{
                  duration: 2,
                  delay: Math.random() * 0.5,
                  ease: "easeOut"
                }}
                className="absolute h-2 w-2 rounded-full bg-primary"
              />
            ))}
          </div>
        </div>
      </AppShell>
    );
  }

  // === RETURNING FREELANCER — FULL EDIT MODE ===
  return (
    <AppShell>
      <div className="relative min-h-screen bg-[#fafafa]">
        {/* Elite Mesh Context */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden isolate">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
          <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-indigo-500/5 blur-[150px]" />
          <div className="absolute -bottom-[10%] left-[20%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 space-y-12 pb-24 pt-12">
          {/* Dashboard Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-black/[0.03]">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-white border border-black/[0.03] px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  Profile Setup
                </div>
                <h1 className="font-display text-5xl font-black tracking-tight leading-none">Edit Profile</h1>
                <p className="text-muted-foreground font-medium text-lg leading-relaxed max-w-xl">Update your professional presence and portfolio.</p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                {!profile?.application_status && (
                  <Button onClick={handleSubmitApplication} disabled={submitting} variant="outline" className="h-16 px-10 rounded-2xl bg-white border-primary/20 text-primary hover:bg-primary/5 shadow-sm font-black uppercase tracking-widest text-xs gap-3">
                    {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    Submit Application
                  </Button>
                )}
                <Button onClick={() => handleSaveProfile()} disabled={saving} className="h-16 px-12 rounded-2xl bg-primary text-primary-foreground shadow-elegant hover:scale-[1.03] transition-all font-black uppercase tracking-widest text-xs gap-3 border-0">
                  {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
                  Save Changes
                </Button>
              </div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-[1fr_420px] gap-12 items-start">
            {/* Control Matrix */}
            <div className="space-y-12">
              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-black/5" />
                  <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary whitespace-nowrap">Profile Information</h2>
                  <div className="h-px flex-1 bg-black/5" />
                </div>

                <div className="grid gap-8 bg-white/60 backdrop-blur-xl rounded-[3rem] p-12 border border-white shadow-sm">
                  <div className="flex flex-col sm:flex-row items-center gap-10 pb-10 border-b border-black/[0.03]">
                    <div className="relative group cursor-pointer" onClick={() => avatarFileRef.current?.click()}>
                      <div className="h-40 w-40 rounded-[2.5rem] bg-white border-[6px] border-white shadow-2xl overflow-hidden group-hover:scale-105 transition-all duration-500">
                        {(avatarPreview || avatarUrl) ? (
                          <img src={avatarPreview || avatarUrl} alt="Profile" className="w-full h-full object-cover" style={{ transform: `scale(${zoom})`, objectPosition: `${position.x}% ${position.y}%` }} />
                        ) : (
                          <div className="h-full w-full bg-primary/5 flex items-center justify-center"><User className="h-12 w-12 text-primary/20" /></div>
                        )}
                        {uploadingAvatar && <div className="absolute inset-0 bg-white/80 flex items-center justify-center backdrop-blur-sm"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
                      </div>
                      <div className="absolute -bottom-2 -right-2 h-12 w-12 rounded-2xl bg-primary text-white shadow-xl flex items-center justify-center group-hover:rotate-12 transition-all">
                        <Upload className="h-5 w-5" />
                      </div>
                      <input ref={avatarFileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                    </div>
                    <div className="space-y-3 text-center sm:text-left flex-1">
                      <h3 className="text-xl font-black tracking-tight">Profile Photo</h3>
                      <p className="text-muted-foreground/60 text-sm font-medium leading-relaxed">A professional photo helps you build trust with potential clients.</p>
                      <div className="flex gap-3 justify-center sm:justify-start pt-2">
                        <Button variant="ghost" size="sm" onClick={() => avatarFileRef.current?.click()} className="rounded-xl font-black text-[10px] uppercase tracking-widest h-10 px-6 border border-black/5 hover:bg-white bg-white/40">Upload New</Button>
                        <Button variant="ghost" size="sm" onClick={() => setIsAdjustingAvatar(true)} className="rounded-xl font-black text-[10px] uppercase tracking-widest h-10 px-6 border border-black/5 hover:bg-white bg-white/40">Adjust Photo</Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-8 pt-4">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 ml-1">Full Name</Label>
                      <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Full Name" className="h-16 rounded-[1.5rem] bg-white border-black/[0.03] px-6 font-bold text-lg shadow-inner-sm focus:ring-primary/20" />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 ml-1">Professional Title</Label>
                      <Input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="e.g. Lead System Architect" className="h-16 rounded-[1.5rem] bg-white border-black/[0.03] px-6 font-bold text-lg shadow-inner-sm focus:ring-primary/20" />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 ml-1">Location</Label>
                      <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Country" className="h-16 rounded-[1.5rem] bg-white border-black/[0.03] px-6 font-bold text-lg shadow-inner-sm focus:ring-primary/20" />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 ml-1">Local Timezone</Label>
                      <div className="h-16 rounded-[1.5rem] bg-black/[0.02] border border-black/[0.03] px-6 flex items-center font-bold text-muted-foreground/60">{timezone}</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 ml-1">Professional Summary</Label>
                    <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={6} className="rounded-[2rem] bg-white border-black/[0.03] p-8 font-medium text-lg resize-none shadow-inner-sm focus:ring-primary/20 leading-relaxed" />
                  </div>
                </div>
              </section>

              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-black/5" />
                  <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary whitespace-nowrap">Portfolio & Skills</h2>
                  <div className="h-px flex-1 bg-black/5" />
                </div>

                <div className="bg-white/60 backdrop-blur-xl rounded-[3rem] p-12 border border-white shadow-sm space-y-10">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 ml-1">Skills</Label>
                    <div className="flex gap-3">
                      <Input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }} placeholder="Add Skill" className="h-16 rounded-[1.5rem] bg-white border-black/[0.03] px-6 font-bold text-lg shadow-inner-sm focus:ring-primary/20" />
                      <Button onClick={addSkill} className="h-16 w-16 rounded-[1.5rem] bg-primary/5 text-primary hover:bg-primary/10 border-0"><Plus /></Button>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-4">
                      {skills.map(s => (
                        <div key={s} className="flex items-center gap-3 rounded-xl bg-white border border-black/[0.03] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-primary shadow-sm group">
                          {s}
                          <button onClick={() => removeSkill(s)} className="text-primary/20 hover:text-destructive transition-colors"><X className="h-3 w-3" /></button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-10 border-t border-black/[0.03] space-y-6">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 ml-1">Certifications</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {certifications.map((c, i) => (
                        <div key={i} className="flex items-center justify-between p-6 rounded-[2rem] bg-white border border-black/[0.03] shadow-sm">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary"><Award className="h-6 w-6" /></div>
                            <div>
                              <p className="font-black text-xs uppercase tracking-tight truncate max-w-[120px]">{c.name}</p>
                              <p className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">{c.issuer}</p>
                            </div>
                          </div>
                          <button onClick={() => removeCertification(i)} className="p-2 text-muted-foreground/20 hover:text-destructive transition-colors"><X className="h-4 w-4" /></button>
                        </div>
                      ))}
                      <button onClick={() => setWizardStep(2)} className="flex items-center justify-center p-6 rounded-[2rem] border-2 border-dashed border-black/5 hover:border-primary/20 bg-white/40 hover:bg-white transition-all text-[10px] font-black uppercase tracking-widest text-primary/40 hover:text-primary">
                        <Plus className="h-4 w-4 mr-2" /> Add Certification
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Live Preview */}
            <div className="lg:sticky lg:top-12 space-y-8">
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-black/5" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary whitespace-nowrap">Live Preview</h2>
                <div className="h-px flex-1 bg-black/5" />
              </div>

              <Card className="relative rounded-[3.5rem] border-0 bg-white shadow-2xl overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                <div className="h-32 bg-gradient-to-r from-primary via-indigo-600 to-primary/80 relative">
                </div>
                <CardContent className="px-10 pb-12">
                  <div className="-mt-16 mb-8 relative z-10">
                    <div className="inline-block relative">
                      <div className="h-32 w-32 rounded-[2.5rem] bg-white border-[6px] border-white shadow-2xl overflow-hidden shadow-elegant-dark">
                        {(avatarPreview || avatarUrl) ? (
                          <img src={avatarPreview || avatarUrl} alt="Preview" className="w-full h-full object-cover" style={{ transform: `scale(${zoom})`, objectPosition: `${position.x}% ${position.y}%` }} />
                        ) : (
                          <div className="h-full w-full bg-primary/10 flex items-center justify-center font-display font-black text-primary text-4xl">{(displayName || "?")[0]}</div>
                        )}
                      </div>
                      <div className={`absolute bottom-0 right-0 h-8 w-8 rounded-2xl ${activityStatus.color} border-4 border-white shadow-lg flex items-center justify-center`}>
                        <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-display text-3xl font-black tracking-tight">{displayName || "Freelancer Name"}</h3>
                      </div>
                      <p className="font-bold text-muted-foreground leading-snug">{headline || "Professional Headline"}</p>
                      <div className="flex items-center gap-4 pt-1 font-black text-[9px] uppercase tracking-widest text-muted-foreground/40">
                        <span className="flex items-center gap-2"><Globe className="h-3.5 w-3.5" />{country}</span>
                        <span className="h-1 w-1 rounded-full bg-black/10" />
                        <span className="flex items-center gap-2"><Clock className="h-3.5 w-3.5" />{timezone}</span>
                      </div>
                    </div>

                    <div className="space-y-4 pt-8 border-t border-black/[0.03]">
                      <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">Service Categories</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedCategories.map(id => (
                          <Badge key={id} className="bg-black/5 text-black hover:bg-black/10 border-0 rounded-lg px-3 py-1.5 text-[9px] font-black uppercase tracking-widest">
                            {allCategories.find(c => c.id === id)?.name}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="pt-8 border-t border-black/[0.03]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Profile Strength</span>
                        <span className="text-[10px] font-black text-primary">{Math.round(strength)}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-black/5 overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${strength}%` }} className="h-full bg-primary" />
                      </div>
                    </div>

                    <Button onClick={() => navigate(`/freelancer/${user?.id}`)} variant="ghost" className="w-full h-14 rounded-2xl border border-black/5 font-black uppercase tracking-widest text-[10px] hover:bg-black/5 mt-4 group">
                      View Public Profile
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Portfolo Form Bridge */}
      {user && (
        <PortfolioProjectForm
          isOpen={isPortfolioFormOpen}
          onClose={() => setIsPortfolioFormOpen(false)}
          onSave={(item) => setPortfolio([...portfolio, item])}
          userId={user.id}
        />
      )}

      {/* Refinement Modals */}
      <Dialog open={isAdjustingAvatar} onOpenChange={setIsAdjustingAvatar}>
        <DialogContent className="sm:max-w-md rounded-[3rem] border-0 shadow-2xl p-0 overflow-hidden">
          <div className="p-10 space-y-10">
            <DialogHeader>
              <DialogTitle className="font-display text-4xl font-black tracking-tight text-center">Adjust Photo</DialogTitle>
            </DialogHeader>
            <div className="space-y-12">
              <div className="flex justify-center">
                <div className="h-56 w-56 rounded-[2.5rem] overflow-hidden border-[8px] border-black/5 shadow-inner-lg relative isolate">
                  <div className="absolute inset-0 bg-primary/5" />
                  {avatarPreview && (
                    <img src={avatarPreview} alt="Crop" className="w-full h-full object-cover relative z-10" style={{ transform: `scale(${zoom})`, objectPosition: `${position.x}% ${position.y}%` }} />
                  )}
                </div>
              </div>
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                    <span className="flex items-center gap-2"><ZoomIn className="h-3 w-3" /> Zoom</span>
                    <span>{Math.round(zoom * 100)}%</span>
                  </div>
                  <Slider value={[zoom]} min={1} max={3} step={0.01} onValueChange={([v]) => setZoom(v)} className="py-2" />
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                    <span className="flex items-center gap-2"><Move className="h-3 w-3" /> Horizontal</span>
                    <span>{position.x}%</span>
                  </div>
                  <Slider value={[position.x]} min={0} max={100} step={1} onValueChange={([v]) => setPosition(p => ({ ...p, x: v }))} className="py-2" />
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                    <span className="flex items-center gap-2"><Move className="h-3 w-3" /> Vertical</span>
                    <span>{position.y}%</span>
                  </div>
                  <Slider value={[position.y]} min={0} max={100} step={1} onValueChange={([v]) => setPosition(p => ({ ...p, y: v }))} className="py-2" />
                </div>
              </div>
            </div>
          </div>
          <div className="flex p-4 gap-2 bg-black/5">
            <Button variant="ghost" onClick={() => setIsAdjustingAvatar(false)} className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px]">Cancel</Button>
            <Button onClick={saveAvatarAdjusted} className="flex-[2] h-14 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-[10px] shadow-lg">Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
};

export default EditProfile;
