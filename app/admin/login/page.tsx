"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
    const [passcode, setPasscode] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ passcode }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                router.push("/admin");
                router.refresh(); // Refresh to update middleware state
            } else {
                setError(data.error || "Access Denied");
            }
        } catch {
            setError("Connection Error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden font-heading text-white">
            {/* EXECUTIVE VIGNETTE */}
            <div className="fixed inset-0 z-0 pointer-events-none bg-vignette-light dark:bg-vignette-dark" />

            {/* Background Ambience */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute bottom-[20%] left-[20%] w-[60%] h-[60%] bg-purple-900/10 rounded-full blur-[120px] animate-pulse" />
            </div>

            <div className="w-full max-w-md bg-surface-card border border-border rounded-[2rem] p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden z-10 transition-all hover:border-primary/20">

                <div className="relative z-10 text-center space-y-8">
                    <div className="space-y-4">
                        <div className="mx-auto w-16 h-16 rounded-2xl bg-surface-hover border border-border flex items-center justify-center text-3xl shadow-lg">
                            🔒
                        </div>
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-foreground">Admin Gateway</h1>
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mt-1">Authorized Personnel Only</p>
                        </div>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2 text-left">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
                                Secure Passcode
                            </label>
                            <input
                                type="password"
                                value={passcode}
                                onChange={(e) => setPasscode(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-surface-hover/50 border border-border rounded-xl px-5 py-4 text-foreground text-center text-lg tracking-[0.5em] placeholder:tracking-normal placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono"
                                autoFocus
                            />
                        </div>

                        {error && (
                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold animate-in fade-in slide-in-from-top-2 flex items-center justify-center gap-2">
                                <span>⚠️</span> {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-foreground text-background font-bold py-4 rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg uppercase tracking-wider text-xs"
                        >
                            {isLoading ? "Verifying Credentials..." : "Authenticate Access"}
                        </button>
                    </form>

                    <div className="pt-4 border-t border-border/50">
                        <p className="text-[10px] text-muted-foreground font-mono opacity-70">
                            SYSTEM ID: EUNOIA-SECURE-V1
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
