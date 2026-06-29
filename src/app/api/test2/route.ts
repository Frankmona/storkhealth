import { NextResponse } from "next/server";
import { fetchFromDataverse } from "@/lib/dataverse";
export async function GET() {
  try {
    const res1 = await fetchFromDataverse("yips_medicalofficerses?$top=1");
    const res2 = await fetchFromDataverse("yips_occupationalmedicalpractioners?$top=1");
    return NextResponse.json({
      mo: res1.value[0],
      op: res2.value[0]
    });
  } catch (e: any) {
    return NextResponse.json({error: e.message}, {status: 500});
  }
}
