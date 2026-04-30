import { PageHeader } from "../../components/ui/page-header";
import { PersonalCoachSettings } from "../../components/settings/personal-coach-settings";

async function loadPersonalization() {
  try {
    const response = await fetch(`${process.env.API_BASE_URL ?? "http://localhost:4000"}/v1/coach/user_001/personalization`, {
      cache: "no-store"
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export default async function SettingsPage() {
  const data = await loadPersonalization();

  return (
    <>
      <PageHeader
        title="Personal Coach Setup"
        subtitle="Tune the platform around your goals, your weak spots, and low-cost model choices."
        kicker="Settings"
      />
      <PersonalCoachSettings initialData={data} />
    </>
  );
}
