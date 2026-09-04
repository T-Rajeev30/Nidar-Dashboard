// Single responsibility: schema for a team member. Login is name-based only
// (no password) so `name` is the unique identity used to sign in.
const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    nameLower: { type: String, required: true, unique: true }, // case-insensitive uniqueness
    email: { type: String, required: true, trim: true, lowercase: true },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    role: { type: String, trim: true, default: '' }, // e.g. "LinkedIn", "Frame lead"
  },
  { timestamps: true }
);

memberSchema.pre('validate', function setNameLower(next) {
  if (this.name) this.nameLower = this.name.trim().toLowerCase();
  next();
});

module.exports = mongoose.model('Member', memberSchema);
