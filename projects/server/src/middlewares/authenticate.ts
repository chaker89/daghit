import { jwtVerify } from 'jose';
import type { Middleware } from 'koa';
import type { AuthConfig, State } from '../auth.js';
import type { Repository } from '../repository.js';

export const authenticate = (repository: Repository, config: AuthConfig): Middleware<State> => async (ctx, next) => {
  const authorization = ctx.get('authorization');
  if (!authorization.startsWith('Bearer '))
  {
    ctx.throw(401, 'Authentication required');
  }
  try {
    const { payload } = await jwtVerify(authorization.slice(7), new TextEncoder().encode(config.secret), {
      algorithms: ['HS256'],
      issuer: 'daghit-server',
      audience: 'daghit-mobile',
    });
    const user = payload.sub ? repository.userById(payload.sub) : undefined;
    if (!user || payload.userId !== user.id)
    {
      return ctx.throw(401, 'Invalid session');
    }
    // Database capabilities are authoritative even if a JWT contains older role claims.
    ctx.state.user = user;
  } catch {
    ctx.throw(401, 'Invalid or expired session');
  }
  await next();
};
