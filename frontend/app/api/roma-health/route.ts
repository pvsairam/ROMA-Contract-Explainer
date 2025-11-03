import { NextResponse } from "next/server";

export async function GET() {
  try {
    const base = process.env.ROMA_API_BASE || "http://localhost:8000";
    const res = await fetch(`${base}/health`, {
      signal: AbortSignal.timeout(3000)
    });
    
    if (!res.ok) {
      return NextResponse.json({ status: "offline" }, { status: 503 });
    }
    
    const data = await res.json();
    return NextResponse.json({ status: "online", ...data });
  } catch (error) {
    return NextResponse.json({ status: "offline", error: "Service unavailable" }, { status: 503 });
  }
}
