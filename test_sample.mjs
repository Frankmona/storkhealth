import sql from 'mssql';
import dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.AZURE_SQL_CONNECTION_STRING;

async function fetchSample() {
  try {
    const pool = await sql.connect(connectionString);
    const result = await pool.request().query(`
      SELECT TOP 5 ECOFNo, MCOFNo, IDNumber, FullName 
      FROM Tbl_COF 
      ORDER BY ID DESC
    `);
    console.log(JSON.stringify(result.recordset, null, 2));
    await sql.close();
  } catch (err) {
    console.error("Database connection failed:", err);
  }
}

fetchSample();
