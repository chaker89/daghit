import type Koa from 'koa';
import Router from '@koa/router';
import type { AuthConfig, State } from '../auth.js';
import type { Repository } from '../repository.js';
import { authenticate } from '../middlewares/authenticate.js';
import { registerHealthRoutes } from './health.js';
import { registerAuthRoutes } from './auth.js';
import { registerDiscoveryRoutes } from './discovery.js';
import { registerMemberRoutes } from './member.js';
import { registerOwnerRoutes } from './owner.js';

export const registerRoutes = (app: Koa<State>, repository: Repository, config: AuthConfig) => {
  const router = new Router<State>({ prefix: '/api' });
  const auth = authenticate(repository, config);

  registerHealthRoutes(router);
  registerAuthRoutes(router, repository, config);
  registerDiscoveryRoutes(router, repository);
  registerMemberRoutes(router, repository, auth);
  registerOwnerRoutes(router, repository, auth);

  app.use(router.routes());
  app.use(router.allowedMethods());
};
