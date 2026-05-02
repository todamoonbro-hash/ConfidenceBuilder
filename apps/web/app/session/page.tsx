import { PageHeader } from "../../components/ui/page-header";
import { GuidedSessionFlow } from "../../components/session/guided-session-flow";
import type { BreathingProtocol } from "../../components/today/breathing-timer";
import type { WarmupDrill } from "../../components/today/warmup-timer";

const API = process.env.API_BASE_URL ?? "http://localhost:4000";

async function loadBreathingProtocol(): Promise<BreathingProtocol | undefined> {
  try {
    const response = await fetch(`${API}/v1/modules/breathing/recommend`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ state: "neutral", minutesAvailable: 3 }),
      cache: "no-store"
    });
    if (!response.ok) return undefined;
    const payload = (await response.json()) as { recommended?: BreathingProtocol };
    return payload.recommended;
  } catch {
    return undefined;
  }
}

async function loadWarmups(): Promise<WarmupDrill[]> {
  try {
    const response = await fetch(`${API}/v1/modules/articulation/warmups`, { cache: "no-store" });
    if (!response.ok) return [];
    const payload = (await response.json()) as { warmups?: WarmupDrill[] };
    return payload.warmups ?? [];
  } catch {
    return [];
  }
}

export default async function DailySessionPage() {
  const [breathingProtocol, warmups] = await Promise.all([loadBreathingProtocol(), loadWarmups()]);

  return (
    <>
      <PageHeader
        kicker="Daily session"
        title="Focused speaking rep"
        subtitle="One honest attempt, real feedback, one correction, one fix, retry."
        action={{ label: "Run baseline", href: "/baseline" }}
      />

      <GuidedSessionFlow breathingProtocol={breathingProtocol} warmups={warmups} />
    </>
  );
}
