import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { getCertificationsData, updateCertificationsData } from "@/lib/db";
import { CertificationItem } from "@/lib/default-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const data = await getCertificationsData();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load certifications", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  try {
    const body: CertificationItem[] = await req.json();
    if (!Array.isArray(body)) {
      return NextResponse.json({ error: "Expected an array of certifications" }, { status: 400 });
    }
    const updated = await updateCertificationsData(body);
    return NextResponse.json({ success: true, count: updated.length, data: updated });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update certifications", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
