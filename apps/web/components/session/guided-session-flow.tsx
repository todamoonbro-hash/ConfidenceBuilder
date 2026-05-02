"use client";

import { useMemo, useState } from "react";
import { BreathingTimer, type BreathingProtocol } from "../today/breathing-timer";
import { WarmupTimer, type WarmupDrill } from "../today/warmup-timer";
import { RealtimeVoiceCoach } from "./realtime-voice-coach";
import { VoiceRecorder } from "./voice-recorder";

type GuidedSessionFlowProps = {
  breathingProtocol?: BreathingProtocol;
  warmups: WarmupDrill[];
};

const FALLBACK_PROTOCOL: BreathingProtocol = {
  id: "box_breath",
  title: "Box Breath",
  source: "built-in fallback",
  durationSeconds: 60,
  intensity: "calm",
  whenToUse: "Use before recording to lower rushed speech and settle attention.",
  evidenceNote: "Slow, even breathing helps prepare a steadier speaking rhythm.",
  steps: [
    { label: "Inhale through nose", seconds: 4, cue: "Smooth, quiet inhale." },
    { label: "Hold", seconds: 4, cue: "Keep shoulders soft." },
    { label: "Exhale", seconds: 4, cue: "Release jaw and throat." },
    { label: "Hold out", seconds: 4, cue: "Stay relaxed." },
    { label: "Repeat the cycle", seconds: 44, cue: "Keep the breath even." }
  ]
};

const FALLBACK_WARMUPS: WarmupDrill[] = [
  {
    id: "hum_reset",
    title: "Gentle Hum Reset",
    instruction: "Hum on a comfortable pitch with lips closed and jaw loose.",
    examplePhrase: "mmmm x 5 slow breaths",
    durationSeconds: 45,
    targetFocus: "resonance"
  },
  {
    id: "lip_trill",
    title: "Lip Trill",
    instruction: "Blow air through relaxed lips and let them vibrate. Keep the throat easy.",
    examplePhrase: "brrrr low to middle pitch",
    durationSeconds: 45,
    targetFocus: "warmup"
  }
];

export function GuidedSessionFlow({ breathingProtocol, warmups }: GuidedSessionFlowProps) {
  const [breathingDone, setBreathingDone] = useState(false);
  const [warmupDone, setWarmupDone] = useState(false);
  const [coachOpen, setCoachOpen] = useState(false);

  const protocol = breathingProtocol ?? FALLBACK_PROTOCOL;
  const warmupDrills = warmups.length > 0 ? warmups.slice(0, 4) : FALLBACK_WARMUPS;
  const prepDone = breathingDone && warmupDone;

  const steps = useMemo(
    () => [
      { label: "Breathe", state: breathingDone ? "done" : "current" },
      { label: "Warm voice", state: breathingDone ? (warmupDone ? "done" : "current") : "next" },
      { label: "Record", state: prepDone ? "current" : "next" },
      { label: "Correct transcript", state: "next" },
      { label: "Feedback + retry", state: "next" }
    ],
    [breathingDone, warmupDone, prepDone]
  );

  return (
    <div className="space-y-5">
      <ol className="flex flex-wrap items-center gap-2 text-xs font-medium" aria-label="Session steps">
        {steps.map((step, idx) => (
          <li key={step.label} className="flex items-center gap-2">
            <span
              className={`inline-flex min-h-8 items-center gap-2 rounded-full px-3 py-1 ${
                step.state === "done"
                  ? "bg-emerald-50 text-emerald-700"
                  : step.state === "current"
                    ? "bg-brand-600 text-white"
                    : "bg-slate-100 text-slate-600"
              }`}
            >
              <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${step.state === "current" ? "bg-white/20" : "bg-white"}`}>
                {step.state === "done" ? "ok" : idx + 1}
              </span>
              {step.label}
            </span>
            {idx < steps.length - 1 ? <span className="text-slate-300" aria-hidden="true">-&gt;</span> : null}
          </li>
        ))}
      </ol>

      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Coach contract</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-950">One behaviour change per session</h2>
          <p className="mt-1 text-sm text-slate-600">
            Prepare your nervous system, warm the voice, record one honest rep, correct the transcript, then apply one fix on the retry.
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <BreathingTimer
            protocol={protocol}
            onComplete={() => setBreathingDone(true)}
            onSkip={() => setBreathingDone(true)}
          />
          <WarmupTimer
            drills={warmupDrills}
            onComplete={() => setWarmupDone(true)}
            onSkip={() => setWarmupDone(true)}
          />
        </div>
      </section>

      <details className="group rounded-lg border border-slate-200 bg-white" open={coachOpen}>
        <summary
          onClick={() => setCoachOpen(!coachOpen)}
          className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-sm font-semibold text-slate-900 [&::-webkit-details-marker]:hidden"
        >
          <span>Optional live coach warmup</span>
          <span className="text-xs font-medium text-slate-500 transition-transform group-open:rotate-180" aria-hidden="true">v</span>
        </summary>
        <div className="border-t border-slate-100 p-5">
          <RealtimeVoiceCoach />
        </div>
      </details>

      <VoiceRecorder />
    </div>
  );
}
