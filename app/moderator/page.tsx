"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Types
type Post = {
    id: string;
    title?: string;
    content: string;
    category: string;
    createdAt: string;
    isFlagged: boolean;
};

type Resource = {
    id: string;
    title: string;
    description: string;
    category: string;
    link: string;
    image: string | null;
};

export default function ModeratorPage() {
    const [activeTab, setActiveTab] = useState<"REVIEW" | "MANAGE">("REVIEW");
    const [flaggedPosts, setFlaggedPosts] = useState<Post[]>([]);
    const [allPosts, setAllPosts] = useState<Post[]>([]);
    const [resources, setResources] = useState<Resource[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const fetchAllData = useCallback(async () => {
        setIsLoading(true);
        try {
            // 1. Verify Auth & Fetch Flagged
            const flagRes = await fetch("/api/admin/moderation/posts");
            if (flagRes.status === 401) {
                router.push("/");
                return;
            }
            const flagData = await flagRes.json();
            setFlaggedPosts(flagData.posts || []);

            // 2. Fetch All Posts (for Manager)
            const allRes = await fetch("/api/community/posts?limit=100");
            const allData = await allRes.json();
            setAllPosts(allData.posts || []);

            // 3. Fetch Resources
            const resRes = await fetch("/api/resources");
            const resData = await resRes.json();
            setResources(resData.resources || []);

        } catch (e) {
            console.error("Failed to load mod data", e);
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    async function handleReviewAction(id: string, action: "restore" | "delete") {
        if (!confirm(action === "delete" ? "Delete permanently?" : "Restore to feed?")) return;

        // Optimistic UI
        setFlaggedPosts(prev => prev.filter(p => p.id !== id));

        await fetch(`/api/admin/moderation/posts/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action })
        });

        if (action === "delete") setAllPosts(prev => prev.filter(p => p.id !== id));
    }

    async function handleDeletePost(id: string) {
        if (!confirm("Admin Delete: This cannot be undone.")) return;

        setAllPosts(prev => prev.filter(p => p.id !== id));

        await fetch(`/api/admin/moderation/posts/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "delete" })
        });
    }

    return (
        <div className="min-h-screen bg-background relative overflow-hidden font-heading text-foreground">
            {/* EXECUTIVE VIGNETTE */}
            <div className="fixed inset-0 z-0 pointer-events-none bg-vignette-light dark:bg-vignette-dark" />

            <div className="relative z-10 max-w-7xl mx-auto p-6 md:p-12 min-h-screen flex flex-col">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 border-b border-border/50 pb-8 gap-6">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight mb-2 text-foreground">Moderator Control</h1>
                        <p className="text-muted-foreground text-lg font-medium">Manage community safety and content.</p>
                    </div>
                    <div className="flex gap-4">
                        <Link href="/community" className="px-6 py-3 rounded-xl bg-surface-card border border-border hover:bg-surface-hover hover:text-primary transition-all text-sm font-bold shadow-sm">
                            ← Back to Feed
                        </Link>
                    </div>
                </header>

                {/* Tabs */}
                <div className="flex gap-4 mb-10">
                    <button
                        onClick={() => setActiveTab("REVIEW")}
                        className={`px-8 py-4 rounded-2xl border text-sm font-bold transition-all uppercase tracking-wider ${activeTab === "REVIEW"
                            ? "bg-red-500/10 text-red-600 border-red-500/20 shadow-inner ring-1 ring-red-500/20"
                            : "bg-surface-card border-border text-muted-foreground hover:text-foreground hover:bg-surface-hover"
                            }`}
                    >
                        Review Queue ({flaggedPosts.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("MANAGE")}
                        className={`px-8 py-4 rounded-2xl border text-sm font-bold transition-all uppercase tracking-wider ${activeTab === "MANAGE"
                            ? "bg-blue-500/10 text-blue-600 border-blue-500/20 shadow-inner ring-1 ring-blue-500/20"
                            : "bg-surface-card border-border text-muted-foreground hover:text-foreground hover:bg-surface-hover"
                            }`}
                    >
                        Content Manager
                    </button>
                </div>

                {isLoading ? (
                    <div className="text-center py-20 text-muted-foreground animate-pulse font-medium text-xl">Loading secure data...</div>
                ) : (
                    <div className="flex-grow">
                        {/* REVIEW TAB - Table Format */}
                        {activeTab === "REVIEW" && (
                            <div className="space-y-6">
                                {flaggedPosts.length === 0 ? (
                                    <div className="text-center py-32 rounded-[3rem] border border-dashed border-border bg-surface-card/50">
                                        <div className="text-6xl mb-6 grayscale opacity-50">✅</div>
                                        <div className="text-2xl font-bold text-foreground mb-2">All clear</div>
                                        <p className="text-muted-foreground font-medium">No flagged content to review.</p>
                                    </div>
                                ) : (
                                    <div className="bg-surface-card border border-border rounded-[2rem] overflow-hidden shadow-sm">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-border bg-surface-hover/50 text-xs uppercase tracking-wider text-muted-foreground">
                                                    <th className="p-6 font-bold">Content Preview</th>
                                                    <th className="p-6 font-bold w-48">Reason</th>
                                                    <th className="p-6 font-bold w-40">Date</th>
                                                    <th className="p-6 font-bold w-64 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {flaggedPosts.map(post => (
                                                    <tr key={post.id} className="border-b border-border hover:bg-surface-hover transition-colors group">
                                                        <td className="p-6">
                                                            <div className="font-medium text-foreground text-sm line-clamp-2 max-w-xl">
                                                                &quot;{post.content}&quot;
                                                            </div>
                                                            <div className="flex gap-2 mt-2">
                                                                <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase">{post.category}</span>
                                                            </div>
                                                        </td>
                                                        <td className="p-6">
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-600 ring-1 ring-red-500/20">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                                                                User Report
                                                            </span>
                                                        </td>
                                                        <td className="p-6 text-sm text-muted-foreground font-mono">
                                                            {new Date(post.createdAt).toLocaleDateString()}
                                                        </td>
                                                        <td className="p-6 text-right">
                                                            <div className="flex justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                                                <button
                                                                    onClick={() => handleReviewAction(post.id, "restore")}
                                                                    className="px-3 py-1.5 bg-surface-card border border-border rounded-lg text-xs font-bold hover:bg-surface-hover hover:text-foreground"
                                                                >
                                                                    Dismiss
                                                                </button>
                                                                <button
                                                                    onClick={() => handleReviewAction(post.id, "delete")}
                                                                    className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 shadow-sm"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* MANAGE TAB */}
                        {activeTab === "MANAGE" && (
                            <div className="grid lg:grid-cols-2 gap-12">
                                <section>
                                    <h3 className="text-xl font-bold mb-6 text-foreground border-b border-border/50 pb-4">All Posts</h3>
                                    <div className="space-y-4 h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                                        {allPosts.map(post => (
                                            <div key={post.id} className="p-6 rounded-2xl bg-surface-card border border-border flex flex-col gap-4 group hover:border-primary/50 transition-all shadow-sm">
                                                <div className="flex justify-between items-start">
                                                    <span className="text-[10px] uppercase font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">{post.category}</span>
                                                    <span className="text-[10px] text-muted-foreground font-mono">{new Date(post.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-sm text-foreground/80 line-clamp-2 font-medium leading-relaxed">{post.content}</p>
                                                <div className="pt-2 flex justify-end">
                                                    <button
                                                        onClick={() => handleDeletePost(post.id)}
                                                        className="text-[10px] uppercase tracking-wider font-bold text-red-500 hover:text-white px-4 py-2 bg-red-500/10 hover:bg-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                                    >
                                                        Force Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <section>
                                    <div className="flex justify-between items-center mb-6 border-b border-border/50 pb-4">
                                        <h3 className="text-xl font-bold text-foreground">Resources</h3>
                                        <button
                                            onClick={() => {
                                                const title = prompt("Resource Title:");
                                                const description = prompt("Description:");
                                                const link = prompt("Link URL:");
                                                if (title && link) {
                                                    fetch("/api/resources", {
                                                        method: "POST",
                                                        headers: { "Content-Type": "application/json" },
                                                        body: JSON.stringify({ title, description, link })
                                                    }).then(() => fetchAllData());
                                                }
                                            }}
                                            className="text-xs bg-foreground text-background px-4 py-2 rounded-lg font-bold hover:scale-105 transition-all shadow-md"
                                        >
                                            + Add New
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        {resources.map(res => (
                                            <div key={res.id} className="p-4 rounded-2xl bg-surface-card border border-border flex items-center gap-5 group hover:border-primary/50 transition-all hover:shadow-lg">
                                                <div className="h-14 w-14 bg-surface-hover rounded-xl flex items-center justify-center text-xl overflow-hidden relative text-muted-foreground ring-1 ring-border">
                                                    {res.image ? <Image src={res.image} alt="" fill className="object-cover" /> : "📚"}
                                                </div>
                                                <div className="flex-grow min-w-0">
                                                    <h4 className="font-bold text-sm truncate text-foreground group-hover:text-primary transition-colors">{res.title}</h4>
                                                    <p className="text-xs text-muted-foreground truncate">{res.description}</p>
                                                </div>
                                                <button
                                                    onClick={async () => {
                                                        if (!confirm("Delete this resource?")) return;
                                                        await fetch(`/api/resources/${res.id}`, { method: "DELETE" });
                                                        fetchAllData();
                                                    }}
                                                    className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                        {resources.length === 0 && <p className="text-muted-foreground text-sm text-center py-8">No resources found.</p>}
                                    </div>
                                </section>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
