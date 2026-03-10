"use client";

import { useEffect, useState, useCallback } from "react";
import CreateReflectionModal from "@/components/community/CreateReflectionModal";
import ModeratorLoginModal from "@/components/community/ModeratorLoginModal";
import Image from "next/image";
import Link from "next/link";
import { useNotifications } from "@/components/NotificationProvider";

import { getOrCreateClientUserId } from "@/lib/clientUserId";

// --- Types ---
type Post = {
    id: string;
    title?: string | null;
    content: string;
    category: string;
    createdAt: string;
    expiresAt: string;
    _count: { reactions: number };
};

type Resource = {
    id: string;
    title: string;
    description: string;
    image: string | null;
    link: string | null;
    isBookmarked?: boolean;
};

export default function CommunityPage() {
    const { notify } = useNotifications();
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModLoginOpen, setIsModLoginOpen] = useState(false);
    const [userId, setUserId] = useState("");

    // View Modal State
    const [viewingPost, setViewingPost] = useState<Post | null>(null);

    // --- Soft Reactions Icons ---
    const REACTIONS = [
        { type: "WARMTH", icon: "💙", label: "With you" },
        { type: "INSIGHT", icon: "💡", label: "Insightful" },
        { type: "SOLIDARITY", icon: "🫂", label: "Hug" },
    ];

    const [resources, setResources] = useState<Resource[]>([]);

    // --- Fetch Logic ---
    const fetchPosts = useCallback(async () => {
        try {
            const url = selectedCategory
                ? `/api/community/posts?category=${encodeURIComponent(selectedCategory)}`
                : "/api/community/posts";

            const res = await fetch(url, { cache: "no-store" });
            const data = await res.json();
            if (data.posts) setPosts(data.posts);
        } catch { }
    }, [selectedCategory]);

    const fetchResources = useCallback(async (anonId: string) => {
        try {
            const res = await fetch(`/api/resources?anonymousId=${anonId}`);
            const data = await res.json();
            if (data.resources) setResources(data.resources);
        } catch { }
    }, []);

    useEffect(() => {
        const id = getOrCreateClientUserId();
        setUserId(id);

        const fetchData = async () => {
            setIsLoading(true);
            await fetchPosts();
            await fetchResources(id);
            setIsLoading(false);
        };
        fetchData();
    }, [fetchPosts, fetchResources]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    // --- Actions ---
    async function handleReact(postId: string, type: string) {
        // Optimistic Update
        setPosts(prev => prev.map(p => {
            if (p.id === postId) {
                return { ...p, _count: { reactions: p._count.reactions + 1 } };
            }
            return p;
        }));

        await fetch(`/api/community/posts/${postId}/react`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ anonymousId: userId, type }),
        });
    }

    async function handleSave(postId: string) {
        notify("success", "Saved to Profile"); // Optimistic feedback
        await fetch(`/api/community/posts/${postId}/save`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ anonymousId: userId })
        });
    }

    async function handleSaveResource(resourceId: string, title: string) {
        const resourceIndex = resources.findIndex(r => r.id === resourceId);
        if (resourceIndex === -1) return;

        const isCurrentlyBookmarked = resources[resourceIndex].isBookmarked;

        // Optimistic Toggle
        const newResources = [...resources];
        newResources[resourceIndex] = { ...newResources[resourceIndex], isBookmarked: !isCurrentlyBookmarked };
        setResources(newResources);

        if (!isCurrentlyBookmarked) {
            notify("success", "Resource Saved");
            await fetch(`/api/resources/${resourceId}/save`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ anonymousId: userId, title })
            });
        } else {
            notify("info", "Resource Removed");
            // Placeholder for unsave if supported, or just notification
        }
    }


    async function handleFlag(postId: string) {
        if (!confirm("Report this post as inappropriate? It will be hidden for review.")) return;
        setPosts(prev => prev.filter(p => p.id !== postId)); // Optimistic hide
        await fetch(`/api/community/posts/${postId}/flag`, {
            method: "POST"
        });
    }

    function getDaysLeft(expiry: string) {
        const exp = new Date(expiry);
        const now = new Date();
        const diff = exp.getTime() - now.getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        if (days <= 0) return "Expiring soon";
        return `${days}d left`;
    }

    // --- Render ---
    return (
        <div className="min-h-screen bg-background relative overflow-hidden font-heading text-foreground">
            {/* EXECUTIVE VIGNETTE */}
            <div className="fixed inset-0 z-0 pointer-events-none bg-vignette-light dark:bg-vignette-dark" />

            {/* Background Ambience */}
            <div className="fixed top-0 right-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-blue-600/5 dark:bg-blue-900/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute top-[40%] left-[10%] w-[25%] h-[25%] bg-purple-500/5 dark:bg-purple-900/10 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto p-4 lg:p-8 h-screen overflow-hidden flex flex-col">

                {/* 3-COLUMN LAYOUT START */}
                <div className="grid lg:grid-cols-12 gap-8 items-start h-full">

                    {/* --- LEFT COLUMN: Navigation & Filters (Sticky) --- */}
                    <aside className="hidden lg:block lg:col-span-3 h-full overflow-y-auto pr-2 custom-scrollbar space-y-6 pt-8">
                        {/* Brand / Header Mini */}
                        <div className="mb-6">
                            <h1 className="text-2xl font-black text-foreground tracking-tight">Community</h1>
                            <p className="text-xs text-muted-foreground font-medium mt-1">Safe space for students.</p>
                        </div>

                        {/* Navigation Menu */}
                        <nav className="space-y-2">
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-between group ${!selectedCategory
                                    ? "bg-foreground text-background shadow-lg"
                                    : "bg-surface-card text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                                    }`}
                            >
                                <span>ALL POSTS</span>
                                <span className="opacity-50">●</span>
                            </button>

                            <div className="pt-4 pb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-2">Topics</div>

                            {["Academic Stress", "Loneliness", "Burnout", "Relationships", "Future Anxiety"].map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-3 ${selectedCategory === cat
                                        ? "bg-primary/10 text-primary border border-primary/20"
                                        : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                                        }`}
                                >
                                    <span className={`w-2 h-2 rounded-full ${selectedCategory === cat ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                                    {cat}
                                </button>
                            ))}
                        </nav>

                        {/* Footer Mini */}
                        <div className="pt-8 border-t border-border/40">
                            <button
                                onClick={() => setIsModLoginOpen(true)}
                                className="block w-full text-left text-xs font-bold text-muted-foreground hover:text-primary transition-colors mb-4 uppercase tracking-wider"
                            >
                                Are you a Moderator?
                            </button>
                            <p className="text-[10px] text-muted-foreground/40 mt-2 px-2">
                                &copy; 2024 Eunoia
                            </p>
                        </div>
                    </aside>

                    {/* --- CENTER COLUMN: Feed (Scrollable) --- */}
                    <main className="lg:col-span-6 h-full overflow-y-auto custom-scrollbar pt-8 pb-32 px-1">

                        {/* Mobile Header (Visible only on small screens) */}
                        <div className="lg:hidden mb-6 sticky top-0 bg-background/95 backdrop-blur-xl z-20 py-4 -mx-4 px-4 border-b border-border/50">
                            <h1 className="text-3xl font-black text-foreground tracking-tight mb-2">Community</h1>
                            {/* Mobile Filters */}
                            <div className="flex overflow-x-auto gap-2 py-2 hide-scrollbar">
                                <button onClick={() => setSelectedCategory(null)} className={`whitespace-nowrap px-4 py-2 rounded-lg text-xs font-bold transition-all border ${!selectedCategory ? "bg-foreground text-background border-foreground" : "bg-surface-card text-muted-foreground border-border"}`}>All</button>
                                {["Academic Stress", "Loneliness", "Burnout", "Future Anxiety"].map(cat => (
                                    <button key={cat} onClick={() => setSelectedCategory(cat)} className={`whitespace-nowrap px-4 py-2 rounded-lg text-xs font-bold transition-all border ${selectedCategory === cat ? "bg-foreground text-background border-foreground" : "bg-surface-card text-muted-foreground border-border"}`}>{cat}</button>
                                ))}
                            </div>
                        </div>

                        {/* COMPOSER CARD (New UX) */}
                        <div
                            onClick={() => setIsModalOpen(true)}
                            className="bg-surface-card border border-border p-6 rounded-[1.5rem] shadow-sm hover:shadow-md transition-all cursor-pointer flex gap-4 items-center group mb-6"
                        >
                            <div className="h-10 w-10 rounded-full bg-surface-hover flex items-center justify-center text-lg">
                                ✍️
                            </div>
                            <div className="flex-grow">
                                <div className="h-10 w-full bg-surface-hover/50 rounded-xl flex items-center px-4 text-muted-foreground text-sm font-medium group-hover:bg-surface-hover transition-colors">
                                    Share your reflection...
                                </div>
                            </div>
                        </div>

                        {/* POSTS LIST */}
                        {isLoading ? (
                            <div className="flex justify-center py-20">
                                <div className="w-8 h-8 border-4 border-muted-foreground/20 border-t-primary rounded-full animate-spin" />
                            </div>
                        ) : posts.length === 0 ? (
                            <div className="p-16 rounded-[2rem] border border-dashed border-border text-center text-muted-foreground bg-surface-card/50">
                                <p className="font-medium text-lg mb-2">It&apos;s quiet here.</p>
                                <p className="text-sm">Be the first to share your reflection.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {posts.map(post => (
                                    <div
                                        key={post.id}
                                        onClick={() => setViewingPost(post)}
                                        className="group relative p-6 md:p-8 rounded-[2rem] bg-surface-card border border-border hover:border-primary/30 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-lg hover:-translate-y-0.5"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="px-3 py-1 rounded-full bg-surface-hover border border-border text-[10px] font-bold uppercase tracking-wider text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20 transition-colors">
                                                {post.category}
                                            </span>
                                            <span className="text-[10px] font-mono font-medium text-muted-foreground opacity-60">
                                                {getDaysLeft(post.expiresAt)}
                                            </span>
                                        </div>

                                        <div className="mb-6 space-y-2">
                                            {post.title && <h3 className="text-lg font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">{post.title}</h3>}
                                            <p className="text-muted-foreground text-sm md:text-base leading-relaxed font-medium line-clamp-3">
                                                {post.content}
                                            </p>
                                        </div>

                                        <div className="flex justify-between items-center pt-4 border-t border-border/30" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex gap-1">
                                                {REACTIONS.map(r => (
                                                    <button
                                                        key={r.type}
                                                        onClick={() => handleReact(post.id, r.type)}
                                                        className="h-8 w-8 hover:bg-surface-hover rounded-full transition-colors flex items-center justify-center text-base opacity-70 hover:opacity-100 hover:scale-110"
                                                        title={r.label}
                                                    >
                                                        {r.icon}
                                                    </button>
                                                ))}
                                                <span className="ml-2 flex items-center text-xs font-bold text-muted-foreground">{post._count?.reactions || 0}</span>
                                            </div>

                                            <div className="flex items-center gap-1">
                                                <button onClick={() => handleSave(post.id)} className="p-2 text-muted-foreground hover:text-foreground transition-colors hover:bg-surface-hover rounded-full" title="Save">
                                                    🔖
                                                </button>
                                                <button onClick={() => handleFlag(post.id)} className="p-2 text-muted-foreground hover:text-red-500 transition-colors hover:bg-surface-hover rounded-full" title="Report">
                                                    🚩
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </main>

                    {/* --- RIGHT COLUMN: Widgets (Sticky) --- */}
                    <aside className="hidden lg:block lg:col-span-3 h-full overflow-y-auto pr-2 custom-scrollbar space-y-6 pt-8">

                        {/* Crisis Widget */}
                        <div className="p-6 rounded-[1.5rem] bg-gradient-to-br from-red-600 to-red-700 text-white shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-[30px]" />
                            <h3 className="text-sm font-black mb-1 uppercase tracking-tight relative z-10">In Crisis?</h3>
                            <p className="text-xs text-red-100 mb-4 font-medium relative z-10 opacity-90">Help is available 24/7.</p>
                            <a href="tel:988" className="block w-full text-center py-2.5 bg-white text-red-600 rounded-lg text-xs font-bold hover:bg-red-50 transition-colors shadow-sm">
                                Call 988 Lifeline
                            </a>
                        </div>

                        {/* Recent Resources */}
                        <div className="bg-surface-card border border-border rounded-[1.5rem] p-5 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Resources</h3>
                                <Link href="/resources" className="text-[10px] font-bold text-primary hover:underline">View All</Link>
                            </div>
                            <div className="space-y-3">
                                {resources.slice(0, 3).map(res => (
                                    <div
                                        key={res.id}
                                        className="flex items-center gap-3 group hover:bg-surface-hover p-2 rounded-xl transition-colors -mx-2 relative"
                                    >
                                        <div className="h-10 w-10 rounded-lg overflow-hidden relative shrink-0 bg-muted">
                                            <Image
                                                src={res.image || "/images/topics/default.png"}
                                                alt={res.title}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <Link href={res.link || '#'} target="_blank" className="min-w-0 flex-grow block">
                                            <h4 className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">{res.title}</h4>
                                            <p className="text-[10px] text-muted-foreground truncate opacity-70">Read more →</p>
                                        </Link>

                                        {/* Bookmark Button */}
                                        <button
                                            onClick={() => handleSaveResource(res.id, res.title)}
                                            className={`h-8 w-8 flex items-center justify-center rounded-full transition-all ${res.isBookmarked
                                                ? "text-primary bg-primary/10"
                                                : "text-muted-foreground hover:bg-background"
                                                }`}
                                            title="Bookmark"
                                        >
                                            {res.isBookmarked ? "🔖" : "🏷️"}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quote of the day (Static for now) */}
                        <div className="bg-surface-card/50 border border-border/50 rounded-[1.5rem] p-5">
                            <p className="text-xs font-medium italic text-muted-foreground leading-relaxed">
                                &quot;Happiness can be found, even in the darkest of times, if one only remembers to turn on the light.&quot;
                            </p>
                            <p className="text-[10px] font-bold text-foreground mt-2">— Albus Dumbledore</p>
                        </div>
                    </aside>

                </div>

                <CreateReflectionModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onPostCreated={fetchPosts}
                    anonymousId={userId}
                />

                {/* View Post Modal */}
                {viewingPost && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-300 font-heading" onClick={() => setViewingPost(null)}>
                        <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-surface-card border border-border rounded-[2rem] shadow-2xl overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>

                            {/* Modal Header */}
                            <div className="px-8 py-6 border-b border-border/50 flex justify-between items-start bg-surface-card sticky top-0 z-10 transition-colors">
                                <div>
                                    <div className="flex gap-2 items-center mb-2">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">{viewingPost.category}</span>
                                        <span className="text-[10px] font-bold text-muted-foreground">{new Date(viewingPost.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    {viewingPost.title && <h2 className="text-xl font-bold text-foreground leading-tight">{viewingPost.title}</h2>}
                                </div>
                                <button onClick={() => setViewingPost(null)} className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-surface-hover rounded-full">✕</button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-8">
                                <p className="text-foreground leading-loose text-base md:text-lg font-medium whitespace-pre-wrap">
                                    {viewingPost.content}
                                </p>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-6 border-t border-border/50 bg-surface-hover/30 flex justify-between items-center">
                                <div className="flex gap-3">
                                    {REACTIONS.map(r => (
                                        <button
                                            key={r.type}
                                            onClick={() => handleReact(viewingPost.id, r.type)}
                                            className="h-10 px-4 hover:bg-surface-hover rounded-xl transition-all text-sm flex gap-2 items-center text-muted-foreground hover:text-foreground border border-border bg-background shadow-sm"
                                        >
                                            <span className="text-lg">{r.icon}</span>
                                            <span className="hidden sm:inline text-xs font-bold uppercase tracking-wide">{r.label}</span>
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => handleSave(viewingPost.id)}
                                    className="px-5 py-2.5 rounded-xl bg-foreground text-background text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity shadow-lg"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <ModeratorLoginModal
                    isOpen={isModLoginOpen}
                    onClose={() => setIsModLoginOpen(false)}
                />
            </div>
        </div>
    );
}

