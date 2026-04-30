import { PageHeader } from "../../components/ui/page-header";
import { RealtimeVoiceCoach } from "../../components/session/realtime-voice-coach";
import { VoiceRecorder } from "../../components/session/voice-recorder";

const STEPS = [
  { label: "Warm up", state: "current" as const },
  { label: "Record", state: "next" as const },
  { label: "Feedback", state: "next" as const },
  { label: "Retry", state: "next" as const },
];

export default function DailySessionPage() {
  return (
    <>
      <PageHeader
        kicker="Daily session"
        title="Focused speaking rep"
        subtitle="One honest attempt, real feedback, one fix, retry. That's it."
      />

      <ol className="mb-6 flex flex-wrap items-center gap-2 text-xs font-medium" aria-label="Session steps">
        {STEPS.map((step, idx) => (
          <li key={step.label} className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 ${
                step.state === "current"
                  ? "bg-brand-600 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${step.state === "current" ? "bg-white/20" : "bg-white"}`}>
                {idx + 1}
              </span>
              {step.label}
            </span>
            {idx < STEPS.length - 1 ? <span className="text-slate-300" aria-hidden>→</span> : null}
          </li>
        ))}
      </ol>

      <details className="mb-5 group rounded-lg border border-slate-200 bg-white">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-sm font-semibold text-slate-900 [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700">1</span>
            Warm up with the live coach
            <span className="text-xs font-normal text-slate-500">(optional)</span>
          </span>
          <span className="text-xs font-medium text-slate-500 transition-transform group-open:rotate-180" aria-hidden>▾</span>
        </summary>
        <div className="border-t border-slate-100 p-5">
          <RealtimeVoiceCoach />
        </div>
      </details>

      <VoiceRecorder />
    </>
  );
}
