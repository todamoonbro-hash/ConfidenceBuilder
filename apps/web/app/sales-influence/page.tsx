import { PageHeader } from "../../components/ui/page-header";
import { SalesInfluenceStudio } from "../../components/modules/sales-influence-studio";

async function loadLibrary() {
  try {
    const response = await fetch("http://localhost:4000/v1/sales-influence/library", { cache: "no-store" });
    if (!response.ok) return null;
    return (await response.json()) as any;
  } catch {
    return null;
  }
}

export default async function SalesInfluencePage() {
  const library = await loadLibrary();

  return (
    <>
      <PageHeader
        kicker="Sales & Influence"
        title="Roleplay simulator for high-stakes commercial and team conversations"
        subtitle="Practice scenarios, get scored feedback, build pitch variants, and track readiness for certification."
      />
      <SalesInfluenceStudio library={library} />
    </>
  );
}
