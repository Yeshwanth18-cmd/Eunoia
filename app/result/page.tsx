"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { type AssessmentType } from '@/lib/assessmentConfig';
import { getOrCreateClientUserId } from "@/lib/clientUserId";
import { useState, useEffect, Suspense } from 'react';
import HistoryLog from "@/components/assessment/HistoryLog";

function getRecommendations(type: AssessmentType, severity: string): string[] {
    const s = severity.toLowerCase();

    if (type === "PHQ9") {
        if (s.includes("minimal")) {
            return [
                "Your score suggests minimal depressive symptoms.",
                "Keep using tools like the mood log and self-care habits to maintain your well-being.",
            ];
        }
        if (s.includes("mild") || s.includes("moderate")) {
            return [
                "Your score suggests mild to moderate depressive symptoms.",
                "Consider talking to a trusted friend or mentor about how you’ve been feeling.",
                "If these feelings persist or worsen, consider booking a counseling session.",
            ];
        }
        return [
            "Your score suggests more significant depressive symptoms.",
            "It may be helpful to speak with a mental health professional or campus counselor soon.",
            "If you ever feel at risk of harming yourself, please contact emergency services or a local helpline immediately.",
        ];
    }

    // GAD-7 cases
    if (s.includes("minimal")) {
        return [
            "Your score suggests minimal anxiety symptoms.",
            "Continue using healthy coping strategies like sleep, movement, and breaks.",
        ];
    }
    if (s.includes("mild") || s.includes("moderate")) {
        return [
            "Your score suggests mild to moderate anxiety symptoms.",
            "Notice when worries feel overwhelming and experiment with grounding or breathing exercises.",
            "Talking with a counselor or mentor can also help you manage stress more effectively.",
        ];
    }

    return [
        "Your score suggests more significant anxiety symptoms.",
        "It may be helpful to speak with a mental health professional or campus counselor soon.",
        "If anxiety is interfering with your daily life or sleep, please seek support rather than handling it alone.",
    ];
}

function getMessage(severity: string | null) {
    if (!severity) return null;

    const text = severity.toLowerCase();

    if (text.includes('minimal')) {
        return {
            heading: 'You seem to be doing okay overall.',
            body: 'Your responses suggest minimal depressive symptoms. Keep maintaining the routines that support you — healthy sleep, movement, and staying connected to people you trust.',
        };
    }
    if (text.includes('mild')) {
        return {
            heading: 'You may be going through a mildly stressful phase.',
            body: 'Mild symptoms can often be managed with self-care: regular sleep, breaks from screens, light exercise, and talking openly with someone you trust about how you feel.',
        };
    }
    if (text.includes('moderately severe')) {
        return {
            heading: 'It looks like you might be struggling quite a bit.',
            body: 'Your responses suggest a higher level of distress. It would be a good idea to speak to a counselor or mental health professional and not carry this alone.',
        };
    }
    if (text.includes('moderate')) {
        return {
            heading: 'You may be experiencing noticeable distress.',
            body: 'Moderate symptoms can impact your day-to-day life. Consider reaching out to a counselor, mentor, or trusted person, and making space in your routine for rest and support.',
        };
    }
    if (text.includes('severe')) {
        return {
            heading: 'You deserve support right now.',
            body: 'Your responses suggest significant distress. It is strongly recommended to talk to a mental health professional as soon as possible. If you have thoughts of self-harm or feel unsafe, please seek urgent help immediately.',
        };
    }

    return null;
}

function ResultContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const scoreParam = searchParams.get('score');
    const severityParam = searchParams.get('severity');
    const type = searchParams.get('type');

    // Convert logic
    const score = scoreParam ? Number(scoreParam) : null;
    const severity = severityParam || null;
    const hasValidData = score !== null && !Number.isNaN(score) && !!severity;
    const message = getMessage(severity);
    const recs = hasValidData ? getRecommendations(type as AssessmentType || 'PHQ9', severity!) : [];

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [userId, setUserId] = useState<string>("");

    useEffect(() => {
        setUserId(getOrCreateClientUserId());
    }, []);

    return (
        <div className="min-h-screen bg-background text-foreground relative overflow-hidden py-10 px-6 font-heading">
            {/* EXECUTIVE VIGNETTE */}
            <div className="fixed inset-0 z-0 pointer-events-none bg-vignette-light dark:bg-vignette-dark" />

            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[20%] right-[0%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[100px] animate-pulse" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto grid lg:grid-cols-2 gap-12">

                {/* LEFT COL: LATEST RESULT */}
                <div className="space-y-8 animate-in slide-in-from-bottom-6">
                    <div>
                        <Link href="/assessment" className="text-sm font-bold text-muted-foreground hover:text-primary mb-4 block transition-colors">← Back to Assessment</Link>
                        <h1 className="text-4xl md:text-5xl font-black mb-2 text-foreground font-heading">Your Insights</h1>
                        <p className="text-muted-foreground text-lg">Analysis of your latest screening.</p>
                    </div>

                    {!hasValidData ? (
                        <div className="bg-surface-card border border-dashed border-border p-8 rounded-3xl">
                            <p className="mb-6 text-muted-foreground text-sm font-medium">
                                No recent clinical data found. Start a check-in.
                            </p>
                            <Link
                                href="/assessment"
                                className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-all hover:scale-[1.02] shadow-md"
                            >
                                Take Self-Assessment
                            </Link>
                        </div>
                    ) : (
                        <div className="bg-surface-card/80 backdrop-blur-xl border border-border p-8 lg:p-10 rounded-[2.5rem] shadow-2xl">
                            <div className="flex items-end justify-between mb-8 border-b border-border/50 pb-8">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Severity</p>
                                    <p className="text-2xl font-bold text-primary">{severity}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Score</p>
                                    <p className="text-6xl font-black text-foreground">{score}</p>
                                </div>
                            </div>

                            {message && (
                                <div className="mb-8 p-6 rounded-2xl bg-primary/5 border border-primary/10">
                                    <p className="font-bold text-primary mb-2 text-lg">{message.heading}</p>
                                    <p className="text-sm text-foreground/80 leading-relaxed max-w-lg">{message.body}</p>
                                </div>
                            )}

                            <div className="space-y-4">
                                <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Recommendations</h4>
                                <ul className="space-y-3">
                                    {recs.map((line, idx) => (
                                        <li key={idx} className="flex gap-3 text-sm text-foreground/90 font-medium">
                                            <span className="text-primary font-bold">→</span>
                                            {line}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="mt-8 pt-8 border-t border-border/50 flex gap-4">
                                <Link
                                    href="/booking"
                                    className="flex-1 py-3 bg-foreground text-background text-center font-bold rounded-xl hover:scale-[1.02] transition-transform shadow-lg"
                                >
                                    Book Counselor
                                </Link>
                                <button
                                    onClick={() => router.push('/assessment')}
                                    className="px-6 py-3 border border-border rounded-xl hover:bg-surface-hover transition-colors text-sm font-bold text-foreground"
                                >
                                    Retake
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT COL: HISTORY TIMELINE */}
                <div className="space-y-8 animate-in slide-in-from-bottom-8 delay-100">
                    <div>
                        <h2 className="text-3xl font-bold mb-2 text-foreground font-heading">Your Timeline</h2>
                        <p className="text-muted-foreground text-lg">A history of your Mirrors and Snapshots.</p>
                    </div>

                    <div className="bg-surface-card/60 border border-border rounded-[2.5rem] p-8 min-h-[500px] max-h-[800px] relative shadow-inner">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-surface-card/90 rounded-[2.5rem] pointer-events-none z-10" />
                        <div className="overflow-y-auto h-full pb-20 custom-scrollbar relative z-0">
                            {/* Note: HistoryLog might need internal styling updates, but the container is now set */}
                            <HistoryLog userId={userId} />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default function ResultPage() {
    return (
        <Suspense fallback={<div className="text-center py-20 text-muted-foreground animate-pulse">Loading result...</div>}>
            <ResultContent />
        </Suspense>
    );
}
