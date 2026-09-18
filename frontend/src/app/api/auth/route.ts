import { NextRequest, NextResponse } from "next/server";
import { authenticateAdmin, generateSessionToken, isAuthConfigured, SESSION_MAX_AGE, verifySessionToken } from "@/lib/auth";
import { requireSameOrigin } from "@/lib/require-admin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const headers = { "Cache-Control": "no-store" };
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
};

export async function POST(req: NextRequest) {
  const forbidden = requireSameOrigin(req);
  if (forbidden) return forbidden;

  const body: unknown = await req.json().catch(() => null);
  const password = body && typeof body === "object" && "password" in body ? body.password : null;
  if (typeof password !== "string" || !password || Buffer.byteLength(password) > 1024) {
    return NextResponse.json({ success: false, error: "A valid password is required" }, { status: 400, headers });
  }

  if (!isAuthConfigured()) {
    return NextResponse.json({ success: false, error: "Admin sign-in is not configured" }, { status: 503, headers });
  }

  try {
    if (!await authenticateAdmin(password)) {
      return NextResponse.json({ success: false, error: "Invalid password or admin account unavailable" }, { status: 401, headers });
    }

    const response = NextResponse.json({ success: true, message: "Edit mode enabled" }, { headers });
    response.cookies.set("admin_token", generateSessionToken(), { ...cookieOptions, maxAge: SESSION_MAX_AGE });
    return response;
  } catch {
    return NextResponse.json({ success: false, error: "Authentication failed" }, { status: 500, headers });
  }
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get("admin_token")?.value;
  return NextResponse.json({ authenticated: token ? verifySessionToken(token) : false }, { headers });
}

export async function DELETE(req: NextRequest) {
  const forbidden = requireSameOrigin(req);
  if (forbidden) return forbidden;
  const response = NextResponse.json({ success: true, message: "Logged out from Edit Mode" }, { headers });
  response.cookies.set("admin_token", "", { ...cookieOptions, maxAge: 0 });
  return response;
}
