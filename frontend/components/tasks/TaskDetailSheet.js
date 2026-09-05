import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import TaskForm from './TaskForm';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../ui/sheet';

export default function TaskDetailSheet({ task, team, onClose, onSave, onDelete }) {
  const [deleting, setDeleting] = useState(false);

  async function removeTask() {
    setDeleting(true);
    const deleted = await onDelete(task._id);
    setDeleting(false);
    if (deleted) onClose();
  }

  return (
    <Sheet open={Boolean(task)} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
        {task && <><SheetHeader><SheetTitle>Edit task</SheetTitle><SheetDescription>{team?.displayName || 'NIDAR team'} task details</SheetDescription></SheetHeader><div className="p-4"><TaskForm task={task} members={team?.members || []} submitLabel="Save changes" onSave={async (values) => { const saved = await onSave(task._id, values); if (saved) onClose(); return saved; }} /><AlertDialog><AlertDialogTrigger asChild><Button variant="destructive" className="mt-6"><Trash2 />Delete task</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete “{task.title}”?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={removeTask} disabled={deleting}>{deleting ? 'Deleting…' : 'Delete task'}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></div></>}
      </SheetContent>
    </Sheet>
  );
}
