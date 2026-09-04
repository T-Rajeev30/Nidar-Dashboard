// Single responsibility: list scheduled meetings with their attendees and
// email-send status.
import { useState } from 'react';
import { safeExternalUrl } from '../lib/dashboard-utils.mjs';
export default function MeetingsList({ meetings, onRetry }) {
  const [retryingId, setRetryingId] = useState(null);

  if (meetings.length === 0) {
    return <p style={styles.empty}>No meetings scheduled yet.</p>;
  }

  return (
    <div style={styles.list}>
      {meetings.map((m) => {
        const meetUrl = safeExternalUrl(m.meetLink);
        return (
        <div key={m._id} style={styles.card}>
          <div style={styles.topRow}>
            <span style={styles.title}>{m.title}</span>
            <span style={{ ...styles.badge, ...(m.emailStatus === 'sent' ? styles.badgeSent : m.emailStatus === 'pending' ? styles.badgePending : styles.badgeFailed) }}>
              {m.emailStatus === 'sent' ? 'Invites sent' : m.emailStatus === 'pending' ? 'Delivery pending' : 'Invite delivery failed'}
            </span>
          </div>
          <p style={styles.when}>
            {new Date(m.scheduledAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
          </p>
          {m.agenda && <p style={styles.agenda}>{m.agenda}</p>}
          {meetUrl && (
            <a href={meetUrl} target="_blank" rel="noreferrer" style={styles.meetLink}>
              Join meeting →
            </a>
          )}
          <p style={styles.attendees}>
            {m.invitees.map((i) => i.name).join(', ')}
          </p>
          {m.emailStatus === 'failed' && onRetry && (
            <button
              type="button"
              style={styles.retryBtn}
              disabled={retryingId === m._id}
              onClick={async () => {
                setRetryingId(m._id);
                try {
                  await onRetry(m._id);
                } finally {
                  setRetryingId(null);
                }
              }}
            >
              {retryingId === m._id ? 'Retrying…' : 'Retry invite'}
            </button>
          )}
        </div>
      ); })}
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
  badgePending: { background: 'rgba(240,180,80,0.15)', color: 'var(--accent)' },
  badgeFailed: { background: 'rgba(229,72,77,0.15)', color: 'var(--status-blocked)' },
  when: { margin: '4px 0', fontSize: 12, color: 'var(--signal)', fontFamily: 'var(--font-mono)' },
  agenda: { margin: '4px 0', fontSize: 13, color: 'var(--text-muted)' },
  meetLink: { display: 'block', margin: '4px 0', fontSize: 12, color: 'var(--signal)', textDecoration: 'none' },
  attendees: { margin: '4px 0 0', fontSize: 12, color: 'var(--text-muted)' },
  retryBtn: { marginTop: 8, background: 'transparent', border: '1px solid var(--line)', color: 'var(--signal)', borderRadius: 4, padding: '6px 9px', fontSize: 12, cursor: 'pointer' },
  empty: { color: 'var(--text-muted)', fontSize: 13 },
};
