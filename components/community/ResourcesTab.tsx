import Link from "next/link";

export default function ResourcesTab() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <header className="space-y-2 border-b border-white/5 pb-2">
                <h2 className="text-xl font-semibold text-white tracking-tight">Well-being Resources</h2>
                <p className="text-neutral-400 text-sm max-w-2xl">
                    Curated articles, guides, and emergency contacts.
                </p>
            </header>

            {/* Emergency Banner */}
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2">
                    <h3 className="text-lg font-bold text-red-200">In Crisis?</h3>
                    <p className="text-sm text-red-200/70">
                        Immediate help is available. You are not alone.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="px-5 py-2.5 rounded-lg bg-red-600 text-white font-bold text-sm hover:bg-red-500 transition-colors shadow-lg shadow-red-900/20">
                        Call 988
                    </button>
                    <button className="px-5 py-2.5 rounded-lg bg-transparent border border-red-500/30 text-red-300 font-medium text-sm hover:bg-red-950/50">
                        Campus Police
                    </button>
                </div>
            </div>

            {/* Resources Grid */}
            <div className="grid md:grid-cols-3 gap-6">
                {['Anxiety', 'Depression', 'Academic Stress', 'Sleep', 'Relationships', 'Mindfulness'].map((topic) => (
                    <div key={topic} className="group p-6 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all hover:border-white/10">
                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-xl mb-4 text-white/50 group-hover:text-white group-hover:bg-white/10 transition-colors">
                            📚
                        </div>
                        <h3 className="font-semibold text-white mb-2">{topic}</h3>
                        <p className="text-sm text-neutral-500 mb-4">
                            Guides and tools to help manage {topic.toLowerCase()}.
                        </p>
                        <Link href="#" className="text-xs font-bold text-white/40 group-hover:text-blue-300 transition-colors flex items-center gap-1">
                            Read Guides <span>→</span>
                        </Link>
                    </div>
                ))}
            </div>

            {/* Blog Section */}
            <div className="border-t border-white/5 pt-8">
                <h2 className="text-xl font-medium text-white mb-6">Latest Insights</h2>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex flex-col md:flex-row gap-6 p-4 rounded-xl hover:bg-white/[0.02] transition-colors group cursor-pointer">
                            <div className="w-full md:w-48 h-32 rounded-lg bg-neutral-900 border border-white/5 flex items-center justify-center text-xl group-hover:scale-[1.02] transition-transform">
                                ✍️
                            </div>
                            <div className="flex-grow space-y-2">
                                <div className="text-xs text-neutral-500 font-mono">Dec 12, 2025 • Wellness</div>
                                <h3 className="text-lg font-bold text-neutral-200 group-hover:text-white transition-colors">
                                    Understanding Burnout: Signs & Recovery
                                </h3>
                                <p className="text-sm text-neutral-500 max-w-2xl">
                                    Learn effective strategies to identify early signs of academic burnout and practical steps to regain your balance.
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
