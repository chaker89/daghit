import type Router from '@koa/router';
import type { State } from '../auth.js';

export const registerHealthRoutes = (router: Router<State>) => {
  router.get('/health', ctx => {
    ctx.body = { status: 'ok' };
  });
};
