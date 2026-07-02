import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { fetchFromDataverse } from "@/lib/dataverse";
import AdminDashboardClient from "./AdminDashboardClient";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/admin/login");
  }

  const stats = { total: 0, fit: 0, unfit: 0, revoked: 0 };
  
  try {
    const today = new Date().toISOString();
    
    const [totalRes, fitRes, unfitRes, revokedRes] = await Promise.all([
      fetchFromDataverse("yips_certificateses?$count=true&$top=1"),
      fetchFromDataverse("yips_certificateses?$count=true&$top=1&$filter=yips_certificatestatus eq 341150000"),
      fetchFromDataverse("yips_certificateses?$count=true&$top=1&$filter=yips_certificatestatus eq 341150001"),
      fetchFromDataverse("yips_certificateses?$count=true&$top=1&$filter=yips_certificatestatus eq 341150002")
    ]);

    stats.total = totalRes["@odata.count"] || 0;
    stats.fit = fitRes["@odata.count"] || 0;
    stats.unfit = unfitRes["@odata.count"] || 0;
    stats.revoked = revokedRes["@odata.count"] || 0;
  } catch (error) {
    console.error("Failed to fetch certificate stats:", error);
  }

  return <AdminDashboardClient session={session} stats={stats} />;
}
