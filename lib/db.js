// lib/db.js
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

// Create a connection
export async function getConnection() {
  return await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });
}

// Execute a SELECT query returning multiple rows
export async function allAsync(query, params = []) {
  const conn = await getConnection();
  const [rows] = await conn.execute(query, params);
  await conn.end();
  return rows;
}

// Execute a SELECT query returning a single row
export async function getAsync(query, params = []) {
  const conn = await getConnection();
  const [rows] = await conn.execute(query, params);
  await conn.end();
  return rows[0] || null;
}

// Execute INSERT, UPDATE, DELETE
export async function runAsync(query, params = []) {
  const conn = await getConnection();
  const [result] = await conn.execute(query, params);
  await conn.end();
  return result;
}
