// Single responsibility: CRUD for team plan/progress entries.
const express = require('express');
const Plan = require('../models/Plan');
const { PHASES } = require('../constants/phases');
const Team = require('../models/Team');
const Member = require('../models/Member');
const { requiredString, optionalString, normalizeHttpUrl, parseDate, parseObjectId, optionalObjectId, ValidationError } = require('../utils/validation');

const router = express.Router();

// GET /api/plans?team=<teamId>&phase=<phase>
router.get('/', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.team) filter.team = req.query.team;
    if (req.query.phase) filter.phase = req.query.phase;

    const plans = await Plan.find(filter)
      .populate('createdBy', 'name')
      .populate('team', 'displayName')
      .sort({ forDate: -1 })
      .lean();

    res.json(plans);
  } catch (err) {
    next(err);
  }
});

// GET /api/plans/phases — the fixed list of phases, for the frontend dropdown
router.get('/phases', (req, res) => {
  res.json(PHASES);
});

// POST /api/plans  { team, title, content, fileUrl, phase, forDate, createdBy }
router.post('/', async (req, res, next) => {
  try {
    const team = parseObjectId(req.body.team, 'team');
    const title = requiredString(req.body.title, 'title', { max: 240 });
    const content = optionalString(req.body.content, 'content');
    const fileUrl = normalizeHttpUrl(req.body.fileUrl, 'fileUrl');
    const phase = req.body.phase || 'simulation';
    const forDate = parseDate(req.body.forDate, 'forDate');
    const createdBy = optionalObjectId(req.body.createdBy, 'createdBy');
    if (!PHASES.includes(phase)) throw new ValidationError('phase is invalid.');
    const [teamDoc, creator] = await Promise.all([Team.exists({ _id: team }), createdBy ? Member.exists({ _id: createdBy }) : null]);
    if (!teamDoc) return res.status(404).json({ error: 'Team not found.', code: 'NOT_FOUND' });
    if (createdBy && !creator) return res.status(404).json({ error: 'Creator not found.', code: 'NOT_FOUND' });

    const plan = await Plan.create({
      team,
      title,
      content, fileUrl, phase,
      forDate,
      createdBy,
    });

    const populated = await plan.populate([
      { path: 'createdBy', select: 'name' },
      { path: 'team', select: 'displayName' },
    ]);
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/plans/:id
router.delete('/:id', async (req, res, next) => {
  try {
    parseObjectId(req.params.id, 'plan');
    const plan = await Plan.findByIdAndDelete(req.params.id);
    if (!plan) return res.status(404).json({ error: 'Plan not found.' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
