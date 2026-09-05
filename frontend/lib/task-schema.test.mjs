import assert from 'node:assert/strict';
import test from 'node:test';
import { taskSchema } from './task-schema.mjs';

test('taskSchema mirrors task title and sub-problem API limits', () => {
  assert.equal(taskSchema.safeParse({ title: 'Optical calibration', subProblemRef: '15' }).success, true);
  assert.equal(taskSchema.safeParse({ title: ' ', subProblemRef: '' }).success, false);
  assert.equal(taskSchema.safeParse({ title: 'x'.repeat(241), subProblemRef: '' }).success, false);
  assert.equal(taskSchema.safeParse({ title: 'Valid title', subProblemRef: '16' }).success, false);
});
