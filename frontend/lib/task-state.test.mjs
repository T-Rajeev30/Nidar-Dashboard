import assert from 'node:assert/strict';
import test from 'node:test';
import { applyTaskUpdate } from './task-state.mjs';

test('applyTaskUpdate updates a task without mutating the previous team state', () => {
  const previous = {
    teamA: [{ _id: 'task-1', title: 'Calibrate', status: 'todo', assignee: null }],
  };
  const teams = [{ _id: 'teamA', members: [{ _id: 'member-2', name: 'Asha' }] }];

  const next = applyTaskUpdate(previous, 'task-1', { status: 'done', assignee: 'member-2' }, teams);

  assert.equal(previous.teamA[0].status, 'todo');
  assert.equal(next.teamA[0].status, 'done');
  assert.deepEqual(next.teamA[0].assignee, { _id: 'member-2', name: 'Asha' });
});
