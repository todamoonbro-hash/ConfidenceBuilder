"use client";

import { useEffect, useMemo, useState } from "react";
import { BreathingTimer, type BreathingProtocol } from "./breathing-timer";
import { WarmupTimer, type WarmupDrill } from "./warmup-timer";
import { IdentityVote } from "./identity-vote";
import { VoiceRecorder } from "../session/voice-recorder";

// Orchestrates the evidence-based 17-minute daily session:
//   1) Cyclic sigh / breathing protocol  (~1.5 min)
//   2) Body release prompt                (~2 min, self-paced)
//   3) SOVTE block: humming -> lip trills -> straw -> sirens (~4 min)
//   4) Speaking rep with prompt           (~5 min, recorder + auto feedback)
//   5) Reflection note                    (~1 min)
//   6) Identity vote                      (~30s)
//
// Each step calls onComplete to advance. The user can pause within a step but the order is fixed —
// research is unanimous that body -> breath -> voice -> rep -> reflect must run in that order.

type Step = "breath" | "body" | "warmup" | "rep" | "reflect" | "identity" | "done";

type SessionPlanStep = {
  skill: string;
  reason: string;
  durationMinutes: number;
  reps: number;
  edgeOfCompetence: boolean;
};

type SessionPlan = {
  steps: SessionPlanStep[];
  durationMinutes: number;
  rationale: string;
  edgeFocus: string;
};

type DailySessionFlowProps = {
  userId: string;
  speakingIdentity: string;
  primaryGoal: string;
  upcomingEvent?: string | null;
  yesterdaysPriorityFix?: string | null;
  todaysPrompt: string;
  breathingProtocol: BreathingProtocol;
  warmupDrills: WarmupDrill[];
  sessionPlan: SessionPlan | null;
};

const STEP_ORDER: Step[] = ["breath", "body", "warmup", "rep", "reflect", "identity", "done"];

const STEP_LABELS: Record<Step, string> = {
  breath: "1. Breath reset",
  body: "2. Body release",
  warmup: "3. Vocal warmup",
  rep: "4. Speaking rep",
  reflect: "5. Reflect",
  identity: "6. Identity vote",
  done: "Done"
};

const BODY_RELEASE_INSTRUCTIONS: Array<{ label: string; cue: string; seconds: number }> = [
  { label: "Shoulder rolls", cue: "10 slow rolls back, then 10 forward", seconds: 30 },
  { label: "Jaw release", cue: "Massage your masseter (jaw hinge), drop the jaw, sigh 'aaah' x 5", seconds: 30 },
  { label: "Spine alignment", cue: "Stand tall, lengthen the back of the neck, drop shoulders", seconds: 20 },
  { label: "Neck release", cue: "Slow ear-to-shoulder both sides, breathe out as you tilt", seconds: 40 }
];

const REP_BEAT_INSTRUCTIONS = [
  "Take 1 — record at full pace, no notes.",
  "Take 2 — slow it 20%. Land your headline before any detail.",
  "Take 3 — same content, but speak as the calmer version of yourself."
];

