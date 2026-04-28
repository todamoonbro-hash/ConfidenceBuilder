import { PageHeader } from "../../components/ui/page-header";
import { ExecutivePresenceStudio } from "../../components/modules/executive-presence-studio";

async function loadLibrary() {
  try {
    const response = await fetch("http://localhost:4000/v1/executive-presence/library", { cache: "no-store" });
    if (!response.ok) return null;
    return (await response.json()) as any;
  } catch {
    return null;
  }
}

export default async function ExecutivePresencePage() {
  const library = await loadLibrary();
  return (
    <>
      <PageHeader
        kicker="Executive Presence"
        title="Boardroom and pressure communication simulator"
        subtitle="Train concise, credible, composed answers in board, investor, leadership, and crisis moments."
      />
      <ExecutivePresenceStudio library={library} />
    </>
  );
}
