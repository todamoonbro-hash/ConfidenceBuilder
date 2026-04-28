export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId") ?? "user_001";

  const response = await fetch(`http://localhost:4000/v1/coach/${userId}/overview`, {
    cache: "no-store"
  });

  return Response.json(await response.json(), { status: response.status });
}
