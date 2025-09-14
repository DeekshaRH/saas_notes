import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

let connection;

export async function init() {
  if (!connection) {
    connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      port: process.env.MYSQL_PORT,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    });
  }
  return connection;
}

export async function getConnection() {
  return init(); // reuse init connection
}

export async function allAsync(query, params = []) {
  const conn = await init();
  const [rows] = await conn.execute(query, params);
  return rows;
}

export async function getAsync(query, params = []) {
  const rows = await allAsync(query, params);
  return rows[0];
}

export async function runAsync(query, params = []) {
  const conn = await init();
  const [result] = await conn.execute(query, params);
  return result;
}
