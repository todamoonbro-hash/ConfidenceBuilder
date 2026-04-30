import { resolveUserId } from "../../../../lib/user";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = resolveUserId(searchParams.get("userId"));
  const response = await fetch(`${process.env.API_BASE_URL ?? "http://localhost:4000"}/v1/modules/media/key-messages/${encodeURIComponent(userId)}`, {
    cache: "no-store"
  });
  const body = await response.json();
  return Response.json(body, { status: response.status });
}

export async function POST(request: Request) {
  const payload = await request.json();
  const response = await fetch(`${process.env.API_BASE_URL ?? "http://localhost:4000"}/v1/modules/media/key-messages`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(payload),
    cache: "no-store"
  });
  const body = await response.json();
  return Response.json(body, { status: response.status });
}
