const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./middleware/errorHandler');
const teamsRouter = require('./routes/teams');
const membersRouter = require('./routes/members');
const tasksRouter = require('./routes/tasks');
const authRouter = require('./routes/auth');
const meetingsRouter = require('./routes/meetings');
const plansRouter = require('./routes/plans');
const { MISSION_DEADLINE } = require('./constants/mission');

const app = express();
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
  .split(',').map((origin) => origin.trim()).filter(Boolean);

app.disable('x-powered-by');
app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'no-referrer',
  });
  next();
});
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '100kb' }));
app.get('/api/health', (req, res) => res.json({ ok: true }));
app.get('/api/mission', (req, res) => res.json({ deadline: MISSION_DEADLINE }));
app.use('/api/teams', teamsRouter);
app.use('/api/members', membersRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/auth', authRouter);
app.use('/api/meetings', meetingsRouter);
app.use('/api/plans', plansRouter);
app.use('/api', (req, res) => res.status(404).json({ error: 'Route not found.', code: 'NOT_FOUND' }));
app.use(errorHandler);

module.exports = app;
