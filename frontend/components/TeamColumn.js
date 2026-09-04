// Single responsibility: one team's column — header, members, progress,
// task list, and the add-task form. Composed from smaller components.
import { useState } from 'react';
import Link from 'next/link';
import ProgressBar from './ProgressBar';
import TaskItem from './TaskItem';
import AddTaskForm from './AddTaskForm';

export default function TeamColumn({ team, tasks, onAddTask, onUpdateTask, onDeleteTask, onSeedModules, onOpenTask, linkToPage = true }) {
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState('');
  const showSeedButton = team.key === 'core-technical' && tasks.length === 0;

  async function handleSeed() {
    if (!onSeedModules) return;
    setSeeding(true);
    setSeedMessage('');
    try {
      const result = await onSeedModules();
      setSeedMessage(`Added ${result.created} module tasks.`);
    } catch (err) {
      setSeedMessage(err.message);
    } finally {
      setSeeding(false);
    }
  }

  return (
    <section style={styles.col}>
      <header style={styles.header}>
        <div>
          {linkToPage ? (
            <Link href={`/teams/${team._id}`} style={styles.nameLink} className="team-name-link">
              <h2 style={styles.name}>{team.displayName}</h2>
            </Link>
          ) : (
            <h2 style={styles.name}>{team.displayName}</h2>
          )}
          <p style={styles.members}>
            {team.members.length > 0
              ? team.members.map((m) => m.name).join(', ')
              : 'No members yet'}
            {team.capacity ? ` · ${team.members.length}/${team.capacity}` : ''}
          </p>
        </div>
      </header>

      <ProgressBar progress={team.progress} />

      {showSeedButton && (
        <div style={styles.seedBox}>
          <p style={styles.seedText}>Load the 15 AirMouse sub-problem modules as starting tasks?</p>
          <button style={styles.seedBtn} onClick={handleSeed} disabled={seeding}>
            {seeding ? 'Loading…' : 'Load 15 modules'}
          </button>
          {seedMessage && <p style={styles.seedMessage}>{seedMessage}</p>}
        </div>
      )}

      <div style={styles.taskList}>
        {tasks.length === 0 && !showSeedButton && <p style={styles.empty}>No tasks yet.</p>}
        {tasks.map((task) => (
          <TaskItem
            key={task._id}
            task={task}
            members={team.members}
            onUpdate={onUpdateTask}
            onDelete={onDeleteTask}
            onOpenDetail={(t) => onOpenTask?.(t, team)}
          />
        ))}
      </div>

      <AddTaskForm onAdd={(payload) => onAddTask(team._id, payload)} />
    </section>
  );
}

const styles = {
  col: {
    background: 'var(--panel)',
    border: '1px solid var(--line)',
    borderRadius: 'var(--radius)',
    padding: 18,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 320,
  },
  header: { marginBottom: 12 },
  nameLink: { textDecoration: 'none', color: 'inherit', cursor: 'pointer' },
  name: { margin: 0, fontSize: 16, fontWeight: 600 },
  members: { margin: '4px 0 0', fontSize: 12, color: 'var(--text-muted)' },
  taskList: { flex: 1, marginTop: 12, overflowY: 'auto' },
  empty: { color: 'var(--text-muted)', fontSize: 13 },
  seedBox: {
    marginTop: 12,
    padding: 12,
    background: 'var(--panel-raised)',
    border: '1px dashed var(--accent-dim)',
    borderRadius: 4,
  },
  seedText: { fontSize: 12, color: 'var(--text-muted)', margin: '0 0 8px' },
  seedBtn: {
    background: 'var(--accent)',
    color: '#171006',
    border: 'none',
    borderRadius: 4,
    padding: '7px 12px',
    fontSize: 12,
    fontWeight: 600,
  },
  seedMessage: { fontSize: 11, color: 'var(--signal)', margin: '8px 0 0' },
};
