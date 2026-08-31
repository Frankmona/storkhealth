import { NextResponse } from "next/server";
import { postToDataverse, fetchFromDataverse } from "@/lib/dataverse";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();



    // Fetch the latest SH- certificate to determine the next increment
    let nextIdNumber = 1;
    try {
      const latestCertQuery = "yips_certificateses?$select=yips_certificatename&$filter=startswith(yips_certificatename, 'SH-')&$orderby=createdon desc&$top=1";
      const latestCertResult = await fetchFromDataverse(latestCertQuery);
      if (latestCertResult?.value && latestCertResult.value.length > 0) {
        const latestName = latestCertResult.value[0].yips_certificatename;
        if (latestName && latestName.startsWith("SH-")) {
          const numPart = parseInt(latestName.substring(3), 10);
          if (!isNaN(numPart)) {
            nextIdNumber = numPart + 1;
          }
        }
      }
    } catch (err) {
      console.error("Error fetching latest certificate for increment:", err);
      // Fallback to 1 or you could throw an error to prevent duplicates
    }

    const uniqueId = `SH-${nextIdNumber.toString().padStart(4, '0')}`;

    // Map the incoming form data to the precise Dataverse logical names
    const dataversePayload: any = {
      // Use the new incremental ID
      "yips_certificatename": uniqueId,
      "yips_certificatenumber": body.certificateNumber,
      "yips_workas": body.workAs,
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

import { queryAzureSql } from "@/lib/azuresql";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter");
    
    // We ignore the Dataverse filter and just fetch the top 200 from Azure SQL for now
    const queryStr = `
      SELECT TOP 200
        c.ID as id,
        COALESCE(c.ECOFNo, CAST(c.MCOFNo AS nvarchar)) AS CertNumber,
        c.FullName,
        c.IDNumber,
        c.Employer,
        c.Status,
        c.MedicalOfficer,
        c.OMP,
        c.COFDate,
        c.COFExpDate,
        c.WorkAs
      FROM Tbl_COF c
      ORDER BY c.ID DESC
    `;
    
    const data = await queryAzureSql(queryStr);
    
    const mappedValue = (data.recordset || []).map((row: any) => ({
        yips_certificatesid: row.id ? row.id.toString() : Math.random().toString(),
        yips_certificatename: `SH-${row.CertNumber || row.id}`,
        yips_certificatenumber: row.CertNumber,
        yips_workas: row.WorkAs || '',
        yips_holderfullname: row.FullName,
        yips_nationalidpassport: row.IDNumber,
        yips_companyname: row.Employer,
        yips_certificatestatus: row.Status === 'Fit' ? 341150000 : (row.Status === 'Revoked' ? 341150002 : 341150001),
        yips_issuedate: row.COFDate,
        yips_expirydate: row.COFExpDate,
        createdon: row.COFDate || new Date().toISOString(),
        yips_MedicalOfficer: row.MedicalOfficer ? { yips_fullname: row.MedicalOfficer } : null,
        yips_OccupationalMedicalPractitioner: row.OMP ? { yips_fullname: row.OMP } : null,
    }));
    
    return NextResponse.json({ success: true, data: mappedValue }, { status: 200 });
  } catch (error) {
    console.error("Certificate GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch certificates" }, { status: 500 });
  }
}
