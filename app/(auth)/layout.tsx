export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left — branding */}
            <div className="hidden lg:flex flex-col justify-between bg-primary p-12">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">F</span>
                    </div>
                    <span className="text-white text-xl font-bold">FeedFlow</span>
                </div>
                <div>
                    <blockquote className="text-white text-2xl font-semibold leading-tight mb-4">
                        "Share moments, connect instantly, discover what matters."
                    </blockquote>
                    <div className="flex flex-col gap-3">
                        {[
                            "Real-time feed with zero lag",
                            "AI-powered content moderation",
                            "Stories that disappear in 24 hours",
                            "DMs with end-to-end privacy",
                        ].map((feat) => (
                            <div key={feat} className="flex items-center gap-2 text-white/80 text-sm">
                                <div className="h-1.5 w-1.5 rounded-full bg-white/60" />
                                {feat}
                            </div>
                        ))}
                    </div>
                </div>
                <p className="text-white/40 text-xs">© 2026 FeedFlow. All rights reserved.</p>
            </div>
            {/* Right — form */}
            <div className="flex items-center justify-center p-6 sm:p-12">
                {children}
            </div>
        </div>
    );
}
