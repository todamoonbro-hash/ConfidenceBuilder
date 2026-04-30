export async function POST(request: Request) {
  const payload = (await request.json()) as {
    attemptId: string;
    userId: string;
    skillBranch?: string;
  };

  const apiResponse = await fetch(`${process.env.API_BASE_URL ?? "http://localhost:4000"}/v1/attempts/${encodeURIComponent(payload.attemptId)}/feedback/generate`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({ userId: payload.userId, skillBranch: payload.skillBranch }),
    cache: "no-store"
  });

  const body = await apiResponse.json();
  return Response.json(body, { status: apiResponse.status });
}
