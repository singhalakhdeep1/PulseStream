"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

const schema = z.object({
    username: z.string().min(3).max(20).regex(/^[a-z0-9_]+$/, "Only lowercase, numbers, underscores"),
    full_name: z.string().min(1).max(100),
    email: z.string().email(),
    password: z.string().min(8),
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const onSubmit = async ({ email, password, username, full_name }: FormData) => {
        setError(null);
        const { error: err } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { username, full_name },
                emailRedirectTo: `${location.origin}/auth/callback`,
            },
        });
        if (err) { setError(err.message); return; }
        router.push("/login?msg=check-email");
    };

    return (
        <div className="w-full max-w-sm space-y-6">
            <div className="text-center">
                <h1 className="text-2xl font-bold">Create account</h1>
                <p className="text-muted-foreground text-sm mt-1">Join FeedFlow today</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {[
                    { id: "username", label: "Username", type: "text", placeholder: "john_doe" },
                    { id: "full_name", label: "Full name", type: "text", placeholder: "John Doe" },
                    { id: "email", label: "Email", type: "email", placeholder: "you@example.com" },
                    { id: "password", label: "Password", type: "password", placeholder: "••••••••" },
                ].map(({ id, label, type, placeholder }) => (
                    <div key={id} className="space-y-1.5">
                        <Label htmlFor={id}>{label}</Label>
                        <Input id={id} type={type} placeholder={placeholder} {...register(id as keyof FormData)} />
                        {errors[id as keyof FormData] && (
                            <p className="text-destructive text-xs">{errors[id as keyof FormData]?.message}</p>
                        )}
                    </div>
                ))}

                {error && (
                    <div className="text-destructive text-sm bg-destructive/10 border border-destructive/20 rounded-md p-3">
                        {error}
                    </div>
                )}

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Create Account
                </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary font-medium hover:underline">
                    Sign in
                </Link>
            </p>
        </div>
    );
}
