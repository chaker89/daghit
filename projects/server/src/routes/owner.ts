import type Router from '@koa/router';
import type { State } from '../auth.js';
import type { Repository } from '../repository.js';
import type { Middleware } from 'koa';
import { requireOwner } from '../middlewares/require-owner.js';
import { gymInput } from '../validation/gyms.js';

export const registerOwnerRoutes = (router: Router<State>, repository: Repository, auth: Middleware<State>) => {
  router.get('/owner/gyms', auth, requireOwner, ctx => {
    ctx.body = repository.ownerGyms(ctx.state.user.id);
  });
  router.post('/owner/gyms', auth, requireOwner, ctx => {
    ctx.body = repository.createGym(ctx.state.user.id, gymInput.parse(ctx.request.body));
    ctx.status = 201;
  });
};
