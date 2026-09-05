// Entry point: wires up Express, connects to MongoDB, mounts routes.
require('dotenv').config();
const { connectDB } = require('./config/db');
const { seedTeams } = require('./seed');
const app = require('./app');

const PORT = process.env.PORT || 5000;

connectDB()
  .then(seedTeams)
  .then(() => {
    app.listen(PORT, () => console.log(`[server] listening on port ${PORT}`));
  })
  .catch((err) => {
    console.error('[server] failed to start');
    process.exit(1);
  });
