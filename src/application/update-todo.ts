import { TodoNotFoundError } from '../domain/errors.js';
import type { TodoRepository } from '../domain/todo-repository.js';
import type { Todo, UpdateTodoInput } from '../domain/todo.js';

export class UpdateTodoUseCase {
  constructor(private readonly todoRepository: TodoRepository) {}

  async execute(id: number, input: UpdateTodoInput): Promise<Todo> {
    const todo = await this.todoRepository.update(id, input);
    if (!todo) {
      throw new TodoNotFoundError(id);
    }
    return todo;
  }
}
