// Single responsibility: CRUD for team plan/progress entries.
const express = require('express');
const Plan = require('../models/Plan');
const { PHASES } = require('../constants/phases');

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
    const { team, title, content, fileUrl, phase, forDate, createdBy } = req.body;
    if (!team || !title || !forDate) {
      return res.status(400).json({ error: 'team, title, and forDate are required.' });
    }

    const plan = await Plan.create({
      team,
      title,
      content: content || '',
      fileUrl: fileUrl || '',
      phase: phase || 'simulation',
      forDate,
      createdBy: createdBy || null,
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
    const plan = await Plan.findByIdAndDelete(req.params.id);
    if (!plan) return res.status(404).json({ error: 'Plan not found.' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;