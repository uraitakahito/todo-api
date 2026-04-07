import { TodoNotFoundError } from '../domain/errors.js';
import type { TodoRepository } from '../domain/todo-repository.js';

export class DeleteTodoUseCase {
  constructor(private readonly todoRepository: TodoRepository) {}

  async execute(id: number): Promise<void> {
    if (!(await this.todoRepository.delete(id))) {
      throw new TodoNotFoundError(id);
    }
  }
}
