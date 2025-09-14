// scripts/seed-users.js
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const users = [
  {
    name: "Acme Admin",
    email: "admin@acme.test",
    password: await bcrypt.hash("password", 10),
    role: "admin",
    tenant_id: 1,
    tenant: "Acme",
  },
  {
    name: "Acme User",
    email: "user@acme.test",
    password: await bcrypt.hash("password", 10),
    role: "user",
    tenant_id: 1,
    tenant: "Acme",
  },
  {
    name: "Globex Admin",
    email: "admin@globex.test",
    password: await bcrypt.hash("password", 10),
    role: "admin",
    tenant_id: 2,
    tenant: "Globex",
  },
  {
    name: "Globex User",
    email: "user@globex.test",
    password: await bcrypt.hash("password", 10),
    role: "user",
    tenant_id: 2,
    tenant: "Globex",
  },
];

async function seed() {
  try {
    // Connect to MySQL
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      port: process.env.MYSQL_PORT,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    });

    console.log("✅ Connected to MySQL");

    // Get tenant IDs
    const [tenants] = await connection.query("SELECT * FROM tenants");
    const tenantMap = {};
    tenants.forEach((t) => (tenantMap[t.name] = t.id));

    // Insert users
    for (let user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await connection.query(
  "INSERT INTO users (name, email, password, role, tenant_id, tenant) VALUES (?, ?, ?, ?, ?, ?)",
  [user.name, user.email, user.password, user.role, user.tenant_id, user.tenant]
);

      console.log(`✅ Created user: ${user.email}`);
    }

    await connection.end();
    console.log("🎉 Seeding completed!");
  } catch (err) {
    console.error("❌ Seeding error:", err);
  }
}

seed();
