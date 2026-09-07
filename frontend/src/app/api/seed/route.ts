import { NextRequest, NextResponse } from "next/server";
import { seedDatabase } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const force = searchParams.get("force") === "true";
    const result = await seedDatabase(force);
    return NextResponse.json({
      success: true,
      message: "Database seed operation completed",
      details: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const force = Boolean(body.force);
    const result = await seedDatabase(force);
    return NextResponse.json({
      success: true,
      message: "Database seed operation completed",
      details: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
