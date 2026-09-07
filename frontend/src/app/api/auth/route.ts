import { NextRequest, NextResponse } from "next/server";
import { authenticateAdmin, generateSessionToken, verifySessionToken } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const password = body.password || "";

    if (!password) {
      return NextResponse.json({ success: false, error: "Password is required" }, { status: 400 });
    }

    const isValid = await authenticateAdmin(password);
    if (!isValid) {
      return NextResponse.json({ success: false, error: "Invalid password" }, { status: 401 });
    }

    const token = generateSessionToken();
    const response = NextResponse.json({
      success: true,
      message: "Authentication successful. Edit mode enabled.",
      token,
    });

    // Set cookie for 7 days
    response.cookies.set("admin_token", token, {
      httpOnly: false, // Accessible to client-side JS for auth check
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Authentication failed" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Check Authorization header or cookie
    const authHeader = req.headers.get("authorization");
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;
    const cookieToken = req.cookies.get("admin_token")?.value;

    const token = bearerToken || cookieToken;
    const isValid = token ? verifySessionToken(token) : false;

    return NextResponse.json({ authenticated: isValid });
  } catch (error: any) {
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: "Logged out from Edit Mode" });
  response.cookies.delete("admin_token");
  return response;
}
