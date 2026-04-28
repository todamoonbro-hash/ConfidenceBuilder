export async function POST(request: Request) {
  const payload = await request.json();
  const response = await fetch("http://localhost:4000/v1/modules/media/soundbite/transform", {
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
