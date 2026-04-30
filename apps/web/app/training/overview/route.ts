import { NextResponse } from "next/server";

const API = process.env.API_BASE_URL ?? "http://localhost:4000";

export async function GET() {
  try {
    const res = await fetch(`${API}/v1/training/overview`, { cache: "no-store" });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ ok: false, error: "upstream_error" }, { status: 502 });
  }
}
