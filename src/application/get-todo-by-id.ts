import { TodoNotFoundError } from '../domain/errors.js';
import type { TodoRepository } from '../domain/todo-repository.js';
import type { Todo } from '../domain/todo.js';

export class GetTodoByIdUseCase {
  constructor(private readonly todoRepository: TodoRepository) {}

  async execute(id: number): Promise<Todo> {
    const todo = await this.todoRepository.findById(id);
    if (!todo) {
      throw new TodoNotFoundError(id);
    }
    return todo;
  }
}
