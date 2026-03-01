export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

export function requireTeamMember(req, res, next) {
  if (!req.user?.teamId) {
    return res.status(403).json({ error: 'You are not in a team' });
  }
  next();
}
