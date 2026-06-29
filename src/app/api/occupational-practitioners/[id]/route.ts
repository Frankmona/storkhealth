import { NextResponse } from "next/server";
import { patchToDataverse, deleteFromDataverse } from "@/lib/dataverse";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    if (!body.fullName) {
      return NextResponse.json({ error: "Full name is required" }, { status: 400 });
    }

    const payload = {
      "yips_fullname": body.fullName
    };

    const result = await patchToDataverse(`yips_occupationalmedicalpractioners(${id})`, payload);
    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (error) {
    console.error("Error updating occupational practitioner:", error);
    return NextResponse.json({ error: "Failed to update occupational practitioner" }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    await deleteFromDataverse(`yips_occupationalmedicalpractioners(${id})`);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting occupational practitioner:", error);
    return NextResponse.json({ error: "Failed to delete occupational practitioner" }, { status: 500 });
  }
}
