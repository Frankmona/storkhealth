import { NextResponse } from "next/server";
import { postToDataverse, fetchFromDataverse } from "@/lib/dataverse";

export async function POST(request: Request) {
  try {
    const body = await request.json();



    // Map the incoming form data to the precise Dataverse logical names
    const dataversePayload: any = {
      // If Dataverse auto-generates this, we could omit it. 
      // For safety, we generate a mock ID if it is the primary required field.
      "yips_certificatename": `STK-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
      "yips_holderfullname": body.fullName,
      "yips_nationalidpassport": body.nationalId,
      "yips_companyname": body.companyName,
      "yips_certificatestatus": parseInt(body.status, 10),
      "yips_issuedate": new Date(body.issueDate).toISOString(),
      "yips_expirydate": new Date(body.expiryDate).toISOString(),
    };

    if (body.medicalType) {
      dataversePayload["yips_medicaltype"] = parseInt(body.medicalType, 10);
    }
    
    if (body.comments) {
      dataversePayload["yips_comments"] = body.comments;
    }

    // Lookup fields require @odata.bind with the plural entity set name and GUID
    // Example: "yips_MedicalOfficer@odata.bind": "/yips_medicalofficerses(GUID)"
    if (body.medicalOfficerId) {
       dataversePayload["yips_MedicalOfficer@odata.bind"] = `/yips_medicalofficerses(${body.medicalOfficerId})`;
    }

    if (body.occupationalPractitionerId) {
       dataversePayload["yips_OccupationalMedicalPractitioner@odata.bind"] = `/yips_occupationalmedicalpractioners(${body.occupationalPractitionerId})`;
    }

    // entity set name is typically plural of the table name
    const result = await postToDataverse("yips_certificateses", dataversePayload, body.callerId);

    // Write to audit trail
    try {
      const certificateId = result?.yips_certificatesid || result?.id; // depending on what postToDataverse returns
      const auditPayload: any = {
        "yips_eventname": "Certificate created::" + (body.userName || "System"),
        "yips_eventtype": 341150000,
      };
      
      if (certificateId) {
        auditPayload["yips_Certificate@odata.bind"] = `/yips_certificateses(${certificateId})`;
      }
      
      await postToDataverse("yips_audittrails", auditPayload, body.callerId);
    } catch (auditError) {
      console.error("Failed to write audit trail for Certificate Creation:", auditError);
      // We don't fail the certificate creation if audit fails
    }

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    console.error("Certificate POST Error:", error);
    return NextResponse.json({ error: "Failed to create certificate" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter");
    
    let query = "yips_certificateses?$select=yips_certificatesid,yips_certificatename,yips_holderfullname,yips_nationalidpassport,yips_companyname,yips_certificatestatus,yips_issuedate,yips_expirydate&$expand=createdby($select=fullname),yips_MedicalOfficer,yips_OccupationalMedicalPractitioner";
    
    if (filter) {
      query += `&$filter=${filter}`;
    }
    
    const result = await fetchFromDataverse(query);
    
    return NextResponse.json({ success: true, data: result.value }, { status: 200 });
  } catch (error) {
    console.error("Certificate GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch certificates" }, { status: 500 });
  }
}
