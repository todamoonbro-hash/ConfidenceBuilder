"use client";

import { useEffect, useRef, useState } from "react";

// Animated breath-coach component. Walks the user through a single breathing protocol's steps,
// expanding/contracting a circle to the rhythm and announcing each phase. When all steps complete
// it calls onComplete() so the parent flow can advance.

export type BreathingStep = {
  label: string;
  seconds: number;
  cue?: string;
};

export type BreathingProtocol = {
  id: string;
  title: string;
  source: string;
  durationSeconds: number;
  intensity: "reset" | "calm" | "energize";
  whenToUse: string;
  steps: BreathingStep[];
  evidenceNote: string;
};

type BreathingTimerProps = {
  protocol: BreathingProtocol;
  onComplete: () => void;
  onSkip?: () => void;
};

type Phase = "inhale" | "hold" | "exhale" | "rest" | "neutral";

function classifyPhase(label: string): Phase {
  const lower = label.toLowerCase();
  if (lower.includes("inhale") || lower.includes("breathe in") || lower.includes("breathe-in") || lower.includes("sip")) return "inhale";
  if (lower.includes("hold")) return "hold";
  if (lower.includes("exhale") || lower.includes("breathe out") || lower.includes("sigh") || lower.includes("release")) return "exhale";
  if (lower.includes("rest") || lower.includes("pause")) return "rest";
  return "neutral";
}

const PHASE_COLORS: Record<Phase, string> = {
  inhale: "from-sky-400 to-sky-600",
  hold: "from-amber-400 to-amber-600",
  exhale: "from-emerald-400 to-emerald-600",
  rest: "from-slate-400 to-slate-600",
  neutral: "from-brand-400 to-brand-600"
};

const PHASE_LABELS: Record<Phase, string> = {
  inhale: "Inhale",
  hold: "Hold",
  exhale: "Exhale",
  rest: "Rest",
  neutral: "Breathe"
};

export function BreathingTimer({ protocol, onComplete, onSkip }: BreathingTimerProps) {
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [secondsLeft, setSecondsLeft] = useState<number>(protocol.steps[0]?.seconds ?? 0);
  const [running, setRunning] = useState<boolean>(false);
  const [completed, setCompleted] = useState<boolean>(false);

  // Refs let the interval read current values without depending on stale closure scope.
  const intervalRef = useRef<number | null>(null);
  const stepIndexRef = useRef<number>(0);
  const secondsLeftRef = useRef<number>(protocol.steps[0]?.seconds ?? 0);
  const completedRef = useRef<boolean>(false);

  const step = protocol.steps[stepIndex];
  const phase = step ? classifyPhase(step.label) : "neutral";
  const stepTotal = step?.seconds ?? 1;
  const stepProgress = stepTotal === 0 ? 1 : (stepTotal - secondsLeft) / stepTotal;
  const totalElapsed = protocol.steps.slice(0, stepIndex).reduce((acc, s) => acc + s.seconds, 0) + (stepTotal - secondsLeft);
  const totalProgress = protocol.durationSeconds === 0 ? 1 : Math.min(1, totalElapsed / protocol.durationSeconds);

  useEffect(() => {
    if (!running || completed) return;
    intervalRef.current = window.setInterval(() => {
      const nextSeconds = secondsLeftRef.current - 1;
      if (nextSeconds > 0) {
        secondsLeftRef.current = nextSeconds;
        setSecondsLeft(nextSeconds);
        return;
      }
      const nextIdx = stepIndexRef.current + 1;
      if (nextIdx >= protocol.steps.length) {
        if (!completedRef.current) {
          completedRef.current = true;
          setCompleted(true);
          window.setTimeout(() => onComplete(), 0);
        }
        return;
      }
      stepIndexRef.current = nextIdx;
      const nextStepSeconds = protocol.steps[nextIdx].seconds;
      secondsLeftRef.current = nextStepSeconds;
      setStepIndex(nextIdx);
      setSecondsLeft(nextStepSeconds);
    }, 1000);
    return () => {
      if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
    };
  }, [running, completed, protocol.steps, onComplete]);

  useEffect(() => {
    if (completed && intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
      setRunning(false);
    }
  }, [completed]);

  let scale = 0.8;
  if (phase === "inhale") scale = 0.6 + 0.4 * stepProgress;
  else if (phase === "exhale") scale = 1.0 - 0.4 * stepProgress;
  else if (phase === "hold") scale = 1.0;
  else if (phase === "rest") scale = 0.6;

  return (
    <div className="flex flex-col items-center gap-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
      <div className="w-full">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
          <span>{protocol.title}</span>
          <span>{Math.max(0, Math.ceil(protocol.durationSeconds - totalElapsed))}s left</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full bg-brand-600 transition-all duration-300" style={{ width: `${totalProgress * 100}%` }} />
        </div>
      </div>

      <div className="relative flex h-64 w-64 items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-slate-100" />
        <div
          aria-hidden
          className={`absolute inset-0 rounded-full bg-gradient-to-br ${PHASE_COLORS[phase]} opacity-30 transition-transform duration-1000 ease-in-out`}
          style={{ transform: `scale(${scale})` }}
        />
        <div
          aria-hidden
          className={`absolute inset-2 rounded-full bg-gradient-to-br ${PHASE_COLORS[phase]} opacity-90 transition-transform duration-1000 ease-in-out`}
          style={{ transform: `scale(${scale})` }}
        />
        <div className="relative z-10 text-center text-white">
          <div className="text-3xl font-semibold">{PHASE_LABELS[phase]}</div>
          <div className="mt-1 text-lg tabular-nums">{secondsLeft}s</div>
        </div>
      </div>

      <div className="w-full text-center">
        <p className="text-sm font-medium text-slate-900" role="status" aria-live="polite">
          {step?.label ?? "Ready."}
        </p>
        {step?.cue ? <p className="mt-1 text-xs text-slate-500">{step.cue}</p> : null}
        <p className="mt-3 text-xs text-slate-400">{protocol.evidenceNote}</p>
      </div>

      <div className="flex w-full flex-col gap-2 sm:flex-row">
        {!running && !completed ? (
          <button
            type="button"
            onClick={() => setRunning(true)}
            className="flex-1 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 min-h-12"
          >
            Start breathing
          </button>
        ) : null}
        {running && !completed ? (
          <button
            type="button"
            onClick={() => setRunning(false)}
            className="flex-1 rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 min-h-12"
          >
            Pause
          </button>
        ) : null}
        {onSkip ? (
          <button
            type="button"
            onClick={onSkip}
            className="rounded-lg px-5 py-3 text-sm font-medium text-slate-600 underline-offset-2 hover:underline min-h-12"
          >
            Skip
          </button>
        ) : null}
      </div>
    </div>
  );
}
