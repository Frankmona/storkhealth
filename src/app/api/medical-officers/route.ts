import { NextResponse } from "next/server";
import { postToDataverse, fetchFromDataverse } from "@/lib/dataverse";

export async function GET(request: Request) {
  try {
    const query = "yips_medicalofficerses?$select=yips_medicalofficersid,yips_fullname";
    const data = await fetchFromDataverse(query);
    return NextResponse.json({ success: true, data: data.value });
  } catch (error) {
    console.error("Error fetching medical officers:", error);
    return NextResponse.json({ error: "Failed to fetch medical officers" }, { status: 500 });
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

    const result = await postToDataverse("yips_medicalofficerses", payload);
    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    console.error("Error creating medical officer:", error);
    return NextResponse.json({ error: "Failed to create medical officer" }, { status: 500 });
  }
}
