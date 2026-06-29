import { NextResponse } from "next/server";
import { fetchFromDataverse } from "@/lib/dataverse";

export async function GET() {
  try {
    const result = await fetchFromDataverse("yips_audittrails?$orderby=createdon desc");
    return NextResponse.json({ success: true, data: result?.value || [] }, { status: 200 });
  } catch (error) {
    console.error("Error fetching audit trail:", error);
    return NextResponse.json({ error: "Failed to fetch audit trail" }, { status: 500 });
  }
}
