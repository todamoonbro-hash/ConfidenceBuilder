import { resolveUserId } from "../../../lib/user";

export async function POST(request: Request) {
  const formData = await request.formData();

  const userId = resolveUserId(String(formData.get("userId") ?? ""));
  const questId = String(formData.get("questId") ?? "");

  if (questId) {
    await fetch(`${process.env.API_BASE_URL ?? "http://localhost:4000"}/v1/quests/${questId}/start`, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({ userId }),
      cache: "no-store"
    });
  }

  return Response.redirect(new URL(`/quests?userId=${encodeURIComponent(userId)}`, request.url), 302);
}
