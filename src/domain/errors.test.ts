import { describe, expect, it } from 'vitest';
import { TodoNotFoundError, TodoValidationError } from './errors.js';

describe('TodoNotFoundError', () => {
  it('should have the correct message and id', () => {
    const error = new TodoNotFoundError(42);
    expect(error.message).toBe('Todo with id 42 not found');
    expect(error.id).toBe(42);
    expect(error.name).toBe('TodoNotFoundError');
    expect(error).toBeInstanceOf(Error);
  });
});

describe('TodoValidationError', () => {
  it('should have the correct message', () => {
    const error = new TodoValidationError('Title cannot be empty');
    expect(error.message).toBe('Title cannot be empty');
    expect(error.name).toBe('TodoValidationError');
    expect(error).toBeInstanceOf(Error);
  });
});
