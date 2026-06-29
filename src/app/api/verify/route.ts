import { NextResponse } from "next/server";
import { fetchFromDataverse, postToDataverse } from "@/lib/dataverse";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const certNum = searchParams.get("certNum");
  const nin = searchParams.get("nin");

  if (!certNum || !nin) {
    return NextResponse.json({ error: "Certificate number and NIN are required" }, { status: 400 });
  }

  try {
    // The exact table name and column names provided by user
    const query = `yips_certificateses?$select=yips_certificatesid,yips_certificatename,yips_holderfullname,yips_nationalidpassport,yips_certificatestatus,yips_issuedate,yips_expirydate&$filter=yips_certificatename eq '${certNum}' and yips_nationalidpassport eq '${nin}'&$expand=yips_MedicalOfficer($select=yips_fullname)`;
    
    const data = await fetchFromDataverse(query);

    if (data && data.value && data.value.length > 0) {
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
      return NextResponse.json(data.value[0]);
    } else {
      // Not found
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Verification API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
