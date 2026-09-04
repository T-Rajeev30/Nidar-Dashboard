const crypto = require('node:crypto');
const Session = require('../models/Session');
const { AppError } = require('./validation');

const SESSION_COOKIE = 'nidar_session';
const SESSION_TTL_MS = Math.max(60 * 60 * 1000, Number(process.env.SESSION_TTL_HOURS || 168) * 60 * 60 * 1000);

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function cookieOptions() {
  const sameSite = (process.env.SESSION_SAME_SITE || (process.env.NODE_ENV === 'production' ? 'none' : 'lax')).toLowerCase();
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: ['strict', 'lax', 'none'].includes(sameSite) ? sameSite : 'lax',
    maxAge: SESSION_TTL_MS,
    path: '/',
  };
}

function parseCookies(header) {
  return String(header || '').split(';').reduce((cookies, part) => {
    const separator = part.indexOf('=');
    if (separator < 0) return cookies;
    const key = part.slice(0, separator).trim();
    if (key) cookies[key] = decodeURIComponent(part.slice(separator + 1).trim());
    return cookies;
  }, {});
}

function publicMember(member) {
  if (!member) return null;
  return {
    _id: member._id,
    name: member.name,
    team: member.team,
    role: member.role || '',
  };
}

async function issueSession(res, member) {
  // Rotate any existing session on login/join to limit session fixation.
  const cookies = parseCookies(res.req?.headers?.cookie);
  if (cookies[SESSION_COOKIE]) await Session.deleteOne({ tokenHash: hashToken(cookies[SESSION_COOKIE]) });
  const token = crypto.randomBytes(32).toString('base64url');
  await Session.create({ tokenHash: hashToken(token), member: member._id, expiresAt: new Date(Date.now() + SESSION_TTL_MS) });
  res.cookie(SESSION_COOKIE, token, cookieOptions());
}

async function requireAuth(req, res, next) {
  try {
    const token = parseCookies(req.headers.cookie)[SESSION_COOKIE];
    if (!token || token.length > 200) throw new AppError('Authentication required.', 401, 'UNAUTHENTICATED');
    const session = await Session.findOne({ tokenHash: hashToken(token), expiresAt: { $gt: new Date() } })
      .populate({ path: 'member', populate: { path: 'team' } });
    if (!session || !session.member) throw new AppError('Authentication required.', 401, 'UNAUTHENTICATED');
    req.member = session.member;
    req.session = session;
    next();
  } catch (err) {
    next(err);
  }
}

async function revokeSession(req) {
  const token = parseCookies(req.headers.cookie)[SESSION_COOKIE];
  if (token) await Session.deleteOne({ tokenHash: hashToken(token) });
}

function clearSession(res) {
  res.clearCookie(SESSION_COOKIE, { ...cookieOptions(), maxAge: undefined });
}

function requireSameOrigin(allowedOrigins) {
  return (req, res, next) => {
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return next();
    const origin = req.get('origin');
    if (origin && !allowedOrigins.includes(origin)) {
      return res.status(403).json({ error: 'Request origin is not allowed.', code: 'CSRF_REJECTED' });
    }
    return next();
  };
}

function assertOwnTeam(member, teamId) {
  if (!member || String(member.team?._id || member.team) !== String(teamId)) {
    throw new AppError('You can only change resources for your own team.', 403, 'FORBIDDEN');
  }
}

module.exports = {
  SESSION_COOKIE,
  hashToken,
  parseCookies,
  publicMember,
  issueSession,
  requireAuth,
  revokeSession,
  clearSession,
  requireSameOrigin,
  assertOwnTeam,
};
