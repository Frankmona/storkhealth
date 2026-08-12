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
    const query = "yips_verificationhistories?$select=yips_certificatenumber,yips_verifiedat,yips_verificationreference,yips_name&$orderby=yips_verifiedat desc";
    const data = await fetchFromDataverse(query);
    return NextResponse.json({ success: true, data: data?.value || [] });
  } catch (error) {
    console.error("Failed to fetch verification histories", error);
    return NextResponse.json({ error: "Failed to fetch verification histories" }, { status: 500 });
  }
}
