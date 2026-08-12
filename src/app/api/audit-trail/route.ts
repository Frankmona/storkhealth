import { NextResponse } from "next/server";
import { fetchFromDataverse } from "@/lib/dataverse";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const result = await fetchFromDataverse("yips_audittrails?$expand=yips_Certificate($select=yips_certificatenumber)&$orderby=createdon desc");
    return NextResponse.json({ success: true, data: result?.value || [] }, { status: 200 });
  } catch (error) {
    console.error("Error fetching audit trail:", error);
    return NextResponse.json({ error: "Failed to fetch audit trail" }, { status: 500 });
  }
}
