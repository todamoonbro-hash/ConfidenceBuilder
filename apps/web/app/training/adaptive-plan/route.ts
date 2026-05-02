import { NextRequest, NextResponse } from "next/server";
import { resolveUserId } from "../../../lib/user";

const API = process.env.API_BASE_URL ?? "http://localhost:4000";

export async function GET(request: NextRequest) {
  const userId = resolveUserId(request.nextUrl.searchParams.get("userId"));
  try {
    const res = await fetch(`${API}/v1/training/adaptive-plan/${encodeURIComponent(userId)}`, { cache: "no-store" });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ ok: false, error: "upstream_error" }, { status: 502 });
  }
}
