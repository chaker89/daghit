import type Koa from 'koa';
import { bodyParser } from '@koa/bodyparser';
import cors from '@koa/cors';
import type { State } from '../auth.js';
import { errorHandler } from './error-handler.js';
import { createAuthRateLimit } from './auth-rate-limit.js';

// Register the error handler first so it can catch failures in the remaining middleware and routes.
export const registerMiddlewares = (app: Koa<State>, origins: string[]) => {
  app.use(errorHandler);
  app.use(cors({
    origin: ctx => origins.includes(ctx.get('Origin')) ? ctx.get('Origin') : '',
  }));
  app.use(bodyParser({
    enableTypes: ['json'],
    jsonLimit: '64kb',
  }));
  app.use(createAuthRateLimit());
};
