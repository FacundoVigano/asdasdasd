const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const AuthUser = require('../models/AuthUser');
const { fetchGuildMemberRoles, mapGuildRolesToAppRoles } = require('../utils/discord');
require('dotenv').config();

const SCOPES = ['identify'];

passport.use(new DiscordStrategy({
  clientID: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  callbackURL: process.env.DISCORD_CALLBACK_URL,
  scope: SCOPES
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const discordId = profile.id;

    // obtener roles del miembro en el guild (usa BOT_TOKEN + TARGET_GUILD_ID)
    const memberRoleIds = await fetchGuildMemberRoles(discordId);

    // mapear roles del guild a roles de app
    const roles = mapGuildRolesToAppRoles(memberRoleIds);

    // fallback: si ADMIN_DISCORD_IDS contiene el id, asegurar admin
    const adminCsv = (process.env.ADMIN_DISCORD_IDS || '').split(',').map(s => s.trim()).filter(Boolean);
    if (adminCsv.includes(discordId) && !roles.includes('admin')) roles.push('admin');

    // find or create auth user
    let user = await AuthUser.findOne({ discordId });
    if (!user) {
      user = new AuthUser({
        discordId,
        username: profile.username,
        discriminator: profile.discriminator,
        avatar: profile.avatar,
        roles
      });
      await user.save();
    } else {
      user.username = profile.username;
      user.discriminator = profile.discriminator;
      user.avatar = profile.avatar;
      user.roles = roles;
      await user.save();
    }

    return done(null, user);
  } catch (err) {
    console.error('passport callback error', err);
    return done(err, null);
  }
}));

passport.serializeUser((user, done) => done(null, user.discordId));
passport.deserializeUser(async (id, done) => {
  try {
    const u = await AuthUser.findOne({ discordId: id });
    done(null, u || null);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;