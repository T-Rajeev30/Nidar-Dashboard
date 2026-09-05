import assert from 'node:assert/strict';
import test from 'node:test';
import { createDashboardMetrics } from './dashboard-metrics.mjs';

test('createDashboardMetrics counts active, overdue, current-week meetings, and unique members', () => {
  const metrics = createDashboardMetrics({
    tasks: [
      { status: 'todo', dueDate: '2026-09-01T00:00:00.000Z' },
      { status: 'in-progress', dueDate: '2026-09-10T00:00:00.000Z' },
      { status: 'done', dueDate: '2026-08-01T00:00:00.000Z' },
      { status: 'blocked' },
    ],
    meetings: [
      { scheduledAt: '2026-09-07T10:00:00.000Z' },
      { scheduledAt: '2026-09-13T18:00:00.000Z' },
      { scheduledAt: '2026-09-14T10:00:00.000Z' },
    ],
    teams: [
      { members: [{ _id: 'one' }, { _id: 'two' }] },
      { members: [{ _id: 'two' }, { _id: 'three' }] },
    ],
    now: new Date('2026-09-08T12:00:00.000Z'),
  });

  assert.deepEqual(metrics.cards, [
    { label: 'Active tasks', value: 3 },
    { label: 'Overdue', value: 1 },
    { label: 'Meetings this week', value: 2 },
    { label: 'Team members', value: 3 },
  ]);
  assert.deepEqual(metrics.statusData, [
    { status: 'To do', count: 1 },
    { status: 'In progress', count: 1 },
    { status: 'Blocked', count: 1 },
    { status: 'Done', count: 1 },
  ]);
});
