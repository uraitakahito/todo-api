import { describe, expect, it, vi } from 'vitest';
import { TodoValidationError } from '../domain/errors.js';
import type { TodoRepository } from '../domain/todo-repository.js';
import type { Todo } from '../domain/todo.js';
import { CreateTodoUseCase } from './create-todo.js';

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

describe('CreateTodoUseCase', () => {
  it('should create a todo with valid title', async () => {
    const repo = createMockRepository();
    vi.mocked(repo.create).mockResolvedValue(sampleTodo);
    const useCase = new CreateTodoUseCase(repo);

    const result = await useCase.execute({ title: 'Test todo' });

    expect(result).toEqual(sampleTodo);
    expect(repo.create).toHaveBeenCalledWith({ title: 'Test todo' });
  });

  it('should throw TodoValidationError for empty title', async () => {
    const repo = createMockRepository();
    const useCase = new CreateTodoUseCase(repo);

    await expect(useCase.execute({ title: '' })).rejects.toThrow(TodoValidationError);
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('should throw TodoValidationError for whitespace-only title', async () => {
    const repo = createMockRepository();
    const useCase = new CreateTodoUseCase(repo);

    await expect(useCase.execute({ title: '   ' })).rejects.toThrow(TodoValidationError);
    expect(repo.create).not.toHaveBeenCalled();
  });
});
