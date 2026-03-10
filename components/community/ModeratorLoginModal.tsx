"use client";

import { useState } from "react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function ModeratorLoginModal({ isOpen, onClose }: Props) {
    const [passcode, setPasscode] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ passcode }),
            });

            if (res.ok) {
                window.location.href = "/moderator";
            } else {
                setError("Invalid Passcode");
            }
        } catch {
            setError("Login failed");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in font-heading">
            <div className="w-full max-w-sm bg-surface-card border border-border rounded-[2rem] shadow-2xl p-8 relative">
                <button onClick={onClose} className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-surface-hover rounded-full">✕</button>

                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-foreground mb-2">Moderator Access</h2>
                    <p className="text-muted-foreground text-sm font-medium">Enter your admin passcode to manage content.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <input
                            type="password"
                            value={passcode}
                            onChange={(e) => setPasscode(e.target.value)}
                            placeholder="Passcode"
                            className="w-full bg-surface-hover/50 border border-border rounded-xl px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:bg-surface-hover transition-all text-center tracking-[0.5em] font-mono text-lg"
                            autoFocus
                        />
                        {error && <p className="text-xs text-red-500 font-bold text-center uppercase tracking-wide">{error}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 bg-foreground text-background font-bold rounded-xl hover:scale-[1.01] transition-all disabled:opacity-50 shadow-lg text-sm uppercase tracking-wide"
                    >
                        {isLoading ? "Verifying..." : "Enter Dashboard"}
                    </button>
                </form>
            </div>
        </div>
    );
}
