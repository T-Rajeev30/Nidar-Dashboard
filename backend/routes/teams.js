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
    const ids = teams.map((team) => team._id);
    const [members, tasks] = await Promise.all([
      Member.find({ team: { $in: ids } }).select('name role team').lean(),
      Task.find({ team: { $in: ids } }).select('status team').lean(),
    ]);
    const membersByTeam = new Map(ids.map((id) => [String(id), []]));
    const tasksByTeam = new Map(ids.map((id) => [String(id), []]));
    members.forEach((member) => membersByTeam.get(String(member.team))?.push(member));
    tasks.forEach((task) => tasksByTeam.get(String(task.team))?.push(task));
    const enriched = teams.map((team) => ({
      ...team,
      members: membersByTeam.get(String(team._id)) || [],
      progress: computeProgress(tasksByTeam.get(String(team._id)) || []),
    }));

    res.json(enriched);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
