"use client";

import { useState } from "react";
import { useNotifications } from "@/components/NotificationProvider";

interface UnifiedCheckInProps {
    userId: string;
    onSuccess?: () => void;
}

export default function UnifiedCheckIn({ userId, onSuccess }: UnifiedCheckInProps) {
    const { notify } = useNotifications();
    const [step, setStep] = useState<"MOOD" | "CAPACITY" | "NOTE" | "DONE">("MOOD");

    // Data
    const [mood, setMood] = useState<number | null>(null);
    const [capacity, setCapacity] = useState<number>(50);
    const [note, setNote] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Helpers
    const moodEmojis = ["😫", "😕", "😐", "🙂", "🤩"];
    const moodLabels = ["Drained", "Low", "Okay", "Good", "Great"];

    const handleMoodSelect = (val: number) => {
        setMood(val);
        // Auto-advance for smoothness
        setTimeout(() => setStep("CAPACITY"), 300);
    };

    const submitAll = async () => {
        if (mood === null) return;
        setIsSubmitting(true);

        try {
            // 1. Submit Mood
            const moodRes = await fetch("/api/mood", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, mood, note }),
            });

            // 2. Submit Capacity
            const capRes = await fetch("/api/assessment/capacity", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, value: capacity }),
            });

            if (!moodRes.ok || !capRes.ok) throw new Error("Failed to save logs");

            notify("success", "Check-in logged successfully.");
            setStep("DONE");
            if (onSuccess) onSuccess();

        } catch (error) {
            console.error(error);
            notify("error", "Failed to save check-in.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const reset = () => {
        setStep("MOOD");
        setMood(null);
        setCapacity(50);
        setNote("");
    };

    if (step === "DONE") {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 animate-in fade-in zoom-in duration-300">
                <div className="text-6xl mb-4">✨</div>
                <h3 className="text-2xl font-light text-foreground mb-2">Check-in Complete</h3>
                <p className="text-muted-foreground mb-6">Your state has been recorded.</p>
                <button
                    onClick={reset}
                    className="px-6 py-2 rounded-full bg-surface-hover hover:bg-surface-hover/80 text-foreground text-sm transition-colors"
                >
                    Log Another
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full relative">
            {/* Progress Indicator */}
            <div className="flex gap-1 mb-6">
                <div className={`h-1 flex-1 rounded-full transition-colors ${["MOOD", "CAPACITY", "NOTE"].includes(step) ? "bg-primary" : "bg-border"}`} />
                <div className={`h-1 flex-1 rounded-full transition-colors ${["CAPACITY", "NOTE"].includes(step) ? "bg-primary" : "bg-border"}`} />
                <div className={`h-1 flex-1 rounded-full transition-colors ${step === "NOTE" ? "bg-primary" : "bg-border"}`} />
            </div>

            <div className="flex-1 flex flex-col justify-center">

                {step === "MOOD" && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                        <div className="text-center">
                            <h3 className="text-2xl font-light text-foreground mb-1">How are you feeling?</h3>
                            <p className="text-muted-foreground text-sm">Tap the vibe that matches best.</p>
                        </div>
                        <div className="grid grid-cols-5 gap-2">
                            {[1, 2, 3, 4, 5].map((val, idx) => (
                                <button
                                    key={val}
                                    onClick={() => handleMoodSelect(val)}
                                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${mood === val ? "bg-primary text-primary-foreground scale-110 shadow-lg shadow-primary/20" : "bg-surface-hover/50 text-muted-foreground hover:bg-surface-hover hover:text-foreground hover:scale-105"}`}
                                >
                                    <span className="text-2xl">{moodEmojis[idx]}</span>
                                    <span className="text-[10px] font-bold uppercase tracking-wider">{moodLabels[idx]}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === "CAPACITY" && (
                    <div className="space-y-8 animate-in slide-in-from-right-4 fade-in duration-300">
                        <div className="text-center">
                            <h3 className="text-2xl font-light text-foreground mb-1">Current Bandwidth?</h3>
                            <p className="text-muted-foreground text-sm">0% = Empty, 100% = Full Charge.</p>
                        </div>

                        <div className="px-4">
                            <input
                                type="range"
                                min="0" max="100"
                                value={capacity}
                                onChange={(e) => setCapacity(Number(e.target.value))}
                                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                            <div className="flex justify-between mt-4">
                                <span className="text-xs font-mono text-muted-foreground">LOW</span>
                                <span className="text-3xl font-bold text-foreground tabular-nums">{capacity}%</span>
                                <span className="text-xs font-mono text-muted-foreground">HIGH</span>
                            </div>
                        </div>

                        <div className="flex justify-between pt-4">
                            <button onClick={() => setStep("MOOD")} className="text-muted-foreground hover:text-foreground text-sm">← Back</button>
                            <button
                                onClick={() => setStep("NOTE")}
                                className="px-6 py-2 bg-foreground text-background rounded-lg font-bold hover:scale-105 transition-transform"
                            >
                                Next →
                            </button>
                        </div>
                    </div>
                )}

                {step === "NOTE" && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                        <div className="text-center">
                            <h3 className="text-2xl font-light text-foreground mb-1">Anything else?</h3>
                            <p className="text-muted-foreground text-sm">Optional note for context.</p>
                        </div>

                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="I'm feeling this way because..."
                            className="w-full h-32 bg-surface-card border border-border rounded-xl p-4 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 resize-none"
                        />

                        <div className="flex justify-between pt-2">
                            <button onClick={() => setStep("CAPACITY")} className="text-muted-foreground hover:text-foreground text-sm">← Back</button>
                            <button
                                onClick={submitAll}
                                disabled={isSubmitting}
                                className="px-8 py-3 bg-foreground text-background rounded-xl font-bold hover:scale-105 transition-transform disabled:opacity-50"
                            >
                                {isSubmitting ? "Saving..." : "Check In"}
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
