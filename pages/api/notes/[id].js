const { init, getAsync, runAsync } = require('../../../lib/db');
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'supersecret_jwt_key';

function cors(res){ res.setHeader('Access-Control-Allow-Origin','*'); }
function auth(req){
  const token = req.headers.authorization;
  if (!token) throw new Error('no token');
  return jwt.verify(token, SECRET);
}

module.exports = async function handler(req, res) {
  cors(res);
  await init();
  try {
    const user = auth(req);
    const { id } = req.query;
    const note = await getAsync('SELECT * FROM notes WHERE id = ?', [id]);
    if (!note || note.tenant_slug !== user.tenant) return res.status(404).json({ error: 'not found' });
    if (req.method === 'GET') return res.json(note);
    if (req.method === 'PUT') {
      if (!['admin','member'].includes(user.role)) return res.status(403).json({ error: 'forbidden' });
      const body = req.body;
      await runAsync('UPDATE notes SET title = ?, content = ? WHERE id = ?', [body.title||note.title, body.content||note.content, id]);
      return res.json({ ok: true });
    }
    if (req.method === 'DELETE') {
      if (!['admin','member'].includes(user.role)) return res.status(403).json({ error: 'forbidden' });
      await runAsync('DELETE FROM notes WHERE id = ?', [id]);
      return res.json({ ok: true });
    }
    res.status(405).end();
  } catch(e){
    res.status(401).json({ error: e.message });
  }
};
