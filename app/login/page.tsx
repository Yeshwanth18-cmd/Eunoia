"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/student-login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Login failed");

            // Redirect to home/dashboard on success
            router.push("/");
            router.refresh();

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
            <div className="fixed top-0 right-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[20%] right-[30%] w-[50%] h-[50%] bg-blue-600/5 dark:bg-blue-900/10 rounded-full blur-[120px] animate-pulse" />
            </div>

            <div className="relative z-10 w-full max-w-md p-6">
                <div className="text-center space-y-4 mb-8">
                    <h1 className="text-4xl font-black tracking-tight">Welcome Back</h1>
                    <p className="text-muted-foreground font-medium">Continue your journey with Eunoia.</p>
                </div>

                <div className="bg-surface-card border border-border rounded-[2rem] p-8 shadow-2xl backdrop-blur-xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
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
                                placeholder="••••••••"
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
                            className="w-full bg-foreground text-background font-bold py-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg mt-2"
                        >
                            {isLoading ? "Logging in..." : "Log In"}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm font-medium text-muted-foreground">
                        New here?{" "}
                        <Link href="/signup" className="text-primary hover:underline underline-offset-4 font-bold">
                            Create an account
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
