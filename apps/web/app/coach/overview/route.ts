import { resolveUserId } from "../../../lib/user";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = resolveUserId(url.searchParams.get("userId"));

  const response = await fetch(`${process.env.API_BASE_URL ?? "http://localhost:4000"}/v1/coach/${encodeURIComponent(userId)}/overview`, {
    cache: "no-store"
  });

  return Response.json(await response.json(), { status: response.status });
}
