/**
 * Require the requesting user to have role === 'admin'.
 * Must be used after verifyJWT so req.performingUser is set.
 */
export const requireAdmin = (req, res, next) => {
  const user = req.performingUser;
  if (!user) {
    return res.status(401).json({ status: 'error', message: 'Authentication required' });
  }
  if (user.role !== 'admin') {
    return res.status(403).json({ status: 'error', message: 'Admin access required' });
  }
  next();
};
