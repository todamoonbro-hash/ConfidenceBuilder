export async function GET(request: Request) {
  const userId = new URL(request.url).searchParams.get("userId") ?? "user_001";
  const response = await fetch(`${process.env.API_BASE_URL ?? "http://localhost:4000"}/v1/difficult-conversations/progress/${userId}`, { cache: "no-store" });
  return Response.json(await response.json(), { status: response.status });
}
