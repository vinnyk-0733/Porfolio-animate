import { NextRequest, NextResponse } from "next/server";
import { getCertificationsData, updateCertificationsData } from "@/lib/db";
import { CertificationItem } from "@/lib/default-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const data = await getCertificationsData();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to load certifications", details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body: CertificationItem[] = await req.json();
    if (!Array.isArray(body)) {
      return NextResponse.json({ error: "Expected an array of certifications" }, { status: 400 });
    }
    const updated = await updateCertificationsData(body);
    return NextResponse.json({ success: true, count: updated.length, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to update certifications", details: error.message },
      { status: 500 }
    );
  }
}
