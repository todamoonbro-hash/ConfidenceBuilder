import { CoachHub } from "../../components/coach/coach-hub";
import { PageHeader } from "../../components/ui/page-header";

async function loadCoach() {
  try {
    const response = await fetch(`${process.env.API_BASE_URL ?? "http://localhost:4000"}/v1/coach/user_001/overview`, { cache: "no-store" });
    if (!response.ok) return null;
    return (await response.json()) as any;
  } catch {
    return null;
  }
}

export default async function CoachPage() {
  const data = await loadCoach();

  return (
    <>
      <PageHeader
        kicker="Coach"
        title="Adaptive coaching engine"
        subtitle="Cross-module weakness detection, next-best-drill recommendations, and weekly progression guidance."
      />
      <CoachHub initialData={data} />
    </>
  );
}
