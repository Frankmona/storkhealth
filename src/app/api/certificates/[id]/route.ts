import { NextResponse } from "next/server";
import { fetchFromDataverse, patchToDataverse, deleteFromDataverse, postToDataverse } from "@/lib/dataverse";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    
    const query = `yips_certificateses(${id})?$select=yips_certificatesid,yips_certificatename,yips_holderfullname,yips_nationalidpassport,yips_companyname,yips_certificatestatus,yips_issuedate,yips_expirydate&$expand=yips_MedicalOfficer,yips_OccupationalMedicalPractitioner`;
    
    const result = await fetchFromDataverse(query);
    
    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (error) {
    console.error(`Certificate GET [id] Error:`, error);
    return NextResponse.json({ error: "Failed to fetch certificate" }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();



    const dataversePayload: any = {};

    
    if (body.fullName !== undefined) dataversePayload["yips_holderfullname"] = body.fullName;
    if (body.nationalId !== undefined) dataversePayload["yips_nationalidpassport"] = body.nationalId;
    if (body.companyName !== undefined) dataversePayload["yips_companyname"] = body.companyName;
    if (body.status !== undefined) dataversePayload["yips_certificatestatus"] = parseInt(body.status, 10);
    if (body.issueDate !== undefined) dataversePayload["yips_issuedate"] = new Date(body.issueDate).toISOString();
    if (body.expiryDate !== undefined) dataversePayload["yips_expirydate"] = new Date(body.expiryDate).toISOString();
    if (body.medicalType !== undefined) dataversePayload["yips_medicaltype"] = parseInt(body.medicalType, 10);
    if (body.comments !== undefined) dataversePayload["yips_comments"] = body.comments;

    if (body.medicalOfficerId !== undefined) {
      if (body.medicalOfficerId === null) {
         // Handle null
      } else {
        dataversePayload["yips_MedicalOfficer@odata.bind"] = `/yips_medicalofficerses(${body.medicalOfficerId})`;
      }
    }

    if (body.occupationalPractitionerId !== undefined && body.occupationalPractitionerId !== null) {
       dataversePayload["yips_OccupationalMedicalPractitioner@odata.bind"] = `/yips_occupationalmedicalpractioners(${body.occupationalPractitionerId})`;
    }

    const result = await patchToDataverse("yips_certificateses", id, dataversePayload, body.callerId);

    // Write to audit trail
    try {
      const auditPayload: any = {
        "yips_eventname": "Certificate updated::" + (body.userName || "System"),
        "yips_eventtype": 341150001,
        "yips_Certificate@odata.bind": `/yips_certificateses(${id})`
      };
      await postToDataverse("yips_audittrails", auditPayload, body.callerId);
    } catch (auditError) {
      console.error("Failed to write audit trail for Certificate Update:", auditError);
    }

    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (error) {
    console.error(`Certificate PATCH [id] Error:`, error);
    return NextResponse.json({ error: "Failed to update certificate" }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: any) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const userName = searchParams.get("userName") || "System";
    const certName = searchParams.get("certName") || "Certificate";

    const result = await deleteFromDataverse("yips_certificateses", id);

    // Write to audit trail
    try {
      // NOTE: We do not bind to the certificate here because the certificate is now deleted
      // and binding to a non-existent GUID will fail.
      const auditPayload: any = {
        "yips_eventname": "Certificate deleted::" + userName + "::" + certName,
        "yips_eventtype": 341150002
      };
      await postToDataverse("yips_audittrails", auditPayload);
    } catch (auditError) {
      console.error("Failed to write audit trail for Certificate Delete:", auditError);
    }

    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (error) {
    console.error(`Certificate DELETE [id] Error:`, error);
    return NextResponse.json({ error: "Failed to delete certificate" }, { status: 500 });
  }
}
