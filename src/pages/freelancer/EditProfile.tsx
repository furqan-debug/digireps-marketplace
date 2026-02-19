import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, X, Plus, Upload, Trash2, User, Eye } from "lucide-react";
import { motion } from "framer-motion";

type PortfolioItem = { id: string; title: string; description: string | null; image_url: string };

const EditProfile = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [country, setCountry] = useState(profile?.country ?? "");
  const [timezone, setTimezone] = useState(profile?.timezone ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [experienceYears, setExperienceYears] = useState(profile?.experience_years?.toString() ?? "");
  const [skills, setSkills] = useState<string[]>(profile?.skills ?? []);
  const [skillInput, setSkillInput] = useState("");
  const [saving, setSaving] = useState(false);

  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("portfolio_items").select("*").eq("freelancer_id", user.id)
      .then(({ data }) => setPortfolio(data ?? []));
  }, [user]);

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) setSkills([...skills, s]);
    setSkillInput("");
  };
  const removeSkill = (s: string) => setSkills(skills.filter((x) => x !== s));

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      display_name: displayName.trim(),
      country: country.trim(),
      timezone: timezone.trim(),
      bio: bio.trim(),
      experience_years: experienceYears ? parseInt(experienceYears) : null,
      skills,
    }).eq("user_id", user.id);
    setSaving(false);
    if (error) {
      toast({ title: "Failed to save profile", description: error.message, variant: "destructive" });
    } else {
      await refreshProfile();
      toast({ title: "Profile saved!" });
    }
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

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl icon-gradient">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold">Edit Profile</h1>
              <p className="text-muted-foreground text-sm">Keep your profile up to date to attract more clients.</p>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_300px] gap-6 items-start">
          {/* Left: Form */}
          <div className="space-y-5">
            {/* Profile Info */}
            <Card>
              <CardHeader>
                <CardTitle className="font-display">Profile Information</CardTitle>
                <CardDescription>This is what clients will see (no email or contact info shown).</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Display Name / Alias</Label>
                  <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name or alias" className="h-11" />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g. United States" className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Input value={timezone} onChange={(e) => setTimezone(e.target.value)} placeholder="e.g. UTC-5" className="h-11" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Years of Experience</Label>
                  <Input type="number" min="0" max="50" value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} placeholder="e.g. 5" className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label>Short Bio</Label>
                  <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} placeholder="Describe your expertise and what makes you stand out..." />
                </div>

                {/* Skills */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Skills</Label>
                    {skills.length > 0 && (
                      <span className="text-xs text-muted-foreground rounded-full bg-primary/10 text-primary px-2 py-0.5">{skills.length} skill{skills.length !== 1 ? "s" : ""}</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); }}}
                      placeholder="Add a skill and press Enter"
                      className="h-10"
                    />
                    <Button type="button" variant="outline" size="sm" onClick={addSkill} className="h-10 px-3">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {skills.map((s) => (
                        <Badge key={s} variant="secondary" className="gap-1 pl-2.5">
                          {s}
                          <button onClick={() => removeSkill(s)} className="ml-0.5 hover:opacity-70"><X className="h-3 w-3" /></button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <Button onClick={handleSaveProfile} disabled={saving} className="w-full h-11 bg-gradient-to-r from-primary to-primary-glow border-0 text-primary-foreground hover:opacity-90 shadow-elegant">
                  {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</> : "Save Profile"}
                </Button>
              </CardContent>
            </Card>

            {/* Portfolio */}
            <Card>
              <CardHeader>
                <CardTitle className="font-display">Portfolio</CardTitle>
                <CardDescription>Upload work samples. Images are hosted on-platform only — no external links.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePortfolioUpload} />

                {/* Drop zone */}
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploadingPortfolio}
                  className="w-full rounded-xl border-2 border-dashed border-border/60 hover:border-primary/40 bg-muted/20 hover:bg-primary/5 transition-all py-8 flex flex-col items-center gap-2 text-muted-foreground hover:text-primary"
                >
                  {uploadingPortfolio ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                  ) : (
                    <Upload className="h-8 w-8" />
                  )}
                  <span className="text-sm font-medium">{uploadingPortfolio ? "Uploading..." : "Click to upload an image"}</span>
                  <span className="text-xs text-muted-foreground/60">PNG, JPG, GIF supported</span>
                </button>

                {portfolio.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center">No portfolio items yet.</p>
                )}
                <div className="grid gap-3 sm:grid-cols-2">
                  {portfolio.map((item) => (
                    <div key={item.id} className="relative group rounded-xl overflow-hidden border border-border/60">
                      <img src={item.image_url} alt={item.title} className="aspect-video w-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deletePortfolioItem(item)}
                          className="gap-1.5"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Remove
                        </Button>
                      </div>
                      {item.title && (
                        <div className="px-3 py-2 text-xs font-medium bg-card/90">{item.title}</div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Live preview */}
          <div className="lg:sticky lg:top-24 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Eye className="h-4 w-4" /> Client Preview
            </div>
            <Card className="border-border/60 overflow-hidden">
              <div className="h-16 bg-gradient-to-br from-primary via-primary-glow to-accent" />
              <CardContent className="pt-0">
                <div className="-mt-6 mb-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/30 to-primary-glow/20 border-2 border-card flex items-center justify-center font-display font-bold text-primary text-xl shadow-sm">
                    {(displayName || "?")[0]?.toUpperCase()}
                  </div>
                </div>
                <h3 className="font-display font-bold text-base">{displayName || "Your Name"}</h3>
                {country && <p className="text-xs text-muted-foreground mt-0.5">{country}</p>}
                {bio && <p className="text-xs text-muted-foreground mt-2 line-clamp-3">{bio}</p>}
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {skills.slice(0, 5).map((s) => (
                      <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                    ))}
                    {skills.length > 5 && <Badge variant="secondary" className="text-xs">+{skills.length - 5}</Badge>}
                  </div>
                )}
                {experienceYears && (
                  <p className="text-xs text-muted-foreground mt-2">{experienceYears}y experience</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default EditProfile;
