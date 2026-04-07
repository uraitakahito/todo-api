import type { CreateTodoInput, Todo, UpdateTodoInput } from './todo.js';

export interface TodoRepository {
  create(input: CreateTodoInput): Promise<Todo>;
  findAll(filter?: { isCompleted?: boolean }): Promise<Todo[]>;
  findById(id: number): Promise<Todo | undefined>;
  update(id: number, input: UpdateTodoInput): Promise<Todo | undefined>;
  delete(id: number): Promise<boolean>;
}
