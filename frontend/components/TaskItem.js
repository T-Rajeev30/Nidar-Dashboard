// Single responsibility: one task row — shows status/assignee, lets any
// signed-in member update status or delete it.
const STATUS_OPTIONS = [
  { value: 'todo', label: 'To do', color: 'var(--status-todo)' },
  { value: 'in-progress', label: 'In progress', color: 'var(--status-progress)' },
  { value: 'blocked', label: 'Blocked', color: 'var(--status-blocked)' },
  { value: 'done', label: 'Done', color: 'var(--status-done)' },
];

export default function TaskItem({ task, members, onUpdate, onDelete }) {
  const statusMeta = STATUS_OPTIONS.find((s) => s.value === task.status) || STATUS_OPTIONS[0];

  return (
    <div style={styles.row}>
      <span style={{ ...styles.dot, background: statusMeta.color }} />

      <div style={styles.body}>
        <div style={styles.titleRow}>
          <span style={styles.title}>{task.title}</span>
          {task.subProblemRef && (
            <span style={styles.subRef}>SP-{String(task.subProblemRef).padStart(2, '0')}</span>
          )}
        </div>
        {task.description && <p style={styles.desc}>{task.description}</p>}
      </div>

      <select
        value={task.status}
        onChange={(e) => onUpdate(task._id, { status: e.target.value })}
        style={styles.select}
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>

      <select
        value={task.assignee?._id || task.assignee || ''}
        onChange={(e) => onUpdate(task._id, { assignee: e.target.value || null })}
        style={styles.select}
      >
        <option value="">Unassigned</option>
        {members.map((m) => (
          <option key={m._id} value={m._id}>{m.name}</option>
        ))}
      </select>

      <button style={styles.deleteBtn} onClick={() => onDelete(task._id)} title="Delete task">✕</button>
    </div>
  );
}

const styles = {
  row: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    padding: '10px 8px',
    borderBottom: '1px solid var(--line)',
  },
  dot: { width: 8, height: 8, borderRadius: '50%', marginTop: 6, flexShrink: 0 },
  body: { flex: 1, minWidth: 0 },
  titleRow: { display: 'flex', alignItems: 'center', gap: 8 },
  title: { fontSize: 14, fontWeight: 500 },
  subRef: {
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    color: 'var(--accent)',
    border: '1px solid var(--accent-dim)',
    borderRadius: 3,
    padding: '1px 5px',
  },
  desc: { margin: '4px 0 0', fontSize: 12, color: 'var(--text-muted)' },
  select: {
    background: 'var(--panel-raised)',
    border: '1px solid var(--line)',
    color: 'var(--text)',
    borderRadius: 4,
    fontSize: 12,
    padding: '4px 6px',
    maxWidth: 120,
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: 13,
    padding: 4,
  },
};
