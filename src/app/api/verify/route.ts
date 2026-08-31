import { NextResponse } from "next/server";
import { queryAzureSql } from "@/lib/azuresql";
import { postToDataverse } from "@/lib/dataverse";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const certNum = searchParams.get("certNum");
  const nin = searchParams.get("nin");

  if (!certNum || !nin) {
    return NextResponse.json({ error: "Certificate number and NIN are required" }, { status: 400 });
  }

  try {
    const query = `
      SELECT TOP 1
        COALESCE(c.ECOFNo, CAST(c.MCOFNo AS nvarchar)) AS CertNumber,
        c.FullName,
        c.IDNumber,
        c.Employer,
        c.Status,
        c.MedicalOfficer,
        c.OMP,
        c.COFDate,
        c.COFExpDate,
        c.WorkAs,
        c.TypeOfMedical
      FROM Tbl_COF c
      WHERE (c.ECOFNo = @certNum OR CAST(c.MCOFNo AS nvarchar) = @certNum) AND c.IDNumber = @nin
      ORDER BY c.COFDate DESC
    `;
    
    const data = await queryAzureSql(query, { certNum, nin });

    if (data && data.recordset && data.recordset.length > 0) {
      const row = data.recordset[0];
      
      // Map Azure SQL row to the Dataverse JSON structure the frontend expects
      const mappedResult = {
        yips_certificatenumber: row.CertNumber,
        yips_holderfullname: row.FullName,
        yips_nationalidpassport: row.IDNumber,
        yips_companyname: row.Employer,
        yips_workas: row.WorkAs || '',
        yips_typeofmedical: row.TypeOfMedical || '',
        yips_certificatestatus: row.Status === 'Fit' ? 341150000 : (row.Status === 'Revoked' ? 341150002 : 341150001), // 341150000 = FIT, 341150001 = UNFIT, 341150002 = REVOKED
        yips_issuedate: row.COFDate,
        yips_expirydate: row.COFExpDate,
        yips_MedicalOfficer: {
          yips_fullname: row.MedicalOfficer
        },
        yips_OccupationalMedicalPractitioner: {
          yips_fullname: row.OMP
        }
      };

      // Log the verification asynchronously
      try {
        postToDataverse("yips_verificationhistories", {
          "yips_certificatenumber": certNum,
          "yips_verificationreference": nin,
          "yips_verifiedat": new Date().toISOString(),
          "yips_name": `Verification for ${certNum}`
        }).catch(err => console.error("Failed to async log verification history:", err));
      } catch(e) {}

      // Found the certificate
      return NextResponse.json(mappedResult);
    } else {
      // Not found
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Verification API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
