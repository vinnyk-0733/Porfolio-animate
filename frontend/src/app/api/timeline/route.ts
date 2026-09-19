import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { getTimelineData, updateTimelineData } from "@/lib/db";
import { TimelineSectionItem } from "@/lib/default-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const data = await getTimelineData();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load timeline data", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const unauthorized = await requireAdmin(req);
  if (unauthorized) return unauthorized;

  try {
    const body: TimelineSectionItem[] = await req.json();
    if (!Array.isArray(body)) {
      return NextResponse.json({ error: "Expected an array of timeline items" }, { status: 400 });
    }
    const updated = await updateTimelineData(body);
    return NextResponse.json({ success: true, count: updated.length, data: updated });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update timeline data", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
