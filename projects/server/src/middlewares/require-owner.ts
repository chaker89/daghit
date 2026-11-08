import type { Middleware } from 'koa';
import type { State } from '../auth.js';

export const requireOwner: Middleware<State> = async (ctx, next) => {
  if (!ctx.state.user.types.includes('owner'))
  {
    ctx.throw(403, 'Owner access required');
  }
  await next();
};
