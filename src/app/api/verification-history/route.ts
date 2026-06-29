import { NextResponse } from "next/server";
import { fetchFromDataverse } from "@/lib/dataverse";

export async function GET() {
  try {
    const query = "yips_verificationhistories?$select=yips_certificatenumber,yips_verifiedat,yips_verificationreference,yips_name&$orderby=yips_verifiedat desc";
    const data = await fetchFromDataverse(query);
    return NextResponse.json({ success: true, data: data?.value || [] });
  } catch (error) {
    console.error("Failed to fetch verification histories", error);
    return NextResponse.json({ error: "Failed to fetch verification histories" }, { status: 500 });
  }
}
