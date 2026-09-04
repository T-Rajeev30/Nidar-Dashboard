// Single responsibility: idempotently make sure the 3 fixed teams exist.
// Run automatically on server start, and can also be run manually:
//   node seed.js
const { TEAMS } = require('./constants/teams');
const Team = require('./models/Team');

async function seedTeams() {
  for (const team of TEAMS) {
    await Team.findOneAndUpdate(
      { key: team.key },
      { key: team.key, displayName: team.displayName, capacity: team.capacity },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
  console.log('[seed] teams ready: core-technical, design-cad, social, documentation');
}

module.exports = { seedTeams };

// Allow running directly: `node seed.js`
if (require.main === module) {
  require('dotenv').config();
  const { connectDB } = require('./config/db');
  connectDB()
    .then(seedTeams)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}