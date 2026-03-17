import mongoose from 'mongoose';

let cached = global.mongoose || (global.mongoose = { conn: null, promise: null });

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) cached.promise = mongoose.connect(process.env.MONGO_URI);
  cached.conn = await cached.promise;
  return cached.conn;
}

const warnSchema = new mongoose.Schema({ warnId: String, reason: String, moderatorId: String, timestamp: { type: Date, default: Date.now } });
const userSchema = new mongoose.Schema({ userId: String, guildId: String, xp: { type: Number, default: 0 }, level: { type: Number, default: 0 }, messageCount: { type: Number, default: 0 }, warns: [warnSchema] });
userSchema.index({ userId: 1, guildId: 1 }, { unique: true });

const welcomeSchema = new mongoose.Schema({
  enabled: Boolean, channelId: String, outsideText: String, color: String,
  authorText: String, authorIconUrl: String, title: String, description: String,
  thumbnailUrl: String, imageUrl: String, footerText: String, footerIconUrl: String,
  showTimestamp: Boolean, fields: [{ name: String, value: String, inline: Boolean }],
}, { _id: false });

const guildSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  welcomeEmbed:          { type: welcomeSchema, default: () => ({}) },
  autoRoleId:            { type: String, default: null },
  modLogChannelId:       { type: String, default: null },
  staffRoleId:           { type: String, default: null },
  ticketLogChannelId:    { type: String, default: null },
  ticketPanel:           { type: Object, default: { title: 'Support Tickets', description: 'Click below to open a ticket.', color: '#7c3aed', buttonLabel: 'Create Ticket', buttonEmoji: '🎫' } },
  ticketTypes:           { type: Object, default: { support: true, report: true, claim: true, appeal: true, other: true } },
  ticketPingStaff:       { type: Boolean, default: true },
  ticketDmTranscript:    { type: Boolean, default: true },
  ticketOnePerUser:      { type: Boolean, default: true },
  levelingEnabled:       { type: Boolean, default: true },
  levelUpMessages:       { type: Boolean, default: true },
  xpMin:                 { type: Number, default: 15 },
  xpMax:                 { type: Number, default: 25 },
  xpCooldown:            { type: Number, default: 60 },
  levelRoles:            [{ level: Number, roleId: String }],
  msgLogMode:            { type: String, default: 'blacklist' },
  msgBlacklist:          [String],
  msgWhitelist:          [String],
  antiRaidEnabled:       { type: Boolean, default: true },
  raidJoinCount:         { type: Number, default: 5 },
  raidJoinWindow:        { type: Number, default: 10 },
  raidAction:            { type: String, default: 'kick' },
  raidNewAccDays:        { type: Number, default: 7 },
  raidOwnerDm:           { type: Boolean, default: true },
  antiNukeEnabled:       { type: Boolean, default: true },
  nukePunishment:        { type: String, default: 'both' },
  nukeWhitelist:         [String],
  nukeThresholds:        { type: Object, default: { channelDelete: 3, ban: 3, kick: 5, roleDelete: 2 } },
  giveawayBonusEntries:  [{ roleId: String, entries: Number }],
  giveawayBlacklist:     [{ type: { type: String }, id: String }],
  giveawayWhitelist:     [{ type: { type: String }, id: String }],
  giveawayWhitelistMode: { type: Boolean, default: false },
  maintenanceMode:       { type: Boolean, default: false },
}, { timestamps: true });

const giveawaySchema = new mongoose.Schema({
  giveawayId: String, guildId: String, channelId: String, messageId: String,
  prize: String, hostId: String, endsAt: Date, winnerCount: Number,
  entries: [String], winners: [String], ended: { type: Boolean, default: false },
}, { timestamps: true });

const ticketSchema = new mongoose.Schema({
  ticketId: String, channelId: String, userId: String, guildId: String, type: String,
  modalFields: Object, status: { type: String, default: 'open' },
  transcript: [{ authorId: String, authorUsername: String, content: String, attachments: [String], timestamp: Date }],
  createdAt: { type: Date, default: Date.now }, closedAt: Date,
});

const customCommandSchema = new mongoose.Schema({ guildId: String, trigger: String, response: String, createdBy: String }, { timestamps: true });
customCommandSchema.index({ guildId: 1, trigger: 1 }, { unique: true });

export const User          = mongoose.models.User          || mongoose.model('User', userSchema);
export const Guild         = mongoose.models.Guild         || mongoose.model('Guild', guildSchema);
export const Giveaway      = mongoose.models.Giveaway      || mongoose.model('Giveaway', giveawaySchema);
export const Ticket        = mongoose.models.Ticket        || mongoose.model('Ticket', ticketSchema);
export const CustomCommand = mongoose.models.CustomCommand || mongoose.model('CustomCommand', customCommandSchema);
