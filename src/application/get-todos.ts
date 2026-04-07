import type { TodoRepository } from '../domain/todo-repository.js';
import type { Todo } from '../domain/todo.js';

export class GetTodosUseCase {
  constructor(private readonly todoRepository: TodoRepository) {}

  async execute(filter?: { isCompleted?: boolean }): Promise<Todo[]> {
    return this.todoRepository.findAll(filter);
  }
}
