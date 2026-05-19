"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/lib/hooks/use-toast";
import { Image, Upload, X } from "lucide-react";

interface Props {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    onCreated?: () => void;
}

export function CreateStoryDialog({ open, onOpenChange, onCreated }: Props) {
    const { toast } = useToast();
    const [preview, setPreview] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [caption, setCaption] = useState("");
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
        const f = e.target.files?.[0];
        if (!f) return;
        setFile(f);
        setPreview(URL.createObjectURL(f));
    }

    async function handleSubmit() {
        if (!file) return;
        setUploading(true);
        try {
            // Upload media
            const formData = new FormData();
            formData.append("files", file);
            const uploadRes = await fetch("/api/media/upload", { method: "POST", body: formData });
            if (!uploadRes.ok) throw new Error("Upload failed");
            const { files } = await uploadRes.json();
            const { url } = files[0];

            // Create story
            const res = await fetch("/api/stories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ media_url: url, media_type: file.type.startsWith("video") ? "video" : "image", caption }),
            });
            if (!res.ok) throw new Error("Failed to create story");

            toast({ title: "Story posted!" });
            onCreated?.();
            onOpenChange(false);
            setPreview(null);
            setFile(null);
            setCaption("");
        } catch (e) {
            toast({ title: "Failed to post story", variant: "destructive" });
        } finally {
            setUploading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Add to Your Story</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {!preview ? (
                        <button
                            onClick={() => fileRef.current?.click()}
                            className="w-full h-64 rounded-xl border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <Upload className="w-10 h-10" />
                            <span className="text-sm">Tap to upload photo or video</span>
                        </button>
                    ) : (
                        <div className="relative rounded-xl overflow-hidden aspect-[9/16]">
                            {file?.type.startsWith("video") ? (
                                <video src={preview} className="w-full h-full object-cover" muted />
                            ) : (
                                <img src={preview} alt="" className="w-full h-full object-cover" />
                            )}
                            <button
                                onClick={() => { setPreview(null); setFile(null); }}
                                className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFile} />

                    <Textarea
                        placeholder="Add a caption…"
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        rows={2}
                        maxLength={200}
                    />

                    <Button onClick={handleSubmit} disabled={!file || uploading} className="w-full">
                        {uploading ? "Posting…" : "Share Story"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
