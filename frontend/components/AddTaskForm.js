import { useState } from 'react';
import { Plus } from 'lucide-react';
import TaskForm from './tasks/TaskForm';
import { Button } from './ui/button';

export default function AddTaskForm({ onAdd }) {
  const [open, setOpen] = useState(false);

  if (!open) return <Button variant="outline" className="add-task-button" type="button" onClick={() => setOpen(true)}><Plus />Add task</Button>;

  return <TaskForm compact submitLabel="Add task" onCancel={() => setOpen(false)} onSave={async ({ title, subProblemRef }) => {
    const saved = await onAdd({ title, subProblemRef });
    if (saved) setOpen(false);
    return saved;
  }} />;
}
