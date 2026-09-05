// Single responsibility: list members (used to populate assignee pickers)
// and let a member update their own email/role.
const express = require('express');
const Member = require('../models/Member');
const { parseObjectId } = require('../utils/validation');

const router = express.Router();

// GET /api/members?team=<teamId>
router.get('/', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.team) filter.team = parseObjectId(req.query.team, 'team');

    const members = await Member.find(filter).select('name role team status').lean();
    res.json(members);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/members/:id  { email?, role? }
router.patch('/:id', async (req, res, next) => {
  try {
    const allowed = ['email', 'role'];
    const updates = {};
    for (const key of allowed) {
      if (key in req.body) updates[key] = req.body[key];
    }

    const member = await Member.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).populate('team');

    if (!member) return res.status(404).json({ error: 'Member not found.' });
    res.json(member);
  } catch (err) {
    next(err);
  }
});

module.exports = router;