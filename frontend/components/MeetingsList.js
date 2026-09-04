// Single responsibility: list scheduled meetings with their attendees and
// email-send status.
export default function MeetingsList({ meetings }) {
  if (meetings.length === 0) {
    return <p style={styles.empty}>No meetings scheduled yet.</p>;
  }

  return (
    <div style={styles.list}>
      {meetings.map((m) => (
        <div key={m._id} style={styles.card}>
          <div style={styles.topRow}>
            <span style={styles.title}>{m.title}</span>
            <span style={{ ...styles.badge, ...(m.emailStatus === 'sent' ? styles.badgeSent : styles.badgeFailed) }}>
              {m.emailStatus === 'sent' ? 'Invites sent' : 'Email failed'}
            </span>
          </div>
          <p style={styles.when}>
            {new Date(m.scheduledAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
          </p>
          {m.agenda && <p style={styles.agenda}>{m.agenda}</p>}
          {m.meetLink && (
            <a href={m.meetLink} target="_blank" rel="noreferrer" style={styles.meetLink}>
              Join meeting →
            </a>
          )}
          <p style={styles.attendees}>
            {m.invitees.map((i) => i.name).join(', ')}
          </p>
        </div>
      ))}
    </div>
  );
}

const styles = {
  list: { display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 420, overflowY: 'auto', paddingRight: 4 },
  card: { background: 'var(--panel-raised)', border: '1px solid var(--line)', borderRadius: 4, padding: '12px 14px' },
  topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  title: { fontSize: 14, fontWeight: 600 },
  badge: { fontSize: 10, fontFamily: 'var(--font-mono)', padding: '2px 6px', borderRadius: 3 },
  badgeSent: { background: 'rgba(77,214,140,0.15)', color: 'var(--done)' },
  badgeFailed: { background: 'rgba(229,72,77,0.15)', color: 'var(--status-blocked)' },
  when: { margin: '4px 0', fontSize: 12, color: 'var(--signal)', fontFamily: 'var(--font-mono)' },
  agenda: { margin: '4px 0', fontSize: 13, color: 'var(--text-muted)' },
  meetLink: { display: 'block', margin: '4px 0', fontSize: 12, color: 'var(--signal)', textDecoration: 'none' },
  attendees: { margin: '4px 0 0', fontSize: 12, color: 'var(--text-muted)' },
  empty: { color: 'var(--text-muted)', fontSize: 13 },
};