"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setError(null);
        const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${location.origin}/auth/callback?next=/reset-password`,
        });
        setLoading(false);
        if (err) { setError(err.message); return; }
        setSent(true);
    };

    if (sent) {
        return (
            <div className="w-full max-w-sm text-center space-y-4">
                <h1 className="text-2xl font-bold">Check your inbox</h1>
                <p className="text-muted-foreground text-sm">
                    We sent a password reset link to <strong>{email}</strong>.
                </p>
                <Link href="/login" className="text-primary text-sm hover:underline">Back to login</Link>
            </div>
        );
    }

    return (
        <div className="w-full max-w-sm space-y-6">
            <div className="text-center">
                <h1 className="text-2xl font-bold">Reset password</h1>
                <p className="text-muted-foreground text-sm mt-1">Enter your email to receive a reset link</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
                </div>
                {error && <p className="text-destructive text-sm">{error}</p>}
                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Send Reset Link
                </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground">
                <Link href="/login" className="text-primary hover:underline">Back to login</Link>
            </p>
        </div>
    );
}
