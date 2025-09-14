import { getConnection } from '../../../lib/db';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'supersecret_jwt_key';

// Enable CORS for all origins
function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

// Verify JWT token
function auth(req) {
  const token = req.headers.authorization;
  if (!token) throw new Error('No token provided');
  return jwt.verify(token, SECRET);
}

export default async function handler(req, res) {
  cors(res);

  if (req.method === 'OPTIONS') return res.status(200).end();

  let conn;
  try {
    const user = auth(req);
    conn = await getConnection();

    if (req.method === 'GET') {
      const [notes] = await conn.execute(
        'SELECT * FROM notes WHERE tenant_slug = ?',
        [user.tenant]
      );
      const [tenantRows] = await conn.execute(
        'SELECT * FROM tenants WHERE slug = ?',
        [user.tenant]
      );
      const tenant = tenantRows[0] || {};
      const count = notes.length;
      const limitReached = tenant.plan === 'free' && count >= 3;

      return res.status(200).json({ notes, limitReached });
    }

    if (req.method === 'POST') {
      const body = req.body;

      if (!['admin', 'member'].includes(user.role))
        return res.status(403).json({ error: 'Forbidden' });

      const [tenantRows] = await conn.execute(
        'SELECT * FROM tenants WHERE slug = ?',
        [user.tenant]
      );
      const tenant = tenantRows[0] || {};

      const [notes] = await conn.execute(
        'SELECT * FROM notes WHERE tenant_slug = ?',
        [user.tenant]
      );

      if (tenant.plan === 'free' && notes.length >= 3)
        return res.status(403).json({ error: 'Note limit reached' });

      const [result] = await conn.execute(
        'INSERT INTO notes (title, content, tenant_slug, owner_id) VALUES (?, ?, ?, ?)',
        [body.title || '', body.content || '', user.tenant, user.id]
      );

      return res.status(200).json({
        id: result.insertId,
        title: body.title || '',
        content: body.content || ''
      });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error(e);
    res.status(401).json({ error: e.message });
  } finally {
    if (conn) await conn.end();
  }
}
