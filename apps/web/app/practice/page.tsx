import { PageHeader } from "../../components/ui/page-header";
import { DEFAULT_USER_ID } from "../../lib/user";

interface PracticePageProps {
  searchParams?: Promise<{ tab?: string }>;
}

type TabKey = "skills" | "scenarios" | "quests";

const VALID_TABS: TabKey[] = ["skills", "scenarios", "quests"];

const SKILLS = [
  {
    title: "Articulation",
    blurb: "Warmups, plosives, tongue twisters, and pace ladders. Builds the muscle of clear, deliberate sound.",
    href: "/modules#articulation",
    minutes: "5–10 min",
  },
  {
    title: "Reading aloud",
    blurb: "Guided, cold, executive, and difficult-text reading. Trains pacing, expression, and recovery.",
    href: "/modules#reading",
    minutes: "8–15 min",
  },
  {
    title: "Impromptu speaking",
    blurb: "Random prompts on a timer (30s / 60s / 90s / 2min). Trains structure under pressure.",
    href: "/modules#impromptu",
    minutes: "5–10 min",
  },
  {
    title: "Listening & response",
    blurb: "Summarise, paraphrase, detect intent, and answer the hidden concern.",
    href: "/modules#listening",
    minutes: "5–10 min",
  },
  {
    title: "Executive simulations",
    blurb: "CFO interview, board update, investor Q&A, hostile stakeholder. Pressure-tests presence.",
    href: "/modules#executive",
    minutes: "10–15 min",
  },
  {
    title: "Media training",
    blurb: "Soundbites, bridging, flagging, hostile journalists, crisis statements.",
    href: "/modules#media",
    minutes: "10–15 min",
  },
];

const SCENARIOS = [
  {
    title: "Interview prep",
    blurb: "Role setup, story bank, answer builder, and full mock interviews.",
    href: "/interview-prep",
  },
  {
    title: "Executive presence",
    blurb: "Library, focused sessions, and longitudinal progress on presence cues.",
    href: "/executive-presence",
  },
  {
    title: "Sales & influence",
    blurb: "Pitch builder, pitch bank, roleplays, and team certifications.",
    href: "/sales-influence",
  },
  {
    title: "Difficult conversations",
    blurb: "Boundary-setting, conflict, layoff, escalation, and recovery scripts.",
    href: "/difficult-conversations",
  },
  {
    title: "Networking",
    blurb: "Intros, follow-ups, and conversation openers for events and one-on-ones.",
    href: "/networking",
  },
];

type Quest = { id: string; title: string; description?: string; status?: string; totalSteps?: number; completedSteps?: number };

async function loadQuests(): Promise<Quest[]> {
  try {
    const response = await fetch(`${process.env.API_BASE_URL ?? "http://localhost:4000"}/v1/quests/${encodeURIComponent(DEFAULT_USER_ID)}`, { cache: "no-store" });
    if (!response.ok) return [];
    const payload = (await response.json()) as { quests?: Quest[] };
    return payload.quests ?? [];
  } catch {
    return [];
  }
}

function Tab({ label, tabKey, active, count }: { label: string; tabKey: TabKey; active: boolean; count?: number }) {
  return (
    <a
      href={`/practice?tab=${tabKey}`}
      aria-current={active ? "page" : undefined}
      className={`inline-flex min-h-10 items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
        active
          ? "bg-brand-600 text-white"
          : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
      }`}
    >
      {label}
      {typeof count === "number" ? (
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"}`}>{count}</span>
      ) : null}
    </a>
  );
}

function SkillsGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {SKILLS.map((skill) => (
        <a key={skill.title} href={skill.href} className="group flex flex-col rounded-lg border border-slate-200 bg-white p-5 transition-all hover:border-brand-300 hover:bg-brand-50/30">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-semibold text-slate-900">{skill.title}</h3>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-600">{skill.minutes}</span>
          </div>
          <p className="mt-2 flex-1 text-sm text-slate-600">{skill.blurb}</p>
          <p className="mt-4 text-sm font-medium text-brand-600 group-hover:text-brand-700">Open lab →</p>
        </a>
      ))}
    </div>
  );
}

function ScenariosGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {SCENARIOS.map((scenario) => (
        <a key={scenario.title} href={scenario.href} className="group flex flex-col rounded-lg border border-slate-200 bg-white p-5 transition-all hover:border-brand-300 hover:bg-brand-50/30">
          <h3 className="text-base font-semibold text-slate-900">{scenario.title}</h3>
          <p className="mt-2 flex-1 text-sm text-slate-600">{scenario.blurb}</p>
          <p className="mt-4 text-sm font-medium text-brand-600 group-hover:text-brand-700">Open scenario →</p>
        </a>
      ))}
    </div>
  );
}

function QuestsView({ quests }: { quests: Quest[] }) {
  if (quests.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
        <p className="text-sm text-slate-600">No quests available yet. Complete a session to unlock progression tracks.</p>
        <a href="/session" className="mt-4 inline-flex min-h-11 items-center rounded-md bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-700 hover:-translate-y-px">Start a session</a>
      </div>
    );
  }

  const active = quests.find((q) => q.status === "active" || q.status === "in_progress");
  const others = quests.filter((q) => q !== active);

  return (
    <div className="space-y-5">
      {active ? (
        <article className="rounded-lg border border-brand-200 bg-brand-50/40 p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">Active quest</p>
          <h3 className="mt-2 text-lg font-semibold text-slate-950">{active.title}</h3>
          {active.description ? <p className="mt-2 text-sm text-slate-600">{active.description}</p> : null}
          {typeof active.totalSteps === "number" && typeof active.completedSteps === "number" ? (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs font-medium text-slate-600">
                <span>Progress</span>
                <span>{active.completedSteps}/{active.totalSteps}</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
                <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${Math.round(((active.completedSteps ?? 0) / Math.max(1, active.totalSteps ?? 1)) * 100)}%` }} />
              </div>
            </div>
          ) : null}
          <a href="/quests" className="mt-5 inline-flex min-h-10 items-center rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-brand-700 hover:-translate-y-px">Continue quest</a>
        </article>
      ) : null}

      {others.length > 0 ? (
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">{active ? "More quests" : "Available quests"}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {others.map((quest) => (
              <a key={quest.id} href={`/quests/start?questId=${encodeURIComponent(quest.id)}`} className="group rounded-lg border border-slate-200 bg-white p-5 transition-all hover:border-brand-300 hover:bg-brand-50/30">
                <h4 className="text-sm font-semibold text-slate-900">{quest.title}</h4>
                {quest.description ? <p className="mt-1 text-xs text-slate-600">{quest.description}</p> : null}
                <p className="mt-3 text-xs font-medium text-brand-600 group-hover:text-brand-700">View →</p>
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default async function PracticePage({ searchParams }: PracticePageProps) {
  const params = await searchParams;
  const requested = params?.tab ?? "skills";
  const activeTab: TabKey = (VALID_TABS as string[]).includes(requested) ? (requested as TabKey) : "skills";

  const quests = activeTab === "quests" ? await loadQuests() : [];

  const subtitleMap: Record<TabKey, string> = {
    skills: "Foundational drills that compound. Pick one, do it well, retry once.",
    scenarios: "Real situations you'll face. Each track has its own library, sessions, and progress.",
    quests: "Multi-day challenge tracks with clear reps, checkpoints, and outcomes.",
  };

  return (
    <>
      <PageHeader
        kicker="Practice"
        title="Pick how you'll train"
        subtitle={subtitleMap[activeTab]}
      />

      <nav className="mb-6 flex flex-wrap gap-1 rounded-lg border border-slate-200 bg-white p-1" aria-label="Practice sections">
        <Tab label="Skills" tabKey="skills" active={activeTab === "skills"} count={SKILLS.length} />
        <Tab label="Scenarios" tabKey="scenarios" active={activeTab === "scenarios"} count={SCENARIOS.length} />
        <Tab label="Quests" tabKey="quests" active={activeTab === "quests"} />
      </nav>

      {activeTab === "skills" ? <SkillsGrid /> : null}
      {activeTab === "scenarios" ? <ScenariosGrid /> : null}
      {activeTab === "quests" ? <QuestsView quests={quests} /> : null}
    </>
  );
}
