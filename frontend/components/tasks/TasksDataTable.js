import { useMemo } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import DataTable from '../data-table/DataTable';

const STATUS_LABELS = {
  todo: 'To do',
  'in-progress': 'In progress',
  blocked: 'Blocked',
  done: 'Done',
};

function statusVariant(status) {
  if (status === 'blocked') return 'destructive';
  if (status === 'done') return 'secondary';
  return 'outline';
}

export default function TasksDataTable({ tasks, teams, onTaskClick, onStatusChange, updatingTaskId, emptyAction }) {
  const teamNames = useMemo(() => new Map(teams.map((team) => [team._id, team.displayName])), [teams]);
  const rows = useMemo(() => tasks.map((task) => ({ ...task, teamName: teamNames.get(task.team?._id || task.team) || 'Unassigned team' })), [tasks, teamNames]);
  const columns = useMemo(() => [
    {
      id: 'select',
      header: ({ table }) => <input aria-label="Select all visible tasks" type="checkbox" checked={table.getIsAllPageRowsSelected()} ref={(element) => { if (element) element.indeterminate = table.getIsSomePageRowsSelected(); }} onChange={table.getToggleAllPageRowsSelectedHandler()} />,
      cell: ({ row }) => <input aria-label={`Select ${row.original.title}`} type="checkbox" checked={row.getIsSelected()} onChange={row.getToggleSelectedHandler()} onClick={(event) => event.stopPropagation()} />,
      enableSorting: false,
      enableHiding: false,
    },
    { accessorKey: 'title', header: 'Task', cell: ({ row }) => <div><strong>{row.original.title}</strong>{row.original.description && <p className="data-table-description">{row.original.description}</p>}{onTaskClick && <Button variant="ghost" size="sm" className="mt-1" onClick={(event) => { event.stopPropagation(); onTaskClick(row.original); }}>Edit task</Button>}</div> },
    { accessorKey: 'teamName', header: 'Team' },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => onStatusChange ? <select aria-label={`Status for ${row.original.title}`} value={row.original.status} disabled={updatingTaskId === row.original._id} onClick={(event) => event.stopPropagation()} onChange={(event) => onStatusChange(row.original._id, { status: event.target.value })}>{Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select> : <Badge variant={statusVariant(row.original.status)}>{STATUS_LABELS[row.original.status] || row.original.status}</Badge> },
    { id: 'assignee', header: 'Assignee', accessorFn: (row) => row.assignee?.name || 'Unassigned', cell: ({ getValue }) => getValue() },
    { id: 'subProblemRef', header: 'Sub-problem', accessorFn: (row) => row.subProblemRef || 0, cell: ({ getValue }) => getValue() ? `SP-${String(getValue()).padStart(2, '0')}` : '—' },
    { id: 'dueDate', header: 'Due date', accessorFn: (row) => row.dueDate || '', cell: ({ getValue }) => getValue() ? new Date(getValue()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—' },
  ], [onStatusChange, onTaskClick, updatingTaskId]);

  return <TasksDataTableView columns={columns} rows={rows} onTaskClick={onTaskClick} emptyAction={emptyAction} />;
}

function TasksDataTableView({ columns, rows, onTaskClick, emptyAction }) {
  return <DataTable columns={columns} data={rows} searchPlaceholder="Search tasks and notes" onRowClick={onTaskClick} emptyMessage="No tasks match the current filters." emptyAction={emptyAction} />;
}
