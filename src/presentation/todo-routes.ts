import type { FastifyInstance } from 'fastify';
import type { CreateTodoUseCase } from '../application/create-todo.js';
import type { DeleteTodoUseCase } from '../application/delete-todo.js';
import type { GetTodoByIdUseCase } from '../application/get-todo-by-id.js';
import type { GetTodosUseCase } from '../application/get-todos.js';
import type { UpdateTodoUseCase } from '../application/update-todo.js';
import { formatTodo, formatTodos } from './format.js';
import {
  createTodoBodySchema,
  todoIdParamSchema,
  todosQuerySchema,
  updateTodoBodySchema,
} from './schemas.js';

export interface TodoUseCases {
  createTodo: CreateTodoUseCase;
  getTodos: GetTodosUseCase;
  getTodoById: GetTodoByIdUseCase;
  updateTodo: UpdateTodoUseCase;
  deleteTodo: DeleteTodoUseCase;
}

export function registerTodoRoutes(
  app: FastifyInstance,
  useCases: TodoUseCases,
): void {
  app.post('/todos', async (request, reply) => {
    const body = createTodoBodySchema.parse(request.body);
    const todo = await useCases.createTodo.execute(body);
    return reply.status(201).send(formatTodo(todo));
  });

  app.get('/todos', async (request) => {
    const query = todosQuerySchema.parse(request.query);
    const todos = await useCases.getTodos.execute(
      query.isCompleted !== undefined ? { isCompleted: query.isCompleted } : undefined,
    );
    return formatTodos(todos);
  });

  app.get('/todos/:id', async (request) => {
    const params = todoIdParamSchema.parse(request.params);
    const todo = await useCases.getTodoById.execute(params.id);
    return formatTodo(todo);
  });

  app.put('/todos/:id', async (request) => {
    const params = todoIdParamSchema.parse(request.params);
    const body = updateTodoBodySchema.parse(request.body);
    const todo = await useCases.updateTodo.execute(params.id, body);
    return formatTodo(todo);
  });

  app.delete('/todos/:id', async (request, reply) => {
    const params = todoIdParamSchema.parse(request.params);
    await useCases.deleteTodo.execute(params.id);
    return reply.status(204).send();
  });
}
