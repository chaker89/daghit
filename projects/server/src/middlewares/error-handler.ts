import type { Middleware } from 'koa';
import { ZodError } from 'zod';
import type { State } from '../auth.js';

export const errorHandler: Middleware<State> = async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    const isValidationError = error instanceof ZodError;
    const status = isValidationError ? 400 : (error as { status?: number }).status ?? 500;
    const message = status === 500
      ? 'Internal server error'
      : isValidationError ? 'Invalid request fields' : (error as Error).message;

    ctx.status = status;
    ctx.body = { message };

    if (status === 500)
    {
      ctx.app.emit('error', error, ctx);
    }
  }
};
