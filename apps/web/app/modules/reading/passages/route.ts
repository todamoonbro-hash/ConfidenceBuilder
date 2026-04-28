export async function GET(request: Request) {
  const url = new URL(request.url);
  const response = await fetch(`http://localhost:4000/v1/modules/reading/passages${url.search}`, { cache: "no-store" });
  const body = await response.json();
  return Response.json(body, { status: response.status });
}
