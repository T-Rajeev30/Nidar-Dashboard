// Name-based onboarding remains, but it establishes a server-managed session.
const express = require('express');
const Team = require('../models/Team');
const Member = require('../models/Member');
const { requiredString, parseEmail } = require('../utils/validation');
const { issueSession, requireAuth, revokeSession, clearSession, publicMember } = require('../utils/auth');

const router = express.Router();

router.post('/login', async (req, res, next) => {
  try {
    const name = requiredString(req.body.name, 'name', { max: 100 });

    const member = await Member.findOne({ nameLower: name.toLowerCase() }).populate('team');
    if (!member) {
      return res.status(404).json({ error: 'No member with that name yet. Join a team first.', code: 'MEMBER_NOT_FOUND' });
    }

    await issueSession(res, member);
    res.json({ member: publicMember(member) });
  } catch (err) {
    next(err);
  }
});

router.post('/join', async (req, res, next) => {
  try {
    const name = requiredString(req.body.name, 'name', { max: 100 });
    const email = parseEmail(req.body.email);
    const teamKey = requiredString(req.body.teamKey, 'teamKey', { max: 100 });
    const role = typeof req.body.role === 'string' ? req.body.role.trim().slice(0, 100) : '';

    const team = await Team.findOne({ key: teamKey });
    if (!team) {
      return res.status(404).json({ error: `Unknown team: ${teamKey}`, code: 'TEAM_NOT_FOUND' });
    }

    const member = await Member.create({
      name,
      email,
      team: team._id,
      role,
    });
    const populated = await member.populate('team');

    await issueSession(res, populated);
    res.status(201).json({ member: publicMember(populated) });
  } catch (err) {
    next(err);
  }
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ member: publicMember(req.member) });
});

router.post('/logout', async (req, res, next) => {
  try {
    await revokeSession(req);
    clearSession(res);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
