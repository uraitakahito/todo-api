export class TodoNotFoundError extends Error {
  constructor(public readonly id: number) {
    super(`Todo with id ${id.toString()} not found`);
    this.name = 'TodoNotFoundError';
  }
}

export class TodoValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TodoValidationError';
  }
}
