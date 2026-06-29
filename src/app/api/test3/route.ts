import { NextResponse } from "next/server";
import { fetchFromDataverse } from "@/lib/dataverse";
export async function GET() {
  try {
    const res = await fetchFromDataverse("EntityDefinitions(LogicalName='yips_certificates')/Attributes/Microsoft.Dynamics.CRM.LookupAttributeMetadata?$select=LogicalName,SchemaName,Targets");
    
    const lookups = res.value.filter((a: any) => 
      a.LogicalName.includes("medical") || a.LogicalName.includes("practitioner") || a.LogicalName.includes("practioner")
    );
    
    return NextResponse.json(lookups);
  } catch (e: any) {
    return NextResponse.json({error: e.message}, {status: 500});
  }
}
