import { loadConfig } from './config.js';
import { createRepository } from './repository.js';

const email = process.argv[2]?.trim().toLowerCase();
if (!email)
{
  throw new Error('Usage: npm run grant-owner --workspace @daghit/server -- user@example.com');
}
const repository = createRepository(loadConfig().databasePath);
try {
  repository.grantOwner(email);
  console.info('Owner access granted. Log in again to obtain updated claims.');
} finally {
  repository.close();
}
