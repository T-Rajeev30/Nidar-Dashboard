// Single responsibility: list members (used to populate assignee pickers).
const express = require('express');
const Member = require('../models/Member');

const router = express.Router();

// GET /api/members?team=<teamId>
router.get('/', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.team) filter.team = req.query.team;

    const members = await Member.find(filter).select('name role team').lean();
    res.json(members);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
