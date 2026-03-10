"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getOrCreateClientUserId } from "@/lib/clientUserId";
import { useNotifications } from "@/components/NotificationProvider";
import SpeechInput from "@/components/journal/SpeechInput";

// Prompts to cycle through
const PROMPTS = [
    "What is something small that went well today?",
    "What is a thought that feels heavy right now?",
    "If you could speak to your younger self, what would you say?",
    "What does 'rest' look like for you today?",
    "List three things that ground you.",
    "Describe your current mood as a landscape."
];

interface JournalEntry {
    id: string;
    title: string;
    content: string;
    prompt: string;
    createdAt: Date | string; // Handle potentially string dates from API
}

export default function JournalPage() {
    const [prompt, setPrompt] = useState("");
    const [content, setContent] = useState("");
    const [title, setTitle] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [userId, setUserId] = useState("");

    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const { notify } = useNotifications();

    // New State for "Reading Mode"
    const [viewingId, setViewingId] = useState<string | null>(null);

    const [currentDate, setCurrentDate] = useState("");

    useEffect(() => {
        setUserId(getOrCreateClientUserId());
        setPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
        fetchEntries();

        const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        setCurrentDate(new Date().toLocaleDateString('en-US', options));
    }, []);

    const fetchEntries = async () => {
        const id = getOrCreateClientUserId();
        try {
            const res = await fetch(`/api/journal?anonymousId=${id}`);
            const data = await res.json();
            if (data.entries) setEntries(data.entries);
        } catch { }
    };

    const handleSave = async () => {
        if (!content.trim()) return;
        setIsSaving(true);
        try {
            const finalTitle = title.trim() || `Journal Entry - ${new Date().toLocaleDateString()}`;

            const res = await fetch('/api/journal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    anonymousId: userId,
                    content,
                    title: finalTitle,
                    prompt: prompt,
                    tags: ["Daily Prompt"],
                    mood: "Neutral"
                })
            });

            if (!res.ok) throw new Error("Save failed");

            notify("success", "Entry saved securely.");
            // Reset to new entry after save
            startNewEntry();
            fetchEntries();
        } catch (e) {
            console.error(e);
            notify("error", "Failed to save entry. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (entryId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this entry?")) return;

        try {
            const res = await fetch('/api/journal', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: entryId, anonymousId: userId })
            });
            if (res.ok) {
                notify("success", "Entry deleted.");
                if (viewingId === entryId) startNewEntry();
                fetchEntries();
            } else {
                throw new Error("Delete failed");
            }
        } catch {
            notify("error", "Could not delete entry.");
        }
    };

    const loadEntry = (entry: JournalEntry) => {
        setViewingId(entry.id);
        setTitle(entry.title || "");
        setContent(entry.content);
        setPrompt(entry.prompt || "");
    };

    const startNewEntry = () => {
        setViewingId(null);
        setTitle("");
        setContent("");
        setPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
    };

    return (
        <div className="min-h-screen bg-background relative overflow-hidden flex flex-col lg:flex-row font-heading">
            {/* EXECUTIVE VIGNETTE */}
            <div className="fixed inset-0 z-0 pointer-events-none bg-vignette-light dark:bg-vignette-dark" />

            {/* Ambient Background - Sapphire/Gold */}
            <div className="fixed top-0 right-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[20%] w-[60%] h-[60%] bg-blue-600/5 dark:bg-blue-900/10 rounded-full blur-[150px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[10%] w-[40%] h-[40%] bg-amber-500/5 dark:bg-amber-500/5 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row gap-12 max-w-7xl mx-auto w-full p-6 lg:p-12">

                {/* Left: Editor Area */}
                <div className="flex-grow max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <header className="flex justify-between items-start">
                        <div className="w-full">
                            <Link href="/assessment" className="text-sm font-bold text-muted-foreground hover:text-primary mb-6 block transition-colors">← Back to Dashboard</Link>

                            <div className="flex items-center gap-4 mb-3">
                                <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded">
                                    {viewingId ? "Reading Entry" : "Daily Reflection"}
                                </span>
                                <span className="text-xs font-mono text-muted-foreground">{currentDate}</span>
                            </div>

                            <h2 className="text-2xl lg:text-3xl font-bold mt-2 leading-tight text-foreground min-h-[3rem] font-heading">
                                {prompt}
                            </h2>

                            {!viewingId && (
                                <button
                                    onClick={() => setPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)])}
                                    className="text-xs text-muted-foreground hover:text-foreground mt-3 underline decoration-muted-foreground/50 transition-colors"
                                >
                                    Shuffle Prompt
                                </button>
                            )}
                        </div>

                        {viewingId && (
                            <button
                                onClick={startNewEntry}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 shadow-lg"
                            >
                                <span>+</span> New
                            </button>
                        )}
                    </header>

                    <div className="relative group space-y-6">
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Title your entry (optional)..."
                            readOnly={!!viewingId} // Read-only if viewing
                            className="w-full bg-transparent border-b border-border p-2 text-xl font-bold text-foreground focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
                        />

                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Start writing..."
                            readOnly={!!viewingId}
                            className={`w-full h-[500px] bg-surface-card border border-border rounded-3xl p-8 text-lg font-medium leading-relaxed resize-none focus:outline-none transition-all placeholder:text-muted-foreground/50 text-foreground shadow-sm ${viewingId ? 'cursor-default focus:border-border' : 'focus:border-primary focus:ring-1 focus:ring-primary/20'}`}
                        />

                        {!viewingId && (
                            <div className="flex justify-end pt-4">
                                <div className="flex gap-2">
                                    <SpeechInput onSpeechResult={(text) => setContent(prev => prev + (prev ? " " : "") + text)} />
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving || !content.trim()}
                                        className="px-8 py-3 bg-foreground text-background font-bold rounded-xl hover:scale-105 transition-transform disabled:opacity-50 shadow-lg"
                                    >
                                        {isSaving ? "Saving..." : "Save Entry"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: History Sidebar */}
                <aside className="relative z-10 w-full lg:w-96 space-y-6 lg:border-l lg:border-border/50 lg:pl-12">
                    <div className="border-b border-border pb-4 flex justify-between items-center">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">History</h3>
                        <span className="text-xs text-muted-foreground font-bold bg-surface-hover px-2 py-1 rounded-full">{entries.length}</span>
                    </div>

                    <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar">
                        {entries.length === 0 ? (
                            <div className="text-center p-8 border border-dashed border-border rounded-2xl bg-surface-card/30">
                                <p className="text-sm text-muted-foreground italic">No entries yet.</p>
                                <button onClick={startNewEntry} className="mt-4 text-sm text-primary font-bold hover:underline">Start Writing</button>
                            </div>
                        ) : (
                            entries.map(entry => (
                                <div
                                    key={entry.id}
                                    onClick={() => loadEntry(entry)}
                                    className={`w-full p-5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 group relative ${viewingId === entry.id
                                        ? "bg-surface-card border-primary shadow-lg shadow-primary/10"
                                        : "bg-surface-card/50 border-border hover:bg-surface-hover hover:border-primary/30"
                                        }`}
                                >
                                    {/* Header */}
                                    <div className="flex justify-between items-start">
                                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide bg-background/50 px-2 py-1 rounded border border-border">
                                            {new Date(entry.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </span>

                                        {/* Visible Delete Button */}
                                        <button
                                            onClick={(e) => handleDelete(entry.id, e)}
                                            className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 p-1.5 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                            title="Delete Entry"
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="3 6 5 6 21 6"></polyline>
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                            </svg>
                                        </button>
                                    </div>

                                    <h4 className={`text-sm font-bold transition-colors ${viewingId === entry.id ? 'text-primary' : 'text-foreground group-hover:text-primary/80'}`}>
                                        {entry.title || "Untitled Entry"}
                                    </h4>

                                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                        {entry.content}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
}
