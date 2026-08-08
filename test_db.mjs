import sql from 'mssql';
import dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.AZURE_SQL_CONNECTION_STRING;

async function checkDatabase() {
  try {
    // Check if the connection string exists
    if (!connectionString) {
      console.error("AZURE_SQL_CONNECTION_STRING is not set in .env");
      return;
    }

    console.log("Connecting to Azure SQL Database...");
    
    // Connect to the database
    const pool = await sql.connect(connectionString);
    console.log("Connected successfully!");

    // Query all tables and columns
    console.log("\nFetching tables and columns...");
    const result = await pool.request().query(`
      SELECT 
        t.name AS TableName,
        c.name AS ColumnName,
        ty.name AS DataType
      FROM sys.tables t
      INNER JOIN sys.columns c ON t.object_id = c.object_id
      INNER JOIN sys.types ty ON c.user_type_id = ty.user_type_id
      WHERE t.is_ms_shipped = 0
      ORDER BY t.name, c.column_id;
    `);

    // Format output
    const tables = {};
    result.recordset.forEach(row => {
      if (!tables[row.TableName]) {
        tables[row.TableName] = [];
      }
      tables[row.TableName].push(`${row.ColumnName} (${row.DataType})`);
    });

    console.log("\n=== DATABASE SCHEMA ===");
    for (const [tableName, columns] of Object.entries(tables)) {
      console.log(`\nTable: ${tableName}`);
      console.log(`Columns: \n  - ${columns.join('\n  - ')}`);
    }

    await sql.close();
  } catch (err) {
    console.error("Database connection failed:", err);
  }
}

checkDatabase();
