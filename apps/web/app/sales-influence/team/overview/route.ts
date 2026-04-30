export async function GET() {
  const response = await fetch(`${process.env.API_BASE_URL ?? "http://localhost:4000"}/v1/sales-influence/team/overview`, { cache: "no-store" });
  return Response.json(await response.json(), { status: response.status });
}
