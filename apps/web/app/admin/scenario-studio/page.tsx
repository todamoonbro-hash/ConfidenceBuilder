import { createHash, timingSafeEqual } from "node:crypto";
import { PageHeader } from "../../../components/ui/page-header";
import { ScenarioStudioAdmin } from "../../../components/admin/scenario-studio-admin";

function timingSafeStringEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export default async function ScenarioStudioPage({
  searchParams
}: {
  searchParams: Promise<{ adminToken?: string }>;
}) {
  const { adminToken } = await searchParams;
  const configuredToken = process.env.ADMIN_UI_TOKEN;
  const isAdmin = Boolean(configuredToken && adminToken && timingSafeStringEqual(adminToken, configuredToken));

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
