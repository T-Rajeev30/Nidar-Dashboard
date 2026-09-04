// Entry point: wires up Express, connects to MongoDB, mounts routes.
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { connectDB } = require('./config/db');
const { seedTeams } = require('./seed');
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
  .split(',')
  .map((o) => o.trim());
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.get('/api/mission', (req, res) => res.json({ deadline: MISSION_DEADLINE }));
app.use('/api/teams', teamsRouter);
app.use('/api/members', membersRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/auth', authRouter);
app.use('/api/meetings', meetingsRouter);
app.use('/api/plans', plansRouter);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB()
  .then(seedTeams)
  .then(() => {
    app.listen(PORT, () => console.log(`[server] listening on port ${PORT}`));
  })
  .catch((err) => {
    console.error('[server] failed to start:', err.message);
    process.exit(1);
  });