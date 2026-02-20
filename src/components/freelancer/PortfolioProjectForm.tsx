import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Upload, Image as ImageIcon, Video, Link as LinkIcon, FileText, Type, Music, Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type PortfolioContentBlock = {
    type: 'image' | 'video' | 'text' | 'link' | 'file';
    url?: string;
    content?: string;
    id: string;
};

interface PortfolioProjectFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (item: any) => void;
    userId: string;
}

export const PortfolioProjectForm = ({ isOpen, onClose, onSave, userId }: PortfolioProjectFormProps) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState("");
    const [role, setRole] = useState("");
    const [description, setDescription] = useState("");
    const [skillInput, setSkillInput] = useState("");
    const [skills, setSkills] = useState<string[]>([]);
    const [blocks, setBlocks] = useState<PortfolioContentBlock[]>([]);
    const [uploading, setUploading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [currentBlockType, setCurrentBlockType] = useState<PortfolioContentBlock['type'] | null>(null);

    const addSkill = () => {
        const s = skillInput.trim();
        if (s && !skills.includes(s)) setSkills([...skills, s]);
        setSkillInput("");
    };

    const removeSkill = (s: string) => setSkills(skills.filter((x) => x !== s));

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !currentBlockType) return;

        // Allow images for 'image' type, and PDFs/Docs for 'file' type
        if (currentBlockType === 'image' && !file.type.startsWith('image/')) {
            toast({ title: "Invalid file type", description: "Please upload an image file.", variant: "destructive" });
            return;
        }

        if (currentBlockType === 'file' && file.type !== 'application/pdf' && !file.type.startsWith('text/')) {
            // We'll allow PDFs and text files for now
            // If it's a docx etc, mime type might be different, but PDF is the priority
        }

        setUploading(true);
        const fileName = `${userId}/portfolio/${Date.now()}-${file.name}`;

        try {
            const { error: upErr } = await supabase.storage.from("portfolio").upload(fileName, file);

            if (upErr) {
                toast({ title: "Upload failed", description: upErr.message, variant: "destructive" });
                setUploading(false);
                return;
            }

            const { data: urlData } = supabase.storage.from("portfolio").getPublicUrl(fileName);

            const newBlock: PortfolioContentBlock = {
                id: Math.random().toString(36).substr(2, 9),
                type: currentBlockType,
                url: urlData.publicUrl,
            };

            setBlocks([...blocks, newBlock]);
        } catch (error: any) {
            toast({ title: "Unexpected error", description: error.message, variant: "destructive" });
        } finally {
            setUploading(false);
            setCurrentBlockType(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const getVideoEmbedUrl = (url: string) => {
        if (!url) return null;

        // Youtube
        const ytMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/);
        if (ytMatch && ytMatch[1]) {
            const id = ytMatch[1].split('&')[0].split('?')[0];
            return `https://www.youtube.com/embed/${id}`;
        }

        // Vimeo
        const vimeoMatch = url.match(/(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/);
        if (vimeoMatch && vimeoMatch[1]) {
            return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
        }

        return null;
    };

    const addTextBlock = () => {
        setBlocks([...blocks, { id: Math.random().toString(36).substr(2, 9), type: 'text', content: "" }]);
    };

    const addLinkBlock = () => {
        setBlocks([...blocks, { id: Math.random().toString(36).substr(2, 9), type: 'link', url: "" }]);
    };

    const removeBlock = (id: string) => {
        setBlocks(blocks.filter(b => b.id !== id));
    };

    const updateBlockContent = (id: string, value: string) => {
        setBlocks(blocks.map(b => b.id === id ? { ...b, content: value } : b));
    };

    const updateBlockUrl = (id: string, value: string) => {
        setBlocks(blocks.map(b => b.id === id ? { ...b, url: value } : b));
    };

    const handleSave = async () => {
        if (!title || !description) {
            toast({ title: "Missing fields", description: "Title and description are required", variant: "destructive" });
            return;
        }

        setLoading(true);
        try {
            // First image block becomes the main image_url for thumbnail purposes
            const firstImage = blocks.find(b => b.type === 'image')?.url || "";

            const { data, error } = await supabase.from("portfolio_items").insert({
                freelancer_id: userId,
                title,
                role,
                description,
                skills_deliverables: skills,
                image_url: firstImage,
                project_data: blocks as any
            }).select().single();

            if (error) throw error;

            onSave(data);
            onClose();
            toast({ title: "Project added to portfolio!" });
        } catch (error: any) {
            toast({ title: "Failed to save project", description: error.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2rem]">
                <DialogHeader>
                    <DialogTitle className="font-display text-2xl font-bold">Add a new portfolio project</DialogTitle>
                    <p className="text-sm text-muted-foreground mt-1">All fields are required unless otherwise indicated.</p>
                </DialogHeader>

                <div className="grid md:grid-cols-2 gap-8 py-6">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60">Project title *</Label>
                            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter a brief but descriptive title" className="h-12 rounded-xl bg-muted/20 border-border/40 px-4" />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60">Your role (optional)</Label>
                            <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Front-end engineer or Marketing analyst" className="h-12 rounded-xl bg-muted/20 border-border/40 px-4" />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60">Project description *</Label>
                            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Briefly describe the project's goals, your solution and the impact you made here." className="rounded-xl bg-muted/20 border-border/40 p-4 resize-none" />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60">Skills and deliverables *</Label>
                            <div className="flex gap-2">
                                <Input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }} placeholder="Add skill relevant to this project" className="h-12 rounded-xl bg-muted/20 border-border/40 px-4" />
                                <Button type="button" variant="outline" onClick={addSkill} className="h-12 w-12 rounded-xl shrink-0"><Plus /></Button>
                            </div>
                            <div className="flex flex-wrap gap-2 pt-2">
                                {skills.map(s => (
                                    <Badge key={s} variant="secondary" className="rounded-lg py-1 px-3 gap-2">
                                        {s} <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => removeSkill(s)} />
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60">Project Content</Label>

                        <div className="min-h-[300px] border-2 border-dashed border-border/40 rounded-3xl p-6 flex flex-col items-center justify-center gap-6 bg-muted/5">
                            {blocks.length === 0 ? (
                                <div className="text-center space-y-4">
                                    <div className="flex justify-center gap-4">
                                        <Button variant="outline" size="icon" onClick={() => { setCurrentBlockType('image'); fileInputRef.current?.click(); }} className="h-12 w-12 rounded-xl hover:text-primary"><ImageIcon className="h-5 w-5" /></Button>
                                        <Button variant="outline" size="icon" onClick={() => { setCurrentBlockType('video'); fileInputRef.current?.click(); }} className="h-12 w-12 rounded-xl hover:text-primary"><Video className="h-5 w-5" /></Button>
                                        <Button variant="outline" size="icon" onClick={addTextBlock} className="h-12 w-12 rounded-xl hover:text-primary"><Type className="h-5 w-5" /></Button>
                                        <Button variant="outline" size="icon" onClick={addLinkBlock} className="h-12 w-12 rounded-xl hover:text-primary"><LinkIcon className="h-5 w-5" /></Button>
                                        <Button variant="outline" size="icon" onClick={() => { setCurrentBlockType('file'); fileInputRef.current?.click(); }} className="h-12 w-12 rounded-xl hover:text-primary"><FileText className="h-5 w-5" /></Button>
                                    </div>
                                    <p className="text-sm font-bold text-muted-foreground/60">Add content</p>
                                </div>
                            ) : (
                                <div className="w-full space-y-4">
                                    {blocks.map((block) => (
                                        <div key={block.id} className="relative group bg-background border border-border/20 rounded-2xl p-4">
                                            <button onClick={() => removeBlock(block.id)} className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X className="h-3 w-3" /></button>

                                            {block.type === 'image' && <img src={block.url} className="w-full rounded-lg object-contain max-h-48" />}
                                            {block.type === 'video' && (
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-3">
                                                        <Video className="h-5 w-5 text-primary" />
                                                        <Input value={block.url} onChange={(e) => updateBlockUrl(block.id, e.target.value)} placeholder="Video URL (Youtube/Vimeo)" className="h-9 text-xs" />
                                                    </div>
                                                    {getVideoEmbedUrl(block.url || "") && (
                                                        <div className="aspect-video w-full rounded-lg overflow-hidden border border-border/20">
                                                            <iframe
                                                                src={getVideoEmbedUrl(block.url || "")!}
                                                                className="w-full h-full"
                                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                allowFullScreen
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            {block.type === 'text' && <Textarea value={block.content} onChange={(e) => updateBlockContent(block.id, e.target.value)} placeholder="Write something..." className="min-h-24 text-sm" />}
                                            {block.type === 'link' && (
                                                <div className="flex items-center gap-3">
                                                    <LinkIcon className="h-5 w-5 text-primary" />
                                                    <Input value={block.url} onChange={(e) => updateBlockUrl(block.id, e.target.value)} placeholder="https://..." className="h-9 text-xs" />
                                                </div>
                                            )}
                                            {block.type === 'file' && (
                                                <div className="flex items-center gap-3">
                                                    <FileText className="h-5 w-5 text-primary" />
                                                    <span className="text-xs truncate max-w-[200px]">{block.url?.split('/').pop()}</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    <div className="flex justify-center gap-2 pt-4">
                                        <Button variant="outline" size="sm" onClick={() => { setCurrentBlockType('image'); fileInputRef.current?.click(); }} className="h-9 w-9 rounded-lg"><ImageIcon className="h-4 w-4" /></Button>
                                        <Button variant="outline" size="sm" onClick={() => { setCurrentBlockType('video'); fileInputRef.current?.click(); }} className="h-9 w-9 rounded-lg"><Video className="h-4 w-4" /></Button>
                                        <Button variant="outline" size="sm" onClick={addTextBlock} className="h-9 w-9 rounded-lg"><Type className="h-4 w-4" /></Button>
                                        <Button variant="outline" size="sm" onClick={addLinkBlock} className="h-9 w-9 rounded-lg"><LinkIcon className="h-4 w-4" /></Button>
                                        <Button variant="outline" size="sm" onClick={() => { setCurrentBlockType('file'); fileInputRef.current?.click(); }} className="h-9 w-9 rounded-lg"><FileText className="h-4 w-4" /></Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} />
                    </div>
                </div>

                <DialogFooter className="gap-3 sm:gap-0 border-t pt-6">
                    <Button variant="ghost" onClick={onClose} className="rounded-xl h-12 px-8">Cancel</Button>
                    <Button onClick={handleSave} disabled={loading || uploading} className="rounded-xl h-12 px-10 gap-3">
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Save Project"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
