import { RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

export default function TaskToolbar({ query, status, onQueryChange, onStatusChange, onRefresh, refreshing }) {
  return (
    <section className="task-toolbar" aria-label="Task controls">
      <label className="search-field">
        <span className="sr-only">Search tasks</span>
        <Input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Search tasks and notes" type="search" />
      </label>
      <label className="filter-field">
        <span className="sr-only">Filter by status</span>
        <select value={status} onChange={(event) => onStatusChange(event.target.value)}>
          <option value="all">All statuses</option>
          <option value="todo">To do</option>
          <option value="in-progress">In progress</option>
          <option value="blocked">Blocked</option>
          <option value="done">Done</option>
        </select>
      </label>
      <Button variant="outline" type="button" onClick={onRefresh} disabled={refreshing}>
        <RefreshCw className={refreshing ? 'animate-spin' : ''} />{refreshing ? 'Refreshing…' : 'Refresh'}
      </Button>
    </section>
  );
}
