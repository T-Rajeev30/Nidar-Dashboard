import test from 'node:test';
import assert from 'node:assert/strict';
import { filterTasks, localDateInputValue, safeExternalUrl } from './dashboard-utils.mjs';

test('filterTasks matches a task title case-insensitively and respects status', () => {
  const tasks = [
    { title: 'Calibrate optical flow', status: 'todo' },
    { title: 'Test frame', status: 'done' },
  ];
  assert.deepEqual(filterTasks(tasks, { query: 'OPTICAL', status: 'all' }), [tasks[0]]);
  assert.deepEqual(filterTasks(tasks, { query: '', status: 'done' }), [tasks[1]]);
});

test('safeExternalUrl only permits http and https', () => {
  assert.equal(safeExternalUrl('https://example.com/plan'), 'https://example.com/plan');
  assert.equal(safeExternalUrl('javascript:alert(1)'), null);
});

test('localDateInputValue uses the local calendar date', () => {
  assert.equal(localDateInputValue(new Date(2026, 0, 2, 0, 30)), '2026-01-02');
});
