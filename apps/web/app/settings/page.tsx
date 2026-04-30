import { PageHeader } from "../../components/ui/page-header";
import { PersonalCoachSettings } from "../../components/settings/personal-coach-settings";
import { resolveUserId } from "../../lib/user";

interface SettingsPageProps {
  searchParams?: Promise<{ userId?: string }>;
}

async function loadPersonalization(userId: string) {
  try {
    const response = await fetch(`${process.env.API_BASE_URL ?? "http://localhost:4000"}/v1/coach/${encodeURIComponent(userId)}/personalization`, {
      cache: "no-store"
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

async function loadConfigStatus() {
  try {
    const response = await fetch(`${process.env.API_BASE_URL ?? "http://localhost:4000"}/v1/config/status`, {
      cache: "no-store"
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

async function loadTrainingOverview() {
  try {
    const response = await fetch(`${process.env.API_BASE_URL ?? "http://localhost:4000"}/v1/training/overview`, {
      cache: "no-store"
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { overview?: Record<string, number> };
    return data.overview ?? null;
  } catch {
    return null;
  }
}

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const params = await searchParams;
  const userId = resolveUserId(params?.userId);
  const [data, configStatus, overview] = await Promise.all([loadPersonalization(userId), loadConfigStatus(), loadTrainingOverview()]);
  const configuredProviders = Object.entries((configStatus?.providers ?? {}) as Record<string, boolean>)
    .filter(([, enabled]) => enabled)
    .map(([provider]) => provider);

  return (
    <>
      <PageHeader
        title="Personal Coach Setup"
        subtitle="Tune the platform around your goals, your weak spots, and low-cost model choices."
        kicker="Settings"
      />
      <section className="mb-4 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 text-sm md:grid-cols-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Active user</p>
          <p className="mt-1 font-medium text-slate-900">{userId}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Persistence</p>
          <p className="mt-1 font-medium text-slate-900">{configStatus?.persistence?.enabled ? "Enabled" : "Not configured"}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Configured providers</p>
          <p className="mt-1 font-medium text-slate-900">{configuredProviders.length > 0 ? configuredProviders.join(", ") : "Local heuristics only"}</p>
        </div>
      </section>
      <PersonalCoachSettings initialData={data} userId={userId} />

      {overview && Object.keys(overview).length > 0 && (
        <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">System overview</h3>
          <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-4">
            {Object.entries(overview).map(([key, value]) => (
              <div key={key} className="rounded-md bg-slate-50 p-3">
                <p className="text-xs text-slate-500 capitalize">{key.replace(/([A-Z])/g, " $1").toLowerCase()}</p>
                <p className="mt-1 text-lg font-bold text-slate-900">{value}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
