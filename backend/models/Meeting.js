// Single responsibility: schema for a scheduled meeting.
const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    agenda: { type: String, trim: true, default: '' },
    meetLink: { type: String, trim: true, default: '' },
    scheduledAt: { type: Date, required: true },
    invitees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true }],
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', default: null },
    emailStatus: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Meeting', meetingSchema);