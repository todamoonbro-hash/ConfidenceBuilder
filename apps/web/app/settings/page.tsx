import { PageHeader } from "../../components/ui/page-header";
import { PlaceholderCard } from "../../components/ui/placeholder-card";

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Control profile details, coaching style, and session preferences used across your academy plan."
        kicker="Account"
      />
      <div className="grid gap-4 md:grid-cols-2">
        <PlaceholderCard
          title="Profile"
          description="Add your current role, communication context, and upcoming high-stakes speaking events."
          ctaLabel="Update onboarding"
          ctaHref="/onboarding"
        />
        <PlaceholderCard
          title="Coaching preferences"
          description="Set session duration, practice intensity, and feedback tone so each rep stays realistic and useful."
          ctaLabel="Open modules"
          ctaHref="/modules"
        />
      </div>
    </>
  );
}
