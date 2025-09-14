import { init, allAsync, getAsync, runAsync } from '../../../lib/db';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'supersecret_jwt_key';

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
}

function auth(req) {
  const token = req.headers.authorization;
  if (!token) throw new Error('No token provided');
  return jwt.verify(token, SECRET);
}

export default async function handler(req, res) {
  cors(res);
  try {
    const user = auth(req);
    await init(); // ensure DB connection

    if (req.method === 'GET') {
      const notes = await allAsync('SELECT * FROM notes WHERE tenant_slug = ?', [user.tenant]);
      const tenant = await getAsync('SELECT * FROM tenants WHERE slug = ?', [user.tenant]);
      const count = notes.length;
      const limitReached = tenant.plan === 'free' && count >= 3;
      return res.json({ notes, limitReached });
    }

    else if (req.method === 'POST') {
      const body = req.body;
      if (!['admin', 'member'].includes(user.role))
        return res.status(403).json({ error: 'Forbidden' });

      const tenant = await getAsync('SELECT * FROM tenants WHERE slug = ?', [user.tenant]);
      const notes = await allAsync('SELECT * FROM notes WHERE tenant_slug = ?', [user.tenant]);
      if (tenant.plan === 'free' && notes.length >= 3)
        return res.status(403).json({ error: 'Note limit reached' });

      const result = await runAsync(
        'INSERT INTO notes (title, content, tenant_slug, owner_id) VALUES (?, ?, ?, ?)',
        [body.title || '', body.content || '', user.tenant, user.id]
      );

      return res.json({ id: result.insertId, title: body.title, content: body.content });
    }

    else {
      res.status(405).end(); // Method Not Allowed
    }
  } catch (e) {
    res.status(401).json({ error: e.message });
  }
}
