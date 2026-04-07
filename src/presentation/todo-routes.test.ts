import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import type { Kysely } from 'kysely';
import type { Database } from '../infrastructure/database.js';
import type { TodoResponse } from './format.js';
import { cleanDatabase, createTestApp } from '../test-helpers/setup.js';

let app: FastifyInstance;
let db: Kysely<Database>;

beforeAll(async () => {
  const testApp = await createTestApp();
  app = testApp.app;
  db = testApp.db;
});

afterEach(async () => {
  await cleanDatabase(db);
});

afterAll(async () => {
  await app.close();
  await db.destroy();
});

describe('POST /todos', () => {
  it('should create a todo', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/todos',
      payload: { title: 'Learn DDD' },
    });

    expect(response.statusCode).toBe(201);
    const body = response.json() as TodoResponse;
    expect(body.title).toBe('Learn DDD');
    expect(body.isCompleted).toBe(false);
    expect(body.id).toBeDefined();
    expect(body.createdAt).toBeDefined();
    expect(body.updatedAt).toBeDefined();
  });

  it('should return 400 for empty title', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/todos',
      payload: { title: '' },
    });

    expect(response.statusCode).toBe(400);
  });

  it('should return 400 for missing title', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/todos',
      payload: {},
    });

    expect(response.statusCode).toBe(400);
  });
});

describe('GET /todos', () => {
  it('should return all todos', async () => {
    await app.inject({ method: 'POST', url: '/todos', payload: { title: 'Todo 1' } });
    await app.inject({ method: 'POST', url: '/todos', payload: { title: 'Todo 2' } });

    const response = await app.inject({ method: 'GET', url: '/todos' });

    expect(response.statusCode).toBe(200);
    const body = response.json() as TodoResponse[];
    expect(body).toHaveLength(2);
  });

  it('should filter by isCompleted', async () => {
    const createRes = await app.inject({
      method: 'POST',
      url: '/todos',
      payload: { title: 'Todo 1' },
    });
    const { id: todoId } = createRes.json() as TodoResponse;

    await app.inject({
      method: 'PUT',
      url: `/todos/${todoId}`,
      payload: { isCompleted: true },
    });
    await app.inject({ method: 'POST', url: '/todos', payload: { title: 'Todo 2' } });

    const completedRes = await app.inject({
      method: 'GET',
      url: '/todos?isCompleted=true',
    });
    const completedTodos = completedRes.json() as TodoResponse[];
    expect(completedTodos).toHaveLength(1);
    expect(completedTodos[0]?.isCompleted).toBe(true);

    const incompleteRes = await app.inject({
      method: 'GET',
      url: '/todos?isCompleted=false',
    });
    const incompleteTodos = incompleteRes.json() as TodoResponse[];
    expect(incompleteTodos).toHaveLength(1);
    expect(incompleteTodos[0]?.isCompleted).toBe(false);
  });
});

describe('GET /todos/:id', () => {
  it('should return a todo by id', async () => {
    const createRes = await app.inject({
      method: 'POST',
      url: '/todos',
      payload: { title: 'Test todo' },
    });
    const { id: todoId } = createRes.json() as TodoResponse;

    const response = await app.inject({ method: 'GET', url: `/todos/${todoId}` });

    expect(response.statusCode).toBe(200);
    expect((response.json() as TodoResponse).title).toBe('Test todo');
  });

  it('should return 404 for non-existent todo', async () => {
    const response = await app.inject({ method: 'GET', url: '/todos/999' });
    expect(response.statusCode).toBe(404);
  });

  it('should return 400 for invalid id', async () => {
    const response = await app.inject({ method: 'GET', url: '/todos/abc' });
    expect(response.statusCode).toBe(400);
  });
});

describe('PUT /todos/:id', () => {
  it('should update a todo', async () => {
    const createRes = await app.inject({
      method: 'POST',
      url: '/todos',
      payload: { title: 'Original' },
    });
    const { id: todoId } = createRes.json() as TodoResponse;

    const response = await app.inject({
      method: 'PUT',
      url: `/todos/${todoId}`,
      payload: { title: 'Updated', isCompleted: true },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as TodoResponse;
    expect(body.title).toBe('Updated');
    expect(body.isCompleted).toBe(true);
  });

  it('should return 404 for non-existent todo', async () => {
    const response = await app.inject({
      method: 'PUT',
      url: '/todos/999',
      payload: { title: 'Updated' },
    });
    expect(response.statusCode).toBe(404);
  });
});

describe('DELETE /todos/:id', () => {
  it('should delete a todo', async () => {
    const createRes = await app.inject({
      method: 'POST',
      url: '/todos',
      payload: { title: 'To delete' },
    });
    const { id: todoId } = createRes.json() as TodoResponse;

    const response = await app.inject({ method: 'DELETE', url: `/todos/${todoId}` });
    expect(response.statusCode).toBe(204);

    const getRes = await app.inject({ method: 'GET', url: `/todos/${todoId}` });
    expect(getRes.statusCode).toBe(404);
  });

  it('should return 404 for non-existent todo', async () => {
    const response = await app.inject({ method: 'DELETE', url: '/todos/999' });
    expect(response.statusCode).toBe(404);
  });
});
