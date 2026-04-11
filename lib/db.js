import mysql from 'mysql2/promise';

let pool;
let isResetting = false;

export function getDB() {
  if (!pool) {
    pool = mysql.createPool({
      uri: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: true },
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000, // send keepalive ping after 10s idle
      connectTimeout: 10000,
      idleTimeout: 60000,           // recycle idle connections after 60s
                                    // (before the server kills them ~28800s default)
    });

    pool.on('connection', (conn) => {
      conn.on('error', (err) => {
        // This is just a log — the pool handles reconnection automatically
        console.error('MySQL connection error:', err.code);
      });
    });
  }
  return pool;
}

async function resetPool() {
  if (isResetting) return;
  isResetting = true;
  try {
    if (pool) {
      await pool.end();
    }
  } catch (e) {
    console.error('Error closing pool:', e.message);
  } finally {
    pool = null;
    isResetting = false;
  }
}

export async function query(sql, params = []) {
  const maxRetries = 3;
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    if (isResetting) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    try {
      const db = getDB();
      const [rows] = await db.execute(sql, params);
      return rows;
    } catch (err) {
      lastError = err;
      console.error(`Query attempt ${attempt + 1}/${maxRetries} failed:`, {
        code: err.code,
        message: err.message,
        sql: sql.substring(0, 100),
      });

      const isConnectionError =
        err.code === 'ECONNRESET'            ||
        err.code === 'ECONNREFUSED'          ||
        err.code === 'PROTOCOL_CONNECTION_LOST' ||
        err.code === 'ETIMEDOUT'             ||
        err.message === 'Pool is closed.';

      if (isConnectionError && attempt < maxRetries - 1) {
        await resetPool();
        const delay = 150 * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        console.log(`Retrying query after ${delay}ms...`);
        continue;
      }

      throw err;
    }
  }

  throw lastError;
}

export async function closePool() {
  await resetPool();
}