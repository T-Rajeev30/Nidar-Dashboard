// Single responsibility: create/list meetings, and email invitees on creation.
const express = require('express');
const Meeting = require('../models/Meeting');
const Member = require('../models/Member');
const { sendMail } = require('../services/mailer');
const { buildMeetingEmail } = require('../utils/meetingEmail');

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
// Creates the meeting, then immediately emails every invitee (and organizer).
router.post('/', async (req, res, next) => {
  try {
    const { title, agenda, meetLink, scheduledAt, inviteeIds, organizerId } = req.body;

    if (!title || !scheduledAt || !Array.isArray(inviteeIds) || inviteeIds.length === 0) {
      return res.status(400).json({ error: 'title, scheduledAt, and at least one invitee are required.' });
    }

    const invitees = await Member.find({ _id: { $in: inviteeIds } });
    if (invitees.length === 0) {
      return res.status(400).json({ error: 'None of the given invitee IDs matched a member.' });
    }
    const emails = invitees.map((m) => m.email).filter(Boolean);

    const meeting = await Meeting.create({
      title,
      agenda,
      meetLink: meetLink || '',
      scheduledAt,
      invitees: invitees.map((m) => m._id),
      organizer: organizerId || null,
    });

    // Send the email; don't fail the request if email sending has an issue —
    // report it back so the UI can show a clear status instead.
    try {
      if (emails.length === 0) {
        meeting.emailStatus = 'failed';
      } else {
        const organizer = organizerId ? await Member.findById(organizerId) : null;
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