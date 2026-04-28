import { PageHeader } from "../../../components/ui/page-header";
import { ScenarioStudioAdmin } from "../../../components/admin/scenario-studio-admin";

export default async function ScenarioStudioPage({
  searchParams
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role } = await searchParams;
  const isAdmin = role === "admin";

  if (!isAdmin) {
    return (
      <section className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-900">
        <h1 className="text-xl font-semibold">Access denied</h1>
        <p className="mt-2 text-sm">Scenario Studio is admin-only. Add <code>?role=admin</code> for authorised preview.</p>
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
      <ScenarioStudioAdmin role="admin" />
    </>
  );
}
