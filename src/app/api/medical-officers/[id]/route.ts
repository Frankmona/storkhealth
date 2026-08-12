import { NextResponse } from "next/server";
import { patchToDataverse, deleteFromDataverse } from "@/lib/dataverse";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();

    if (!body.fullName) {
      return NextResponse.json({ error: "Full name is required" }, { status: 400 });
    }

    const payload = {
      "yips_fullname": body.fullName
    };

    const result = await patchToDataverse("yips_medicalofficerses", id, payload);
    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (error) {
    console.error("Error updating medical officer:", error);
    return NextResponse.json({ error: "Failed to update medical officer" }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    await deleteFromDataverse("yips_medicalofficerses", id);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting medical officer:", error);
    return NextResponse.json({ error: "Failed to delete medical officer" }, { status: 500 });
  }
}
