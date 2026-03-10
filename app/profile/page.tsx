"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { getOrCreateClientUserId } from "@/lib/clientUserId";
import { RESOURCES } from "@/lib/resourceList";
import Image from "next/image";

export default function ProfilePage() {
    const [userId, setUserId] = useState<string>("");
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState<"overview" | "journey" | "community" | "settings">("overview");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [profileData, setProfileData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [cursorEnabled, setCursorEnabled] = useState(true);

    useEffect(() => {
        setUserId(getOrCreateClientUserId());
        setMounted(true);
        fetchProfile();

        const stored = localStorage.getItem("cursorEffectEnabled");
        if (stored !== null) setCursorEnabled(stored === "true");
    }, []);

    const toggleCursor = (enabled: boolean) => {
        setCursorEnabled(enabled);
        localStorage.setItem("cursorEffectEnabled", String(enabled));
        window.dispatchEvent(new Event("cursor-effect-toggle"));
    };

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const anonId = getOrCreateClientUserId();
            const res = await fetch(`/api/user/profile?anonymousId=${anonId}`, {
                cache: "no-store",
                headers: { "Pragma": "no-cache" }
            });
            if (res.ok) {
                const data = await res.json();
                setProfileData(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const res = await fetch(`/api/user/export?anonymousId=${userId}`);
            if (!res.ok) throw new Error("Export failed");
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `eunoia-profile-${new Date().toISOString().split("T")[0]}.html`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch {
            alert("Export failed.");
        }
    };

    if (!mounted) return null;

    const { data, user } = profileData || {};

    return (
        <div className="min-h-screen relative overflow-hidden transition-colors duration-500 font-heading text-foreground bg-background">
            {/* EXECUTIVE VIGNETTE */}
            <div className="fixed inset-0 z-0 pointer-events-none bg-vignette-light dark:bg-vignette-dark" />

            {/* Background Ambience */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[10%] right-[5%] w-[60%] h-[60%] bg-blue-600/5 dark:bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[10%] left-[5%] w-[40%] h-[40%] bg-amber-500/5 dark:bg-amber-500/5 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-5xl mx-auto relative z-10 space-y-8 p-6 md:p-12 pb-24">
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-border/50 pb-8 backdrop-blur-sm">
                    <div className="flex items-center gap-6">
                        <div className="h-24 w-24 rounded-2xl bg-surface-card border border-border flex items-center justify-center text-4xl font-black shadow-xl text-primary font-heading">
                            {user?.name ? user.name[0] : "👤"}
                        </div>
                        <div>
                            <h1 className="text-4xl font-light text-foreground">{user?.name || "Guest User"}</h1>
                            <p className="text-muted-foreground font-mono text-xs mt-1">ID: {userId}</p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 bg-surface-card p-1 rounded-full border border-border shadow-sm">
                        {["overview", "journey", "community", "settings"].map((tab) => (
                            <button
                                key={tab}
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                onClick={() => setActiveTab(tab as any)}
                                className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${activeTab === tab
                                    ? "bg-primary text-primary-foreground shadow-md"
                                    : "text-muted-foreground hover:text-foreground hover:bg-surface-hover"
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </header>

                {loading ? (
                    <div className="py-20 text-center text-muted-foreground animate-pulse font-medium">Loading profile data...</div>
                ) : (
                    <div className="min-h-[400px]">
                        {/* OVERVIEW TAB */}
                        {activeTab === "overview" && (
                            <div className="grid md:grid-cols-3 gap-6 animate-fade-in-up">
                                {/* Stats */}
                                <div className="p-8 rounded-[1.5rem] bg-surface-card border border-border flex flex-col items-center justify-center gap-2 hover:shadow-lg transition-shadow hover:border-primary/30 group">
                                    <span className="text-5xl font-black text-primary group-hover:scale-110 transition-transform">{data?.assessments?.length || 0}</span>
                                    <span className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Assessments</span>
                                </div>
                                <div className="p-8 rounded-[1.5rem] bg-surface-card border border-border flex flex-col items-center justify-center gap-2 hover:shadow-lg transition-shadow hover:border-amber-500/30 group">
                                    <span className="text-5xl font-black text-amber-500 group-hover:scale-110 transition-transform">{data?.moodLogs?.length || 0}</span>
                                    <span className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Check-ins</span>
                                </div>
                                <div className="p-8 rounded-[1.5rem] bg-surface-card border border-border flex flex-col items-center justify-center gap-2 hover:shadow-lg transition-shadow hover:border-emerald-500/30 group">
                                    <span className="text-5xl font-black text-emerald-600 group-hover:scale-110 transition-transform">{data?.bookings?.length || 0}</span>
                                    <span className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Consultations</span>
                                </div>

                                {/* Recent Activity */}
                                <div className="md:col-span-3 p-8 rounded-[2rem] bg-surface-card border border-border">
                                    <h3 className="text-lg font-bold mb-4 text-foreground">Recent Activity</h3>
                                    <div className="space-y-4">
                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                        {data?.moodLogs?.slice(0, 3).map((log: any) => (
                                            <div key={log.id} className="flex items-center gap-4 p-4 rounded-2xl bg-surface-hover border border-border/50">
                                                <div className="text-2xl">{["", "😫", "😕", "😐", "🙂", "🤩"][log.mood]}</div>
                                                <div>
                                                    <div className="text-sm font-medium text-foreground">Daily Check-in</div>
                                                    <div className="text-xs text-muted-foreground">{new Date(log.createdAt).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* JOURNEY TAB */}
                        {activeTab === "journey" && (
                            <div className="space-y-8 animate-fade-in-up">
                                <section>
                                    <h2 className="text-xl font-bold mb-4 text-foreground">Assessment History</h2>
                                    <div className="grid gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                        {data?.assessments?.map((a: any) => (
                                            <div key={a.id} className="flex justify-between items-center p-5 rounded-2xl bg-surface-card border border-border hover:border-primary/50 transition-colors">
                                                <div>
                                                    <span className="font-bold text-foreground">{a.assessmentType}</span>
                                                    <span className="text-xs text-muted-foreground ml-2">{new Date(a.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm font-mono text-primary font-bold">Score: {a.totalScore}</div>
                                                    <div className="text-xs text-muted-foreground uppercase">{a.severity}</div>
                                                </div>
                                            </div>
                                        ))}
                                        {(!data?.assessments || data.assessments.length === 0) && <p className="text-muted-foreground italic">No assessments yet.</p>}
                                    </div>
                                </section>

                                <section>
                                    <h2 className="text-xl font-bold mb-4 text-foreground">Consultations</h2>
                                    <div className="grid gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                        {data?.bookings?.map((b: any) => (
                                            <div key={b.id} className="flex justify-between items-center p-5 rounded-2xl bg-surface-card border border-border">
                                                <div>
                                                    <span className="font-bold text-foreground">{b.reason || "Session"}</span>
                                                    <div className="text-xs text-muted-foreground">{new Date(b.slot).toLocaleString()}</div>
                                                </div>
                                                <div className={`px-3 py-1 rounded-full text-xs font-bold ${b.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-600' : 'bg-green-500/10 text-green-600'}`}>
                                                    {b.status}
                                                </div>
                                            </div>
                                        ))}
                                        {(!data?.bookings || data.bookings.length === 0) && <p className="text-muted-foreground italic">No bookings found.</p>}
                                    </div>
                                </section>
                            </div>
                        )}

                        {/* COMMUNITY TAB */}
                        {activeTab === "community" && (
                            <div className="grid lg:grid-cols-2 gap-8 animate-fade-in-up">
                                <section className="flex flex-col max-h-[600px]">
                                    <h2 className="text-xl font-bold mb-4 text-foreground flex-shrink-0">My Reflections</h2>
                                    <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-grow">
                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                        {data?.myPosts?.map((p: any) => (
                                            <div key={p.id} className="p-6 rounded-2xl bg-surface-card border border-border group relative hover:border-primary/50 transition-colors shrink-0">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="text-sm font-bold text-foreground">{p.title || "Untitled"}</h4>
                                                    <button
                                                        onClick={async () => {
                                                            if (!confirm("Delete this reflection?")) return;
                                                            await fetch(`/api/community/posts/${p.id}`, {
                                                                method: 'DELETE',
                                                                headers: { 'x-anonymous-id': userId }
                                                            });
                                                            fetchProfile();
                                                        }}
                                                        className="text-muted-foreground hover:text-red-500 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                                <p className="text-sm text-foreground/80 line-clamp-3">&quot;{p.content}&quot;</p>
                                                <div className="mt-4 flex justify-between items-center text-xs text-muted-foreground">
                                                    <span className="bg-primary/10 text-primary px-2 py-1 rounded-md text-[10px] font-bold uppercase">{p.category}</span>
                                                    <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        ))}
                                        {(!data?.myPosts || data.myPosts.length === 0) && <p className="text-muted-foreground italic">No posts shared yet.</p>}
                                    </div>
                                </section>

                                <section className="flex flex-col max-h-[600px]">
                                    <h2 className="text-xl font-bold mb-4 text-foreground flex-shrink-0">Saved Gems</h2>
                                    <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-grow">
                                        {/* Saved Resources */}
                                        {data?.savedResources?.length > 0 && (
                                            <div className="mb-6 space-y-3">
                                                <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-2 sticky top-0 bg-background/95 backdrop-blur-sm z-10 py-2">Reading List</h3>
                                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                                {data.savedResources.map((sr: any) => {
                                                    const resDef = RESOURCES.find(r => r.id === sr.resourceId);
                                                    if (!resDef) return null;
                                                    return (
                                                        <a key={sr.id} href={resDef.link} target="_blank" className="flex items-center gap-3 p-3 rounded-2xl bg-surface-card hover:bg-surface-hover transition-colors border border-border shrink-0">
                                                            <div className="h-12 w-12 relative rounded-xl overflow-hidden shrink-0 bg-muted">
                                                                <Image src={resDef.image} alt={resDef.title} fill className="object-cover" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="text-sm font-bold text-foreground truncate">{resDef.title}</div>
                                                                <div className="text-[10px] text-muted-foreground">Saved {new Date(sr.savedAt).toLocaleDateString()}</div>
                                                            </div>
                                                        </a>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        <h3 className="text-xs font-bold uppercase tracking-wider text-primary sticky top-0 bg-background/95 backdrop-blur-sm z-10 py-2">Reflections</h3>
                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                        {data?.savedPosts?.map((p: any) => (
                                            <div key={p.id} className="p-4 rounded-2xl bg-surface-card border border-border hover:bg-surface-hover transition-colors shrink-0">
                                                <p className="text-sm text-foreground line-clamp-2 italic">&quot;{p.content}&quot;</p>
                                                <div className="mt-2 flex justify-between items-center text-xs text-muted-foreground">
                                                    <span className="text-primary font-bold">Saved</span>
                                                    <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        ))}
                                        {(!data?.savedPosts || data.savedPosts.length === 0) && <p className="text-muted-foreground italic">No saved items.</p>}
                                    </div>
                                </section>
                            </div >
                        )}

                        {/* SETTINGS TAB */}
                        {activeTab === "settings" && (
                            <div className="space-y-8 max-w-2xl animate-fade-in-up">
                                <div className="p-8 rounded-[2rem] bg-surface-card border border-border space-y-6">
                                    <h3 className="font-bold text-foreground text-lg">Appearance</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button onClick={() => setTheme("dark")} className={`p-4 rounded-xl border font-medium transition-all ${theme === 'dark' ? 'bg-primary text-primary-foreground border-primary shadow-lg scale-105' : 'bg-surface-hover text-muted-foreground border-border hover:border-primary/50'}`}>
                                            🌙 Dark Mode
                                        </button>
                                        <button onClick={() => setTheme("light")} className={`p-4 rounded-xl border font-medium transition-all ${theme === 'light' ? 'bg-primary text-primary-foreground border-primary shadow-lg scale-105' : 'bg-surface-hover text-muted-foreground border-border hover:border-primary/50'}`}>
                                            ☀️ Light Mode
                                        </button>
                                    </div>
                                </div>

                                <div className="p-8 rounded-[2rem] bg-surface-card border border-border space-y-6">
                                    <h3 className="font-bold text-foreground text-lg">Visual Effects</h3>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-foreground">Mouse Attractor</p>
                                            <p className="text-sm text-muted-foreground">Show particle effects around your cursor.</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={cursorEnabled}
                                                onChange={(e) => toggleCursor(e.target.checked)}
                                            />
                                            <div className="w-11 h-6 bg-surface-hover peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                        </label>
                                    </div>
                                </div>

                                <div className="p-8 rounded-[2rem] bg-surface-card border border-border space-y-6">
                                    <h3 className="font-bold text-foreground text-lg">Data Control</h3>
                                    <button onClick={handleExport} className="w-full py-4 bg-foreground text-background font-bold rounded-xl hover:opacity-90 transition-opacity">
                                        Download My Data
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
