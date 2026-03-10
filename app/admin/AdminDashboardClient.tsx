"use client";

import { useEffect, useState } from "react";
import ModerationTab from "./ModerationTab";

// --- Types ---
type AssessmentRow = {
    id: string;
    createdAt: string;
    userId: string | null;
    anonymousId: string | null;
    assessmentType: string;
    totalScore: number;
    severity: string;
};

type BookingRow = {
    id: string;
    createdAt: string;
    studentName: string;
    studentEmail: string | null;
    reason: string | null;
    slot: string;
    status: string;
    anonymousId: string | null;
};

type MoodRow = {
    id: string;
    createdAt: string;
    userId: string | null;
    mood: number;
    note: string | null;
};

type UserRow = {
    id: string;
    createdAt: string;
    email: string;
    name: string;
    _count: {
        assessments: number;
        bookings: number;
        moodLogs: number;
    };
};

type Tab = 'overview' | 'assessments' | 'bookings' | 'moods' | 'users' | 'moderation' | 'settings';

// --- Helpers ---

function formatDate(input: string) {
    const d = new Date(input);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AdminDashboardClient() {
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [assessments, setAssessments] = useState<AssessmentRow[]>([]);
    const [bookings, setBookings] = useState<BookingRow[]>([]);
    const [moods, setMoods] = useState<MoodRow[]>([]);
    const [users, setUsers] = useState<UserRow[]>([]);
    const [config, setConfig] = useState({ voiceEnabled: true });
    const [isLoading, setIsLoading] = useState(true);

    const [assessmentFilter, setAssessmentFilter] = useState("ALL");
    const [searchQuery, setSearchQuery] = useState("");

    async function loadData() {
        try {
            setIsLoading(true);
            const [, assessmentsRes, bookingsRes, moodsRes, usersRes, configRes] = await Promise.all([
                fetch("/api/admin/severity-summary", { cache: "no-store" }),
                fetch("/api/admin/assessments/recent?limit=200", { cache: "no-store" }),
                fetch("/api/admin/bookings/recent?limit=100", { cache: "no-store" }),
                fetch("/api/admin/moods/recent?limit=100", { cache: "no-store" }),
                fetch("/api/admin/users", { cache: "no-store" }),
                fetch("/api/config", { cache: "no-store" }),
            ]);

            const assessmentsJson = assessmentsRes.ok ? await assessmentsRes.json() : { assessments: [] };
            const bookingsJson = bookingsRes.ok ? await bookingsRes.json() : { bookings: [] };
            const moodsJson = moodsRes.ok ? await moodsRes.json() : { moods: [] };
            const usersJson = usersRes.ok ? await usersRes.json() : { users: [] };
            const configJson = configRes.ok ? await configRes.json() : { voiceEnabled: true };

            setAssessments(assessmentsJson.assessments ?? []);
            setBookings(bookingsJson.bookings ?? []);
            setMoods(moodsJson.moods ?? []);
            setUsers(usersJson.users ?? []);
            setConfig(configJson);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    // --- Computed Data ---

    // Assessment Filtering
    const filteredAssessments = assessments.filter(a => {
        if (assessmentFilter !== "ALL" && a.assessmentType !== assessmentFilter) return false;
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (a.userId?.toLowerCase().includes(query) || a.anonymousId?.toLowerCase().includes(query) || a.id.includes(query));
        }
        return true;
    });

    // Bookings Splitting
    const registeredBookings = bookings.filter(b => !!b.studentEmail);
    const anonymousBookings = bookings.filter(b => !b.studentEmail);

    // Mood Analysis - Vibe Check
    const moodDistribution = [0, 0, 0, 0, 0, 0];
    moods.forEach(m => {
        if (m.mood >= 1 && m.mood <= 5) moodDistribution[m.mood]++;
    });
    const totalMoods = moods.length || 1;

    // --- Actions ---

    async function handleLogout() {
        await fetch("/api/auth/logout", { method: "POST" });
        window.location.href = "/admin/login";
    }

    async function handleDeleteAssessment(id: string) {
        if (!confirm("Delete this assessment?")) return;
        await fetch(`/api/admin/assessments/${id}`, { method: "DELETE" });
        setAssessments((prev) => prev.filter((a) => a.id !== id));
    }

    async function handleDeleteBooking(id: string) {
        if (!confirm("Delete this booking?")) return;
        await fetch(`/api/admin/bookings/${id}`, { method: "DELETE" });
        setBookings((prev) => prev.filter((b) => b.id !== id));
    }

    async function handleUpdateBookingStatus(id: string, status: string) {
        const res = await fetch(`/api/admin/bookings/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
        });
        if (res.ok) {
            setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
        }
    }

    async function handleDeleteMood(id: string) {
        if (!confirm("Delete this mood log?")) return;
        await fetch(`/api/admin/moods/${id}`, { method: "DELETE" });
        setMoods((prev) => prev.filter((m) => m.id !== id));
    }

    async function handleDeleteUser(id: string) {
        if (!confirm("Delete this user and ALL data?")) return;
        await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
        setUsers((prev) => prev.filter((u) => u.id !== id));
    }

    async function handleToggleVoice(enabled: boolean) {
        const newConfig = { ...config, voiceEnabled: enabled };
        setConfig(newConfig); // Optimistic
        await fetch("/api/config", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newConfig)
        });
    }

    // --- User Details (Future) ---
    async function handleViewUserBookings(user: UserRow) {
        console.log("View user", user);
    }

    if (isLoading) return (
        <div className="flex justify-center py-40">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
    );

    const SidebarItem = ({ id, label, icon }: { id: Tab | 'users', label: string, icon: React.ReactNode }) => (
        <button
            onClick={() => setActiveTab(id as Tab)}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 text-sm font-bold tracking-wide ${activeTab === id
                ? "bg-primary text-primary-foreground shadow-lg scale-105 ring-1 ring-primary/50"
                : "text-muted-foreground hover:text-foreground hover:bg-surface-hover hover:scale-105 active:scale-95"
                }`}
        >
            <span className="text-xl">{icon}</span>
            {label}
        </button>
    );

    return (
        <div className="flex flex-col lg:flex-row gap-8 min-h-screen relative font-heading text-foreground">
            {/* VIGNETTE & BG - RESTORED JEWEL TONE */}
            <div className="fixed inset-0 z-0 pointer-events-none bg-vignette-light dark:bg-vignette-dark" />

            <div className="fixed top-0 right-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[30%] right-[30%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[120px] animate-pulse" />
            </div>

            {/* Sidebar */}
            <aside className="w-full lg:w-72 flex-shrink-0 space-y-8 z-10 p-6 lg:p-0">
                <div className="px-4 pt-4">
                    <h1 className="text-3xl font-black text-foreground tracking-tighter">Admin <span className="text-primary block text-lg font-medium tracking-normal">Console</span></h1>
                </div>

                <nav className="space-y-2">
                    <SidebarItem id="overview" label="Overview" icon="📊" />
                    <SidebarItem id="assessments" label="Assessments" icon="📝" />
                    <SidebarItem id="bookings" label="Bookings" icon="📅" />
                    <SidebarItem id="moods" label="Vibe Check" icon="☁️" />
                    <SidebarItem id="users" label="Users" icon="👥" />
                    <SidebarItem id="moderation" label="Moderation" icon="🛡️" />
                    <SidebarItem id="settings" label="Settings" icon="⚙️" />
                </nav>

                <div className="px-4 pt-4 border-t border-border/50 space-y-3">
                    <button onClick={loadData} className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors w-full uppercase tracking-wider p-2 hover:bg-surface-hover rounded-lg border border-transparent hover:border-primary/20">
                        Refresh Data
                    </button>
                    <button onClick={handleLogout} className="flex items-center gap-2 text-xs font-bold text-red-500 hover:text-red-600 transition-colors w-full uppercase tracking-wider p-2 hover:bg-red-500/10 rounded-lg border border-transparent hover:border-red-500/20">
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content - RESTORED SURFACE CARDS */}
            <main className="flex-1 bg-surface-card border border-border rounded-[2.5rem] p-8 lg:p-12 min-h-[600px] backdrop-blur-xl relative overflow-hidden shadow-2xl z-10 m-4 lg:m-0 lg:my-8 lg:mr-8 shadow-black/10">

                {activeTab === 'overview' && (
                    <div className="space-y-12 animate-in fade-in duration-500">
                        <div className="flex justify-between items-end border-b border-border/50 pb-6">
                            <div>
                                <h2 className="text-3xl font-black text-foreground tracking-tight">System Overview</h2>
                                <p className="text-muted-foreground font-medium">Real-time platform metrics.</p>
                            </div>
                        </div>

                        {/* KPI Cards - SHARPER BORDERS & SHADOWS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                            <div className="p-8 rounded-[2rem] bg-surface-card border border-border relative overflow-hidden group hover:shadow-xl transition-all hover:border-primary hover:scale-[1.02] duration-300">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground relative z-10">Total Users</span>
                                <div className="text-5xl font-black text-foreground mt-4 relative z-10 group-hover:scale-110 transition-transform origin-left">{users.length}</div>
                                <div className="absolute right-[-20px] top-[-20px] text-9xl opacity-[0.03] grayscale group-hover:grayscale-0 transition-all">👥</div>
                            </div>

                            <div className="p-8 rounded-[2rem] bg-surface-card border border-border relative overflow-hidden group hover:shadow-xl transition-all hover:border-primary hover:scale-[1.02] duration-300">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground relative z-10">Assessments</span>
                                <div className="text-5xl font-black text-foreground mt-4 relative z-10 group-hover:scale-110 transition-transform origin-left">{assessments.length}</div>
                                <div className="absolute right-[-20px] top-[-20px] text-9xl opacity-[0.03] grayscale group-hover:grayscale-0 transition-all">📝</div>
                            </div>

                            {/* Vibe Meter */}
                            <div className="p-8 rounded-[2rem] bg-surface-card border border-border relative overflow-hidden group hover:shadow-xl transition-all hover:border-primary hover:scale-[1.02] duration-300">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Campus Vibe</span>
                                <div className="flex items-end gap-2 mt-4">
                                    <div className="text-5xl font-black text-foreground group-hover:scale-110 transition-transform origin-left">
                                        {(moods.reduce((acc, m) => acc + m.mood, 0) / (moods.length || 1)).toFixed(1)}
                                    </div>
                                    <span className="text-sm text-muted-foreground mb-1 font-bold">/ 5.0</span>
                                </div>
                            </div>

                            <div className="p-8 rounded-[2rem] bg-surface-card border border-border relative overflow-hidden group hover:shadow-xl transition-all hover:border-primary hover:scale-[1.02] duration-300">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Energy Level</span>
                                <div className="flex items-end gap-2 mt-4">
                                    <div className="text-5xl font-black text-foreground group-hover:scale-110 transition-transform origin-left">
                                        {((moods.reduce((acc, m) => acc + m.mood, 0) / (moods.length || 1)) * 20).toFixed(0)}%
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity Mini-Feed */}
                        <div>
                            <h3 className="text-lg font-bold text-foreground mb-6 border-b border-border/50 pb-2">Live Pulse</h3>
                            <div className="flex gap-4 overflow-x-auto pb-6 custom-scrollbar">
                                {moods.slice(0, 5).map(m => (
                                    <div key={m.id} className="min-w-[240px] p-6 rounded-[1.5rem] bg-surface-hover border border-border flex flex-col gap-3 group relative hover:-translate-y-1 transition-transform shadow-sm hover:shadow-md">
                                        <div className="flex items-center gap-3">
                                            <span className="text-3xl filter grayscale group-hover:grayscale-0 transition-all">{m.mood >= 4 ? "🤩" : m.mood === 3 ? "😐" : "😫"}</span>
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase">{formatDate(m.createdAt)}</span>
                                        </div>
                                        {m.note && <p className="text-xs text-foreground/70 font-medium italic line-clamp-2">&quot;{m.note}&quot;</p>}
                                        <button onClick={() => handleDeleteMood(m.id)} className="text-[10px] font-bold text-red-500 hover:text-red-600 mt-auto opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wider text-right">Delete Log</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'assessments' && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-border/50 pb-6">
                            <div>
                                <h2 className="text-3xl font-black text-foreground tracking-tight">Assessments</h2>
                                <p className="text-muted-foreground font-medium">Review student screening results.</p>
                            </div>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-muted-foreground">🔍</span>
                                <input
                                    type="text"
                                    placeholder="Search ID..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 pr-4 py-2.5 bg-surface-hover border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all w-64 shadow-sm focus:shadow-md"
                                />
                            </div>
                        </div>

                        {/* Tabs - SHARPER ACTIVE STATES */}
                        <div className="flex gap-2 overflow-x-auto pb-4 custom-scrollbar">
                            {["ALL", "PHQ9", "GAD7", "PSS", "UCLA", "PSWQ"].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setAssessmentFilter(type)}
                                    className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${assessmentFilter === type ? "bg-primary text-primary-foreground border-primary shadow-md ring-1 ring-primary/50" : "bg-surface-hover text-muted-foreground border-border hover:bg-surface-card hover:border-primary/30"
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>

                        <div className="rounded-[2rem] border border-border bg-surface-card overflow-hidden shadow-sm">
                            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-surface-hover text-muted-foreground uppercase text-[10px] font-bold tracking-widest sticky top-0 z-10 backdrop-blur-md shadow-sm">
                                        <tr>
                                            <th className="px-6 py-4">Date</th>
                                            <th className="px-6 py-4">Type</th>
                                            <th className="px-6 py-4">User Ref</th>
                                            <th className="px-6 py-4">Score</th>
                                            <th className="px-6 py-4">Severity</th>
                                            <th className="px-6 py-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {filteredAssessments.map(a => (
                                            <tr key={a.id} className="hover:bg-surface-hover transition-colors group">
                                                <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{formatDate(a.createdAt)}</td>
                                                <td className="px-6 py-4 font-bold text-foreground">{a.assessmentType}</td>
                                                <td className="px-6 py-4 text-xs font-mono text-muted-foreground truncate max-w-[150px]">
                                                    {a.userId ? `Reg: ${a.userId}` : `Anon: ${a.anonymousId}`}
                                                </td>
                                                <td className="px-6 py-4 font-bold">{a.totalScore}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${['severe', 'moderately severe', 'high stress', 'high worry', 'high loneliness'].includes(a.severity?.toLowerCase()) ? 'bg-red-500/10 text-red-600 border-red-500/20' : 'bg-green-500/10 text-green-600 border-green-500/20'}`}>
                                                        {a.severity}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button onClick={() => handleDeleteAssessment(a.id)} className="text-red-400 hover:text-red-500 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wider bg-transparent border border-red-200 dark:border-red-900 rounded px-2 py-1 hover:bg-red-50 dark:hover:bg-red-900/20">Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'bookings' && (
                    <div className="space-y-12 animate-in fade-in duration-500">
                        <div className="border-b border-border/50 pb-6">
                            <h2 className="text-3xl font-black text-foreground tracking-tight">Bookings</h2>
                            <p className="text-muted-foreground font-medium">Manage consultation requests.</p>
                        </div>

                        {/* Registered Section */}
                        <section>
                            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4 pl-1">Registered Students <span className="opacity-50 ml-1">({registeredBookings.length})</span></h3>
                            <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {registeredBookings.map(b => (
                                    <div key={b.id} className="p-6 rounded-[1.5rem] bg-surface-card border border-border flex flex-col md:flex-row justify-between items-center gap-6 hover:shadow-lg transition-all hover:border-primary/20 group">
                                        <div>
                                            <div className="font-bold text-lg text-foreground">{b.studentName}</div>
                                            <div className="text-sm text-primary font-medium">{b.studentEmail}</div>
                                            <div className="text-xs text-muted-foreground mt-2 font-mono bg-surface-hover inline-block px-2 py-1 rounded-md">Requested: {formatDate(b.slot)}</div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border ${b.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' : b.status === 'CONFIRMED' ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-red-500/10 text-red-600 border-red-500/20'}`}>{b.status}</span>
                                            {b.status === 'PENDING' && (
                                                <div className="flex gap-2 ml-2 opacity-100 transition-opacity">
                                                    <button onClick={() => handleUpdateBookingStatus(b.id, 'CONFIRMED')} className="bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-green-700 shadow-sm border border-green-600">Approve</button>
                                                    <button onClick={() => handleUpdateBookingStatus(b.id, 'CANCELLED')} className="bg-surface-hover text-foreground text-xs font-bold px-4 py-2 rounded-xl hover:bg-red-500 hover:text-white transition-colors border border-border shadow-sm">Deny</button>
                                                </div>
                                            )}
                                            <button onClick={() => handleDeleteBooking(b.id)} className="text-muted-foreground hover:text-red-500 p-2 ml-2 transition-colors opacity-0 group-hover:opacity-100 hover:scale-110">🗑️</button>
                                        </div>
                                    </div>
                                ))}
                                {registeredBookings.length === 0 && <div className="p-8 text-center text-muted-foreground border border-dashed border-border rounded-2xl">No registered student bookings.</div>}
                            </div>
                        </section>

                        {/* Anonymous Section */}
                        <section>
                            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4 pl-1">Anonymous Requests <span className="opacity-50 ml-1">({anonymousBookings.length})</span></h3>
                            <div className="grid grid-cols-1 gap-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {anonymousBookings.map(b => (
                                    <div key={b.id} className="p-6 rounded-[1.5rem] bg-surface-hover/30 border border-border border-dashed flex flex-col md:flex-row justify-between items-center gap-6 opacity-75 hover:opacity-100 transition-opacity hover:border-primary/20 hover:bg-surface-hover/50">
                                        <div>
                                            <div className="font-bold text-foreground">Anonymous User</div>
                                            <div className="text-xs text-muted-foreground font-mono">ID: {b.anonymousId}</div>
                                            <div className="text-xs text-muted-foreground mt-1">Requested: {formatDate(b.slot)}</div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${b.status}`}>{b.status}</span>
                                            {b.status === 'PENDING' && (
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleUpdateBookingStatus(b.id, 'CONFIRMED')} className="text-green-600 text-xs font-bold hover:underline">Approve</button>
                                                    <button onClick={() => handleUpdateBookingStatus(b.id, 'CANCELLED')} className="text-red-500 text-xs font-bold hover:underline">Deny</button>
                                                </div>
                                            )}
                                            <button onClick={() => handleDeleteBooking(b.id)} className="text-muted-foreground hover:text-red-500">🗑️</button>
                                        </div>
                                    </div>
                                ))}
                                {anonymousBookings.length === 0 && <div className="p-8 text-center text-muted-foreground border border-dashed border-border rounded-2xl">No anonymous bookings.</div>}
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === 'moods' && (
                    <div className="space-y-12 animate-in fade-in duration-500">
                        <div className="border-b border-border/50 pb-6">
                            <h2 className="text-3xl font-black text-foreground tracking-tight">Campus Vibe Analysis</h2>
                            <p className="text-muted-foreground font-medium">Emotional trend tracking.</p>
                        </div>

                        {/* Vibe Aggregation - RICHER COLORS */}
                        <div className="grid grid-cols-5 gap-4 h-48 items-end p-8 bg-surface-hover rounded-[2rem] border border-border shadow-inner">
                            {[1, 2, 3, 4, 5].map(rating => {
                                const count = moodDistribution[rating];
                                const percentage = count / totalMoods * 100;
                                return (
                                    <div key={rating} className="flex flex-col items-center gap-3 w-full h-full justify-end group">

                                        <div className="w-full relative h-full flex items-end">
                                            <div
                                                className={`w-full rounded-t-xl transition-all duration-1000 ${rating >= 4 ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : rating === 3 ? 'bg-amber-500 shadow-lg shadow-amber-500/20' : 'bg-rose-500 shadow-lg shadow-rose-500/20'} opacity-90 group-hover:opacity-100 group-hover:scale-y-105`}
                                                style={{ height: `${percentage}%`, minHeight: '10px' }}
                                            />
                                        </div>
                                        <div className="text-center">
                                            <span className="text-xl font-black text-foreground block">{rating}</span>
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase">{count} logs</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="p-8 rounded-[2rem] bg-surface-card border border-border shadow-sm">
                            <h3 className="text-lg font-bold text-foreground mb-4">Common Themes</h3>
                            <div className="flex flex-wrap gap-3">
                                {moods.flatMap(m => m.note?.split(' ') || []).filter(w => w.length > 4).slice(0, 10).map((word, i) => (
                                    <span key={i} className="px-4 py-2 rounded-xl bg-surface-hover text-sm font-medium text-foreground border border-border shadow-sm hover:shadow-md transition-all cursor-default">{word}</span>
                                ))}
                                {moods.length === 0 && <span className="text-muted-foreground italic">No sufficient data for analysis.</span>}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="border-b border-border/50 pb-6">
                            <h2 className="text-3xl font-black text-foreground tracking-tight">Registered Users</h2>
                            <p className="text-muted-foreground font-medium">Student database.</p>
                        </div>
                        <div className="rounded-[2rem] border border-border bg-surface-card overflow-hidden shadow-md">
                            <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
                                <table className="w-full text-left text-sm relative">
                                    <thead className="bg-surface-hover text-muted-foreground uppercase text-[10px] font-bold tracking-widest sticky top-0 z-10 backdrop-blur-md border-b border-border shadow-sm">
                                        <tr>
                                            <th className="px-6 py-4">Name</th>
                                            <th className="px-6 py-4">Email</th>
                                            <th className="px-6 py-4">Joined</th>
                                            <th className="px-6 py-4 text-right">Activity Stats</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50 text-foreground">
                                        {users.map((u: UserRow) => (
                                            <tr key={u.id} className="hover:bg-surface-hover transition-colors group cursor-pointer" onClick={() => handleViewUserBookings(u)}>
                                                <td className="px-6 py-4 font-bold">{u.name}</td>
                                                <td className="px-6 py-4 text-muted-foreground">{u.email}</td>
                                                <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{formatDate(u.createdAt)}</td>
                                                <td className="px-6 py-4 text-right flex items-center justify-end gap-3">
                                                    <span className="inline-flex gap-2 text-[10px] font-bold uppercase tracking-wider">
                                                        <span title="Bookings" className="bg-surface-hover px-2 py-1 rounded border border-border text-muted-foreground">📅 {u._count?.bookings || 0}</span>
                                                        <span title="Assessments" className="bg-surface-hover px-2 py-1 rounded border border-border text-muted-foreground">📝 {u._count?.assessments || 0}</span>
                                                        <span title="Mood Logs" className="bg-surface-hover px-2 py-1 rounded border border-border text-muted-foreground">😊 {u._count?.moodLogs || 0}</span>
                                                    </span>
                                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteUser(u.id); }} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600 text-xs font-bold uppercase ml-2 border border-red-500/20 px-2 py-1 rounded hover:bg-red-500/10">Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'moderation' && <ModerationTab />}

                {activeTab === 'settings' && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="border-b border-border/50 pb-6">
                            <h2 className="text-3xl font-black text-foreground tracking-tight">System Settings</h2>
                            <p className="text-muted-foreground font-medium">Configure platform features.</p>
                        </div>

                        <div className="p-8 rounded-[2rem] bg-surface-card border border-border space-y-6 max-w-2xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-foreground">Voice-to-Text Journaling</h3>
                                    <p className="text-sm text-muted-foreground">Allow students to use microphone for journal entries.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={config.voiceEnabled}
                                        onChange={(e) => handleToggleVoice(e.target.checked)}
                                    />
                                    <div className="w-11 h-6 bg-surface-hover peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
