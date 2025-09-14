const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'supersecret_jwt_key';
module.exports = function handler(req, res){
  res.setHeader('Access-Control-Allow-Origin', '*');
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: 'missing token' });
  try {
    const payload = jwt.verify(token, SECRET);
    res.json({ email: payload.email, role: payload.role, tenant: payload.tenant });
  } catch(e){
    res.status(401).json({ error: 'invalid token' });
  }
};
