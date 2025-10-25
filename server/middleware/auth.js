import { verifyToken } from '../utils/jwt.js';

export function authenticate(req, res, next) {
  try {
    // Expect: Authorization: Bearer <token>
    const authHeader = req.headers['authorization'] || '';
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }
    const token = parts[1];
    const decoded = verifyToken(token);
    req.user = decoded; // { id, role, email, name }
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
