"use client";

import { useState } from "react";
import UnifiedCheckIn from "@/components/assessment/UnifiedCheckIn";
import { getOrCreateClientUserId } from "@/lib/clientUserId";

interface MoodDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export function MoodDrawer({ isOpen, onClose }: MoodDrawerProps) {
    const [userId] = useState<string>(() => getOrCreateClientUserId());

    // We can use a simple state to force re-renders if needed, but UnifiedCheckIn manages its own state well.
    // The key here is consistency.

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="fixed top-2 bottom-2 right-2 w-full max-w-lg rounded-[2rem] overflow-hidden shadow-2xl z-50 transition-all animate-in slide-in-from-right duration-300 flex flex-col bg-neutral-900 border border-white/10">

                {/* Background Ambience */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute -top-[10%] -right-[10%] w-[70%] h-[40%] bg-purple-900/20 rounded-full blur-[80px] animate-pulse" />
                    <div className="absolute bottom-[10%] -left-[10%] w-[60%] h-[50%] bg-blue-900/10 rounded-full blur-[80px] animate-pulse delay-500" />
                </div>

                {/* Header */}
                <div className="relative z-10 flex items-center justify-between p-6 border-b border-white/5 bg-black/10 backdrop-blur-md">
                    <div>
                        <h2 className="text-xl font-light text-white tracking-tight">Daily Check-in</h2>
                        <p className="text-xs text-neutral-400">Capture your moment.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/10 transition-colors text-neutral-400 hover:text-white"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="relative z-10 flex-1 p-8 flex flex-col justify-center">
                    <UnifiedCheckIn userId={userId} onSuccess={onClose} />
                </div>

                {/* Footer Hint */}
                <div className="relative z-10 p-4 text-center border-t border-white/5 bg-black/20">
                    <p className="text-[10px] text-neutral-600 uppercase tracking-widest">
                        Your data is private & helping the campus vibe.
                    </p>
                </div>
            </div>
        </>
    );
}
