import Fastify from 'fastify';
import { CreateTodoUseCase } from './application/create-todo.js';
import { DeleteTodoUseCase } from './application/delete-todo.js';
import { GetTodoByIdUseCase } from './application/get-todo-by-id.js';
import { GetTodosUseCase } from './application/get-todos.js';
import { UpdateTodoUseCase } from './application/update-todo.js';
import { createDb } from './infrastructure/connection.js';
import { KyselyTodoRepository } from './infrastructure/kysely-todo-repository.js';
import { errorHandler } from './presentation/error-handler.js';
import { registerTodoRoutes } from './presentation/todo-routes.js';

// Infrastructure
const db = createDb();
const todoRepository = new KyselyTodoRepository(db);

// Application (Use Cases)
const createTodo = new CreateTodoUseCase(todoRepository);
const getTodos = new GetTodosUseCase(todoRepository);
const getTodoById = new GetTodoByIdUseCase(todoRepository);
const updateTodo = new UpdateTodoUseCase(todoRepository);
const deleteTodo = new DeleteTodoUseCase(todoRepository);

// Presentation
const app = Fastify({ logger: true });

app.setErrorHandler(errorHandler);

app.get('/health', async () => {
  return { status: 'ok' };
});

registerTodoRoutes(app, {
  createTodo,
  getTodos,
  getTodoById,
  updateTodo,
  deleteTodo,
});

// Graceful shutdown
const gracefulShutdown = async (): Promise<void> => {
  await app.close();
  await db.destroy();
};

process.on('SIGTERM', () => void gracefulShutdown());
process.on('SIGINT', () => void gracefulShutdown());

await app.listen({ port: 3000, host: '0.0.0.0' });
