import mysql from 'mysql2/promise';

let pool;

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
    });
  }
  return pool;
}

export async function query(sql, params = []) {
  const db = getDB();
  try {
    const [rows] = await db.execute(sql, params);
    return rows;
  } catch (err) {
    if (err.code === 'ECONNRESET' || err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_CONNECTION_LOST') {
      // Retry once
      const [rows] = await db.execute(sql, params);
      return rows;
    }
    throw err;
  }
}