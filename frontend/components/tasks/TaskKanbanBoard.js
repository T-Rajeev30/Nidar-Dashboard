import { useState } from 'react';
import { DndContext, KeyboardSensor, PointerSensor, closestCorners, useDraggable, useDroppable, useSensor, useSensors } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Badge } from '../ui/badge';

const STATUSES = [
  ['todo', 'To do'],
  ['in-progress', 'In progress'],
  ['blocked', 'Blocked'],
  ['done', 'Done'],
];

function KanbanColumn({ status, label, tasks, onTaskClick }) {
  const { isOver, setNodeRef } = useDroppable({ id: `status:${status}` });
  return <section ref={setNodeRef} className={`kanban-column${isOver ? ' kanban-column-over' : ''}`} aria-labelledby={`kanban-${status}`}>
    <div className="kanban-column-heading"><h3 id={`kanban-${status}`}>{label}</h3><Badge variant="outline">{tasks.length}</Badge></div>
    <div className="kanban-cards">{tasks.length === 0 ? <p className="empty-state">Drop a task here</p> : tasks.map((task) => <KanbanCard key={task._id} task={task} onTaskClick={onTaskClick} />)}</div>
  </section>;
}

function KanbanCard({ task, onTaskClick }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task._id, data: { task } });
  const style = { transform: CSS.Translate.toString(transform) };
  return <button type="button" ref={setNodeRef} style={style} className={`kanban-card${isDragging ? ' kanban-card-dragging' : ''}`} {...listeners} {...attributes} aria-label={`${task.title}, status ${task.status}. Activate to open task.`} onClick={() => onTaskClick?.(task)}>
    <strong>{task.title}</strong>
    {task.description && <p>{task.description}</p>}
    <div className="kanban-card-meta"><span>{task.assignee?.name || 'Unassigned'}</span>{task.dueDate && <time dateTime={task.dueDate}>{new Date(task.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</time>}</div>
    <span className="kanban-card-edit">Open task</span>
  </button>;
}

export default function TaskKanbanBoard({ tasks, onStatusChange, onTaskClick, updatingTaskId, emptyAction }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const [activeId, setActiveId] = useState(null);
  function handleDragEnd({ active, over }) {
    setActiveId(null);
    if (!over) return;
    const task = tasks.find((item) => item._id === active.id);
    const nextStatus = String(over.id).replace(/^status:/, '');
    if (task && task.status !== nextStatus && updatingTaskId !== task._id) onStatusChange(task._id, { status: nextStatus });
  }
  if (!tasks.length) return <div className="kanban-empty"><p>No tasks match the current filters.</p>{emptyAction}</div>;
  return <div className="kanban-board-wrap"><p className="sr-only">Drag a task with the mouse or keyboard to change its status. Activate a task card to edit.</p><DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={({ active }) => setActiveId(active.id)} onDragCancel={() => setActiveId(null)} onDragEnd={handleDragEnd}>
    <div className="kanban-board" data-active-task={activeId || undefined}>{STATUSES.map(([status, label]) => <KanbanColumn key={status} status={status} label={label} tasks={tasks.filter((task) => task.status === status)} onTaskClick={onTaskClick} />)}</div>
  </DndContext></div>;
}
