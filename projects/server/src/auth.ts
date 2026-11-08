import { SignJWT } from 'jose';
import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import type { AuthenticatedUser } from '@daghit/typings';
import type { User } from './repository.js';

export type AuthConfig = {
  secret: string;
  ttlSeconds: number;
};
// Koa keeps this context on the same request as it passes through middleware and routes.
// Keep the bearer token available for an explicit future server-to-server call; never log it.
export type State = {
  user: AuthenticatedUser;
  accessToken: string;
};

const deriveKey = promisify(scrypt);

// Build server-owned request context using a verified database user, never client-supplied identity fields.
export const createRequestIdentity = (user: User, accessToken: string): State => ({
  user: {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    types: [...user.types],
  },
  accessToken,
});

export const hashPassword = async (password: string) => {
  const salt = randomBytes(16).toString('hex');
  const hash = await deriveKey(password, salt, 64) as Buffer;
  return `${salt}:${hash.toString('hex')}`;
};
export const checkPassword = async (password: string, stored: string) => {
  const [salt, encoded] = stored.split(':');
  const expected = Buffer.from(encoded, 'hex');
  const actual = await deriveKey(password, salt, 64) as Buffer;
  return expected.length === actual.length && timingSafeEqual(expected, actual);
};
export const issueToken = (user: User, config: AuthConfig) => new SignJWT({
  userId: user.id,
  type: user.types,
})
  .setProtectedHeader({ alg: 'HS256' })
  .setSubject(user.id)
  .setIssuer('daghit-server')
  .setAudience('daghit-mobile')
  .setIssuedAt()
  .setExpirationTime(Math.floor(Date.now() / 1000) + config.ttlSeconds)
  .sign(new TextEncoder().encode(config.secret));

