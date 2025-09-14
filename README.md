# Multi-Tenant Notes SaaS (Next.js) — MySQL edition

This repo is the MySQL-backed version of the Multi-Tenant Notes SaaS app.

## Key changes
- Replaced SQLite with MySQL (mysql2) and connection pooling.
- Use environment variables to configure MySQL connection.
- Project seeds required tenants and users on first run.

## Environment
Copy `.env.example` → `.env.local` and update:
```
JWT_SECRET=your_jwt_secret
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=example
MYSQL_DATABASE=notes_saas
```

## Run locally
1. Ensure MySQL server is running and a database named `notes_saas` exists, or create it:
   ```sql
   CREATE DATABASE notes_saas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Start dev server:
   ```
   npm run dev
   ```
4. The app will create tables and seed tenants/users automatically on first API call.

## Deploying to Vercel
- Set environment variables in Vercel (`JWT_SECRET`, `MYSQL_*`).
- Use a managed MySQL service (PlanetScale, AWS RDS, PlanetScale recommended for serverless).
- For PlanetScale, make sure to enable `non-strict` mode if using DDL from the app, or run migrations externally.

## API
- `POST /api/auth/login` — login
- `GET /api/health` — health
- Notes CRUD endpoints — tenant-isolated
- `POST /api/tenants/:slug/upgrade` — Admin-only upgrade endpoint
- `POST /api/invite` — Admin-only invite (creates user with `password`)

## Test accounts
- admin@acme.test / password (admin, tenant acme)
- user@acme.test / password (member, tenant acme)
- admin@globex.test / password (admin, tenant globex)
- user@globex.test / password (member, tenant globex)

