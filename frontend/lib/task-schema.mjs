import { z } from 'zod';

const optionalSubProblemRef = z.union([
  z.literal(''),
  z.coerce.number().int('Use a whole number.').min(1, 'Use a value from 1 to 15.').max(15, 'Use a value from 1 to 15.'),
]).transform((value) => (value === '' ? null : value));

export const taskSchema = z.object({
  title: z.string().trim().min(1, 'Give this task a title.').max(240, 'Title must be 240 characters or fewer.'),
  description: z.string().trim().max(5000, 'Description must be 5,000 characters or fewer.').optional().default(''),
  subProblemRef: optionalSubProblemRef,
  dueDate: z.string().optional().default(''),
  assignee: z.string().nullable().optional().default(''),
  status: z.enum(['todo', 'in-progress', 'blocked', 'done']).default('todo'),
});
