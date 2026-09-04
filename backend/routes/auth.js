// Single responsibility: name-based sign-in. No passwords: a member either
// already exists (login) or is created on the spot when joining a team.
const express = require('express');
const Team = require('../models/Team');
const Member = require('../models/Member');

const router = express.Router();

// POST /api/auth/login  { name }
// Looks up an existing member by name (case-insensitive).
router.post('/login', async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required.' });
    }

    const member = await Member.findOne({ nameLower: name.trim().toLowerCase() }).populate('team');
    if (!member) {
      return res.status(404).json({ error: 'No member with that name yet. Join a team first.' });
    }

    res.json({ member });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/join  { name, email, teamKey, role }
// Creates a new member on the given team. Email is required so meeting
// invites have somewhere to go.
router.post('/join', async (req, res, next) => {
  try {
    const { name, email, teamKey, role } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required.' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email is required so you can be invited to meetings.' });
    }
    if (!teamKey) {
      return res.status(400).json({ error: 'teamKey is required.' });
    }

    const team = await Team.findOne({ key: teamKey });
    if (!team) {
      return res.status(404).json({ error: `Unknown team: ${teamKey}` });
    }

    const member = await Member.create({
      name: name.trim(),
      email: email.trim(),
      team: team._id,
      role: role || '',
    });
    const populated = await member.populate('team');

    res.status(201).json({ member: populated });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
