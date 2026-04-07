import { TodoValidationError } from '../domain/errors.js';
import type { TodoRepository } from '../domain/todo-repository.js';
import type { CreateTodoInput, Todo } from '../domain/todo.js';

export class CreateTodoUseCase {
  constructor(private readonly todoRepository: TodoRepository) {}

  async execute(input: CreateTodoInput): Promise<Todo> {
    if (!input.title.trim()) {
      throw new TodoValidationError('Title cannot be empty');
    }
    return this.todoRepository.create(input);
  }
}
