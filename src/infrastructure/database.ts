import type { ColumnType, Generated } from 'kysely';

export interface TodoTable {
  id: Generated<number>;
  title: string;
  isCompleted: ColumnType<boolean, boolean | undefined, boolean>;
  createdAt: ColumnType<Date, string | undefined, never>;
  updatedAt: ColumnType<Date, string | undefined, string>;
}

export interface Database {
  todos: TodoTable;
}
