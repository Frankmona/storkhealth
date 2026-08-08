import sql from 'mssql';

const sqlConfig = {
  connectionString: process.env.AZURE_SQL_CONNECTION_STRING,
};

let poolPromise: Promise<sql.ConnectionPool> | null = null;

export async function getAzureSqlPool(): Promise<sql.ConnectionPool> {
  if (!process.env.AZURE_SQL_CONNECTION_STRING) {
    throw new Error('AZURE_SQL_CONNECTION_STRING environment variable is not set');
  }

  if (!poolPromise) {
    poolPromise = sql.connect(process.env.AZURE_SQL_CONNECTION_STRING)
      .then(pool => {
        console.log('Connected to Azure SQL Database');
        return pool;
      })
      .catch(err => {
        console.error('Database Connection Failed! Bad Config: ', err);
        poolPromise = null;
        throw err;
      });
  }
  return poolPromise;
}

export async function queryAzureSql(query: string, params?: { [key: string]: any }) {
  try {
    const pool = await getAzureSqlPool();
    const request = pool.request();
    
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        request.input(key, value);
      }
    }

    const result = await request.query(query);
    return result;
  } catch (err) {
    console.error('Azure SQL Query Error:', err);
    throw err;
  }
}
