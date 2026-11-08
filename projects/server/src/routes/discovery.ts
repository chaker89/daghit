import type Router from '@koa/router';
import type { State } from '../auth.js';
import type { Repository } from '../repository.js';
import type { Catalog } from '@daghit/typings';

export const registerDiscoveryRoutes = (router: Router<State>, repository: Repository) => {
  router.get('/discovery', ctx => {
    const gyms = repository.publicGyms();
    const catalog: Catalog = {
      gyms,
      listings: {
        Gyms: gyms.map(gym => ({
          ...gym,
          title: gym.name,
          gymId: gym.id,
        })),
        Classes: [],
        'Personal training': [],
      },
    };
    ctx.body = catalog;
  });
};
