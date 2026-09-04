// Single responsibility: top bar — mission title, overall progress, signed-in
// member, sign-out.
import ProgressBar from './ProgressBar';
import DeadlineCountdown from './DeadlineCountdown';

export default function Header({ member, overallProgress, deadline, onSignOut }) {
  return (
    <header style={styles.wrap}>
      <div>
        <div style={styles.eyebrowRow}>
          <span style={styles.dot} />
          <span style={styles.eyebrow}>NIDAR 2026-27 · TRACK 1</span>
        </div>
        <h1 style={styles.title}>AirMouse Ops Board</h1>
      </div>

      <div style={styles.progressBlock}>
        <span style={styles.progressLabel}>Mission progress</span>
        <div style={styles.progressBarWrap}>
          <ProgressBar progress={overallProgress} />
        </div>
      </div>

      <DeadlineCountdown deadline={deadline} />

      <div style={styles.memberBlock}>
        <span style={styles.memberName}>{member?.name}</span>
        <span style={styles.memberTeam}>{member?.team?.displayName}</span>
        <button style={styles.signOut} onClick={onSignOut}>Sign out</button>
      </div>
    </header>
  );
}

const styles = {
  wrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 24,
    padding: '18px 28px',
    borderBottom: '1px solid var(--line)',
    flexWrap: 'wrap',
  },
  eyebrowRow: { display: 'flex', alignItems: 'center', gap: 8 },
  dot: { width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)' },
  eyebrow: { fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 1, color: 'var(--signal)' },
  title: { margin: '4px 0 0', fontSize: 20, fontWeight: 700 },
  progressBlock: { flex: 1, maxWidth: 320, minWidth: 200 },
  progressLabel: { fontSize: 11, color: 'var(--text-muted)' },
  progressBarWrap: { marginTop: 6 },
  memberBlock: { display: 'flex', alignItems: 'center', gap: 10, textAlign: 'right' },
  memberName: { fontSize: 14, fontWeight: 600 },
  memberTeam: { fontSize: 12, color: 'var(--text-muted)' },
  signOut: {
    background: 'none',
    border: '1px solid var(--line)',
    color: 'var(--text-muted)',
    borderRadius: 4,
    padding: '6px 10px',
    fontSize: 12,
  },
};
