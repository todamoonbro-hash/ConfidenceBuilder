export async function GET() {
  const response = await fetch("http://localhost:4000/v1/sales-influence/team/overview", { cache: "no-store" });
  return Response.json(await response.json(), { status: response.status });
}
