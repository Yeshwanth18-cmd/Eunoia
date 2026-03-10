"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({ name: "", email: "", password: "" }); // Added name
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            // Assuming we have a signup endpoint or modifying login to handle it, 
            // but usually signup is separate. 
            // If /api/auth/student-login is only for login, we need a signup endpoint.
            // For now, I will assume a standard Signup flow or mock it if needed.
            // Wait, previous instructions didn't specify backend changes for signup, 
            // but the user just asked for "Login & Up pages to follow theme".
            // I'll assume the page exists or I'm creating the UI for it.
            // If logic is missing, I'll fallback to a mock or same endpoint if it handles upsert.

            // Checking previous context, I don't see a visible signup.ts. 
            // I will create a basic signup UI that tries to post to /api/auth/signup 
            // (or similar) - if it fails, the UI is still done.
            // Actually, best to just render the UI for now as requested.

            // Mock success for UI demo if backend is missing
            // setTimeout(() => { router.push("/"); }, 1000);

            const res = await fetch("/api/auth/student-signup", { // Hypothetical endpoint
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                // Fallback if endpoint doesn't exist to not break flow for user
                if (res.status === 404) {
                    setError("Signup endpoint not implemented yet.");
                } else {
                    const data = await res.json();
                    throw new Error(data.error || "Signup failed");
                }
            } else {
                router.push("/login");
            }

        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden font-heading text-foreground">
            {/* EXECUTIVE VIGNETTE */}
            <div className="fixed inset-0 z-0 pointer-events-none bg-vignette-light dark:bg-vignette-dark" />

            {/* Background Ambience */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[20%] left-[30%] w-[50%] h-[50%] bg-amber-500/5 dark:bg-amber-500/5 rounded-full blur-[120px] animate-pulse" />
            </div>

            <div className="relative z-10 w-full max-w-md p-6">
                <div className="text-center space-y-4 mb-8">
                    <h1 className="text-4xl font-black tracking-tight">Join Eunoia</h1>
                    <p className="text-muted-foreground font-medium">Start your journey to mental wellness today.</p>
                </div>

                <div className="bg-surface-card border border-border rounded-[2rem] p-8 shadow-2xl backdrop-blur-xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground pl-1">Name</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-surface-hover/50 border border-border rounded-xl px-5 py-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/50"
                                placeholder="Your Name"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground pl-1">Email</label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-surface-hover/50 border border-border rounded-xl px-5 py-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/50"
                                placeholder="student@university.edu"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground pl-1">Password</label>
                            <input
                                type="password"
                                required
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                className="w-full bg-surface-hover/50 border border-border rounded-xl px-5 py-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/50"
                                placeholder="Create a strong password"
                            />
                        </div>

                        {error && (
                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-sm font-bold text-center animate-in fade-in slide-in-from-top-2">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-foreground text-background font-bold py-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg mt-2 "
                        >
                            {isLoading ? "Creating Account..." : "Create Account"}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm font-medium text-muted-foreground">
                        Already have an account?{" "}
                        <Link href="/login" className="text-primary hover:underline underline-offset-4 font-bold">
                            Log in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
