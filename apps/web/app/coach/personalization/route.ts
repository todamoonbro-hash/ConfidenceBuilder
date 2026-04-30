export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId") ?? "user_001";
  const response = await fetch(`${process.env.API_BASE_URL ?? "http://localhost:4000"}/v1/coach/${userId}/personalization`, {
    cache: "no-store"
  });
  return Response.json(await response.json(), { status: response.status });
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId") ?? "user_001";
  const body = await request.json();
  const response = await fetch(`${process.env.API_BASE_URL ?? "http://localhost:4000"}/v1/coach/${userId}/personalization`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  return Response.json(await response.json(), { status: response.status });
}
