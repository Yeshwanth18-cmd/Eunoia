"use client";

import { useEffect, useState } from "react";

type FlaggedPost = {
    id: string;
    content: string;
    createdAt: string;
    anonymousId: string;
    isFlagged: boolean;
};

export default function ModerationTab() {
    const [posts, setPosts] = useState<FlaggedPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadFlaggedPosts();
    }, []);

    async function loadFlaggedPosts() {
        try {
            setIsLoading(true);
            const res = await fetch("/api/admin/moderation/posts", {
                cache: "no-store",
                headers: { "Pragma": "no-cache" }
            });
            if (res.ok) {
                const data = await res.json();
                setPosts(data.posts || []);
            }
        } finally {
            setIsLoading(false);
        }
    }

    async function handleAction(id: string, action: 'DELETE' | 'RESTORE') {
        // 1. Optimistic Update: Remove from list immediately
        setPosts(prev => prev.filter(p => p.id !== id));

        // 2. Perform API Call
        try {
            const url = `/api/admin/moderation/posts/${id}`;
            const res = await fetch(url, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action })
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || "Action failed");
            }
        } catch (error) {
            console.error(error);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            alert(`Failed: ${(error as any).message}`);
            loadFlaggedPosts();
        }
    }

    if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading moderation queue...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="border-b border-border/50 pb-6">
                <h2 className="text-3xl font-black text-foreground tracking-tight">Content Moderation</h2>
                <p className="text-muted-foreground font-medium">Review reported community content.</p>
            </div>

            <div className="rounded-[2rem] border border-border bg-surface-card overflow-hidden shadow-md">
                <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left text-sm relative">
                        <thead className="bg-surface-hover text-muted-foreground uppercase text-[10px] font-bold tracking-widest sticky top-0 z-10 backdrop-blur-md border-b border-border shadow-sm">
                            <tr>
                                <th className="px-6 py-4">Content</th>
                                <th className="px-6 py-4">User ID</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50 text-foreground">
                            {posts.map(p => (
                                <tr key={p.id} className="hover:bg-surface-hover transition-colors group">
                                    <td className="px-6 py-4 max-w-md">
                                        <p className="line-clamp-2 md:line-clamp-none font-medium">{p.content}</p>
                                        <span className="text-[10px] text-muted-foreground block mt-1">{new Date(p.createdAt).toLocaleDateString()}</span>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{p.anonymousId}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleAction(p.id, 'RESTORE')} className="text-green-600 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors">Keep</button>
                                            <button onClick={() => handleAction(p.id, 'DELETE')} className="text-red-500 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors">Remove</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {posts.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground italic bg-surface-hover/30">
                                        <span className="text-2xl block mb-2">🎉</span>
                                        No flagged content to review.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
