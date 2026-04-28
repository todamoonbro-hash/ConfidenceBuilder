export async function POST(request: Request) {
  const payload = await request.json();

  const apiResponse = await fetch("http://localhost:4000/v1/recordings/attempts", {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(payload),
    cache: "no-store"
  });

  const body = await apiResponse.json();
  return Response.json(body, { status: apiResponse.status });
}
