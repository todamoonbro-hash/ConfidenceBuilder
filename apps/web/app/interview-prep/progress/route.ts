import { resolveUserId } from "../../../lib/user";

export async function GET(request: Request) {
  const userId = resolveUserId(new URL(request.url).searchParams.get("userId"));
  const response = await fetch(`${process.env.API_BASE_URL ?? "http://localhost:4000"}/v1/interview/progress/${encodeURIComponent(userId)}`, { cache: "no-store" });
  return Response.json(await response.json(), { status: response.status });
}
