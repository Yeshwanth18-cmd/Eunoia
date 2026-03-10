"use client";

import { useEffect, useState } from "react";

type HistoryItem = {
    id: string;
    type: "EXPERIENTIAL" | "CAPACITY";
    date: string;       // Formatted date string
    timestamp: number;  // For sorting
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;          // The record content
};

export default function HistoryLog({ userId, refreshTrigger }: { userId: string, refreshTrigger?: number }) {
    const [items, setItems] = useState<HistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // In a real app, we might need a dedicated API to fetch combined history.
        // For this prototype, we'll fetch both endpoints client-side and merge.

        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Parallel fetch with query params
                const [expRes, capRes] = await Promise.all([
                    fetch(`/api/assessment/experiential?userId=${userId}`).then(r => r.json()),
                    fetch(`/api/assessment/capacity?userId=${userId}`).then(r => r.json())
                ]);

                const combined: HistoryItem[] = [];

                if (expRes.logs) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    expRes.logs.forEach((log: any) => {
                        combined.push({
                            id: log.id,
                            type: "EXPERIENTIAL",
                            date: new Date(log.createdAt).toLocaleDateString(),
                            timestamp: new Date(log.createdAt).getTime(),
                            data: log
                        });
                    });
                }

                if (capRes.logs) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    capRes.logs.forEach((log: any) => {
                        combined.push({
                            id: log.id,
                            type: "CAPACITY",
                            date: new Date(log.createdAt).toLocaleDateString(),
                            timestamp: new Date(log.createdAt).getTime(),
                            data: log
                        });
                    });
                }

                // Sort Descending
                combined.sort((a, b) => b.timestamp - a.timestamp);
                setItems(combined);

            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };

        if (userId) fetchData();
    }, [userId, refreshTrigger]);

    if (isLoading) return <div className="text-center text-neutral-500 py-10">Loading history...</div>;
    if (items.length === 0) return <div className="text-center text-neutral-500 py-10">No history yet. Start by witnessing yourself.</div>;

    return (
        <div className="space-y-6 animate-in fade-in max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {items.map(item => (
                <div key={item.id} className="relative pl-6 border-l border-white/10 pb-6 last:pb-0">
                    <div className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full bg-neutral-800 border border-white/20" />

                    <div className="text-[10px] text-neutral-500 font-mono mb-1">{item.date}</div>

                    {item.type === "EXPERIENTIAL" ? (
                        <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
                            <div className="flex flex-wrap gap-2 mb-2">
                                {item.data.tags.map((t: string) => (
                                    <span key={t} className="px-2 py-1 rounded-md bg-white/10 text-xs text-neutral-300">{t}</span>
                                ))}
                            </div>
                            {item.data.note && <p className="text-sm text-neutral-400 italic">&quot;{item.data.note}&quot;</p>}
                        </div>
                    ) : (
                        <div className="bg-white/5 border border-white/5 p-4 rounded-xl space-y-2">
                            <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Snapshot</h4>
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <div className="text-[10px] text-neutral-500 uppercase">Phys</div>
                                    <div className="text-lg font-light text-teal-200">{item.data.physical}/5</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-neutral-500 uppercase">Ment</div>
                                    <div className="text-lg font-light text-blue-200">{item.data.mental}/5</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-neutral-500 uppercase">Emot</div>
                                    <div className="text-lg font-light text-purple-200">{item.data.emotional}/5</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
