const { init, runAsync, getAsync } = require('../../lib/db');
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'supersecret_jwt_key';
function cors(res){ res.setHeader('Access-Control-Allow-Origin','*'); }
function auth(req){
  const token = req.headers.authorization;
  if (!token) throw new Error('no token');
  return jwt.verify(token, SECRET);
}
module.exports = async function handler(req, res){
  cors(res);
  await init();
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const user = auth(req);
    if (user.role !== 'admin') return res.status(403).json({ error: 'only admin' });
    const { email, role } = req.body;
    if (!email || !role) return res.status(400).json({ error: 'invalid' });
    await runAsync('INSERT INTO users (email, password, role, tenant_slug) VALUES (?, ?, ?, ?)', [email, 'password', role, user.tenant]);
    res.json({ ok: true });
  } catch(e){
    res.status(401).json({ error: e.message });
  }
};
