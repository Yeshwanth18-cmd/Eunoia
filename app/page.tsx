"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="relative space-y-20 pb-20 min-h-screen">

      {/* VIGNETTE & BACKGROUND LAYERS */}
      {/* Light Mode: Subtle Cool Grey Vignette | Dark Mode: Deep Heavy Vignette */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-vignette-light dark:bg-vignette-dark" />

      {/* Hero Section */}
      <section className="relative py-12 px-6 md:px-10 overflow-hidden rounded-[2rem] border border-black/5 dark:border-white/5 shadow-2xl text-center transition-all duration-500 group max-w-5xl mx-auto bg-surface-card/60 backdrop-blur-md mt-4">

        {/* Animated Background - EXECUTIVE SAPPHIRE */}
        <div className="absolute inset-0 z-0 bg-background transition-colors duration-500" />
        {/* Subtle, Deep Gradient */}
        <div className="absolute inset-0 z-0 opacity-100 dark:opacity-100 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/50 via-background to-background dark:from-indigo-950/60 dark:via-background dark:to-background pointer-events-none" />

        {/* CONTRAST LAYERS: Sapphire + Gold (Jewel Tones) */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/10 dark:bg-indigo-500/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute top-20 right-20 w-80 h-80 bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-[80px] animate-float" />

        <div className="relative z-10 space-y-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-hover border border-border text-[11px] font-bold text-foreground/70 uppercase tracking-widest backdrop-blur-md shadow-sm">
            ⭐ Professional Student Support
          </div>

          <div className="space-y-2">
            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-foreground leading-[1.1] font-heading drop-shadow-lg">
              Find Your <br />
              {/* JEWEL TONE GRADIENT */}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-700 to-amber-600 dark:from-indigo-400 dark:via-violet-400 dark:to-amber-400">
                Balance.
              </span>
            </h1>

            <h2 className="text-2xl md:text-3xl font-bold text-muted-foreground/80 tracking-tight max-w-3xl mx-auto pt-4 pb-2">
              Privacy-powered <span className="text-foreground">mentor haven</span> for students.
            </h2>
          </div>

          <div className="flex flex-wrap justify-center gap-4 pt-4 pb-2">
            <Link
              href="/assessment"
              className="group relative inline-flex items-center justify-center rounded-xl bg-primary text-primary-foreground px-8 py-3.5 text-lg font-bold transition-all duration-300 hover:scale-[1.02] hover:shadow-lg shadow-indigo-500/20"
            >
              Start Check-in
            </Link>
            <Link
              href="/resources"
              className="group inline-flex items-center justify-center rounded-xl bg-surface-card border border-border px-8 py-3.5 text-lg font-bold text-foreground transition-all duration-300 hover:border-primary hover:bg-surface-hover hover:shadow-md"
            >
              Explore Resources
            </Link>
          </div>

          <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60 pt-4">
            Secure • Professional • Confidential
          </p>
        </div>
      </section>

      {/* Feature Grid - EXECUTIVE CARDS */}
      <section className="relative z-10 grid gap-6 md:grid-cols-3 px-4 max-w-7xl mx-auto">
        {/* Card 1 */}
        <div className="group relative rounded-[1.5rem] border border-border bg-surface-card p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl overflow-hidden hover:border-indigo-500/50">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-[40px] group-hover:bg-indigo-500/10 transition-all" />
          <div className="relative z-10 space-y-6">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-2xl font-heading shadow-sm border border-indigo-100 dark:border-indigo-800">
              ✨
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground mb-2 font-heading">Clarity</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Evidence-based tools specifically designed for student mental health.
              </p>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="group relative rounded-[1.5rem] border border-border bg-surface-card p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl overflow-hidden hover:border-teal-500/50">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-[40px] group-hover:bg-teal-500/10 transition-all" />
          <div className="relative z-10 space-y-6">
            <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 flex items-center justify-center text-2xl font-heading shadow-sm border border-teal-100 dark:border-teal-800">
              🔒
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground mb-2 font-heading">Security</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Local-first architecture ensures your data never leaves your device without consent.
              </p>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="group relative rounded-[1.5rem] border border-border bg-surface-card p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl overflow-hidden hover:border-amber-500/50">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-[40px] group-hover:bg-amber-500/10 transition-all" />
          <div className="relative z-10 space-y-6">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 flex items-center justify-center text-2xl font-heading shadow-sm border border-amber-100 dark:border-amber-800">
              💪
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground mb-2 font-heading">Strength</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Direct access to university counseling and crisis management resources.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Note */}
      <div className="relative z-10 py-12 border-t border-border/50 text-center">
        <p className="text-xs font-bold text-muted-foreground opacity-60 uppercase tracking-widest">
          Professional Standard Care
        </p>
      </div>
    </div>
  );
}
