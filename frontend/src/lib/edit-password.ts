import crypto from "node:crypto";
import { promisify } from "node:util";
import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

const pbkdf2 = promisify(crypto.pbkdf2);
export type PasswordResult = "correct" | "incorrect" | "unavailable" | "not-set";

// Compare only the supplied password with the saved password. No accounts,
// roles, session cookies, signing keys, or credential-version gates are needed.
export async function checkPassword(password: string): Promise<PasswordResult> {
  if (typeof password !== "string" || !password || Buffer.byteLength(password) > 1024) return "incorrect";
  try {
    const db = await getDatabase();
    if (!db) return "unavailable";
    const saved = await db.collection("admin_auth").findOne({ username: "admin" });
    if (!saved || typeof saved.hash !== "string" || !/^[a-f0-9]{128}$/i.test(saved.hash)
      || typeof saved.salt !== "string" || !/^[a-f0-9]{32}$/i.test(saved.salt)) return "not-set";
    // Older saved passwords used 10,000 iterations without an iterations field.
    const iterations = saved.iterations ?? 10000;
    if (iterations !== 10000 && iterations !== 210000) return "not-set";
    const candidate = await pbkdf2(password, saved.salt, iterations, 64, "sha512");
    return crypto.timingSafeEqual(Buffer.from(saved.hash, "hex"), candidate) ? "correct" : "incorrect";
  } catch {
    return "unavailable";
  }
}

export function checkRequestOrigin(req: NextRequest): NextResponse | null {
  const origin = req.headers.get("origin");
  if (req.headers.get("sec-fetch-site") === "cross-site"
    || (origin !== null && origin !== req.nextUrl.origin)) {
    return NextResponse.json({ success: false, error: "Open edit mode from this website." }, { status: 403 });
  }
  return null;
}

export function passwordError(result: Exclude<PasswordResult, "correct">, status?: number): NextResponse {
  const error = result === "incorrect" ? "Incorrect password."
    : result === "not-set" ? "No edit password is saved in this database. Set it using the password setup script."
      : "Cannot connect to the database. Please try again or check the website's database connection.";
  return NextResponse.json({ success: false, error, code: result }, {
    status: status ?? (result === "incorrect" ? 403 : 503),
    headers: { "Cache-Control": "no-store" },
  });
}

// Every save uses the same password check as the unlock button.
export async function checkEditPassword(req: NextRequest): Promise<NextResponse | null> {
  const originError = checkRequestOrigin(req);
  if (originError) return originError;
  const encoded = req.headers.get("x-edit-password");
  if (!encoded || encoded.length > 1368 || !/^[A-Za-z0-9+/]+={0,2}$/.test(encoded)) {
    return NextResponse.json({ success: false, error: "Enter your password to enable edit mode.", code: "password-required" }, { status: 400 });
  }
  const result = await checkPassword(Buffer.from(encoded, "base64").toString("utf8"));
  return result === "correct" ? null : passwordError(result);
}
