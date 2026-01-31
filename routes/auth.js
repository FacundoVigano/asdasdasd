const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');
const AuthUser = require('../models/AuthUser');
const { fetchGuildMemberRoles, mapGuildRolesToAppRoles } = require('../utils/discord');

const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:5000';
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET no definido');

// iniciar OAuth con Discord
router.get('/discord', passport.authenticate('discord'));

// callback OAuth
router.get('/discord/callback', passport.authenticate('discord', { failureRedirect: '/auth/fail' }), async (req, res) => {
  try {
    const u = req.user;
    const token = jwt.sign({
      discordId: u.discordId,
      roles: u.roles
    }, JWT_SECRET, { expiresIn: '8h' });

    const redirectUrl = `${FRONTEND.replace(/\/$/, '')}/?token=${token}`;
    return res.redirect(redirectUrl);
  } catch (err) {
    console.error('Error generando JWT:', err);
    return res.redirect(FRONTEND + '/?error=auth');
  }
});

router.get('/fail', (req, res) => res.status(401).send('Autenticación fallida'));

// devuelve info del usuario autenticado (token en Authorization)
router.get('/me', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' });
  const token = auth.substring(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await AuthUser.findOne({ discordId: payload.discordId }).lean();
    if (!user) return res.status(404).json({ error: 'No user' });
    return res.json({ discordId: user.discordId, username: user.username, roles: user.roles });
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
});

// Admin-only: refresh roles for a given discordId by querying guild
router.get('/refresh-roles/:discordId', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' });
  const token = auth.substring(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (!Array.isArray(payload.roles) || !payload.roles.includes('admin')) return res.status(403).json({ error: 'Se requiere rol admin' });

    const { discordId } = req.params;
    const memberRoles = await fetchGuildMemberRoles(discordId);
    const roles = mapGuildRolesToAppRoles(memberRoles);
    // fallback admin ids
    const adminCsv = (process.env.ADMIN_DISCORD_IDS || '').split(',').map(s => s.trim()).filter(Boolean);
    if (adminCsv.includes(discordId) && !roles.includes('admin')) roles.push('admin');

    const user = await AuthUser.findOne({ discordId });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    user.roles = roles;
    await user.save();
    return res.json({ ok: true, discordId: user.discordId, roles: user.roles });
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o no autorizado' });
  }
});

// Admin-only: assign roles manually (body: { roles: ['admin','policia'] })
router.put('/users/:discordId/roles', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' });
  const token = auth.substring(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (!Array.isArray(payload.roles) || !payload.roles.includes('admin')) return res.status(403).json({ error: 'Se requiere rol admin' });

    const { discordId } = req.params;
    const { roles } = req.body;
    if (!Array.isArray(roles)) return res.status(400).json({ error: 'roles debe ser array' });

    const target = await AuthUser.findOne({ discordId });
    if (!target) return res.status(404).json({ error: 'Usuario no encontrado' });
    target.roles = roles;
    await target.save();
    return res.json({ ok: true, discordId: target.discordId, roles: target.roles });
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o no autorizado' });
  }
});

module.exports = router;