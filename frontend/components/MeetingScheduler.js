// Single responsibility: form to schedule a meeting — pick a time, write an
// agenda, check off attendees from any team, submit. Emailing happens
// server-side once this posts.
import { useState } from 'react';
import { toast } from 'sonner';

export default function MeetingScheduler({ teams, onSchedule }) {
  const [title, setTitle] = useState('');
  const [agenda, setAgenda] = useState('');
  const [meetLink, setMeetLink] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [selected, setSelected] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  function toggleMember(memberId) {
    setSelected((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !scheduledAt || selected.length === 0) {
      toast.error('Title, time, and at least one attendee are required.');
      return;
    }

    setSubmitting(true);
    try {
      const meeting = await onSchedule({
        title: title.trim(),
        agenda: agenda.trim(),
        meetLink: meetLink.trim(),
        scheduledAt: new Date(scheduledAt).toISOString(),
        inviteeIds: selected,
      });
      if (meeting.emailStatus === 'sent') toast.success(`Invite emailed to ${selected.length} attendee(s).`);
      else toast.error('Meeting was saved, but the invite email failed to send.');
      setTitle('');
      setAgenda('');
      setMeetLink('');
      setScheduledAt('');
      setSelected([]);
    } catch (err) {
      toast.error(err.message || 'Unable to schedule this meeting.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.row}>
        <input
          style={styles.input}
          aria-label="Meeting title"
          placeholder="Meeting title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          style={styles.input}
          aria-label="Meeting date and time"
          type="datetime-local"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
        />
      </div>

      <textarea
        style={styles.textarea}
        aria-label="Meeting agenda"
        placeholder="Agenda (optional)"
        value={agenda}
        onChange={(e) => setAgenda(e.target.value)}
        rows={2}
      />

      <input
        style={styles.input}
        aria-label="Meeting link"
        placeholder="Meet link (Google Meet, Zoom, etc. — optional)"
        value={meetLink}
        onChange={(e) => setMeetLink(e.target.value)}
      />

      <p style={styles.sectionLabel}>Attendees</p>
      <div style={styles.teamGroups}>
        {teams.map((team) => (
          <div key={team._id} style={styles.teamGroup}>
            <p style={styles.teamGroupTitle}>{team.displayName}</p>
            {team.members.length === 0 && <p style={styles.noMembers}>No members yet</p>}
            {team.members.map((m) => (
              <label key={m._id} style={styles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={selected.includes(m._id)}
                  onChange={() => toggleMember(m._id)}
                />
                {m.name}
              </label>
            ))}
          </div>
        ))}
      </div>

      <button style={styles.submitBtn} disabled={submitting}>
        {submitting ? 'Scheduling & emailing…' : 'Schedule & send invites'}
      </button>
    </form>
  );
}

const styles = {
  form: { display: 'flex', flexDirection: 'column', gap: 12 },
  row: { display: 'flex', gap: 10, flexWrap: 'wrap' },
  input: {
    flex: 1,
    minWidth: 180,
    background: 'var(--panel-raised)',
    border: '1px solid var(--line)',
    borderRadius: 4,
    padding: '9px 10px',
    color: 'var(--text)',
    fontSize: 13,
  },
  textarea: {
    background: 'var(--panel-raised)',
    border: '1px solid var(--line)',
    borderRadius: 4,
    padding: '9px 10px',
    color: 'var(--text)',
    fontSize: 13,
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  sectionLabel: { fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0' },
  teamGroups: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 },
  teamGroup: { background: 'var(--panel-raised)', border: '1px solid var(--line)', borderRadius: 4, padding: 10 },
  teamGroupTitle: { margin: '0 0 6px', fontSize: 12, fontWeight: 600, color: 'var(--signal)' },
  noMembers: { fontSize: 12, color: 'var(--text-muted)', margin: 0 },
  checkboxRow: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '3px 0' },
  submitBtn: {
    alignSelf: 'flex-start',
    background: 'var(--accent)',
    color: '#171006',
    border: 'none',
    borderRadius: 4,
    padding: '10px 16px',
    fontWeight: 600,
    fontSize: 13,
  },
};
