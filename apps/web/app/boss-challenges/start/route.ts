import { redirect } from "next/navigation";
import { DEFAULT_USER_ID } from "../../../lib/user";

export async function GET(request: Request) {
  const challengeId = new URL(request.url).searchParams.get("challengeId");

  if (!challengeId) {
    redirect("/dashboard");
  }

  const response = await fetch(`${process.env.API_BASE_URL ?? "http://localhost:4000"}/v1/boss-challenges/${encodeURIComponent(challengeId)}/start`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ userId: DEFAULT_USER_ID }),
    cache: "no-store"
  });
  const data = (await response.json().catch(() => null)) as { ok?: boolean } | null;

  if (!response.ok || data?.ok !== true) {
    redirect("/dashboard?bossChallenge=locked");
  }

  redirect(`/session?bossChallengeId=${encodeURIComponent(challengeId)}`);
}
