import { describe, expect, it, vi } from 'vitest';
import { TodoNotFoundError } from '../domain/errors.js';
import type { TodoRepository } from '../domain/todo-repository.js';
import type { Todo } from '../domain/todo.js';
import { GetTodoByIdUseCase } from './get-todo-by-id.js';

function createMockRepository(): TodoRepository {
  return {
    create: vi.fn(),
    findAll: vi.fn(),
    findById: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
}

const sampleTodo: Todo = {
  id: 1,
  title: 'Test todo',
  isCompleted: false,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

describe('GetTodoByIdUseCase', () => {
  it('should return a todo when found', async () => {
    const repo = createMockRepository();
    vi.mocked(repo.findById).mockResolvedValue(sampleTodo);
    const useCase = new GetTodoByIdUseCase(repo);

    const result = await useCase.execute(1);

    expect(result).toEqual(sampleTodo);
    expect(repo.findById).toHaveBeenCalledWith(1);
  });

  it('should throw TodoNotFoundError when not found', async () => {
    const repo = createMockRepository();
    vi.mocked(repo.findById).mockResolvedValue(undefined);
    const useCase = new GetTodoByIdUseCase(repo);

    await expect(useCase.execute(999)).rejects.toThrow(TodoNotFoundError);
  });
});
