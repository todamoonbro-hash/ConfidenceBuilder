import { PageHeader } from "../../components/ui/page-header";
import { PlaceholderCard } from "../../components/ui/placeholder-card";

export default function HistoryPage() {
  return (
    <>
      <PageHeader
        title="History"
        subtitle="Review your speaking attempts, transcripts, and scoring changes to spot meaningful improvement."
        kicker="Review"
      />
      <div className="grid gap-4">
        <PlaceholderCard
          title="Recent sessions"
          description="Your timeline will appear here as soon as you complete your first full session."
          ctaLabel="Run first session"
          ctaHref="/session"
        />
        <PlaceholderCard
          title="Weekly executive review"
          description="Each week you will see what improved, what still weakens impact, and one clear focus for the next week."
          ctaLabel="Open dashboard"
          ctaHref="/dashboard"
        />
      </div>
    </>
  );
}
