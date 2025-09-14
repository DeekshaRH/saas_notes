import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

export async function getConnection() {
  return await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });
}

// Execute a query that returns multiple rows
export async function allAsync(query, params = []) {
  const conn = await getConnection();
  const [rows] = await conn.execute(query, params);
  await conn.end();
  return rows;
}

// Execute a query that returns a single row
export async function getAsync(query, params = []) {
  const rows = await allAsync(query, params);
  return rows[0] || null;
}

// Execute a query that modifies data (INSERT, UPDATE, DELETE)
export async function runAsync(query, params = []) {
  const conn = await getConnection();
  const [result] = await conn.execute(query, params);
  await conn.end();
  return result;
}
