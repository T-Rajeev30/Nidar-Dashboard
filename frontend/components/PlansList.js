// Single responsibility: list of uploaded plans across teams, most recent
// first, with the phase and team visible so it reads as a running log.
const PHASE_LABELS = {
  simulation: 'Simulation',
  'hardware-integration': 'Hardware Integration',
  testing: 'Testing',
  final: 'Final',
};
import { safeExternalUrl } from '../lib/dashboard-utils.mjs';
import { Button } from './ui/button';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export default function PlansList({ plans, onDelete }) {
  if (plans.length === 0) {
    return <div className="empty-state-action"><p style={styles.empty}>No plans have been posted yet. Share the next team milestone to keep progress visible.</p><Button asChild size="sm"><a href="#post-plan">Post a plan</a></Button></div>;
  }

  return (
    <div style={styles.list}>
      {plans.map((plan) => {
        const fileUrl = safeExternalUrl(plan.fileUrl);
        return (
        <div key={plan._id} style={styles.card}>
          <div style={styles.headerRow}>
            <span style={styles.phaseTag}>{PHASE_LABELS[plan.phase] || plan.phase}</span>
            <span style={styles.teamName}>{plan.team?.displayName}</span>
            <span style={styles.date}>{formatDate(plan.forDate)}</span>
            <button style={styles.deleteBtn} onClick={() => window.confirm(`Delete “${plan.title}”? This cannot be undone.`) && onDelete(plan._id)} aria-label={`Delete ${plan.title}`}>✕</button>
          </div>
          <p style={styles.title}>{plan.title}</p>
          {plan.content && <p style={styles.content}>{plan.content}</p>}
          {fileUrl && (
            <a href={fileUrl} target="_blank" rel="noreferrer" style={styles.fileLink}>
              View attached file →
            </a>
          )}
          {plan.createdBy?.name && <p style={styles.by}>Uploaded by {plan.createdBy.name}</p>}
        </div>
      ); })}
    </div>
  );
}

const styles = {
  list: { display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 420, overflowY: 'auto' },
  card: {
    background: 'var(--panel-raised)',
    border: '1px solid var(--line)',
    borderRadius: 4,
    padding: '12px 14px',
  },
  headerRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' },
  phaseTag: {
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    color: 'var(--accent)',
    border: '1px solid var(--accent-dim)',
    borderRadius: 3,
    padding: '1px 6px',
  },
  teamName: { fontSize: 12, color: 'var(--signal)', fontWeight: 600 },
  date: { fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' },
  deleteBtn: { background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 13, padding: '0 2px' },
  title: { fontSize: 14, fontWeight: 600, margin: '2px 0' },
  content: { fontSize: 13, color: 'var(--text-muted)', margin: '4px 0', whiteSpace: 'pre-wrap' },
  fileLink: { fontSize: 12, color: 'var(--signal)', textDecoration: 'none' },
  by: { fontSize: 11, color: 'var(--text-muted)', margin: '6px 0 0' },
  empty: { fontSize: 13, color: 'var(--text-muted)' },
};
