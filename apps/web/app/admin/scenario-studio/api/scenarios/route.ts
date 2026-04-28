export async function GET(request: Request) {
  const url = new URL(request.url);
  const role = url.searchParams.get("role") ?? "user";
  const module = url.searchParams.get("module") ?? "";
  const includeArchived = url.searchParams.get("includeArchived") ?? "false";
  const response = await fetch(`http://localhost:4000/v1/admin/scenario-studio/scenarios?module=${module}&includeArchived=${includeArchived}`, {
    headers: { "x-user-role": role },
    cache: "no-store"
  });
  return Response.json(await response.json(), { status: response.status });
}

export async function POST(request: Request) {
  const role = request.headers.get("x-user-role") ?? "user";
  const body = await request.json();
  const response = await fetch("http://localhost:4000/v1/admin/scenario-studio/scenarios", {
    method: "POST",
    headers: { "content-type": "application/json", "x-user-role": role },
    body: JSON.stringify(body)
  });
  return Response.json(await response.json(), { status: response.status });
}

export async function PUT(request: Request) {
  const role = request.headers.get("x-user-role") ?? "user";
  const body = await request.json();
  const id = body.id;
  const response = await fetch(`http://localhost:4000/v1/admin/scenario-studio/scenarios/${id}/update`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-user-role": role },
    body: JSON.stringify(body)
  });
  return Response.json(await response.json(), { status: response.status });
}
