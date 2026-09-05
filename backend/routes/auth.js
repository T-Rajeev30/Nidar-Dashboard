const express = require('express');
const rateLimit = require('express-rate-limit');
const Member = require('../models/Member');
const Invitation = require('../models/Invitation');
const { requiredString, parseEmail, AppError } = require('../utils/validation');
const { hashToken, issueSession, requireAuth, revokeSession, clearSession, publicMember } = require('../utils/auth');
const { hashPassword, verifyPassword } = require('../utils/passwords');
const { claimInvitation } = require('../utils/invitations');
const { rateLimitHandler } = require('../utils/rateLimit');

const router = express.Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: 'draft-7', legacyHeaders: false, handler: rateLimitHandler, skipSuccessfulRequests: true, skip: () => process.env.NODE_ENV === 'test' });
const claimLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: 'draft-7', legacyHeaders: false, handler: rateLimitHandler, skip: () => process.env.NODE_ENV === 'test' });

router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const email = parseEmail(req.body.email);
    const password = requiredString(req.body.password, 'password', { max: 256 });
    const member = await Member.findOne({ email }).select('+passwordHash').populate('team');
    const valid = member && member.status === 'active' && member.passwordHash
      ? await verifyPassword(password, member.passwordHash) : false;
    if (!valid) throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
    await issueSession(res, member);
    res.json({ member: publicMember(member) });
  } catch (err) { next(err); }
});

router.get('/invite/:token', claimLimiter, async (req, res, next) => {
  try {
    const token = requiredString(req.params.token, 'token', { max: 256 });
    const invitation = await Invitation.findOne({ tokenHash: hashToken(token), usedAt: null, expiresAt: { $gt: new Date() } })
      .populate('team', 'key displayName').select('name email team role expiresAt');
    if (!invitation) throw new AppError('This invitation is invalid or expired.', 404, 'INVITATION_INVALID');
    res.json({ invitation: { name: invitation.name, email: invitation.email, team: invitation.team, role: invitation.role, expiresAt: invitation.expiresAt } });
  } catch (err) { next(err); }
});

router.post('/claim-invite', claimLimiter, async (req, res, next) => {
  try {
    const token = requiredString(req.body.token, 'token', { max: 256 });
    const passwordHash = await hashPassword(req.body.password);
    const result = await claimInvitation(token, passwordHash);
    if (!result) throw new AppError('This invitation is invalid or expired.', 400, 'INVITATION_INVALID');
    await issueSession(res, result.member);
    res.status(201).json({ member: publicMember(result.member) });
  } catch (err) { next(err); }
});

router.get('/me', requireAuth, (req, res) => res.json({ member: publicMember(req.member) }));

router.post('/logout', async (req, res, next) => {
  try { await revokeSession(req); clearSession(res); res.status(204).send(); } catch (err) { next(err); }
});

module.exports = router;
