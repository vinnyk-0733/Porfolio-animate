import { NextRequest, NextResponse } from "next/server";
import { getProjectsData, updateProjectsData } from "@/lib/db";
import { ProjectItem } from "@/lib/default-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const data = await getProjectsData();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to load projects", details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body: ProjectItem[] = await req.json();
    if (!Array.isArray(body)) {
      return NextResponse.json({ error: "Expected an array of projects" }, { status: 400 });
    }
    const updated = await updateProjectsData(body);
    return NextResponse.json({ success: true, count: updated.length, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to update projects", details: error.message },
      { status: 500 }
    );
  }
}
