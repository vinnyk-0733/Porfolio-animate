import { NextRequest, NextResponse } from "next/server";
import { checkPassword, checkRequestOrigin, passwordError } from "@/lib/edit-password";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const originError = checkRequestOrigin(req);
  if (originError) return originError;
  const body: unknown = await req.json().catch(() => null);
  const password = body && typeof body === "object" && "password" in body ? body.password : null;
  if (typeof password !== "string" || !password || Buffer.byteLength(password) > 1024) {
    return NextResponse.json({ success: false, error: "Enter a valid password." }, { status: 400 });
  }
  const result = await checkPassword(password);
  if (result !== "correct") return passwordError(result, result === "incorrect" ? 200 : undefined);
  return NextResponse.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
}
