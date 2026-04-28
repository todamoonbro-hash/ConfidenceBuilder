import { PageHeader } from "../../components/ui/page-header";
import { DifficultConversationsStudio } from "../../components/modules/difficult-conversations-studio";

async function loadLibrary() {
  try {
    const response = await fetch("http://localhost:4000/v1/difficult-conversations/library", { cache: "no-store" });
    if (!response.ok) return null;
    return (await response.json()) as any;
  } catch {
    return null;
  }
}

export default async function DifficultConversationsPage() {
  const library = await loadLibrary();
  return (
    <>
      <PageHeader
        kicker="Difficult Conversations"
        title="Practise uncomfortable conversations with clarity, empathy, and boundaries"
        subtitle="Train negotiation, conflict, feedback, payment, and relationship repair in realistic pressure scenarios."
      />
      <DifficultConversationsStudio library={library} />
    </>
  );
}
