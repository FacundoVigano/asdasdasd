require('dotenv').config();
// Este util usa fetch (Node >= 18 tiene fetch global). Si no está disponible, instala node-fetch.

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const GUILD_ID = process.env.TARGET_GUILD_ID || null;

function csvToSet(s) {
  if (!s) return new Set();
  return new Set(s.split(',').map(x => x.trim()).filter(Boolean));
}

const ADMIN_ROLE_IDS = csvToSet(process.env.ADMIN_ROLE_IDS);
const POLICIA_ROLE_IDS = csvToSet(process.env.POLICIA_ROLE_IDS);
const MEDICO_ROLE_IDS = csvToSet(process.env.MEDICO_ROLE_IDS);

// fetch member roles from guild using bot token
async function fetchGuildMemberRoles(discordId) {
  if (!BOT_TOKEN || !GUILD_ID) return [];
  try {
    const url = `https://discord.com/api/v10/guilds/${GUILD_ID}/members/${discordId}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bot ${BOT_TOKEN}` }
    });
    if (!res.ok) {
      // member not found or not accessible
      return [];
    }
    const member = await res.json();
    return Array.isArray(member.roles) ? member.roles : [];
  } catch (err) {
    console.error('fetchGuildMemberRoles error', err);
    return [];
  }
}

// map guild role ids array -> app roles array
function mapGuildRolesToAppRoles(memberRoleIds = []) {
  const set = new Set(memberRoleIds || []);
  const roles = [];
  for (const id of set) {
    if (ADMIN_ROLE_IDS.has(id)) { roles.push('admin'); break; }
  }
  for (const id of set) {
    if (POLICIA_ROLE_IDS.has(id)) { roles.push('policia'); break; }
  }
  for (const id of set) {
    if (MEDICO_ROLE_IDS.has(id)) { roles.push('medico'); break; }
  }
  return roles;
}

module.exports = { fetchGuildMemberRoles, mapGuildRolesToAppRoles };