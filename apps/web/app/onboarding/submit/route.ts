export async function POST(request: Request) {
  const formData = await request.formData();

  const userId = String(formData.get("userId") ?? "user_001");

  const payload = {
    userId,
    mainGoal: String(formData.get("mainGoal") ?? "confidence"),
    confidenceLevel: Number(formData.get("confidenceLevel") ?? 5),
    currentSpeakingLevel: String(formData.get("currentSpeakingLevel") ?? "intermediate"),
    readingDifficulty: String(formData.get("readingDifficulty") ?? "medium"),
    preferredSessionLength: Number(formData.get("preferredSessionLength") ?? 20),
    upcomingEvent: String(formData.get("upcomingEvent") ?? "") || undefined,
    preferredCoachStyle: String(formData.get("preferredCoachStyle") ?? "balanced")
  };

  await fetch("http://localhost:4000/v1/onboarding", {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(payload),
    cache: "no-store"
  });

  return Response.redirect(new URL(`/dashboard?userId=${encodeURIComponent(userId)}`, request.url), 302);
}