export function DailySessionFlow({
  userId,
  speakingIdentity,
  primaryGoal,
  upcomingEvent,
  yesterdaysPriorityFix,
  todaysPrompt,
  breathingProtocol,
  warmupDrills,
  sessionPlan
}: DailySessionFlowProps) {
  const [step, setStep] = useState<Step>("breath");
  const [bodyStepIndex, setBodyStepIndex] = useState(0);
  const [bodySecondsLeft, setBodySecondsLeft] = useState(BODY_RELEASE_INSTRUCTIONS[0].seconds);
  const [bodyRunning, setBodyRunning] = useState(false);
  const [repTakeIndex, setRepTakeIndex] = useState(0);
  const [reflectionNote, setReflectionNote] = useState("");

  const currentStepIdx = STEP_ORDER.indexOf(step);

  const advance = () => {
    setStep((prev) => {
      const idx = STEP_ORDER.indexOf(prev);
      return STEP_ORDER[Math.min(STEP_ORDER.length - 1, idx + 1)] as Step;
    });
  };

  const skipTo = (target: Step) => setStep(target);

  // Body release simple ticker
  useEffect(() => {
    if (step !== "body" || !bodyRunning) return;
    const interval = window.setInterval(() => {
      setBodySecondsLeft((s) => {
        if (s > 1) return s - 1;
        setBodyStepIndex((idx) => {
          const nextIdx = idx + 1;
          if (nextIdx >= BODY_RELEASE_INSTRUCTIONS.length) {
            window.setTimeout(() => advance(), 0);
            return idx;
          }
          setBodySecondsLeft(BODY_RELEASE_INSTRUCTIONS[nextIdx].seconds);
          return nextIdx;
        });
        return 0;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [step, bodyRunning]);

  const edgeFocusLabel = sessionPlan?.edgeFocus ?? primaryGoal;

  return (
    <div className="grid gap-6">
      {/* Stepper */}
      <ol className="flex flex-wrap gap-2 text-xs font-medium">
        {STEP_ORDER.filter((s) => s !== "done").map((s, idx) => {
          const isActive = s === step;
          const isComplete = idx < currentStepIdx;
          return (
            <li
              key={s}
              className={`rounded-full px-3 py-1 ${
                isActive
                  ? "bg-brand-600 text-white"
                  : isComplete
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-slate-100 text-slate-600"
              }`}
            >
              {STEP_LABELS[s]}
            </li>
          );
        })}
      </ol>

      {yesterdaysPriorityFix && step === "breath" ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-800">From yesterday</p>
          <p className="mt-1 text-sm text-amber-900">
            <span className="font-semibold">Priority fix:</span> {yesterdaysPriorityFix}
          </p>
          <p className="mt-1 text-xs text-amber-800">Hold this in mind during today&apos;s rep.</p>
        </div>
      ) : null}

      {step === "breath" ? (
        <BreathingTimer
          protocol={breathingProtocol}
          onComplete={advance}
          onSkip={() => skipTo("body")}
        />
      ) : null}

      {step === "body" ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
            <span>
              Body release ({bodyStepIndex + 1} of {BODY_RELEASE_INSTRUCTIONS.length})
            </span>
            <span>{bodySecondsLeft}s</span>
          </div>
          <h3 className="mt-3 text-lg font-semibold text-slate-900">
            {BODY_RELEASE_INSTRUCTIONS[bodyStepIndex].label}
          </h3>
          <p className="mt-2 text-sm text-slate-700">{BODY_RELEASE_INSTRUCTIONS[bodyStepIndex].cue}</p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            {!bodyRunning ? (
              <button
                type="button"
                onClick={() => setBodyRunning(true)}
                className="flex-1 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 min-h-12"
              >
                Start body release
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setBodyRunning(false)}
                className="flex-1 rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 min-h-12"
              >
                Pause
              </button>
            )}
            <button
              type="button"
              onClick={() => skipTo("warmup")}
              className="rounded-lg px-5 py-3 text-sm font-medium text-slate-600 hover:underline min-h-12"
            >
              Skip body
            </button>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            The body gates the breath. 90 seconds here makes the warmup work.
          </p>
        </div>
      ) : null}

      {step === "warmup" ? (
        <WarmupTimer
          drills={warmupDrills}
          onComplete={advance}
          onSkip={() => skipTo("rep")}
        />
      ) : null}

      {step === "rep" ? (
        <div className="grid gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
              Edge of competence: <span className="text-slate-700">{edgeFocusLabel}</span>
            </p>
            <h3 className="mt-2 text-xl font-semibold text-slate-950">Today&apos;s prompt</h3>
            <p className="mt-2 rounded-lg bg-slate-50 px-4 py-3 text-base text-slate-800">{todaysPrompt}</p>
            {upcomingEvent ? (
              <p className="mt-3 text-xs text-slate-500">
                Imagine you&apos;re saying this in front of: <span className="font-medium text-slate-700">{upcomingEvent}</span>
              </p>
            ) : null}
            <p className="mt-3 text-sm font-medium text-slate-900">
              Rep {Math.min(repTakeIndex + 1, REP_BEAT_INSTRUCTIONS.length)} of {REP_BEAT_INSTRUCTIONS.length}
              {": "}
              {REP_BEAT_INSTRUCTIONS[Math.min(repTakeIndex, REP_BEAT_INSTRUCTIONS.length - 1)]}
            </p>
          </div>

          <VoiceRecorder
            userId={userId}
            skillBranch="confidence"
            initialExerciseId={`ex_today_${edgeFocusLabel}`}
            impromptuMode={false}
            autoChain
            hideDeveloperFields
          />

          <div className="flex flex-col gap-2 sm:flex-row">
            {repTakeIndex < REP_BEAT_INSTRUCTIONS.length - 1 ? (
              <button
                type="button"
                onClick={() => setRepTakeIndex((i) => i + 1)}
                className="flex-1 rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 min-h-12"
              >
                Next take
              </button>
            ) : null}
            <button
              type="button"
              onClick={advance}
              className="flex-1 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 min-h-12"
            >
              I&apos;m done — reflect
            </button>
          </div>
        </div>
      ) : null}

      {step === "reflect" ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">One specific note</p>
          <h3 className="mt-2 text-lg font-semibold text-slate-900">
            What&apos;s the one thing you noticed?
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            One specific observation, not a list. Self-1 (judging mind) overload kills performance.
          </p>
          <textarea
            value={reflectionNote}
            onChange={(event) => setReflectionNote(event.target.value)}
            rows={3}
            className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            placeholder="e.g. I rushed the headline. Tomorrow: pause before speaking."
          />
          <button
            type="button"
            onClick={advance}
            className="mt-4 w-full rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 min-h-12"
          >
            Continue
          </button>
        </div>
      ) : null}

      {step === "identity" ? (
        <IdentityVote
          speakingIdentity={speakingIdentity}
          identityReinforcement={`One more rep as ${speakingIdentity || "a calm, clear, direct speaker"}. Voted into existence by the work, not the words.`}
          onLogged={() => {
            advance();
          }}
        />
      ) : null}

      {step === "done" ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 sm:p-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">Session complete</p>
          <p className="mt-2 text-base text-emerald-900">
            Same time tomorrow. Distributed practice beats massed practice — see you in 24 hours.
          </p>
          <a
            href="/dashboard"
            className="mt-4 inline-block rounded-lg bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800 min-h-12"
          >
            See your progress
          </a>
        </div>
      ) : null}
    </div>
  );
}

export type { SessionPlan, SessionPlanStep };
