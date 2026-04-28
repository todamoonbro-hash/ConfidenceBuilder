import { PageHeader } from "../../components/ui/page-header";
import { NetworkingStudio } from "../../components/modules/networking-studio";

async function loadLibrary() {
  try {
    const response = await fetch("http://localhost:4000/v1/networking/library", { cache: "no-store" });
    if (!response.ok) return null;
    return (await response.json()) as any;
  } catch {
    return null;
  }
}

export default async function NetworkingPage() {
  const library = await loadLibrary();
  return (
    <>
      <PageHeader
        kicker="Networking"
        title="Practise introductions, rapport, and follow-up conversations"
        subtitle="Build authentic confidence in professional networking, asks, and relationship follow-through."
      />
      <NetworkingStudio library={library} />
    </>
  );
}
