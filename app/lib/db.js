// TiDB connection via mysql2
// Uses individual env vars from .env.local:
//   DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT, DB_SSL

import mysql from 'mysql2/promise';

let pool = null;

function getPool() {
  if (!process.env.DB_HOST) {
    return null;
  }

  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      port: parseInt(process.env.DB_PORT || '4000'),
      ssl: process.env.DB_SSL === 'true' ? { minVersion: 'TLSv1.2', rejectUnauthorized: false } : undefined,
      waitForConnections: true,
      connectionLimit: 5,
      idleTimeout: 60000,
    });
  }

  return pool;
}

export async function query(sql, params = []) {
  const p = getPool();
  if (!p) return null;

  try {
    const [rows] = await p.execute(sql, params);
    return rows;
  } catch (e) {
    console.error('TiDB query error:', e);
    throw e;
  }
}

// Initialize tables (call once on first API request)
let tablesInitialized = false;

export async function initTables() {
  const p = getPool();
  if (!p) return false;
  if (tablesInitialized) return true;

  try {
    await p.execute(`
      CREATE TABLE IF NOT EXISTS transactions (
        id VARCHAR(36) PRIMARY KEY,
        type ENUM('income', 'expense') NOT NULL,
        amount DECIMAL(12,2) NOT NULL,
        category VARCHAR(50) NOT NULL,
        description VARCHAR(255),
        date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await p.execute(`
      CREATE TABLE IF NOT EXISTS budgets (
        id VARCHAR(36) PRIMARY KEY,
        category VARCHAR(50) NOT NULL UNIQUE,
        monthly_limit DECIMAL(12,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    tablesInitialized = true;
    return true;
  } catch (e) {
    console.error('Failed to initialize tables:', e);
    throw e;
  }
}
