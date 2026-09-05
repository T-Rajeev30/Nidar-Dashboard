import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Search, Plus, LayoutDashboard, UsersRound } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { navigateWithViewTransition } from '../lib/view-transitions';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from './ui/dialog';

export default function CommandPalette({ open, onOpenChange, tasks, onTaskSelect, isAdmin }) {
  const router = useRouter();
  useEffect(() => {
    function handleKeyDown(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        onOpenChange(!open);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  function selectTask(task) {
    onOpenChange(false);
    onTaskSelect(task);
  }

  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="command-dialog" showCloseButton={false}>
      <DialogTitle className="sr-only">Find tasks and actions</DialogTitle>
      <DialogDescription className="sr-only">Search tasks, open a task, or jump to a dashboard action.</DialogDescription>
      <Command label="Find tasks and actions">
        <div className="command-search"><Search aria-hidden="true" /><CommandInput autoFocus placeholder="Search tasks or actions…" /></div>
        <CommandList>
          <CommandEmpty>No matching tasks or actions.</CommandEmpty>
          <CommandGroup heading="Actions">
            <CommandItem onSelect={() => { onOpenChange(false); document.getElementById('create-task')?.scrollIntoView({ behavior: 'smooth' }); }}><Plus aria-hidden="true" />Create a task</CommandItem>
            <CommandItem onSelect={() => { onOpenChange(false); window.location.hash = 'schedule-meeting'; }}><LayoutDashboard aria-hidden="true" />Schedule a meeting</CommandItem>
            {isAdmin && <CommandItem onSelect={() => { onOpenChange(false); navigateWithViewTransition(() => router.push('/admin/members')); }}><UsersRound aria-hidden="true" />Manage members</CommandItem>}
          </CommandGroup>
          <CommandGroup heading="Tasks">
            {tasks.slice(0, 40).map((task) => <CommandItem key={task._id} value={`${task.title} ${task.description || ''}`} onSelect={() => selectTask(task)}>{task.title}<span className="command-meta">{task.status}</span></CommandItem>)}
          </CommandGroup>
        </CommandList>
      </Command>
      <p className="command-hint">Use ↑↓ to navigate · Enter to select · Esc to close</p>
    </DialogContent>
  </Dialog>;
}
