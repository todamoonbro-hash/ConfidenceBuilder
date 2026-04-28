export async function POST(request: Request) {
  const formData = await request.formData();

  const userId = String(formData.get("userId") ?? "user_001");
  const questId = String(formData.get("questId") ?? "");

  if (questId) {
    await fetch(`http://localhost:4000/v1/quests/${questId}/start`, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({ userId }),
      cache: "no-store"
    });
  }

  return Response.redirect(new URL(`/dashboard?userId=${encodeURIComponent(userId)}`, request.url), 302);
}
