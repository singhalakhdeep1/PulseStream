"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCreatePost } from "@/lib/hooks/use-posts";
import { getInitials, cn } from "@/lib/utils";
import { ImagePlus, Loader2, X, Upload } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import type { Profile } from "@/types";

const MAX_POST_LENGTH = 2000;

interface Props { profile: Partial<Profile> | null }

export function CreatePostDialog({ profile }: Props) {
    const [open, setOpen] = useState(false);
    const [content, setContent] = useState("");
    const [mediaFiles, setMediaFiles] = useState<Array<{ file: File; preview: string }>>([]);
    const { mutate: createPost, isPending } = useCreatePost();

    const remaining = MAX_POST_LENGTH - content.length;
    const overLimit = remaining < 0;

    const onDrop = useCallback((accepted: File[], rejected: File[]) => {
        if (rejected.length > 0) {
            toast.error("Some files were rejected. Only images up to 5 MB are allowed.");
        }
        const newFiles = accepted.slice(0, 4 - mediaFiles.length).map((file) => ({
            file,
            preview: URL.createObjectURL(file),
        }));
        setMediaFiles((prev) => [...prev, ...newFiles].slice(0, 4));
    }, [mediaFiles.length]);

    const { getRootProps, getInputProps, isDragActive, open: openFileDialog } = useDropzone({
        onDrop,
        accept: { "image/*": [".jpg", ".jpeg", ".png", ".gif", ".webp"] },
        maxSize: 5 * 1024 * 1024,
        maxFiles: 4,
        noClick: true,
        noKeyboard: true,
    });

    const removeMedia = (index: number) => {
        setMediaFiles((prev) => {
            URL.revokeObjectURL(prev[index].preview);
            return prev.filter((_, i) => i !== index);
        });
    };

    const handleSubmit = () => {
        if (!content.trim() || overLimit || isPending) return;
        createPost(
            { content: content.trim() },
            {
                onSuccess: () => {
                    setContent("");
                    mediaFiles.forEach((f) => URL.revokeObjectURL(f.preview));
                    setMediaFiles([]);
                    setOpen(false);
                    toast.success("Post published!");
                },
                onError: () => toast.error("Failed to publish post. Try again."),
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <div className="flex items-center gap-3 cursor-text w-full">
                    <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage src={profile?.avatar_url ?? undefined} />
                        <AvatarFallback>{getInitials(profile?.full_name ?? "?")}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-muted-foreground text-sm border border-border rounded-full px-4 py-2.5 hover:bg-muted/50 transition-colors">
                        What&apos;s happening?
                    </div>
                </div>
            </DialogTrigger>

            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Create post</DialogTitle>
                </DialogHeader>

                {/* Dropzone wrapper */}
                <div
                    {...getRootProps()}
                    className={cn(
                        "rounded-lg transition-colors",
                        isDragActive && "ring-2 ring-primary bg-primary/5"
                    )}
                >
                    <input {...getInputProps()} />

                    <div className="flex gap-3">
                        <Avatar className="h-10 w-10 shrink-0">
                            <AvatarImage src={profile?.avatar_url ?? undefined} />
                            <AvatarFallback>{getInitials(profile?.full_name ?? "?")}</AvatarFallback>
                        </Avatar>
                        <Textarea
                            placeholder={isDragActive ? "Drop images here…" : "What's happening?"}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="flex-1 min-h-[120px] resize-none border-none shadow-none focus-visible:ring-0 text-base p-0"
                            autoFocus
                        />
                    </div>

                    {/* Media previews */}
                    {mediaFiles.length > 0 && (
                        <div className={cn(
                            "mt-3 grid gap-2",
                            mediaFiles.length === 1 ? "grid-cols-1" : "grid-cols-2"
                        )}>
                            {mediaFiles.map((media, i) => (
                                <div key={i} className="relative rounded-xl overflow-hidden aspect-video bg-muted group">
                                    <Image
                                        src={media.preview}
                                        alt={`Attachment ${i + 1}`}
                                        fill
                                        className="object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeMedia(i)}
                                        className="absolute top-1.5 right-1.5 bg-black/60 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-3 h-3 text-white" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Drag overlay hint */}
                    {isDragActive && (
                        <div className="flex flex-col items-center justify-center py-4 gap-1.5 text-primary">
                            <Upload className="w-6 h-6" />
                            <p className="text-sm font-medium">Drop to add images</p>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between border-t pt-3">
                    <div className="flex items-center gap-1 text-muted-foreground">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={openFileDialog}
                            disabled={mediaFiles.length >= 4}
                            title="Add images (max 4)"
                        >
                            <ImagePlus className="h-4 w-4" />
                        </Button>
                        {mediaFiles.length > 0 && (
                            <span className="text-xs">{mediaFiles.length}/4</span>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <span className={`text-xs ${overLimit ? "text-destructive" : "text-muted-foreground"}`}>
                            {remaining}
                        </span>
                        <Button
                            onClick={handleSubmit}
                            disabled={!content.trim() || overLimit || isPending}
                            size="sm"
                        >
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Post
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
