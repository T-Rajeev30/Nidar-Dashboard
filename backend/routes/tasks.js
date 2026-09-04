// Single responsibility: CRUD for tasks.
const express = require('express');
const Task = require('../models/Task');

const router = express.Router();

// GET /api/tasks?team=<teamId>&status=<status>
router.get('/', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.team) filter.team = req.query.team;
    if (req.query.status) filter.status = req.query.status;

    const tasks = await Task.find(filter)
      .populate('assignee', 'name')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .lean();

    res.json(tasks);
  } catch (err) {
    next(err);
  }
});

// POST /api/tasks  { title, description, team, assignee, subProblemRef, dueDate, createdBy }
router.post('/', async (req, res, next) => {
  try {
    const { title, description, team, assignee, subProblemRef, dueDate, createdBy } = req.body;
    if (!title || !team) {
      return res.status(400).json({ error: 'title and team are required.' });
    }

    const task = await Task.create({
      title,
      description,
      team,
      assignee: assignee || null,
      subProblemRef: subProblemRef || null,
      dueDate: dueDate || null,
      createdBy: createdBy || null,
    });

    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/tasks/:id  { status?, assignee?, title?, description?, dueDate? }
router.patch('/:id', async (req, res, next) => {
  try {
    const allowed = ['status', 'assignee', 'title', 'description', 'dueDate', 'subProblemRef'];
    const updates = {};
    for (const key of allowed) {
      if (key in req.body) updates[key] = req.body[key];
    }

    const task = await Task.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!task) return res.status(404).json({ error: 'Task not found.' });

    res.json(task);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found.' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
