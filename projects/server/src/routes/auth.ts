import type Router from '@koa/router';
import type { State } from '../auth.js';
import type { Repository } from '../repository.js';
import { checkPassword, hashPassword, issueToken, type AuthConfig } from '../auth.js';
import { credentials, signup } from '../validation/auth.js';

export const registerAuthRoutes = (router: Router<State>, repository: Repository, config: AuthConfig) => {
  router.post('/auth/signup', async ctx => {
    const input = signup.parse(ctx.request.body);
    if (repository.userByEmail(input.email))
    {
      ctx.throw(409, 'Account already exists');
    }
    const passwordHash = await hashPassword(input.password);
    // Recheck after the asynchronous hash to handle concurrent signup requests.
    if (repository.userByEmail(input.email))
    {
      ctx.throw(409, 'Account already exists');
    }
    const user = repository.createUser({
      email: input.email,
      name: input.name,
      phone: '',
      passwordHash,
      types: ['member'],
    });
    ctx.status = 201;
    ctx.body = { accessToken: await issueToken(user, config) };
  });
  const dummyHash = hashPassword('nonexistent-account-password');
  router.post('/auth/login', async ctx => {
    const input = credentials.parse(ctx.request.body);
    const user = repository.userByEmail(input.email);
    const valid = await checkPassword(input.password, user?.passwordHash ?? await dummyHash);
    if (!user || !valid)
    {
      return ctx.throw(401, 'Invalid credentials');
    }
    ctx.body = { accessToken: await issueToken(user, config) };
  });
};
