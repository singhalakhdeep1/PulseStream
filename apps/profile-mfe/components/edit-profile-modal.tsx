"use client";
// ─── EditProfileModal — exposed by profile_mfe ────────────────────────────────

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, Button, Spinner } from "@feedflow/ui";
import { gqlFetch } from "../lib/gql-client";

const schema = z.object({
    displayName: z.string().min(1).max(50),
    bio:         z.string().max(160).optional(),
    location:    z.string().max(30).optional(),
    website:     z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

const UPDATE_PROFILE_MUTATION = `
    mutation UpdateProfile($input: UpdateProfileInput!) {
        updateProfile(input: $input) {
            user { id displayName bio location website avatarUrl }
            errors { field message }
        }
    }
`;

interface EditProfileModalProps {
    open: boolean;
    onClose: () => void;
    user: {
        id: string;
        username: string;
        displayName: string;
        bio?: string;
        location?: string;
        website?: string;
    };
}

export function EditProfileModal({ open, onClose, user }: EditProfileModalProps) {
    const queryClient = useQueryClient();

    const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            displayName: user.displayName,
            bio:         user.bio ?? "",
            location:    user.location ?? "",
            website:     user.website ?? "",
        },
    });

    const mutation = useMutation({
        mutationFn: (values: FormValues) =>
            gqlFetch(UPDATE_PROFILE_MUTATION, { input: { ...values } }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["profile", user.username] });
            onClose();
        },
    });

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Edit profile</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Display name</label>
                        <input
                            {...register("displayName")}
                            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                        {errors.displayName && <p className="text-xs text-destructive mt-1">{errors.displayName.message}</p>}
                    </div>
                    <div>
                        <label className="text-sm font-medium">Bio</label>
                        <textarea
                            {...register("bio")}
                            rows={3}
                            className="mt-1 w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                        {errors.bio && <p className="text-xs text-destructive mt-1">{errors.bio.message}</p>}
                    </div>
                    <div>
                        <label className="text-sm font-medium">Location</label>
                        <input
                            {...register("location")}
                            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Website</label>
                        <input
                            {...register("website")}
                            type="url"
                            placeholder="https://"
                            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                        {errors.website && <p className="text-xs text-destructive mt-1">{errors.website.message}</p>}
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? <Spinner className="h-3 w-3" /> : "Save"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default EditProfileModal;
