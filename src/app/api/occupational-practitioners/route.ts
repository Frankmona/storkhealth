import { NextResponse } from "next/server";
import { fetchFromDataverse } from "@/lib/dataverse";

export async function GET() {
  try {
    const query = "yips_occupationalmedicalpractioners"; 
    
    const result = await fetchFromDataverse(query);
    
    return NextResponse.json({ success: true, data: result.value }, { status: 200 });
  } catch (error: any) {
    console.error("Occ Practitioner GET Error:", error);
    
    try {
      const fallbackResult = await fetchFromDataverse("yips_occupationalmedicalpractionerses");
      return NextResponse.json({ success: true, data: fallbackResult.value }, { status: 200 });
    } catch (fallbackError) {
      return NextResponse.json({ error: "Failed to fetch occupational practitioners" }, { status: 500 });
    }
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.fullName) {
      return NextResponse.json({ error: "Full name is required" }, { status: 400 });
    }

    const payload = {
      "yips_fullname": body.fullName
    };

    const { postToDataverse } = await import("@/lib/dataverse");
    const result = await postToDataverse("yips_occupationalmedicalpractioners", payload);
    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    console.error("Error creating occupational practitioner:", error);
    return NextResponse.json({ error: "Failed to create occupational practitioner" }, { status: 500 });
  }
}
