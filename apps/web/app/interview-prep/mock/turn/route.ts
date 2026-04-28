export async function POST(request: Request) {
  const body = await request.json();
  const response = await fetch("http://localhost:4000/v1/interview/mock/turn", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  return Response.json(await response.json(), { status: response.status });
}
