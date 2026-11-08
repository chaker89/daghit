import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createApp } from '../src/app.js';
import { createRepository } from '../src/repository.js';
import { issueToken, type State } from '../src/auth.js';

const config = { secret: 'test-secret-only-not-for-deployment-123456', ttlSeconds: 3600 };

test('API auth, owner authorization, validation, and durable private gyms', async () => {
  const folder = mkdtempSync(join(tmpdir(), 'daghit-'));
  const path = join(folder, 'test.sqlite');
  let repository = createRepository(path);
  let observedState: Partial<State> = {};
  const app = createApp(repository, config);
  app.middleware.unshift(async (ctx, next) => {
    await next();
    observedState = { ...ctx.state };
  });
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address() as { port: number };
  const call = async (route: string, method = 'GET', body?: unknown, token?: string) => {
    const response = await fetch(`http://127.0.0.1:${address.port}/api${route}`, {
      method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    return { status: response.status, body: await response.json() as any };
  };
  try {
    assert.equal((await call('/health')).status, 200);
    assert.equal((await call('/me')).status, 401);
    const input = { name: 'Member', email: 'person@example.com', password: 'long-test-password', onboardingPreference: 'owner' };
    const signup = await call('/auth/signup', 'POST', input);
    assert.equal(signup.status, 201);
    assert.equal(observedState.user?.email, input.email);
    assert.equal(observedState.accessToken, signup.body.accessToken);
    assert.equal(Object.hasOwn(observedState.user!, 'passwordHash'), false);
    assert.equal((await call('/owner/gyms', 'GET', undefined, signup.body.accessToken)).status, 403);
    const spoofedIdentity = { user: { id: 'another-user', types: ['owner'] } };
    assert.equal((await call('/owner/gyms', 'POST', spoofedIdentity, signup.body.accessToken)).status, 403);
    assert.equal((await call('/auth/login', 'POST', { email: input.email, password: 'incorrect-password' })).status, 401);
    assert.equal((await call('/auth/signup', 'POST', input)).status, 409);
    const profile = await call('/me', 'GET', undefined, signup.body.accessToken);
    assert.equal(profile.body.email, input.email);
    assert.equal(profile.body.passwordHash, undefined);
    assert.equal(observedState.user?.id, profile.body.id);
    assert.equal(observedState.accessToken, signup.body.accessToken);
    assert.equal(Object.hasOwn(observedState.user!, 'passwordHash'), false);
    const user = repository.userByEmail(input.email)!;
    const expired = await issueToken(user, { ...config, ttlSeconds: -1 });
    assert.equal((await call('/me', 'GET', undefined, expired)).status, 401);
    assert.equal((await call('/me', 'GET', undefined, signup.body.accessToken + 'broken')).status, 401);
    repository.grantOwner(input.email);
    const login = await call('/auth/login', 'POST', input);
    const token = login.body.accessToken;
    const gym = { name: 'New gym', type: 'Gym', description: '', city: 'Beirut', address: 'Test address', latitude: 33.89, longitude: 35.5 };
    assert.equal((await call('/owner/gyms', 'POST', { ...gym, latitude: 100 }, token)).status, 400);
    const saved = await call('/owner/gyms', 'POST', gym, token);
    assert.equal(saved.status, 201);
    assert.equal((await call('/owner/gyms', 'GET', undefined, token)).body.length, 1);
    assert.deepEqual((await call('/discovery')).body.gyms, []);
    assert.equal((await call(`/me/favorites/${saved.body.id}`, 'PUT', undefined, token)).status, 404);
    assert.deepEqual((await call('/me/bookings', 'GET', undefined, token)).body, { upcoming: [], previous: [], canceled: [] });
    repository.close();
    repository = createRepository(path);
    assert.equal(repository.ownerGyms(user.id).length, 1);
  } finally {
    await new Promise<void>(resolve => server.close(() => resolve()));
    repository.close();
    rmSync(folder, { recursive: true, force: true });
  }
});
