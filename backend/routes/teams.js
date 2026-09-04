// Single responsibility: read-only endpoints for team + progress data.
const express = require('express');
const Team = require('../models/Team');
const Task = require('../models/Task');
const Member = require('../models/Member');
const { computeProgress } = require('../utils/progress');

const router = express.Router();

// GET /api/teams - every team with its members and task progress
router.get('/', async (req, res, next) => {
  try {
    const teams = await Team.find().sort({ key: 1 }).lean();

    const enriched = await Promise.all(
      teams.map(async (team) => {
        const [members, tasks] = await Promise.all([
          Member.find({ team: team._id }).select('name role').lean(),
          Task.find({ team: team._id }).select('status').lean(),
        ]);
        return { ...team, members, progress: computeProgress(tasks) };
      })
    );

    res.json(enriched);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
