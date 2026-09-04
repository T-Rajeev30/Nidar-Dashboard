// Single responsibility: render a labeled progress bar from a progress object
// shaped like { percent, done, total }.
export default function ProgressBar({ progress }) {
  const { percent = 0, done = 0, total = 0 } = progress || {};

  return (
    <div style={styles.wrap}>
      <div style={styles.track}>
        <div style={{ ...styles.fill, width: `${percent}%` }} />
      </div>
      <span style={styles.label}>{done}/{total} · {percent}%</span>
    </div>
  );
}

const styles = {
  wrap: { display: 'flex', alignItems: 'center', gap: 10 },
  track: {
    flex: 1,
    height: 6,
    background: 'var(--line)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    background: 'var(--signal)',
    transition: 'width 300ms ease',
  },
  label: { fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' },
};
