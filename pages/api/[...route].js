const { connectDB, Guild, User, Giveaway, CustomCommand, Ticket } = require('../../lib/db');
const { getIronSession } = require('iron-session');
const axios = require('axios');

async function getSession(req, res) {
  return getIronSession(req, res, {
    password: process.env.SESSION_SECRET || 'fallback-secret-at-least-32-chars-long-here',
    cookieName: 'repl_sess',
    cookieOptions: { secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 24 * 7 },
  });
}

function hasAdmin(permissions) {
  return (BigInt(permissions) & BigInt(0x8)) === BigInt(0x8);
}

export default async function handler(req, res) {
  const { route } = req.query;
  const path = Array.isArray(route) ? route.join('/') : route;

  // ── GET /api/auth/login ──────────────────────────────────────────────────────
  if (path === 'auth/login') {
    const params = new URLSearchParams({
      client_id:     process.env.DISCORD_CLIENT_ID,
      redirect_uri:  process.env.DISCORD_REDIRECT_URI,
      response_type: 'code',
      scope:         'identify guilds',
    });
    return res.redirect(`https://discord.com/api/oauth2/authorize?${params}`);
  }

  // ── GET /api/auth/callback ───────────────────────────────────────────────────
  if (path === 'auth/callback') {
    const { code } = req.query;
    if (!code) return res.redirect('/?error=no_code');
    try {
      const tokenRes = await axios.post('https://discord.com/api/oauth2/token',
        new URLSearchParams({
          client_id:     process.env.DISCORD_CLIENT_ID,
          client_secret: process.env.DISCORD_CLIENT_SECRET,
          grant_type:    'authorization_code',
          code,
          redirect_uri:  process.env.DISCORD_REDIRECT_URI,
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
      const { access_token } = tokenRes.data;
      const headers = { Authorization: `Bearer ${access_token}` };
      const [userRes, guildsRes] = await Promise.all([
        axios.get('https://discord.com/api/users/@me', { headers }),
        axios.get('https://discord.com/api/users/@me/guilds', { headers }),
      ]);
      const session = await getSession(req, res);
      session.user   = { id: userRes.data.id, username: userRes.data.username, avatar: userRes.data.avatar };
      session.guilds = guildsRes.data
        .filter(g => hasAdmin(g.permissions))
        .map(g => ({ id: g.id, name: g.name, icon: g.icon, permissions: g.permissions }));
      await session.save();
      return res.redirect('/dashboard');
    } catch (e) {
      const msg = e.response?.data ? JSON.stringify(e.response.data) : e.message;
      console.error('OAuth error:', msg);
      return res.redirect('/dashboard?error=' + encodeURIComponent(msg));
    }
  }

  // ── GET /api/auth/logout ─────────────────────────────────────────────────────
  if (path === 'auth/logout') {
    const session = await getSession(req, res);
    session.destroy();
    return res.redirect('/');
  }

  // ── GET /api/me ──────────────────────────────────────────────────────────────
  if (path === 'me') {
    const session = await getSession(req, res);
    if (!session.user) return res.status(401).json({ error: 'Not logged in' });
    return res.json({ user: session.user, guilds: session.guilds });
  }

  // ── GET /api/botguilds ────────────────────────────────────────────────────────
  if (path === 'botguilds') {
    const session = await getSession(req, res);
    if (!session.user) return res.status(401).json({ error: 'Unauthorized' });
    await connectDB();
    const guilds = await Guild.find({}, 'guildId').lean();
    return res.json({ guildIds: guilds.map(g => g.guildId) });
  }

  // ── Everything below requires auth + guildId ─────────────────────────────────
  const guildMatch = path.match(/^guild\/(\d+)(?:\/(.+))?$/);
  if (!guildMatch) return res.status(404).json({ error: 'Not found' });

  const session = await getSession(req, res);
  if (!session.user) return res.status(401).json({ error: 'Unauthorized' });

  const guildId   = guildMatch[1];
  const subpath   = guildMatch[2] || '';
  const userGuild = session.guilds?.find(g => g.id === guildId);
  if (!userGuild) return res.status(403).json({ error: 'No permission' });

  await connectDB();

  // ── GET/POST /api/guild/:id ──────────────────────────────────────────────────
  if (!subpath) {
    if (req.method === 'GET') {
      const data = await Guild.findOneAndUpdate({ guildId }, { $setOnInsert: { guildId } }, { upsert: true, new: true });
      return res.json(data);
    }
    if (req.method === 'POST') {
      // Flatten nested objects into dot notation for MongoDB
      const flatten = (obj, prefix = '') => {
        return Object.keys(obj).reduce((acc, key) => {
          const fullKey = prefix ? `${prefix}.${key}` : key;
          const val = obj[key];
          if (val && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
            Object.assign(acc, flatten(val, fullKey));
          } else {
            acc[fullKey] = val;
          }
          return acc;
        }, {});
      };
      const flat = flatten(req.body);
      const updated = await Guild.findOneAndUpdate({ guildId }, { $set: flat }, { new: true, upsert: true });
      return res.json(updated);
    }
  }

  // ── POST /api/guild/:id/sendpanel ─────────────────────────────────────────────
  if (subpath === 'sendpanel' && req.method === 'POST') {
    const { channelId, panel } = req.body;
    if (!channelId) return res.status(400).json({ error: 'channelId required' });
    const token = process.env.BOT_TOKEN || process.env.DISCORD_TOKEN;
    if (!token) return res.status(500).json({ error: 'BOT_TOKEN not set in Vercel environment variables' });
    try {
      // Save panel settings first
      await Guild.findOneAndUpdate({ guildId }, { $set: { ticketPanel: panel } });
      const botRes = await axios.post(`https://discord.com/api/v10/channels/${channelId}/messages`, {
        embeds: [{
          title: panel?.title || 'Support Tickets',
          description: panel?.description || 'Click the button below to open a ticket.',
          color: parseInt((panel?.color || '#7c3aed').replace('#', ''), 16),
        }],
        components: [{
          type: 1,
          components: [{
            type: 2, style: 1,
            label: panel?.buttonLabel || 'Create Ticket',
            emoji: { name: panel?.buttonEmoji || '🎫' },
            custom_id: 'ticket_open',
          }]
        }]
      }, { headers: { Authorization: `Bot ${token}`, 'Content-Type': 'application/json' } });
      await Guild.findOneAndUpdate({ guildId }, { 'ticketPanel.channelId': channelId, 'ticketPanel.messageId': botRes.data.id });
      return res.json({ ok: true, messageId: botRes.data.id });
    } catch (e) {
      const errMsg = e.response?.data?.message || e.message;
      console.error('sendpanel error:', errMsg);
      return res.status(400).json({ error: errMsg });
    }
  }

  // ── POST /api/guild/:id/editpanel ─────────────────────────────────────────────
  if (subpath === 'editpanel' && req.method === 'POST') {
    const { channelId, messageId, panel } = req.body;
    if (!channelId || !messageId) return res.status(400).json({ error: 'channelId and messageId required' });
    const token = process.env.BOT_TOKEN || process.env.DISCORD_TOKEN;
    if (!token) return res.status(500).json({ error: 'BOT_TOKEN not set in Vercel environment variables' });
    try {
      await Guild.findOneAndUpdate({ guildId }, { $set: { ticketPanel: panel } });
      await axios.patch(`https://discord.com/api/v10/channels/${channelId}/messages/${messageId}`, {
        embeds: [{
          title: panel?.title || 'Support Tickets',
          description: panel?.description || 'Click the button below to open a ticket.',
          color: parseInt((panel?.color || '#7c3aed').replace('#', ''), 16),
        }],
        components: [{
          type: 1,
          components: [{
            type: 2, style: 1,
            label: panel?.buttonLabel || 'Create Ticket',
            emoji: { name: panel?.buttonEmoji || '🎫' },
            custom_id: 'ticket_open',
          }]
        }]
      }, { headers: { Authorization: `Bot ${token}`, 'Content-Type': 'application/json' } });
      return res.json({ ok: true });
    } catch (e) {
      const errMsg = e.response?.data?.message || e.message;
      console.error('editpanel error:', errMsg);
      return res.status(400).json({ error: 'Invalid message link, or bot does not have permission in that channel' });
    }
  }

  // ── GET /api/guild/:id/stats ─────────────────────────────────────────────────
  if (subpath === 'stats') {
    const [openTickets, activeGiveaways, modStats, topUsers] = await Promise.all([
      Ticket.countDocuments({ guildId, status: 'open' }),
      Giveaway.countDocuments({ guildId, ended: false }),
      User.aggregate([{ $match: { guildId } }, { $group: { _id: null, total: { $sum: { $size: '$warns' } } } }]),
      User.find({ guildId }).sort({ level: -1, xp: -1 }).limit(3),
    ]);
    return res.json({ openTickets, activeGiveaways, totalModActions: modStats[0]?.total || 0, topUsers });
  }

  // ── /api/guild/:id/commands ──────────────────────────────────────────────────
  if (subpath === 'commands') {
    if (req.method === 'GET')    { return res.json(await CustomCommand.find({ guildId })); }
    if (req.method === 'POST')   { const c = await CustomCommand.findOneAndUpdate({ guildId, trigger: req.body.trigger }, { response: req.body.response, createdBy: session.user.id }, { upsert: true, new: true }); return res.json(c); }
    if (req.method === 'DELETE') { await CustomCommand.findOneAndDelete({ guildId, trigger: req.body.trigger }); return res.json({ ok: true }); }
  }

  // ── GET /api/guild/:id/giveaways ─────────────────────────────────────────────
  if (subpath === 'giveaways') {
    return res.json(await Giveaway.find({ guildId }).sort({ createdAt: -1 }).limit(20));
  }

  return res.status(404).json({ error: 'Not found' });
}
