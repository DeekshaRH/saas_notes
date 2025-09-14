import bcrypt from 'bcrypt';
import { getConnection } from '../../../lib/db.js';

export default async function handler(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }

  try {
    const conn = await getConnection();
    const [rows] = await conn.query('SELECT * FROM users WHERE email = ?', [email]);
    await conn.end();

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = rows[0];

    if (!user.password) {
      return res.status(500).json({ message: 'User has no password set' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Return success (you can generate JWT here)
    res.status(200).json({ message: 'Login successful', user: { email: user.email, role: user.role } });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}
