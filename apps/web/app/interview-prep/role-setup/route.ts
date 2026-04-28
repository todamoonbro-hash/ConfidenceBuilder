export async function POST(request: Request) {
  const body = await request.json();
  const response = await fetch("http://localhost:4000/v1/interview/role-setup", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  return Response.json(await response.json(), { status: response.status });
}

export async function GET(request: Request) {
  const userId = new URL(request.url).searchParams.get("userId") ?? "user_001";
  const response = await fetch(`http://localhost:4000/v1/interview/role-setup/${userId}`, { cache: "no-store" });
  return Response.json(await response.json(), { status: response.status });
}
