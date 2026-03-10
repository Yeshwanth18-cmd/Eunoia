"use client";

import { useEffect, useState } from "react";
import { getOrCreateClientUserId } from "@/lib/clientUserId";
import { useNotifications } from "@/components/NotificationProvider";

type Assessment = {
    id: string;
    createdAt: string;
    assessmentType: string;
    totalScore: number;
    severity: string;
};

type MoodLog = {
    id: string;
    createdAt: string;
    mood: number;
    note: string | null;
};

type Booking = {
    id: string;
    createdAt: string;
    studentName: string;
    studentEmail: string | null;
    reason: string | null;
    slot: string;
    status: string;
};

type HistoryResponse = {
    assessments: Assessment[];
    moods: MoodLog[];
    bookings: Booking[];
};

export default function HistoryPage() {
    const { notify } = useNotifications();
    const [userId, setUserId] = useState<string>("");
    const [data, setData] = useState<HistoryResponse | null>(null);

    useEffect(() => {
        setUserId(getOrCreateClientUserId());
    }, []);
    const [isLoading, setIsLoading] = useState(true);

    function formatDateTime(input: string) {
        const d = new Date(input);
        if (Number.isNaN(d.getTime())) return "—";
        return d.toLocaleString();
    }

    async function loadHistory() {
        try {
            setIsLoading(true);
            const res = await fetch(`/api/history?userId=${encodeURIComponent(userId)}`);
            if (!res.ok) {
                const body = await res.json().catch(() => null);
                notify("error", body?.error ?? "Failed to load history");
                return;
            }
            const body = (await res.json()) as HistoryResponse;
            setData(body);
        } catch (error) {
            console.error(error);
            notify("error", "Something went wrong while loading history");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (userId) {
            loadHistory();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    const assessments = data?.assessments ?? [];
    const moods = data?.moods ?? [];
    const bookings = data?.bookings ?? [];

    return (
        <div className="space-y-8">
            <section className="space-y-2">
                <h1 className="text-2xl font-semibold">Your history</h1>
                <p className="text-sm text-neutral-500 max-w-xl">
                    A quick overview of your recent assessments, mood logs, and booking requests from this device.
                </p>
            </section>

            <section className="flex items-center justify-between">
                <p className="text-[11px] text-neutral-500">
                    Anonymous ID: <span className="font-mono text-neutral-300">{userId}</span>
                </p>
                <button
                    type="button"
                    onClick={loadHistory}
                    className="rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-300 hover:border-neutral-500"
                >
                    Refresh
                </button>
            </section>

            {isLoading ? (
                <div className="flex justify-center py-10">
                    <p className="text-sm text-neutral-500 animate-pulse">Loading your history…</p>
                </div>
            ) : (
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Assessments */}
                    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-xl backdrop-blur-md flex flex-col max-h-[500px]">
                        <h2 className="text-lg font-medium text-neutral-100 mb-4 flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-purple-500" />
                            Assessments
                        </h2>
                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            {assessments.length === 0 ? (
                                <p className="text-xs text-neutral-500 italic">
                                    No assessments found yet from this device.
                                </p>
                            ) : (
                                <ul className="space-y-3">
                                    {assessments.map((a) => (
                                        <li key={a.id} className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-3 transition-colors hover:border-neutral-700">
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <span className="font-medium text-sm text-neutral-200">
                                                    {a.assessmentType === "PHQ9" ? "PHQ-9" : "GAD-7"}
                                                </span>
                                                <span className="text-[10px] text-neutral-500 font-medium uppercase tracking-wide">
                                                    {formatDateTime(a.createdAt)}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-neutral-400">Score: <span className="text-neutral-100 font-medium">{a.totalScore}</span></span>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide bg-neutral-800 text-neutral-300`}>
                                                    {a.severity}
                                                </span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* Mood logs */}
                    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-xl backdrop-blur-md flex flex-col max-h-[500px]">
                        <h2 className="text-lg font-medium text-neutral-100 mb-4 flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-blue-500" />
                            Mood logs
                        </h2>
                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            {moods.length === 0 ? (
                                <p className="text-xs text-neutral-500 italic">
                                    No mood entries yet. Try logging your mood on the Mood page.
                                </p>
                            ) : (
                                <ul className="space-y-3">
                                    {moods.map((m) => (
                                        <li key={m.id} className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-3 transition-colors hover:border-neutral-700">
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <span className="font-medium text-sm text-neutral-200">Mood: {m.mood}/5</span>
                                                <span className="text-[10px] text-neutral-500 font-medium uppercase tracking-wide">
                                                    {formatDateTime(m.createdAt)}
                                                </span>
                                            </div>
                                            {m.note && (
                                                <div className="mt-2 pt-2 border-t border-neutral-800/50 text-xs text-neutral-400 italic">
                                                    &ldquo;{m.note}&rdquo;
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* Bookings */}
                    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-xl backdrop-blur-md flex flex-col max-h-[500px]">
                        <h2 className="text-lg font-medium text-neutral-100 mb-4 flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            Bookings
                        </h2>
                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            {bookings.length === 0 ? (
                                <p className="text-xs text-neutral-500 italic">
                                    No booking requests recorded yet.
                                </p>
                            ) : (
                                <ul className="space-y-3">
                                    {bookings.map((b) => (
                                        <li key={b.id} className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-3 transition-colors hover:border-neutral-700">
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <span className="font-medium text-sm text-neutral-200 truncate max-w-[120px]">{b.studentName}</span>
                                                <span className="text-[10px] text-neutral-500 font-medium uppercase tracking-wide">
                                                    {formatDateTime(b.slot)}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs mb-2">
                                                <span className="text-neutral-400">Status</span>
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide bg-neutral-800 text-neutral-300">
                                                    {b.status}
                                                </span>
                                            </div>
                                            {b.reason && (
                                                <div className="pt-2 border-t border-neutral-800/50 text-xs text-neutral-400">
                                                    Reason: {b.reason}
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
