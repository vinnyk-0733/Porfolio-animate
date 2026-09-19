import { NextRequest, NextResponse } from "next/server";
import { seedDatabase } from "@/lib/db";
import { checkEditPassword } from "@/lib/edit-password";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  const passwordFailure = await checkEditPassword(req);
  if (passwordFailure) return passwordFailure;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Expected a valid JSON object" },
      { status: 400 }
    );
  }

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json(
      { success: false, error: "Expected a JSON object" },
      { status: 400 }
    );
  }

  if ("force" in body && typeof body.force !== "boolean") {
    return NextResponse.json(
      { success: false, error: "force must be a boolean" },
      { status: 400 }
    );
  }

  const force = "force" in body && body.force === true;

  try {
    const result = await seedDatabase(force);
    return NextResponse.json({
      success: true,
      message: "Database seed operation completed",
      details: result,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to seed database" },
      { status: 500 }
    );
  }
}
