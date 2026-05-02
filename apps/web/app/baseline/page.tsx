import { PageHeader } from "../../components/ui/page-header";
import { VoiceRecorder } from "../../components/session/voice-recorder";

const BASELINE_REPS = [
  {
    id: "free_speech",
    title: "1. Free speech sample",
    purpose: "Measures your natural clarity, pacing, structure, and confidence when nothing is scripted.",
    recorder: (
      <VoiceRecorder
        skillBranch="confidence"
        initialExerciseId="ex_baseline_free_speech"
        drillInstruction="Speak for 60 seconds about what you want to improve in your communication and where it currently breaks down."
        drillExamplePhrase="I want to become clearer under pressure because..."
        drillTargetFocus="baseline confidence, clarity, concision"
        drillDifficultyLevel="Baseline"
      />
    )
  },
  {
    id: "read_aloud",
    title: "2. Read-aloud sample",
    purpose: "Shows fluency, phrase chunking, articulation, and recovery when the words are fixed.",
    recorder: (
      <VoiceRecorder
        skillBranch="reading"
        initialExerciseId="ex_baseline_read_aloud"
        drillInstruction="Read this aloud: The clearest speakers do not rush to sound impressive. They slow down, choose the main point, and let each sentence land before moving on."
        drillExamplePhrase="Read exactly, then pause for one full beat at each full stop."
        drillTargetFocus="fluency, pauses, expression"
        drillDifficultyLevel="Baseline"
      />
    )
  },
  {
    id: "impromptu",
    title: "3. Impromptu answer",
    purpose: "Tests structure under time pressure and whether you can land the answer early.",
    recorder: (
      <VoiceRecorder
        skillBranch="impromptu"
        initialExerciseId="ex_baseline_impromptu"
        impromptuMode
        impromptuPrompt="You have 60 seconds: what is one professional strength you want people to notice more clearly?"
        impromptuTargetSeconds={60}
        drillInstruction="Use Point, Reason, Example, Point. Answer directly in the first sentence."
        drillExamplePhrase="My main strength is..."
        drillTargetFocus="structure under pressure"
        drillDifficultyLevel="Baseline"
      />
    )
  },
  {
    id: "pressure",
    title: "4. Pressure answer",
    purpose: "Reveals calmness, executive presence, brevity, and recovery under challenge.",
    recorder: (
      <VoiceRecorder
        skillBranch="executive"
        initialExerciseId="ex_baseline_pressure"
        executiveMode
        executiveSimulation={{
          mode: "baseline_pressure",
          style: "challenging",
          openingQuestion: "Why should we trust you to communicate clearly when the stakes are high?",
          scenarioBrief: "A senior stakeholder is testing your confidence and clarity."
        }}
        drillInstruction="Answer in 45-60 seconds. Lead with the answer, give one proof point, and stop cleanly."
        drillExamplePhrase="You should trust me because..."
        drillTargetFocus="executive presence, calmness, brevity"
        drillDifficultyLevel="Baseline"
      />
    )
  }
];

export default function BaselinePage() {
  return (
    <>
      <PageHeader
        kicker="Assessment"
        title="Baseline speaking assessment"
        subtitle="Four short samples give the coach enough signal to recommend the right plan. Correct each transcript before feedback."
        action={{ label: "Back to session", href: "/session" }}
      />

      <section className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950">
        <p className="font-semibold">Measurement honesty</p>
        <p className="mt-1">
          This baseline is coaching-grade, not clinical diagnosis. It can assess transcript, structure, clarity, concision, and some timing. It cannot diagnose voice disorders, stuttering, pain, vocal fold health, or neurological speech issues.
        </p>
      </section>

      <div className="space-y-5">
        {BASELINE_REPS.map((rep, index) => (
          <details key={rep.id} open={index === 0} className="rounded-lg border border-slate-200 bg-white">
            <summary className="cursor-pointer list-none px-5 py-4 [&::-webkit-details-marker]:hidden">
              <p className="text-base font-semibold text-slate-950">{rep.title}</p>
              <p className="mt-1 text-sm text-slate-600">{rep.purpose}</p>
            </summary>
            <div className="border-t border-slate-100 p-5">{rep.recorder}</div>
          </details>
        ))}
      </div>
    </>
  );
}
