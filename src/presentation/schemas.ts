import { z } from 'zod';

export const createTodoBodySchema = z.object({
  title: z.string().min(1, 'Title cannot be empty'),
});

export const updateTodoBodySchema = z.object({
  title: z.string().min(1, 'Title cannot be empty').optional(),
  isCompleted: z.boolean().optional(),
});

export const todoIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const todosQuerySchema = z.object({
  isCompleted: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional(),
});
