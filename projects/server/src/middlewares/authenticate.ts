import { jwtVerify } from 'jose';
import type { Middleware } from 'koa';
import { createRequestIdentity, type AuthConfig, type State } from '../auth.js';
import type { Repository } from '../repository.js';

export const authenticate = (repository: Repository, config: AuthConfig): Middleware<State> => async (ctx, next) => {
  const authorization = ctx.get('authorization');
  if (!authorization.startsWith('Bearer '))
  {
    ctx.throw(401, 'Authentication required');
  }
  const accessToken = authorization.slice(7);
  try {
    const { payload } = await jwtVerify(accessToken, new TextEncoder().encode(config.secret), {
      algorithms: ['HS256'],
      issuer: 'daghit-server',
      audience: 'daghit-mobile',
    });
    const user = payload.sub ? repository.userById(payload.sub) : undefined;
    if (!user || payload.userId !== user.id)
    {
      return ctx.throw(401, 'Invalid session');
    }
    // Downstream middleware/routes share this verified identity via ctx.state.
    // Explicitly select safe fields: the repository record also contains a password hash.
    // Current database capabilities are authoritative even if JWT role claims are older.
    Object.assign(ctx.state, createRequestIdentity(user, accessToken));
  } catch {
    ctx.throw(401, 'Invalid or expired session');
  }
  await next();
};
