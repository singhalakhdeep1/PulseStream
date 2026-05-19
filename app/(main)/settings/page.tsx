"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/lib/hooks/use-toast";
import { getInitials } from "@/lib/utils";

const profileSchema = z.object({
    full_name: z.string().min(1).max(100),
    username: z.string().min(3).max(30).regex(/^[a-z0-9_]+$/, "Lowercase, numbers, underscores only"),
    bio: z.string().max(200).optional(),
    website: z.string().url().optional().or(z.literal("")),
});
type ProfileData = z.infer<typeof profileSchema>;

const passwordSchema = z.object({
    password: z.string().min(8),
    confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, { message: "Must match", path: ["confirmPassword"] });
type PasswordData = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
    const { toast } = useToast();
    const supabase = createClient();
    const [tab, setTab] = useState<"profile" | "account" | "notifications">("profile");

    const profileForm = useForm<ProfileData>({ resolver: zodResolver(profileSchema) });
    const passwordForm = useForm<PasswordData>({ resolver: zodResolver(passwordSchema) });

    async function onProfileSubmit(data: ProfileData) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { error } = await supabase.from("profiles").update(data).eq("id", user.id);
        if (error) toast({ title: "Failed to update", description: error.message, variant: "destructive" });
        else toast({ title: "Profile updated!" });
    }

    async function onPasswordSubmit(data: PasswordData) {
        const { error } = await supabase.auth.updateUser({ password: data.password });
        if (error) toast({ title: error.message, variant: "destructive" });
        else { toast({ title: "Password changed" }); passwordForm.reset(); }
    }

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold mb-6">Settings</h1>

            <div className="flex gap-1 border-b border-border mb-6">
                {(["profile", "account", "notifications"] as const).map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-4 py-2 text-sm -mb-px border-b-2 capitalize transition-colors ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {tab === "profile" && (
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-5">
                    <div className="space-y-1">
                        <Label>Full Name</Label>
                        <Input {...profileForm.register("full_name")} />
                    </div>
                    <div className="space-y-1">
                        <Label>Username</Label>
                        <div className="flex items-center">
                            <span className="px-3 py-2 border border-r-0 border-input rounded-l-md bg-muted text-muted-foreground text-sm">@</span>
                            <Input className="rounded-l-none" {...profileForm.register("username")} />
                        </div>
                        {profileForm.formState.errors.username && (
                            <p className="text-xs text-destructive">{profileForm.formState.errors.username.message}</p>
                        )}
                    </div>
                    <div className="space-y-1">
                        <Label>Bio</Label>
                        <Textarea {...profileForm.register("bio")} rows={3} placeholder="Tell people about yourself" />
                    </div>
                    <div className="space-y-1">
                        <Label>Website</Label>
                        <Input {...profileForm.register("website")} placeholder="https://yoursite.com" />
                    </div>
                    <Button type="submit" disabled={profileForm.formState.isSubmitting}>Save Profile</Button>
                </form>
            )}

            {tab === "account" && (
                <div className="space-y-8">
                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                        <h2 className="font-semibold">Change Password</h2>
                        <div className="space-y-1">
                            <Label>New Password</Label>
                            <Input type="password" {...passwordForm.register("password")} />
                        </div>
                        <div className="space-y-1">
                            <Label>Confirm Password</Label>
                            <Input type="password" {...passwordForm.register("confirmPassword")} />
                            {passwordForm.formState.errors.confirmPassword && (
                                <p className="text-xs text-destructive">{passwordForm.formState.errors.confirmPassword.message}</p>
                            )}
                        </div>
                        <Button type="submit" disabled={passwordForm.formState.isSubmitting}>Update Password</Button>
                    </form>

                    <div className="border border-destructive rounded-lg p-4 space-y-3">
                        <h2 className="font-semibold text-destructive">Danger Zone</h2>
                        <p className="text-sm text-muted-foreground">Permanently delete your account and all your data.</p>
                        <Button variant="destructive" onClick={async () => {
                            if (!confirm("Delete account permanently?")) return;
                            await supabase.auth.signOut();
                        }}>
                            Delete Account
                        </Button>
                    </div>
                </div>
            )}

            {tab === "notifications" && (
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">Notification preferences coming soon.</p>
                </div>
            )}
        </div>
    );
}
