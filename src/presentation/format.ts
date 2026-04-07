import type { Todo } from '../domain/todo.js';

export interface TodoResponse {
  id: number;
  title: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export function formatTodo(todo: Todo): TodoResponse {
  return {
    id: todo.id,
    title: todo.title,
    isCompleted: todo.isCompleted,
    createdAt: todo.createdAt.toISOString(),
    updatedAt: todo.updatedAt.toISOString(),
  };
}

export function formatTodos(todos: Todo[]): TodoResponse[] {
  return todos.map(formatTodo);
}
