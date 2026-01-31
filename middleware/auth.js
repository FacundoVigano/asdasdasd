const jwt = require('jsonwebtoken');
const AuthUser = require('../models/AuthUser');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET no definido');

const ROLE_RANK = { medico: 1, policia: 2, admin: 3 };

// verify token and attach req.authUser
async function verifyToken(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' });
  const token = auth.substring(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await AuthUser.findOne({ discordId: payload.discordId }).lean();
    if (!user) return res.status(401).json({ error: 'Usuario no registrado' });
    req.authUser = { discordId: user.discordId, roles: user.roles || [] };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

function requireAnyRole(allowed = []) {
  return (req, res, next) => {
    const roles = (req.authUser && req.authUser.roles) || [];
    if (roles.includes('admin')) return next(); // admin siempre pasa
    const ok = allowed.some(r => roles.includes(r));
    if (!ok) return res.status(403).json({ error: 'No autorizado (roles)' });
    return next();
  };
}

function requireMinRole(role) {
  return (req, res, next) => {
    const roles = (req.authUser && req.authUser.roles) || [];
    if (roles.includes('admin')) return next();
    const userMaxRank = Math.max(...roles.map(r => ROLE_RANK[r] || 0), 0);
    const requiredRank = ROLE_RANK[role] || 0;
    if (userMaxRank >= requiredRank) return next();
    return res.status(403).json({ error: 'No autorizado (rol insuficiente)' });
  };
}

module.exports = { verifyToken, requireAnyRole, requireMinRole };