function isAuthorizedAdminUiRequest(request: Request) {
  const configuredToken = process.env.ADMIN_UI_TOKEN;
  const providedToken = request.headers.get("x-admin-ui-token");
  return Boolean(configuredToken && providedToken && providedToken === configuredToken);
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!isAuthorizedAdminUiRequest(request)) {
    return Response.json({ ok: false, error: "access_denied" }, { status: 403 });
  }

  const body = await request.json();
  const { id } = await context.params;

  const response = await fetch(`${process.env.API_BASE_URL ?? "http://localhost:4000"}/v1/admin/scenario-studio/scenarios/${id}/action`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-admin-token": process.env.ADMIN_API_TOKEN ?? "" },
    body: JSON.stringify(body)
  });

  return Response.json(await response.json(), { status: response.status });
}
