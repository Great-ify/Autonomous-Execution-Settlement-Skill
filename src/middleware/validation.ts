import { FastifyReply, FastifyRequest } from 'fastify';
import { ZodSchema } from 'zod';
import { AppError } from '../utils/AppError';

export const validate = (schema: ZodSchema) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      schema.parse(request.body);
    } catch (error) {
      throw new AppError(`Validation failed: ${error}`, 400);
    }
  };
};
