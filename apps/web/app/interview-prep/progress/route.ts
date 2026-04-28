export async function GET(request: Request) {
  const userId = new URL(request.url).searchParams.get("userId") ?? "user_001";
  const response = await fetch(`http://localhost:4000/v1/interview/progress/${userId}`, { cache: "no-store" });
  return Response.json(await response.json(), { status: response.status });
}
