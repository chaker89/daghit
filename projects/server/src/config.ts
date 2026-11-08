import { resolve, dirname } from 'node:path';
import { mkdirSync } from 'node:fs';

export const loadConfig = () => {
  const secret = process.env.JWT_SECRET ?? '';
  if (Buffer.byteLength(secret) < 32)
  {
    throw new Error('JWT_SECRET must contain at least 32 bytes; generate a random secret and set it in .env.local');
  }
  const port = Number(process.env.PORT ?? 3000);
  const ttlSeconds = Number(process.env.JWT_TTL_SECONDS ?? 3600);
  if (!Number.isInteger(port) || port < 1 || port > 65535 || !Number.isInteger(ttlSeconds) || ttlSeconds < 1)
  {
    throw new Error('Invalid PORT or JWT_TTL_SECONDS');
  }
  const databasePath = resolve(process.env.DATABASE_PATH ?? './data/daghit.sqlite');
  mkdirSync(dirname(databasePath), { recursive: true });
  return {
    secret,
    ttlSeconds,
    port,
    databasePath,
    origins: (process.env.CORS_ORIGINS ?? '')
      .split(',')
      .map(value => value.trim())
      .filter(Boolean),
  };
};
