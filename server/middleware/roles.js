export function requireRole(role) {
  return function (req, res, next) {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthenticated' });
    }
    const ok = Array.isArray(role) ? role.includes(req.user.role) : req.user.role === role;
    if (!ok) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    return next();
  };
}
