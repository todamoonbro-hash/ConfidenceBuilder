import { PageHeader } from "../../components/ui/page-header";
import { DEFAULT_USER_ID } from "../../lib/user";

const GOAL_OPTIONS = ["confidence", "public_speaking", "articulation", "reading_aloud", "interviews", "executive_presence", "listening"] as const;

export default function OnboardingPage() {
  return (
    <>
      <PageHeader
        kicker="Setup"
        title="Your speaking profile"
        subtitle="Takes 30 seconds — you can change anything later in Settings. This baseline keeps coaching recommendations specific and useful."
      />

      <form action="/onboarding/submit" method="post" className="max-w-2xl rounded-lg border border-slate-200 bg-white p-6">
        <input type="hidden" name="userId" value={DEFAULT_USER_ID} />

        <div className="grid gap-5">
          {/* Primary role and goal */}
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-900">What's your primary speaking goal?</span>
              <select name="mainGoal" defaultValue="executive_presence" className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10">
                {GOAL_OPTIONS.map((goal) => (
                  <option key={goal} value={goal}>{goal.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-900">Current confidence (1-10)</span>
              <input name="confidenceLevel" type="number" min={1} max={10} defaultValue={5} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10" />
            </label>
          </div>

          {/* Experience level */}
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-900">Speaking experience</span>
              <select name="currentSpeakingLevel" defaultValue="intermediate" className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10">
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-900">Daily session length</span>
              <select name="preferredSessionLength" defaultValue={20} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10">
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={20}>20 minutes</option>
                <option value={30}>30 minutes</option>
              </select>
            </label>
          </div>

          {/* Upcoming event */}
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-900">Upcoming speaking event (optional)</span>
            <input name="upcomingEvent" type="text" placeholder="E.g., Board presentation on June 14" className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10" />
            <p className="text-xs text-slate-600">This helps us prioritize the most relevant drills.</p>
          </label>

          {/* Coach preferences */}
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-900">Coach style</span>
              <select name="preferredCoachStyle" defaultValue="balanced" className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10">
                <option value="direct">Direct and honest</option>
                <option value="supportive">Supportive and encouraging</option>
                <option value="balanced">Balanced approach</option>
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-900">Reading drill difficulty</span>
              <select name="readingDifficulty" defaultValue="medium" className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10">
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Challenging</option>
              </select>
            </label>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button 
            type="submit" 
            className="flex-1 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
          >
            Save profile and start
          </button>
          <a 
            href="/" 
            className="px-5 py-3 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors text-center"
          >
            Skip for now
          </a>
        </div>
      </form>

      <div className="mt-6 rounded-lg border border-blue-200 p-5">
        <p className="text-sm text-slate-700"><span className="font-semibold text-slate-900">Why we ask:</span> This profile helps our AI coach personalize recommendations. You can update it anytime in settings.</p>
      </div>
    </>
  );
}
