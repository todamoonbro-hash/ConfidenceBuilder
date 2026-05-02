"use client";

import { useEffect, useRef, useState } from "react";

// Multi-stage vocal warmup walker. Steps the user through the SOVTE block (humming -> lip trills ->
// straw phonation -> sirens) one at a time, each on its own timer. Voice pedagogy says order
// matters; the user can pause but not skip ahead, so we don't undermine the protocol.

export type WarmupDrill = {
  id: string;
  title: string;
  instruction: string;
  examplePhrase?: string;
  durationSeconds?: number;
  targetFocus?: string;
};

type WarmupTimerProps = {
  drills: WarmupDrill[];
  onComplete: () => void;
  onSkip?: () => void;
};

export function WarmupTimer({ drills, onComplete, onSkip }: WarmupTimerProps) {
  const [drillIndex, setDrillIndex] = useState(0);
  const initialSeconds = drills[0]?.durationSeconds ?? 60;
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [running, setRunning] = useState(false);
  const completedRef = useRef(false);
  const intervalRef = useRef<number | null>(null);

  const drill = drills[drillIndex];
  const drillDuration = drill?.durationSeconds ?? 60;
  const drillProgress = drillDuration === 0 ? 1 : (drillDuration - secondsLeft) / drillDuration;

  useEffect(() => {
    if (!running) return;
    intervalRef.current = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev > 1) return prev - 1;
        setDrillIndex((idx) => {
          const nextIdx = idx + 1;
          if (nextIdx >= drills.length) {
            if (!completedRef.current) {
              completedRef.current = true;
              window.setTimeout(() => onComplete(), 0);
            }
            return idx;
          }
          setSecondsLeft(drills[nextIdx].durationSeconds ?? 60);
          return nextIdx;
        });
        return 0;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [running, drills, onComplete]);

  useEffect(() => {
    if (completedRef.current && intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
      setRunning(false);
    }
  }, [drillIndex, secondsLeft]);

  if (!drill) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
      <div>
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
          <span>Vocal warmup ({drillIndex + 1} of {drills.length})</span>
          <span>{secondsLeft}s</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full bg-brand-600 transition-all duration-300" style={{ width: `${drillProgress * 100}%` }} />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-900">{drill.title}</h3>
        {drill.targetFocus ? (
          <p className="mt-1 text-xs uppercase tracking-wider text-brand-600">{drill.targetFocus}</p>
        ) : null}
        <p className="mt-3 text-sm text-slate-700">{drill.instruction}</p>
        {drill.examplePhrase ? (
          <p className="mt-3 rounded-lg bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800">
            {drill.examplePhrase}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        {!running && !completedRef.current ? (
          <button
            type="button"
            onClick={() => setRunning(true)}
            className="flex-1 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 min-h-12"
          >
            {drillIndex === 0 ? "Start warmup" : "Continue"}
          </button>
        ) : null}
        {running && !completedRef.current ? (
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
            className="rounded-lg px-5 py-3 text-sm font-medium text-slate-600 hover:underline min-h-12"
          >
            Skip warmups
          </button>
        ) : null}
      </div>

      <p className="text-xs text-slate-500">
        Order matters — humming first, then lip trills, then straw, then sirens. Skipping ahead reduces the benefit.
      </p>
    </div>
  );
}
