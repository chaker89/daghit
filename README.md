# Daghit

Lebanon fitness marketplace in a Lerna/npm-workspaces monorepo.

```text
projects/
  mobile/       Expo React Native app
  server/       Koa API
  typings/      Shared API types
  ui/           Reusable React Native components
```

Use Node 24 and run `npm ci` at the root. Follow [server and monorepo setup](docs/SERVER.md) to configure a server-only JWT secret and the mobile API URL.

```sh
npm run start:server
npm run start
npm run lint
npm run typecheck
npm run build
npm run test:server
npm run check:changed -- origin/main
```

Run the two start commands in separate terminals. Lerna orders builds using workspace dependencies and caches unchanged outputs. CI selects changed packages and their dependents. Mobile builds export Android/iOS bundles; native signing and store submission are separate EAS work.

## Build and rebuild reference

Run these commands from the repository root:

| Goal | Command | Behavior |
| --- | --- | --- |
| Build all projects, reusing unchanged results | `npm run build` | Selects all projects and restores cached outputs when inputs match. |
| Build only changed projects and their dependents | `npm run build:changed -- origin/main` | Compares against the Git reference and uses cached outputs where possible. Replace `origin/main` with your intended base branch or commit. |
| Force a full rebuild | `npm run build -- --skip-nx-cache` | Selects all projects and runs their builds without reusing cached results. |

Use the full build commands for newly created or uncommitted workspaces. These builds compile server code and export mobile bundles; they do not sign or submit native apps.

See [API and session contract](docs/BACKEND_INTEGRATION.md), [reusable UI](docs/REUSABLE_UI.md), [product context](docs/PROJECT_SPECS.md), and [data model planning](docs/DATA_MODEL.md).
