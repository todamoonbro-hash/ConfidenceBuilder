export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const role = request.headers.get("x-user-role") ?? "user";
  const body = await request.json();
  const { id } = await context.params;

  const response = await fetch(`http://localhost:4000/v1/admin/scenario-studio/scenarios/${id}/action`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-user-role": role },
    body: JSON.stringify(body)
  });

  return Response.json(await response.json(), { status: response.status });
}
