import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import type { Kysely } from 'kysely';
import type { Database } from './database.js';
import { KyselyTodoRepository } from './kysely-todo-repository.js';
import { cleanDatabase, createTestDb, runMigrations } from '../test-helpers/setup.js';

let db: Kysely<Database>;
let repository: KyselyTodoRepository;

beforeAll(async () => {
  db = createTestDb();
  await runMigrations(db);
  repository = new KyselyTodoRepository(db);
});

afterEach(async () => {
  await cleanDatabase(db);
});

afterAll(async () => {
  await db.destroy();
});

describe('KyselyTodoRepository', () => {
  it('should create a todo', async () => {
    const todo = await repository.create({ title: 'Test todo' });

    expect(todo.id).toBeDefined();
    expect(todo.title).toBe('Test todo');
    expect(todo.isCompleted).toBe(false);
    expect(todo.createdAt).toBeInstanceOf(Date);
    expect(todo.updatedAt).toBeInstanceOf(Date);
  });

  it('should find all todos', async () => {
    await repository.create({ title: 'Todo 1' });
    await repository.create({ title: 'Todo 2' });

    const todos = await repository.findAll();

    expect(todos).toHaveLength(2);
  });

  it('should filter todos by isCompleted', async () => {
    await repository.create({ title: 'Todo 1' });
    const todo2 = await repository.create({ title: 'Todo 2' });
    await repository.update(todo2.id, { isCompleted: true });

    const completedTodos = await repository.findAll({ isCompleted: true });
    const incompleteTodos = await repository.findAll({ isCompleted: false });

    expect(completedTodos).toHaveLength(1);
    expect(completedTodos[0]?.title).toBe('Todo 2');
    expect(incompleteTodos).toHaveLength(1);
    expect(incompleteTodos[0]?.title).toBe('Todo 1');
  });

  it('should find a todo by id', async () => {
    const created = await repository.create({ title: 'Test todo' });
    const found = await repository.findById(created.id);

    expect(found).toBeDefined();
    expect(found?.title).toBe('Test todo');
  });

  it('should return undefined for non-existent id', async () => {
    const found = await repository.findById(999);
    expect(found).toBeUndefined();
  });

  it('should update a todo', async () => {
    const created = await repository.create({ title: 'Original' });
    const updated = await repository.update(created.id, {
      title: 'Updated',
      isCompleted: true,
    });

    expect(updated).toBeDefined();
    expect(updated?.title).toBe('Updated');
    expect(updated?.isCompleted).toBe(true);
    expect(updated?.updatedAt.getTime()).toBeGreaterThanOrEqual(created.updatedAt.getTime());
  });

  it('should return undefined when updating non-existent todo', async () => {
    const result = await repository.update(999, { title: 'Updated' });
    expect(result).toBeUndefined();
  });

  it('should delete a todo', async () => {
    const created = await repository.create({ title: 'To delete' });
    await expect(repository.delete(created.id)).resolves.toBe(true);

    const found = await repository.findById(created.id);
    expect(found).toBeUndefined();
  });

  it('should return false when deleting non-existent todo', async () => {
    await expect(repository.delete(999)).resolves.toBe(false);
  });
});
