import type { Kysely } from 'kysely';
import { sql } from 'kysely';
import type { CreateTodoInput, Todo, UpdateTodoInput } from '../domain/todo.js';
import type { TodoRepository } from '../domain/todo-repository.js';
import type { Database } from './database.js';

export class KyselyTodoRepository implements TodoRepository {
  constructor(private readonly db: Kysely<Database>) {}

  async create(input: CreateTodoInput): Promise<Todo> {
    return this.db
      .insertInto('todos')
      .values({ title: input.title })
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async findAll(filter?: { isCompleted?: boolean }): Promise<Todo[]> {
    let query = this.db.selectFrom('todos').selectAll();

    if (filter?.isCompleted !== undefined) {
      query = query.where('isCompleted', '=', filter.isCompleted);
    }

    return query.orderBy('createdAt', 'desc').execute();
  }

  async findById(id: number): Promise<Todo | undefined> {
    return this.db
      .selectFrom('todos')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  async update(id: number, input: UpdateTodoInput): Promise<Todo | undefined> {
    const values: Record<string, unknown> = {};

    if (input.title !== undefined) {
      values['title'] = input.title;
    }
    if (input.isCompleted !== undefined) {
      values['isCompleted'] = input.isCompleted;
    }

    if (Object.keys(values).length === 0) {
      return this.findById(id);
    }

    values['updatedAt'] = sql`now()`;

    return this.db
      .updateTable('todos')
      .set(values)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.db
      .deleteFrom('todos')
      .where('id', '=', id)
      .executeTakeFirst();

    return result.numDeletedRows > 0n;
  }
}
