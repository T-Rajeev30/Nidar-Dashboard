import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Search, Plus, LayoutDashboard, UsersRound } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { navigateWithViewTransition } from '../lib/view-transitions';

export default function CommandPalette({ open, onOpenChange, tasks, onTaskSelect, isAdmin }) {
  const router = useRouter();
  useEffect(() => {
    function handleKeyDown(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        onOpenChange(!open);
      }
      if (open && event.key === 'Escape') onOpenChange(false);
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  if (!open) return null;

  function selectTask(task) {
    onOpenChange(false);
    onTaskSelect(task);
  }

  return <div className="command-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onOpenChange(false); }}>
    <div className="command-dialog" role="dialog" aria-modal="true" aria-label="Find tasks and actions">
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
    </div>
  </div>;
}
