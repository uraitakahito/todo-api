export interface Todo {
  id: number;
  title: string;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTodoInput {
  title: string;
}

export interface UpdateTodoInput {
  title?: string | undefined;
  isCompleted?: boolean | undefined;
}
