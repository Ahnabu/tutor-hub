import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { sanitizeInput } from '../utils/sanitize.js';
import { BadRequestError } from '../utils/errors.js';

interface RequestValidationSchema {
  body?: AnyZodObject;
  query?: AnyZodObject;
  params?: AnyZodObject;
}

export const validateRequest = (schema: RequestValidationSchema) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schema.body) {
        const sanitizedBody = sanitizeInput(req.body);
        req.body = await schema.body.parseAsync(sanitizedBody);
      }

      if (schema.query) {
        const sanitizedQuery = sanitizeInput(req.query);
        req.query = await schema.query.parseAsync(sanitizedQuery);
      }

      if (schema.params) {
        const sanitizedParams = sanitizeInput(req.params);
        req.params = await schema.params.parseAsync(sanitizedParams);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));
        next(new BadRequestError('Validation failed', 'VALIDATION_ERROR', formattedErrors));
      } else {
        next(error);
      }
    }
  };
};
