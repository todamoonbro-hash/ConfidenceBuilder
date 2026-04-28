import { PageHeader } from "../../components/ui/page-header";

const GOAL_OPTIONS = ["confidence", "public_speaking", "articulation", "reading_aloud", "interviews", "executive_presence", "listening"] as const;

export default function OnboardingPage() {
  return (
    <>
      <PageHeader
        title="Onboarding"
        subtitle="Build a professional training baseline so coaching stays specific to your role, pressure points, and speaking goals."
        kicker="Setup"
      />

      <form action="/onboarding/submit" method="post" className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 md:grid-cols-2">
        <input type="hidden" name="userId" value="user_001" />

        <label className="grid gap-1 text-sm">
          Primary objective
          <select name="mainGoal" defaultValue="executive_presence" className="rounded-md border border-slate-300 px-3 py-2">
            {GOAL_OPTIONS.map((goal) => (
              <option key={goal} value={goal}>{goal.replace("_", " ")}</option>
            ))}
          </select>
        </label>

        <label className="grid gap-1 text-sm">
          Current confidence (1-10)
          <input name="confidenceLevel" type="number" min={1} max={10} defaultValue={5} className="rounded-md border border-slate-300 px-3 py-2" />
        </label>

        <label className="grid gap-1 text-sm">
          Speaking level
          <select name="currentSpeakingLevel" defaultValue="intermediate" className="rounded-md border border-slate-300 px-3 py-2">
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </label>

        <label className="grid gap-1 text-sm">
          Preferred daily session length
          <select name="preferredSessionLength" defaultValue={20} className="rounded-md border border-slate-300 px-3 py-2">
            <option value={10}>10 minutes</option>
            <option value={15}>15 minutes</option>
            <option value={20}>20 minutes</option>
            <option value={30}>30 minutes</option>
          </select>
        </label>

        <label className="grid gap-1 text-sm md:col-span-2">
          Upcoming high-stakes speaking event (optional)
          <input name="upcomingEvent" type="text" placeholder="E.g. Board update on June 14" className="rounded-md border border-slate-300 px-3 py-2" />
        </label>

        <label className="grid gap-1 text-sm">
          Coach style
          <select name="preferredCoachStyle" defaultValue="balanced" className="rounded-md border border-slate-300 px-3 py-2">
            <option value="direct">Direct</option>
            <option value="supportive">Supportive</option>
            <option value="balanced">Balanced</option>
          </select>
        </label>

        <label className="grid gap-1 text-sm">
          Reading drill difficulty
          <select name="readingDifficulty" defaultValue="medium" className="rounded-md border border-slate-300 px-3 py-2">
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </label>

        <button type="submit" className="md:col-span-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">Save profile and continue</button>
      </form>
    </>
  );
}
