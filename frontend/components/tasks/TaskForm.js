import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { taskSchema } from '../../lib/task-schema.mjs';
import { Form, FormError, FormField, FormLabel } from '../forms/Form';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

function taskValues(task) {
  return {
    title: task?.title || '',
    description: task?.description || '',
    subProblemRef: task?.subProblemRef ? String(task.subProblemRef) : '',
    dueDate: task?.dueDate ? String(task.dueDate).slice(0, 10) : '',
    assignee: task?.assignee?._id || task?.assignee || '',
    status: task?.status || 'todo',
  };
}

export default function TaskForm({ task, members = [], onSave, onCancel, submitLabel = 'Save task', compact = false }) {
  const form = useForm({ resolver: zodResolver(taskSchema), defaultValues: taskValues(task) });
  const { reset, formState: { isSubmitting } } = form;

  useEffect(() => { reset(taskValues(task)); }, [task, reset]);

  async function submit(values) {
    const saved = await onSave({
      ...values,
      assignee: values.assignee || null,
      dueDate: values.dueDate || null,
    });
    if (saved && !task) reset(taskValues());
    return saved;
  }

  return (
    <Form {...form}>
      <form className={compact ? 'task-form task-form-compact' : 'task-form'} onSubmit={form.handleSubmit(submit)} noValidate>
        <div className="task-form-field">
          <FormLabel htmlFor="task-title">Task title</FormLabel>
          <FormField name="title" control={form.control} render={({ field }) => <Input {...field} id="task-title" autoFocus maxLength="240" placeholder="Next concrete step" />} />
          <FormError name="title" />
        </div>
        {!compact && <div className="task-form-field"><FormLabel htmlFor="task-description">Description</FormLabel><FormField name="description" control={form.control} render={({ field }) => <Textarea {...field} id="task-description" rows={4} placeholder="Context, dependency, or next action" />} /><FormError name="description" /></div>}
        <div className="task-form-grid">
          <div className="task-form-field"><FormLabel htmlFor="task-sub-problem">Sub-problem</FormLabel><FormField name="subProblemRef" control={form.control} render={({ field }) => <Input {...field} id="task-sub-problem" type="number" min="1" max="15" inputMode="numeric" placeholder="1–15" />} /><FormError name="subProblemRef" /></div>
          {!compact && <div className="task-form-field"><FormLabel htmlFor="task-due-date">Due date</FormLabel><FormField name="dueDate" control={form.control} render={({ field }) => <Input {...field} id="task-due-date" type="date" />} /></div>}
        </div>
        {!compact && <div className="task-form-grid">
          <div className="task-form-field"><FormLabel htmlFor="task-status">Status</FormLabel><FormField name="status" control={form.control} render={({ field }) => <select {...field} id="task-status"><option value="todo">To do</option><option value="in-progress">In progress</option><option value="blocked">Blocked</option><option value="done">Done</option></select>} /></div>
          <div className="task-form-field"><FormLabel htmlFor="task-assignee">Assignee</FormLabel><FormField name="assignee" control={form.control} render={({ field }) => <select {...field} id="task-assignee"><option value="">Unassigned</option>{members.map((member) => <option key={member._id} value={member._id}>{member.name}</option>)}</select>} /></div>
        </div>}
        <div className="task-form-actions"><Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : submitLabel}</Button>{onCancel && <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>}</div>
      </form>
    </Form>
  );
}
