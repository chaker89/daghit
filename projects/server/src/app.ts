import Koa from 'koa';
import type { AuthConfig, State } from './auth.js';
import type { Repository } from './repository.js';
import { registerMiddlewares } from './middlewares/index.js';
import { registerRoutes } from './routes/index.js';

export const createApp = (repository: Repository, config: AuthConfig, origins: string[] = []) => {
  const app = new Koa<State>();
  registerMiddlewares(app, origins);
  registerRoutes(app, repository, config);
  return app;
};
