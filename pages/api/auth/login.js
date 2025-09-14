import { getConnection } from '../../../lib/db';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
const SECRET = process.env.JWT_SECRET || 'supersecret_jwt_key';

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

// Helper functions for MySQL queries
async function getAsync(query, params) {
  const conn = await getConnection();
  const [results] = await conn.execute(query, params);
  await conn.end();
  return results[0] || null;
}

export default async function handler(req, res) {
  cors(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await getAsync('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, tenant: user.tenant_slug },
      SECRET,
      { expiresIn: '7d' }
    );

    return res.json({ token, user: { id: user.id, email: user.email, role: user.role, tenant: user.tenant_slug } });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
