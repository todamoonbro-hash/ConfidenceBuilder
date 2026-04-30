import { PageHeader } from "../../../components/ui/page-header";
import { ScenarioStudioAdmin } from "../../../components/admin/scenario-studio-admin";

export default async function ScenarioStudioPage({
  searchParams
}: {
  searchParams: Promise<{ adminToken?: string }>;
}) {
  const { adminToken } = await searchParams;
  const configuredToken = process.env.ADMIN_UI_TOKEN;
  const isAdmin = Boolean(configuredToken && adminToken && adminToken === configuredToken);

  if (!isAdmin) {
    return (
      <section className="rounded-lg border border-rose-200 bg-rose-50 p-6 text-rose-900">
        <h1 className="text-xl font-semibold">Access denied</h1>
        <p className="mt-2 text-sm">Scenario Studio is admin-only.</p>
      </section>
    );
  }

  return (
    <>
      <PageHeader
        kicker="Admin"
        title="Scenario Studio"
        subtitle="Create, test, publish, and retire module scenarios without hardcoding service files."
      />
      <ScenarioStudioAdmin adminUiToken={adminToken ?? ""} />
    </>
  );
}
