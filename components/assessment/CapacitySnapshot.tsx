"use client";

import { useState } from "react";
import { useNotifications } from "@/components/NotificationProvider";

export default function CapacitySnapshot({ userId, onSuccess }: { userId: string, onSuccess?: () => void }) {
    const [values, setValues] = useState({ physical: 3, mental: 3, emotional: 3 });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { notify } = useNotifications();

    const handleChange = (key: keyof typeof values, val: number) => {
        setValues(prev => ({ ...prev, [key]: val }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await fetch("/api/assessment/capacity", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, ...values }),
            });
            notify("success", "Snapshot captured.");
            if (onSuccess) onSuccess();
        } catch {
            notify("error", "Failed to log.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-500">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-light text-white">How heavy does it feel?</h2>
                <p className="text-neutral-500 text-sm">Capture your current bandwidth.</p>
            </div>

            <div className="space-y-12 max-w-xl mx-auto">
                {/* Physical Scale */}
                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <label className="text-sm font-bold text-teal-200 uppercase tracking-widest">Physical Energy</label>
                        <span className="text-xs text-neutral-400 font-mono">
                            {values.physical === 1 ? "Drained" : values.physical === 5 ? "Vibrant" : "Steady"}
                        </span>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                        {[1, 2, 3, 4, 5].map((level) => (
                            <button
                                key={level}
                                onClick={() => handleChange("physical", level)}
                                className={`h-12 rounded-lg border transition-all duration-200 ${values.physical >= level
                                    ? "bg-teal-500/20 border-teal-500/50 shadow-[0_0_10px_rgba(20,184,166,0.2)]"
                                    : "bg-white/5 border-white/5 hover:bg-white/10"
                                    }`}
                            />
                        ))}
                    </div>
                    <div className="flex justify-between text-[10px] text-neutral-600 uppercase tracking-wider font-medium">
                        <span>Empty</span>
                        <span>Full</span>
                    </div>
                </div>

                {/* Mental Scale */}
                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <label className="text-sm font-bold text-blue-200 uppercase tracking-widest">Mental Bandwidth</label>
                        <span className="text-xs text-neutral-400 font-mono">
                            {values.mental === 1 ? "Noisy" : values.mental === 5 ? "Clear" : "Active"}
                        </span>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                        {[1, 2, 3, 4, 5].map((level) => (
                            <button
                                key={level}
                                onClick={() => handleChange("mental", level)}
                                className={`h-12 rounded-lg border transition-all duration-200 ${values.mental >= level
                                    ? "bg-blue-500/20 border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.2)]"
                                    : "bg-white/5 border-white/5 hover:bg-white/10"
                                    }`}
                            />
                        ))}
                    </div>
                    <div className="flex justify-between text-[10px] text-neutral-600 uppercase tracking-wider font-medium">
                        <span>Foggy</span>
                        <span>Sharp</span>
                    </div>
                </div>

                {/* Emotional Scale */}
                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <label className="text-sm font-bold text-purple-200 uppercase tracking-widest">Emotional Space</label>
                        <span className="text-xs text-neutral-400 font-mono">
                            {values.emotional === 1 ? "Closed" : values.emotional === 5 ? "Open" : "Reactive"}
                        </span>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                        {[1, 2, 3, 4, 5].map((level) => (
                            <button
                                key={level}
                                onClick={() => handleChange("emotional", level)}
                                className={`h-12 rounded-lg border transition-all duration-200 ${values.emotional >= level
                                    ? "bg-purple-500/20 border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.2)]"
                                    : "bg-white/5 border-white/5 hover:bg-white/10"
                                    }`}
                            />
                        ))}
                    </div>
                    <div className="flex justify-between text-[10px] text-neutral-600 uppercase tracking-wider font-medium">
                        <span>Tight</span>
                        <span>Spacious</span>
                    </div>
                </div>
            </div>

            <div className="flex justify-center pt-4">
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-10 py-3 rounded-full bg-white text-black font-bold tracking-widest uppercase text-xs hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all shadow-lg"
                >
                    {isSubmitting ? "Capturing..." : "Capture Snapshot"}
                </button>
            </div>
        </div>
    );
}
