"use client";

import { useState } from "react";

const CATEGORIES = [
    "Academic Stress",
    "Loneliness",
    "Burnout",
    "Relationships",
    "Future Anxiety",
    "Other"
];

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onPostCreated: () => void;
    anonymousId: string;
}

export default function CreateReflectionModal({ isOpen, onClose, onPostCreated, anonymousId }: Props) {
    const [step, setStep] = useState<"RULES" | "WRITE">("RULES");
    const [content, setContent] = useState("");
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState(CATEGORIES[0]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    async function handleSubmit() {
        if (!content.trim()) return;

        try {
            setIsSubmitting(true);
            const res = await fetch("/api/community/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    content,
                    category,
                    anonymousId
                })
            });

            if (res.ok) {
                setContent("");
                setTitle("");
                setStep("RULES"); // Reset for next time
                onPostCreated();
                onClose();
            } else {
                alert("Failed to post. Please try again.");
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-300 font-heading">
            <div className="w-full max-w-lg bg-surface-card border border-border rounded-[2rem] shadow-2xl overflow-hidden relative">

                {/* Header */}
                <div className="px-8 py-6 border-b border-border/50 flex justify-between items-center bg-surface-hover/30">
                    <h2 className="text-xl font-bold text-foreground tracking-tight">
                        {step === "RULES" ? "Community Values" : "New Reflection"}
                    </h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-surface-hover rounded-full">
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="p-8">
                    {step === "RULES" ? (
                        <div className="space-y-8">
                            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                                <p className="font-medium text-foreground">To keep this space safe for everyone, please agree to the following:</p>
                                <ul className="space-y-3 list-disc pl-4 marker:text-primary">
                                    <li><strong className="text-foreground">Share experiences, not advice.</strong> Say &quot;I felt...&quot; instead of &quot;You should...&quot;</li>
                                    <li><strong className="text-foreground">No medical claims.</strong> Do not diagnose or prescribe fixes.</li>
                                    <li><strong className="text-foreground">No judgment.</strong> This is a place for observation, not debate.</li>
                                    <li><strong className="text-foreground">Personal reflection only.</strong> Focus on your own journey.</li>
                                </ul>
                            </div>
                            <button
                                onClick={() => setStep("WRITE")}
                                className="w-full py-4 bg-foreground text-background font-bold rounded-xl hover:scale-[1.01] transition-all shadow-lg text-sm uppercase tracking-wide"
                            >
                                I Agree & Understand
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Topic</label>
                                <div className="flex flex-wrap gap-2">
                                    {CATEGORIES.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setCategory(cat)}
                                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${category === cat
                                                ? "bg-primary text-primary-foreground border-primary shadow-md"
                                                : "bg-surface-hover/50 text-muted-foreground border-transparent hover:bg-surface-hover hover:text-foreground"
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Title your thought (optional)"
                                    className="w-full bg-transparent text-xl md:text-2xl font-bold text-foreground placeholder-muted-foreground/50 outline-none border-b border-border/50 pb-2 focus:border-primary transition-colors"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    maxLength={100}
                                />
                                <textarea
                                    placeholder="What's on your mind? Use 'I feel...' or 'I noticed...'"
                                    className="w-full h-48 bg-surface-hover/30 rounded-xl p-4 text-base text-foreground placeholder-muted-foreground/50 resize-none outline-none leading-relaxed border border-transparent focus:border-primary/50 transition-all focus:bg-surface-hover/50"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                />
                                <div className="text-right text-xs text-muted-foreground font-mono">
                                    {content.length}/2000
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    onClick={handleSubmit}
                                    disabled={!content.trim() || isSubmitting}
                                    className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:shadow-lg hover:shadow-primary/20 hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        "Post Anonymously"
                                    )}
                                </button>
                                <p className="text-center text-[10px] text-muted-foreground mt-4 font-medium uppercase tracking-widest">
                                    Posts expire automatically in 7 days
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
