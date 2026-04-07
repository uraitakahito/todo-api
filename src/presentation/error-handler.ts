import type { FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { TodoNotFoundError, TodoValidationError } from '../domain/errors.js';

export function errorHandler(
  error: Error,
  _request: FastifyRequest,
  reply: FastifyReply,
): void {
  if (error instanceof TodoNotFoundError) {
    void reply.status(404).send({ error: error.message });
    return;
  }

  if (error instanceof TodoValidationError) {
    void reply.status(400).send({ error: error.message });
    return;
  }

  if (error instanceof ZodError) {
    void reply.status(400).send({
      error: 'Validation error',
      details: error.issues,
    });
    return;
  }

  void reply.status(500).send({ error: 'Internal server error' });
}
