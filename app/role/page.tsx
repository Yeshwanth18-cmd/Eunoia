"use client";

import { useRouter } from "next/navigation";

export default function RolePage() {
    const router = useRouter();

    const handleStudent = () => {
        router.push("/");
    };

    const handleAdmin = () => {
        router.push("/admin");
    };

    return (
        <div className="flex flex-col items-center justify-center py-20 gap-10">
            <div className="text-center space-y-3">
                <h1 className="text-4xl font-bold text-neutral-100">Choose your role</h1>
                <p className="text-base text-neutral-400 max-w-lg mx-auto leading-relaxed">
                    Eunoia supports both students and counselors/admins. Select how you want to use the app.
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 w-full max-w-3xl justify-center">
                <button
                    onClick={handleStudent}
                    className="flex-1 group relative rounded-2xl border border-neutral-800 bg-neutral-900/60 p-8 text-left transition-all duration-300 hover:border-neutral-700 hover:bg-neutral-900/80 hover:-translate-y-1 hover:shadow-xl backdrop-blur-sm"
                >
                    <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors">
                        <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <div className="font-semibold text-xl text-neutral-100 mb-2">Student</div>
                    <div className="text-sm text-neutral-400 leading-relaxed">
                        Take assessments, log mood, and access campus resources.
                    </div>
                </button>

                <button
                    onClick={handleAdmin}
                    className="flex-1 group relative rounded-2xl border border-purple-500/30 bg-purple-900/10 p-8 text-left transition-all duration-300 hover:border-purple-500/50 hover:bg-purple-900/20 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-900/10 backdrop-blur-sm"
                >
                    <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-6 group-hover:bg-purple-500/20 transition-colors">
                        <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <div className="font-semibold text-xl text-neutral-100 mb-2">Admin / Counselor</div>
                    <div className="text-sm text-neutral-400 leading-relaxed">
                        View severity overview, recent assessments, and bookings.
                    </div>
                </button>
            </div>
        </div>
    );
}
