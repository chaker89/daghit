import { execFileSync, spawnSync } from 'node:child_process';

const base = process.argv[2];
if (!base)
{
  throw new Error('Provide a Git base: npm run check:changed -- origin/main');
}
execFileSync('git', ['rev-parse', '--verify', base], { stdio: 'ignore' });
const files = execFileSync('git', ['diff', '--name-only', base, 'HEAD'], { encoding: 'utf8' }).trim().split('\n');
// A root toolchain/lockfile change can affect every workspace even if no package source changed.
const sharedFiles = new Set(['package.json', 'package-lock.json', 'nx.json', 'lerna.json', '.nvmrc', 'scripts/affected.mjs', '.github/workflows/ci.yml']);
const sharedChanged = files.some(file => sharedFiles.has(file));
const args = ['lerna', 'run', 'lint,typecheck,build,test'];
if (!sharedChanged)
{
  args.push(`--since=${base}`, '--include-dependents');
}
const result = spawnSync('npx', args, { stdio: 'inherit', env: { ...process.env, NX_DAEMON: 'false' } });
process.exit(result.status ?? 1);
