import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";

export function requireSameOrigin(req: NextRequest): NextResponse | null {
  const origin = req.headers.get("origin");
  if (req.headers.get("sec-fetch-site") === "cross-site"
    || (origin !== null && origin !== req.nextUrl.origin)) {
    return NextResponse.json({ error: "Cross-origin requests are not allowed" }, { status: 403 });
  }
  return null;
}

export function requireAdmin(req: NextRequest): NextResponse | null {
  const token = req.cookies.get("admin_token")?.value;
  if (!token || !verifySessionToken(token)) {
    return NextResponse.json({ error: "Admin authentication required" }, {
      status: 401,
      headers: { "Cache-Control": "no-store" },
    });
  }
  return requireSameOrigin(req);
}
