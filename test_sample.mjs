import sql from 'mssql';
import dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.AZURE_SQL_CONNECTION_STRING;

async function fetchSample() {
  try {
    const pool = await sql.connect(connectionString);
    const result = await pool.request().query(`
      SELECT TOP 1
        c.ECOFNo,
        c.MCOFNo,
        c.FullName,
        c.IDNumber,
        c.Employer,
        c.IsFit,
        c.MedicalOfficer,
        c.OMP,
        c.COFDate,
        c.COFExpDate,
        m.JobTitle
      FROM Tbl_COF c
      LEFT JOIN MClients m ON c.IDNumber = m.IDNumber
      WHERE c.IDNumber = 'FN345023'
      ORDER BY c.COFDate DESC
    `);
    console.log(JSON.stringify(result.recordset, null, 2));
    await sql.close();
  } catch (err) {
    console.error("Database connection failed:", err);
  }
}

fetchSample();
