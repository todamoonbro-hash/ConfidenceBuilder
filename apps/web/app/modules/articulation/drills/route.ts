export async function GET() {
  const response = await fetch("http://localhost:4000/v1/modules/articulation/drills", { cache: "no-store" });
  const body = await response.json();
  return Response.json(body, { status: response.status });
}
