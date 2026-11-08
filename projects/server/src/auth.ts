import { SignJWT } from 'jose';
import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import type { User } from './repository.js';

const deriveKey = promisify(scrypt);
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
export type AuthConfig = {
  secret: string;
  ttlSeconds: number;
};
export type State = { user: User };
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

