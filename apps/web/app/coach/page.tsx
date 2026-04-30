import { CoachHub } from "../../components/coach/coach-hub";
import { PageHeader } from "../../components/ui/page-header";
import { resolveUserId } from "../../lib/user";

interface CoachPageProps {
  searchParams?: Promise<{ userId?: string }>;
}

async function loadCoach(userId: string) {
  try {
    const response = await fetch(`${process.env.API_BASE_URL ?? "http://localhost:4000"}/v1/coach/${encodeURIComponent(userId)}/overview`, { cache: "no-store" });
    if (!response.ok) return null;
    return (await response.json()) as any;
  } catch {
    return null;
  }
}

export default async function CoachPage({ searchParams }: CoachPageProps) {
  const params = await searchParams;
  const userId = resolveUserId(params?.userId);
  const data = await loadCoach(userId);

  return (
    <>
      <PageHeader
        kicker="Coach"
        title="Adaptive coaching engine"
        subtitle="Cross-module weakness detection, next-best-drill recommendations, and weekly progression guidance."
      />
      <CoachHub initialData={data} userId={userId} />
    </>
  );
}
