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
      keepAliveInitialDelay: 0,
      connectTimeout: 10000,
    });

    // ✅ Listen for pool errors to prevent unhandled rejections crashing the pool
    pool.on('connection', (conn) => {
      conn.on('error', (err) => {
        console.error('MySQL connection error:', err.code);
      });
    });
  }
  return pool;
}

async function resetPool() {
  if (isResetting) return; // ✅ prevent concurrent resets
  isResetting = true;
  try {
    if (pool) {
      await pool.end(); // ✅ properly await before nulling
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
    // ✅ Wait if a reset is in progress
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
        err.code === 'ECONNRESET' ||
        err.code === 'ECONNREFUSED' ||
        err.code === 'PROTOCOL_CONNECTION_LOST' ||
        err.code === 'ETIMEDOUT' ||
        err.message === 'Pool is closed.'; // ✅ catch this specific error

      if (isConnectionError && attempt < maxRetries - 1) {
        await resetPool(); // ✅ now properly awaited
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