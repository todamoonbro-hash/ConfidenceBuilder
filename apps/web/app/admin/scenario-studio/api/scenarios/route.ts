function isAuthorizedAdminUiRequest(request: Request) {
  const configuredToken = process.env.ADMIN_UI_TOKEN;
  const providedToken = request.headers.get("x-admin-ui-token");
  return Boolean(configuredToken && providedToken && providedToken === configuredToken);
}

export async function GET(request: Request) {
  if (!isAuthorizedAdminUiRequest(request)) {
    return Response.json({ ok: false, error: "access_denied" }, { status: 403 });
  }

  const url = new URL(request.url);
  const module = url.searchParams.get("module") ?? "";
  const includeArchived = url.searchParams.get("includeArchived") ?? "false";
  const response = await fetch(`${process.env.API_BASE_URL ?? "http://localhost:4000"}/v1/admin/scenario-studio/scenarios?module=${module}&includeArchived=${includeArchived}`, {
    headers: { "x-admin-token": process.env.ADMIN_API_TOKEN ?? "" },
    cache: "no-store"
  });
  return Response.json(await response.json(), { status: response.status });
}

export async function POST(request: Request) {
  if (!isAuthorizedAdminUiRequest(request)) {
    return Response.json({ ok: false, error: "access_denied" }, { status: 403 });
  }

  const body = await request.json();
  const response = await fetch(`${process.env.API_BASE_URL ?? "http://localhost:4000"}/v1/admin/scenario-studio/scenarios`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-admin-token": process.env.ADMIN_API_TOKEN ?? "" },
    body: JSON.stringify(body)
  });
  return Response.json(await response.json(), { status: response.status });
}

export async function PUT(request: Request) {
  if (!isAuthorizedAdminUiRequest(request)) {
    return Response.json({ ok: false, error: "access_denied" }, { status: 403 });
  }

  const body = await request.json();
  const id = body.id;
  const response = await fetch(`${process.env.API_BASE_URL ?? "http://localhost:4000"}/v1/admin/scenario-studio/scenarios/${id}/update`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-admin-token": process.env.ADMIN_API_TOKEN ?? "" },
    body: JSON.stringify(body)
  });
  return Response.json(await response.json(), { status: response.status });
}
