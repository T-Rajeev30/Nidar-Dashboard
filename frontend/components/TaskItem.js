// Single responsibility: one task row — shows status/assignee, lets any
// signed-in member update status, toggle the highlight flag, or delete it.
import { useState } from 'react';
const STATUS_OPTIONS = [
  { value: 'todo', label: 'To do', color: 'var(--status-todo)' },
  { value: 'in-progress', label: 'In progress', color: 'var(--status-progress)' },
  { value: 'blocked', label: 'Blocked', color: 'var(--status-blocked)' },
  { value: 'done', label: 'Done', color: 'var(--status-done)' },
];

export default function TaskItem({ task, members, onUpdate, onDelete, onOpenDetail }) {
  const [busy, setBusy] = useState(false);
  const statusMeta = STATUS_OPTIONS.find((s) => s.value === task.status) || STATUS_OPTIONS[0];
  const cardClass = [
    'task-card',
    `task-card--${task.status}`,
    task.highlighted ? 'task-card--highlighted' : '',
  ].join(' ').trim();

  async function update(changes) { setBusy(true); try { await onUpdate(task._id, changes); } finally { setBusy(false); } }
  async function remove() { if (!window.confirm(`Delete “${task.title}”? This cannot be undone.`)) return; setBusy(true); try { await onDelete(task._id); } finally { setBusy(false); } }
  return (
    <div className={cardClass} style={styles.row} aria-busy={busy}>
      <button
        className={`highlight-toggle ${task.highlighted ? 'highlight-toggle--on' : ''}`}
        onClick={() => update({ highlighted: !task.highlighted })}
        disabled={busy}
        aria-label={task.highlighted ? `Remove highlight from ${task.title}` : `Highlight ${task.title}`}
        title={task.highlighted ? 'Remove highlight' : 'Highlight this task'}
      >
        {task.highlighted ? '★' : '☆'}
      </button>

      <div style={styles.body}>
        <div style={styles.titleRow}>
          <button style={styles.titleBtn} onClick={() => onOpenDetail?.(task)} disabled={busy}>{task.title}</button>
          {task.subProblemRef && (
            <span style={styles.subRef}>SP-{String(task.subProblemRef).padStart(2, '0')}</span>
          )}
        </div>
        {task.description && <p style={styles.desc}>{task.description}</p>}
      </div>

      <select
        value={task.status}
        onChange={(e) => update({ status: e.target.value })}
        disabled={busy}
        style={{ ...styles.select, color: statusMeta.color }}
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>

      <select
        value={task.assignee?._id || task.assignee || ''}
        onChange={(e) => update({ assignee: e.target.value || null })}
        disabled={busy}
        style={styles.select}
      >
        <option value="">Unassigned</option>
        {members.map((m) => (
          <option key={m._id} value={m._id}>{m.name}</option>
        ))}
      </select>

      <button style={styles.deleteBtn} onClick={remove} disabled={busy} title="Delete task" aria-label={`Delete ${task.title}`}>✕</button>
    </div>
  );
}

const styles = {
  row: {
    borderRadius: 4,
  },
  body: { flex: 1, minWidth: 0 },
  titleRow: { display: 'flex', alignItems: 'center', gap: 8 },
  titleBtn: {
    background: 'none',
    border: 'none',
    padding: 0,
    fontSize: 14,
    fontWeight: 500,
    color: 'var(--text)',
    textAlign: 'left',
    cursor: 'pointer',
  },
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
