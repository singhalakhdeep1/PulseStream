"use client";
// ─── CreatePostModal — exposed by feed_mfe ───────────────────────────────────

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ImageIcon, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, Button, Spinner } from "@feedflow/ui";
import { gqlFetch } from "../lib/gql-client";

const schema = z.object({
    content: z.string().min(1, "Post cannot be empty").max(500, "Max 500 characters"),
    visibility: z.enum(["public", "followers", "private"]).default("public"),
});

type FormValues = z.infer<typeof schema>;

const CREATE_POST_MUTATION = `
    mutation CreatePost($input: CreatePostInput!) {
        createPost(input: $input) {
            post { id content createdAt }
            errors { field message }
        }
    }
`;

interface CreatePostModalProps {
    open: boolean;
    onClose: () => void;
}

export default function CreatePostModal({ open, onClose }: CreatePostModalProps) {
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [charCount, setCharCount] = React.useState(0);

    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(schema),
    });

    const content = watch("content", "");
    React.useEffect(() => { setCharCount(content?.length ?? 0); }, [content]);

    const onSubmit = async (values: FormValues) => {
        setIsSubmitting(true);
        try {
            await gqlFetch(CREATE_POST_MUTATION, {
                input: { content: values.content, visibility: values.visibility.toUpperCase() },
            });
            reset();
            onClose();
        } catch (e) {
            console.error("Failed to create post", e);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Create post</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <textarea
                        {...register("content")}
                        placeholder="What's on your mind?"
                        rows={4}
                        className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    {errors.content && (
                        <p className="text-xs text-destructive">{errors.content.message}</p>
                    )}

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <button type="button" className="text-muted-foreground hover:text-foreground transition-colors">
                                <ImageIcon className="h-4 w-4" />
                            </button>
                            <select
                                {...register("visibility")}
                                className="text-xs border border-input rounded-md px-2 py-1 bg-background"
                            >
                                <option value="public">Public</option>
                                <option value="followers">Followers</option>
                                <option value="private">Only me</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`text-xs ${charCount > 450 ? "text-destructive" : "text-muted-foreground"}`}>
                                {charCount}/500
                            </span>
                            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
                                <X className="h-4 w-4" />
                            </Button>
                            <Button type="submit" size="sm" disabled={isSubmitting || charCount === 0}>
                                {isSubmitting ? <Spinner className="h-3 w-3" /> : "Post"}
                            </Button>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
