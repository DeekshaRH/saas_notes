import { getConnection } from '../../../lib/db';
import jwt from 'jsonwebtoken';
const SECRET = process.env.JWT_SECRET || 'supersecret_jwt_key';

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function auth(req) {
  const token = req.headers.authorization;
  if (!token) throw new Error('No token provided');
  return jwt.verify(token, SECRET);
}

// Helper functions for MySQL queries
async function allAsync(query, params) {
  const conn = await getConnection();
  const [rows] = await conn.execute(query, params);
  await conn.end();
  return rows;
}

async function getAsync(query, params) {
  const results = await allAsync(query, params);
  return results[0] || null;
}

async function runAsync(query, params) {
  const conn = await getConnection();
  const [result] = await conn.execute(query, params);
  await conn.end();
  return result;
}

export default async function handler(req, res) {
  cors(res);

  try {
    const user = auth(req);

    if (req.method === 'GET') {
      const notes = await allAsync('SELECT * FROM notes WHERE tenant_slug = ?', [user.tenant]);
      const tenant = await getAsync('SELECT * FROM tenants WHERE slug = ?', [user.tenant]);
      const count = notes.length;
      const limitReached = tenant.plan === 'free' && count >= 3;
      return res.json({ notes, limitReached });

    } else if (req.method === 'POST') {
      const body = req.body;
      if (!['admin', 'member'].includes(user.role)) {
        return res.status(403).json({ error: 'forbidden' });
      }

      const tenant = await getAsync('SELECT * FROM tenants WHERE slug = ?', [user.tenant]);
      const notes = await allAsync('SELECT * FROM notes WHERE tenant_slug = ?', [user.tenant]);
      if (tenant.plan === 'free' && notes.length >= 3) {
        return res.status(403).json({ error: 'note limit reached' });
      }

      const result = await runAsync(
        'INSERT INTO notes (title, content, tenant_slug, owner_id) VALUES (?, ?, ?, ?)',
        [body.title || '', body.content || '', user.tenant, user.id]
      );

      return res.json({ id: result.insertId, title: body.title, content: body.content });

    } else {
      res.status(405).end();
    }

  } catch (e) {
    res.status(401).json({ error: e.message });
  }
}
