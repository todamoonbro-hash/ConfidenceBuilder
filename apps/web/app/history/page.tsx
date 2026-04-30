import { PageHeader } from "../../components/ui/page-header";
import { DEFAULT_USER_ID } from "../../lib/user";

type HistoryItem = {
  attempt: {
    id: string;
    exerciseId: string;
    createdAt: string;
    durationSeconds: number;
  };
  exercise?: {
    title: string;
    drillType: string;
  };
  transcript?: {
    content: string;
    wordCount: number;
  };
  score?: {
    total: number;
  };
  feedback?: {
    priorityFix: string;
    retryInstruction: string;
  };
};

async function loadHistory(): Promise<HistoryItem[]> {
  try {
    const response = await fetch(
      `${process.env.API_BASE_URL ?? "http://localhost:4000"}/v1/history/${encodeURIComponent(DEFAULT_USER_ID)}?limit=20`,
      { cache: "no-store" }
    );
    if (!response.ok) return [];
    const payload = (await response.json()) as { history?: HistoryItem[] };
    return payload.history ?? [];
  } catch {
    return [];
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export default async function HistoryPage() {
  const history = await loadHistory();

  return (
    <>
      <PageHeader
        title="History"
        subtitle="Review your speaking attempts, transcripts, and scoring changes to spot meaningful improvement."
        kicker="Review"
      />
      {history.length === 0 ? (
        <section className="rounded-lg border border-slate-200 bg-white p-8 text-center">
          <h2 className="text-base font-semibold text-slate-900">No saved attempts yet</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">Record and save a session to build a timeline of transcripts, scores, and retry instructions.</p>
          <a href="/session" className="mt-5 inline-flex min-h-11 items-center rounded-md bg-brand-600 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-brand-700">
            Start a session
          </a>
        </section>
      ) : (
        <section className="grid gap-3">
          {history.map((item) => (
            <article key={item.attempt.id} className="rounded-lg border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{item.exercise?.drillType?.replace(/_/g, " ") ?? "Practice"}</p>
                  <h2 className="mt-1 text-base font-semibold text-slate-950">{item.exercise?.title ?? item.attempt.exerciseId}</h2>
                  <p className="mt-1 text-xs text-slate-500">{formatDate(item.attempt.createdAt)} - {item.attempt.durationSeconds}s</p>
                </div>
                {item.score ? <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">Score {item.score.total}</span> : null}
              </div>

              {item.transcript?.content ? (
                <p className="mt-4 rounded-md bg-slate-50 p-3 text-sm leading-relaxed text-slate-700">{item.transcript.content}</p>
              ) : (
                <p className="mt-4 rounded-md bg-amber-50 p-3 text-sm text-amber-800">Transcript not added yet.</p>
              )}

              {item.feedback ? (
                <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
                  <p className="rounded-md border border-slate-200 p-3"><strong>Priority fix:</strong> {item.feedback.priorityFix}</p>
                  <p className="rounded-md border border-slate-200 p-3"><strong>Retry:</strong> {item.feedback.retryInstruction}</p>
                </div>
              ) : null}
            </article>
          ))}
        </section>
      )}
    </>
  );
}
