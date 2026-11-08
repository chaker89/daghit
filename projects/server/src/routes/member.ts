import type Router from '@koa/router';
import type { State } from '../auth.js';
import type { Repository } from '../repository.js';
import type { Middleware } from 'koa';
import type { Profile } from '@daghit/typings';

export const registerMemberRoutes = (router: Router<State>, repository: Repository, auth: Middleware<State>) => {
  router.get('/me', auth, ctx => {
    const { id, email, name, phone } = ctx.state.user;
    const profile: Profile = {
      id,
      email,
      name,
      phone,
      plan: null,
    };
    ctx.body = profile;
  });
  router.get('/me/bookings', auth, ctx => {
    ctx.body = repository.bookings(ctx.state.user.id);
  });
  router.get('/me/favorites', auth, ctx => {
    ctx.body = repository.favorites(ctx.state.user.id);
  });
  router.put('/me/favorites/:gymId', auth, ctx => {
    if (!repository.favoriteExists(ctx.params.gymId))
    {
      ctx.throw(404, 'Gym unavailable');
    }
    ctx.body = repository.setFavorite(ctx.state.user.id, ctx.params.gymId, true);
  });
  router.delete('/me/favorites/:gymId', auth, ctx => {
    ctx.body = repository.setFavorite(ctx.state.user.id, ctx.params.gymId, false);
  });
};
