"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/components/NotificationProvider";
import { getOrCreateClientUserId } from "@/lib/clientUserId";
import {
  PHQ9_QUESTIONS, GAD7_QUESTIONS, PSS_QUESTIONS, UCLA_QUESTIONS, PSWQ_QUESTIONS,
  AssessmentType
} from "@/lib/assessmentConfig";
import UnifiedCheckIn from "@/components/assessment/UnifiedCheckIn";

export default function AssessmentPage() {
  const router = useRouter();
  const { notify } = useNotifications();
  const [showTools, setShowTools] = useState(false);
  const [userId, setUserId] = useState<string>("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Tool State
  const [assessmentType, setAssessmentType] = useState<AssessmentType>("PHQ9");
  const [answers, setAnswers] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Date state for hydration fix
  const [dateString, setDateString] = useState("");

  useEffect(() => {
    setUserId(getOrCreateClientUserId());
    setDateString(new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }));
  }, []);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const loadQuestions = () => {
    switch (assessmentType) {
      case "PHQ9": return PHQ9_QUESTIONS;
      case "GAD7": return GAD7_QUESTIONS;
      case "PSS": return PSS_QUESTIONS;
      case "UCLA": return UCLA_QUESTIONS;
      case "PSWQ": return PSWQ_QUESTIONS;
      default: return PHQ9_QUESTIONS;
    }
  };

  const questions = loadQuestions();

  const getToolTitle = (type: AssessmentType) => {
    switch (type) {
      case "PHQ9": return "PHQ-9 Depression";
      case "GAD7": return "GAD-7 Anxiety";
      case "PSS": return "Perceived Stress";
      case "UCLA": return "Loneliness Scale";
      case "PSWQ": return "Worry & Overthinking";
    }
  };

  function setAnswer(index: number, value: number) {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  async function internalSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      // Normalized answers: fill gaps with 0
      const normalizedAnswers = questions.map((_, index) => answers[index] ?? 0);

      const res = await fetch("/api/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, assessmentType, answers: normalizedAnswers }),
      });
      if (!res.ok) throw new Error("Submission failed");
      const data = await res.json();
      notify("success", `Completed. Result: ${data.severity}`);
      router.push(`/result?score=${data.totalScore}&type=${assessmentType}&severity=${data.severity}`);
    } catch (err) {
      console.error(err);
      notify("error", "Failed to submit assessment.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const openTool = (type: AssessmentType) => {
    setAssessmentType(type);
    setAnswers([]);
    setShowTools(true);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden font-heading">
      {/* EXECUTIVE VIGNETTE */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-vignette-light dark:bg-vignette-dark" />

      {/* Background Ambience - Sapphire */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/5 dark:bg-blue-900/10 rounded-full blur-[120px] animate-pulse" />
      </div>

      <div className="relative z-10 p-6 lg:p-12 max-w-7xl mx-auto min-h-screen">

        {/* HEADER */}
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground font-heading">
              Daily Check-in
            </h1>
            <p className="text-lg text-muted-foreground font-medium mt-2">
              Locate yourself in the moment.
            </p>
          </div>
          <div className="px-4 py-2 bg-primary/10 rounded-lg border border-primary/20 text-primary font-bold text-sm uppercase tracking-widest">
            {dateString}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* MAIN STAGE (70%) - Daily Pulse */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            <section className="bg-surface-card border border-border rounded-[2rem] p-8 lg:p-10 shadow-xl hover:shadow-2xl hover:border-primary/30 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] group-hover:bg-primary/10 transition-all" />

              <div className="relative z-10 mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-1 font-heading">How are you feeling?</h2>
                <p className="text-muted-foreground text-sm">Capture your current state regarding Mood, Anxiety, and Sleep.</p>
              </div>
              {/* Unified Check-in Component */}
              <div className="bg-surface-hover/50 rounded-2xl p-2 border border-border/50">
                <UnifiedCheckIn userId={userId} onSuccess={handleRefresh} />
              </div>
            </section>

            {/* Quick Journal Entry */}
            <section
              onClick={() => router.push('/journal')}
              className="bg-surface-card border border-border rounded-[2rem] p-8 lg:p-10 shadow-lg hover:shadow-xl hover:border-amber-500/30 transition-all duration-300 cursor-pointer group flex items-center justify-between"
            >
              <div className="flex items-center gap-6">
                <div className="h-16 w-16 rounded-2xl bg-amber-100 dark:bg-amber-900/20 text-amber-600 flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform">
                  📓
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-1 font-heading">Quick Journal</h2>
                  <p className="text-muted-foreground text-sm">Process your thoughts in private.</p>
                </div>
              </div>
              <div className="h-12 w-12 rounded-full border border-border flex items-center justify-center text-muted-foreground group-hover:bg-amber-500 group-hover:text-white group-hover:border-amber-500 transition-all">
                →
              </div>
            </section>
          </div>

          {/* SIDEBAR (30%) - Clinical Toolkit */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-surface-card/60 backdrop-blur-sm border border-border rounded-[2rem] p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl">
                  📐
                </div>
                <h3 className="text-lg font-bold text-foreground font-heading">Clinical Toolkit</h3>
              </div>

              <div className="space-y-3">
                <ToolkitButton
                  title="Depression (PHQ-9)"
                  desc="Standard screening tool"
                  onClick={() => openTool("PHQ9")}
                  highlight
                />
                <ToolkitButton
                  title="Anxiety (GAD-7)"
                  desc="Generalized anxiety scale"
                  onClick={() => openTool("GAD7")}
                />
                <ToolkitButton
                  title="Stress (PSS-10)"
                  desc="Perceived stress scale"
                  onClick={() => openTool("PSS")}
                />
                <ToolkitButton
                  title="Loneliness (UCLA)"
                  desc="Social isolation measure"
                  onClick={() => openTool("UCLA")}
                />
                <ToolkitButton
                  title="Worry (PSWQ)"
                  desc="Worry & Overthinking scale"
                  onClick={() => openTool("PSWQ")}
                />
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary to-indigo-600 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-lg">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
              <h3 className="text-xl font-bold mb-2 relative z-10">Need Guidance?</h3>
              <p className="text-indigo-100 text-sm mb-6 relative z-10 leading-relaxed">
                Not sure where to start? Check our curated resources.
              </p>
              <button
                onClick={() => router.push('/resources')}
                className="w-full py-3 bg-white text-primary font-bold rounded-xl shadow-lg relative z-10 hover:bg-indigo-50 transition-colors"
              >
                View Library
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* MODAL: Standard Tools View */}
      {showTools && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-surface-card border border-border rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 lg:p-12 shadow-2xl relative">
            <button
              onClick={() => setShowTools(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-surface-hover text-muted-foreground hover:text-foreground transition-colors"
            >
              ✕
            </button>

            <header className="mb-8 border-b border-border pb-6">
              <span className="text-xs font-bold uppercase tracking-widest text-primary">Standard Tool</span>
              <h2 className="text-3xl font-bold text-foreground mt-2 font-heading">{getToolTitle(assessmentType)}</h2>
            </header>

            <form onSubmit={internalSubmit} className="space-y-8">
              {questions.map((q, idx) => (
                <div key={idx} className="space-y-4 pb-6 border-b border-border/50">
                  <p className="text-lg text-foreground font-medium leading-relaxed">{idx + 1}. {q.text}</p>

                  {/* Rating Scale */}
                  <div className="grid grid-cols-5 gap-2">
                    {[0, 1, 2, 3, 4].map((val) => {
                      const maxVal = (assessmentType === "PSS" || assessmentType === "PSWQ") ? 4 : 3;
                      if (val > maxVal) return null;

                      return (
                        <label key={val} className={`cursor-pointer border py-3 text-center rounded-lg transition-all hover:bg-surface-hover ${answers[idx] === val ? "bg-primary text-primary-foreground border-primary font-bold shadow-md transform scale-105" : "border-border text-muted-foreground"}`}>
                          <input type="radio" value={val} checked={answers[idx] === val} onChange={() => setAnswer(idx, val)} className="hidden" />
                          <span className="text-sm">{val}</span>
                        </label>
                      );
                    })}
                  </div>
                  <div className="flex justify-between px-1">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Not at all</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Often</span>
                  </div>
                </div>
              ))}
              <div className="pt-4">
                <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-primary text-primary-foreground font-bold text-lg rounded-xl hover:shadow-lg hover:shadow-primary/20 hover:scale-[1.01] transition-all">
                  {isSubmitting ? "Calculating..." : "Show Result"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-component for clean code
function ToolkitButton({ title, desc, onClick, highlight = false }: { title: string, desc: string, onClick: () => void, highlight?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border transition-all duration-200 group flex items-center justify-between
                ${highlight
          ? 'bg-primary/5 border-primary/20 hover:bg-primary/10'
          : 'bg-surface-hover/50 border-transparent hover:bg-surface-hover hover:border-border'
        }`}
    >
      <div>
        <span className={`block text-sm font-bold ${highlight ? 'text-primary' : 'text-foreground'}`}>
          {title}
        </span>
        <span className="text-xs text-muted-foreground">
          {desc}
        </span>
      </div>
      <span className={`text-xs font-bold ${highlight ? 'text-primary' : 'text-muted-foreground'} opacity-0 group-hover:opacity-100 transition-opacity`}>
        START
      </span>
    </button>
  )
}
