export async function GET() {
  const response = await fetch(`${process.env.API_BASE_URL ?? "http://localhost:4000"}/v1/modules/media/drills`, { cache: "no-store" });
  const body = await response.json();
  return Response.json(body, { status: response.status });
}
