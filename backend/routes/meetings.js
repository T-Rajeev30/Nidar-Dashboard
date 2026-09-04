// Single responsibility: create/list meetings, and email invitees on creation.
const express = require('express');
const Meeting = require('../models/Meeting');
const Member = require('../models/Member');
const { sendMail } = require('../services/mailer');
const { buildMeetingEmail } = require('../utils/meetingEmail');
const { requiredString, optionalString, normalizeHttpUrl, parseFutureDate, parseObjectId, optionalObjectId, ValidationError } = require('../utils/validation');

const router = express.Router();

// GET /api/meetings — upcoming + past meetings, most recent first
router.get('/', async (req, res, next) => {
  try {
    const meetings = await Meeting.find()
      .populate('invitees', 'name')
      .populate('organizer', 'name')
      .sort({ scheduledAt: -1 })
      .lean();
    res.json(meetings);
  } catch (err) {
    next(err);
  }
});

// POST /api/meetings  { title, agenda, meetLink, scheduledAt, inviteeIds, organizerId }
// Creates the meeting, then immediately emails every selected invitee.
router.post('/', async (req, res, next) => {
  try {
    const title = requiredString(req.body.title, 'title', { max: 240 });
    const agenda = optionalString(req.body.agenda, 'agenda');
    const meetLink = normalizeHttpUrl(req.body.meetLink, 'meetLink');
    const scheduledAt = parseFutureDate(req.body.scheduledAt);
    const organizerId = optionalObjectId(req.body.organizerId, 'organizerId');
    if (!Array.isArray(req.body.inviteeIds) || req.body.inviteeIds.length === 0) throw new ValidationError('At least one invitee is required.');
    const inviteeIds = [...new Set(req.body.inviteeIds.map((id) => parseObjectId(id, 'inviteeId')))];

    const invitees = await Member.find({ _id: { $in: inviteeIds } });
    if (invitees.length !== inviteeIds.length) return res.status(404).json({ error: 'One or more invitees were not found.', code: 'NOT_FOUND' });
    const organizer = organizerId ? await Member.findById(organizerId) : null;
    if (organizerId && !organizer) return res.status(404).json({ error: 'Organizer not found.', code: 'NOT_FOUND' });
    const emails = invitees.map((m) => m.email).filter(Boolean);

    const meeting = await Meeting.create({
      title,
      agenda,
      meetLink: meetLink || '',
      scheduledAt,
      invitees: invitees.map((m) => m._id),
      organizer: organizerId,
    });

    // Send the email; don't fail the request if email sending has an issue —
    // report it back so the UI can show a clear status instead.
    try {
      if (emails.length === 0) {
        meeting.emailStatus = 'failed';
      } else {
        const { subject, text, html } = buildMeetingEmail({
          title,
          agenda,
          meetLink,
          scheduledAt,
          inviteeNames: invitees.map((m) => m.name),
          organizerName: organizer?.name || null,
        });
        await sendMail({ to: emails, subject, text, html });
        meeting.emailStatus = 'sent';
      }
      await meeting.save();
    } catch (mailErr) {
      console.error('[meetings] email failed:', mailErr.message);
      meeting.emailStatus = 'failed';
      await meeting.save();
    }

    const populated = await meeting.populate([
      { path: 'invitees', select: 'name' },
      { path: 'organizer', select: 'name' },
    ]);
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
