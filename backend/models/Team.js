// Single responsibility: schema for a sub-team (Core Technical, Design & CAD, Social).
const mongoose = require('mongoose');
const { TEAM_KEYS } = require('../constants/teams');

const teamSchema = new mongoose.Schema(
  {
    key: { type: String, enum: TEAM_KEYS, required: true, unique: true },
    displayName: { type: String, required: true },
    capacity: { type: Number, default: null }, // null = no fixed headcount
  },
  { timestamps: true }
);

module.exports = mongoose.model('Team', teamSchema);
