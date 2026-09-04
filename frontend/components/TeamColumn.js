// Single responsibility: one team's column — header, members, progress,
// task list, and the add-task form. Composed from smaller components.
import ProgressBar from './ProgressBar';
import TaskItem from './TaskItem';
import AddTaskForm from './AddTaskForm';

export default function TeamColumn({ team, tasks, onAddTask, onUpdateTask, onDeleteTask }) {
  return (
    <section style={styles.col}>
      <header style={styles.header}>
        <div>
          <h2 style={styles.name}>{team.displayName}</h2>
          <p style={styles.members}>
            {team.members.length > 0
              ? team.members.map((m) => m.name).join(', ')
              : 'No members yet'}
            {team.capacity ? ` · ${team.members.length}/${team.capacity}` : ''}
          </p>
        </div>
      </header>

      <ProgressBar progress={team.progress} />

      <div style={styles.taskList}>
        {tasks.length === 0 && <p style={styles.empty}>No tasks yet.</p>}
        {tasks.map((task) => (
          <TaskItem
            key={task._id}
            task={task}
            members={team.members}
            onUpdate={onUpdateTask}
            onDelete={onDeleteTask}
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
  name: { margin: 0, fontSize: 16, fontWeight: 600 },
  members: { margin: '4px 0 0', fontSize: 12, color: 'var(--text-muted)' },
  taskList: { flex: 1, marginTop: 12, overflowY: 'auto' },
  empty: { color: 'var(--text-muted)', fontSize: 13 },
};
