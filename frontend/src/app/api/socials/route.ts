import { NextRequest, NextResponse } from "next/server";
import { getSocialsData, updateSocialsData } from "@/lib/db";
import { SocialItem } from "@/lib/default-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const data = await getSocialsData();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to load socials data", details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body: SocialItem[] = await req.json();
    if (!Array.isArray(body)) {
      return NextResponse.json({ error: "Expected an array of social items" }, { status: 400 });
    }
    const updated = await updateSocialsData(body);
    return NextResponse.json({ success: true, count: updated.length, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to update socials data", details: error.message },
      { status: 500 }
    );
  }
}
