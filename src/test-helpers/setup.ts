import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promises as fs } from 'node:fs';
import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import { FileMigrationProvider, type Kysely, Migrator, sql } from 'kysely';
import { CreateTodoUseCase } from '../application/create-todo.js';
import { DeleteTodoUseCase } from '../application/delete-todo.js';
import { GetTodoByIdUseCase } from '../application/get-todo-by-id.js';
import { GetTodosUseCase } from '../application/get-todos.js';
import { UpdateTodoUseCase } from '../application/update-todo.js';
import { createDb } from '../infrastructure/connection.js';
import type { Database } from '../infrastructure/database.js';
import { KyselyTodoRepository } from '../infrastructure/kysely-todo-repository.js';
import { errorHandler } from '../presentation/error-handler.js';
import { registerTodoRoutes } from '../presentation/todo-routes.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));

export function createTestDb(): Kysely<Database> {
  return createDb({
    database: process.env['DATABASE_NAME'] ?? 'todo_api_test',
  });
}

export async function runMigrations(db: Kysely<Database>): Promise<void> {
  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.join(currentDir, '..', 'infrastructure', 'migrations'),
    }),
  });

  const { error } = await migrator.migrateToLatest();
  if (error) {
    throw error;
  }
}

export async function cleanDatabase(db: Kysely<Database>): Promise<void> {
  await sql`TRUNCATE TABLE todos RESTART IDENTITY CASCADE`.execute(db);
}

export interface TestApp {
  app: FastifyInstance;
  db: Kysely<Database>;
}

export async function createTestApp(): Promise<TestApp> {
  const db = createTestDb();
  await runMigrations(db);

  const todoRepository = new KyselyTodoRepository(db);
  const createTodo = new CreateTodoUseCase(todoRepository);
  const getTodos = new GetTodosUseCase(todoRepository);
  const getTodoById = new GetTodoByIdUseCase(todoRepository);
  const updateTodo = new UpdateTodoUseCase(todoRepository);
  const deleteTodo = new DeleteTodoUseCase(todoRepository);

  const app = Fastify({ logger: false });
  app.setErrorHandler(errorHandler);
  registerTodoRoutes(app, {
    createTodo,
    getTodos,
    getTodoById,
    updateTodo,
    deleteTodo,
  });

  return { app, db };
}
