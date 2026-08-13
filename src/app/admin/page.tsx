import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { queryAzureSql } from "@/lib/azuresql";
import AdminDashboardClient from "./AdminDashboardClient";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/admin/login");
  }

  const stats = { total: 0, fit: 0, unfit: 0, revoked: 0 };
  
  try {
    const query = `
      SELECT 
        COUNT(*) as Total,
        SUM(CAST(IsFit AS int)) as Fit,
        SUM(CASE WHEN IsFit = 0 THEN 1 ELSE 0 END) as Unfit
      FROM Tbl_COF
    `;
    
    const data = await queryAzureSql(query);
    if (data && data.recordset && data.recordset.length > 0) {
      const row = data.recordset[0];
      stats.total = row.Total || 0;
      stats.fit = row.Fit || 0;
      stats.unfit = row.Unfit || 0;
      stats.revoked = 0; // Azure DB does not have a revoked status for IsFit
    }
  } catch (error) {
    console.error("Failed to fetch certificate stats:", error);
  }

  return <AdminDashboardClient session={session} stats={stats} />;
}
