import { PageHeader } from "../../components/ui/page-header";
import { RealtimeVoiceCoach } from "../../components/session/realtime-voice-coach";
import { VoiceRecorder } from "../../components/session/voice-recorder";

export default function DailySessionPage() {
  return (
    <>
      <PageHeader
        kicker="Daily session"
        title="Focused speaking rep"
        subtitle="Simple: Pick a drill, record one honest response, review real feedback, and retry once. Growth happens through repetition."
      />

      {/* Session flow guide */}
      <section className="mb-6 rounded-lg border border-slate-200 p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="flex gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">1</div>
            <div>
              <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Warm up</p>
              <p className="mt-1 text-sm text-slate-600">Start with live coach or skip to recorder</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">2</div>
            <div>
              <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Record</p>
              <p className="mt-1 text-sm text-slate-600">One real attempt at the prompt</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">3</div>
            <div>
              <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Get feedback</p>
              <p className="mt-1 text-sm text-slate-600">AI analysis + one priority fix</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">4</div>
            <div>
              <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Retry</p>
              <p className="mt-1 text-sm text-slate-600">Apply the fix and do it again</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-5">
        <div>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Live Coach (optional warm-up)</h2>
          <RealtimeVoiceCoach />
        </div>

        <div>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Record Your Response</h2>
          <VoiceRecorder />
        </div>
      </div>
    </>
  );
}
