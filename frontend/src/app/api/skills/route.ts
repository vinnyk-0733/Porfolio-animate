import { NextRequest, NextResponse } from "next/server";
import { checkEditPassword } from "@/lib/edit-password";
import { getSkillsData, updateSkillsData } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const data = await getSkillsData();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load skills", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const passwordFailure = await checkEditPassword(req);
  if (passwordFailure) return passwordFailure;

  try {
    const body = await req.json();
    const updated = await updateSkillsData(body);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update skills", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
