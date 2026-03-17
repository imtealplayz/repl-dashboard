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

module.exports = async function handler(req, res) {
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
      session.user   = userRes.data;
      session.guilds = guildsRes.data.filter(g => hasAdmin(g.permissions));
      await session.save();
      return res.redirect('/dashboard');
    } catch (e) {
      console.error('OAuth error:', e.message);
      return res.redirect('/?error=auth_failed');
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
      const updated = await Guild.findOneAndUpdate({ guildId }, { $set: req.body }, { new: true, upsert: true });
      return res.json(updated);
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
