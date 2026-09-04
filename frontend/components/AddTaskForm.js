// Single responsibility: inline form for adding one task to a team.
import { useState } from 'react';

export default function AddTaskForm({ onAdd }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [subProblemRef, setSubProblemRef] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    await onAdd({
      title: title.trim(),
      subProblemRef: subProblemRef ? Number(subProblemRef) : null,
    });
    setTitle('');
    setSubProblemRef('');
    setOpen(false);
  }

  if (!open) {
    return (
      <button style={styles.openBtn} onClick={() => setOpen(true)}>+ Add task</button>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <input
        style={styles.input}
        placeholder="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        autoFocus
      />
      <input
        style={styles.numInput}
        placeholder="SP#"
        type="number"
        min="1"
        max="15"
        value={subProblemRef}
        onChange={(e) => setSubProblemRef(e.target.value)}
        title="Optional: link to sub-problem 1-15"
      />
      <button style={styles.saveBtn} type="submit">Add</button>
      <button style={styles.cancelBtn} type="button" onClick={() => setOpen(false)}>Cancel</button>
    </form>
  );
}

const styles = {
  openBtn: {
    width: '100%',
    marginTop: 10,
    padding: '8px 10px',
    background: 'none',
    border: '1px dashed var(--line)',
    borderRadius: 4,
    color: 'var(--text-muted)',
    fontSize: 13,
  },
  form: { display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' },
  input: {
    flex: 1,
    minWidth: 120,
    background: 'var(--panel-raised)',
    border: '1px solid var(--line)',
    borderRadius: 4,
    padding: '7px 8px',
    color: 'var(--text)',
    fontSize: 13,
  },
  numInput: {
    width: 52,
    background: 'var(--panel-raised)',
    border: '1px solid var(--line)',
    borderRadius: 4,
    padding: '7px 8px',
    color: 'var(--text)',
    fontSize: 13,
  },
  saveBtn: {
    background: 'var(--accent)',
    color: '#171006',
    border: 'none',
    borderRadius: 4,
    padding: '7px 12px',
    fontSize: 13,
    fontWeight: 600,
  },
  cancelBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: 13,
  },
};
