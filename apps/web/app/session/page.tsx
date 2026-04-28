import { PageHeader } from "../../components/ui/page-header";
import { RealtimeVoiceCoach } from "../../components/session/realtime-voice-coach";
import { VoiceRecorder } from "../../components/session/voice-recorder";

export default function DailySessionPage() {
  return (
    <>
      <PageHeader
        kicker="Daily session"
        title="Focused speaking rep"
        subtitle="Simple flow: pick mode, record one response, transcribe, review one priority fix, and retry once."
      />

      <section className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
        <p className="font-medium text-slate-900">Session checklist</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>Start live coach (or skip to recorder)</li>
          <li>Record your answer</li>
          <li>Transcribe and generate feedback</li>
          <li>Apply one fix and run one retry</li>
        </ol>
      </section>

      <div className="grid gap-4">
        <RealtimeVoiceCoach />
        <VoiceRecorder />
      </div>
    </>
  );
}
