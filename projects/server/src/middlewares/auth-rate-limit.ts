import type { Middleware } from 'koa';
import type { State } from '../auth.js';

export const createAuthRateLimit = (): Middleware<State> => {
  // Bound authentication attempts per IP without storing credentials or logging request bodies.
  const attempts = new Map<string, {
    count: number;
    resetAt: number;
  }>();
  return async (ctx, next) => {
    if (ctx.path === '/api/auth/login' || ctx.path === '/api/auth/signup')
    {
      const now = Date.now();
      for (const [ip, entry] of attempts)
      {
        if (entry.resetAt <= now)
        {
          attempts.delete(ip);
        }
      }
      const entry = attempts.get(ctx.ip) ?? {
        count: 0,
        resetAt: now + 60000,
      };
      entry.count++;
      attempts.set(ctx.ip, entry);
      if (entry.count > 20)
      {
        ctx.set('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)));
        ctx.throw(429, 'Too many attempts');
      }
    }
    await next();
  };
};
