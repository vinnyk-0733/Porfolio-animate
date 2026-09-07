import { NextResponse } from "next/server";
import { getAllPortfolioData } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const data = await getAllPortfolioData();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to load portfolio data", details: error.message },
      { status: 500 }
    );
  }
}
