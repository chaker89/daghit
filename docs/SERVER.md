# Koa server and monorepo development

## Workspaces

- `projects/mobile` — Expo SDK 58 Android/iOS app (`@daghit/mobile`).
- `projects/server` — Koa API (`@daghit/server`), Node 24 or newer.
- `projects/typings` — shared API contracts (`@daghit/typings`), with no runtime code or platform dependencies.
- `projects/ui` — shared mobile UI (`@daghit/ui`).

Both apps declare a dependency on typings. Mobile also depends on UI. Server code never imports mobile or UI code. Shared types are TypeScript contracts, not runtime validation or a finalized database schema. Validate external input at the server boundary.

## Start locally

1. Use Node 24 (`nvm use`) and run `npm ci` at the repository root.
2. Copy `projects/server/.env.example` to `projects/server/.env.local`.
3. Generate a secret with `node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"` and paste it into `JWT_SECRET` in the server's `.env.local`. Never put it in a mobile `EXPO_PUBLIC_` variable. A missing/short secret prevents startup.
4. Run `npm run start:server` in one terminal. Health: `http://localhost:3000/api/health`.
5. In `projects/mobile/.env.local`, set `EXPO_PUBLIC_API_URL=http://YOUR_COMPUTER_LAN_IP:3000/api`. A phone on the same Wi-Fi must use the computer's reachable LAN IP, not localhost. Server binds to `0.0.0.0`; allow the port through your local firewall if necessary. Release mobile builds require HTTPS.
6. Run `npm run start` in another terminal and open Expo Go. Create an account with a password of 10–128 characters. Data persists in `projects/server/data/daghit.sqlite`; no sample accounts or gyms are seeded.

Owner signup preference does not grant owner permissions. After signup, an operator can grant access locally:

```sh
npm run grant-owner --workspace @daghit/server -- person@example.com
```

Log in again to receive updated JWT claims. The server checks current database capabilities on every protected request, including owner requests.

## Carrying identity through a request

Successful login/signup and authenticated requests populate the Koa context:

```ts
ctx.state.user        // Safe AuthenticatedUser: id, email, name, phone, types
ctx.state.accessToken // Bearer token for a future explicit downstream request
```

Middleware and route handlers handling the same request share this context. `createRequestIdentity` selects safe fields from the verified database record; password hashes never enter this context. Client-supplied `body.user` fields are not used as identity or permissions. The original request body remains application input, so schema validation stays independent from authentication.

A new HTTP call to another server does not inherit Koa context automatically. When that service exists, explicitly forward the bearer token in `Authorization`, and have the receiving service verify it and build its own context. Agree on the receiving service's JWT audience or token-exchange contract at that time. Do not forward the full Koa context, log its token, or trust identity fields from the body without token verification. No downstream service/call is implemented yet.

## Current server behavior

Server code is organized as follows:

```text
src/
  app.ts          Creates Koa and registers imported middleware and routes
  index.ts        Loads configuration, opens storage, and starts listening
  middlewares/    Error handling, auth rate limits, authentication, owner access
  routes/         Health, authentication, discovery, member, and owner endpoints
  validation/     Request body schemas used by routes
  auth.ts         Password hashing and JWT issuance helpers
  repository.ts   SQLite data access
```

`middlewares/index.ts` registers application middleware in order, with error handling first. `routes/index.ts` registers the domain route groups under `/api` and connects authentication middleware to protected routes. Keep handlers and schemas out of `app.ts`; it is the assembly point only.

All mobile endpoints documented in `BACKEND_INTEGRATION.md` have Koa routes. Passwords are salted and hashed using scrypt; bearer JWTs use HS256, issuer/audience verification, expiry, and a server-only secret. Default lifetime is one hour. Auth endpoints have a process-local attempt limit; CORS allows only the configured browser origins. Requests are validated with Zod and have a JSON size limit.

Signup creates a member. Profiles have no subscription until subscription functionality is implemented. Classes, personal training offers, and booking writes are not implemented; their read collections are empty until that domain is added. This is missing product functionality, not a fixture fallback.

Owner-created gyms are private drafts (`published = 0`) and persist across restarts. Discovery only returns published rows. No publish/approval API is exposed yet because approval policy is unresolved; adding a gym does not silently publish it. Favorites accept published gyms only and reject unknown/private IDs. No fake ratings are created; unrated public gyms carry an empty rating and zero reviews to match the existing client contract.

SQLite implementation details are isolated in `projects/server/src/repository.ts`. They are a minimal local persistence adapter, not a reviewed production schema. A future database service can replace this boundary; its HTTP calls will be asynchronous, so migrate repository methods/call sites together. Do not add a second service yet.

## Build only affected work

Lerna uses npm workspaces and the Nx task runner. `lerna.json` and `nx.json` configure task ordering, dependency inputs, output folders, and local caching. On a shared-types change, both apps are affected. On a UI change, mobile is affected. A server-only change does not require a mobile build. Toolchain/lockfile changes trigger all projects.

```sh
npm run lint
npm run typecheck
npm run build
npm run test:server
npm run check:changed -- origin/main
npm run build:changed -- origin/main
```

Replace `origin/main` with the commit/branch you want to compare against. `check:changed` examines committed changes between that ref and HEAD, includes dependent projects, and runs lint/typecheck/build/test where those tasks exist. Commit new workspaces before relying on affected selection. With no base or for local uncommitted work, use the full commands; unchanged task inputs reuse cached outputs.

The GitHub Actions workflow checks affected projects on pull requests and pushes, fetches full Git history, and persists the local task cache between jobs. First pushes with no valid base run all projects. Root package/lockfile or task configuration changes explicitly select all projects. Set repository variable `EXPO_PUBLIC_API_URL` to the intended public API URL for mobile bundle checks. Mobile env files and that environment variable participate in the build cache key. Server secrets/database contents are excluded from task inputs and never read by build steps.

`npm run build` compiles server JS to `projects/server/dist`, emits shared declarations, and exports Android/iOS JS bundles/assets to `projects/mobile/dist`. These mobile exports are not signed APK/AAB/IPA files. Lerna does not sign, deploy, publish, or submit anything. EAS native builds/submission require separate deployment configuration, credentials, and approval. Run `npm run start --workspace @daghit/server` to launch compiled server JS after building.

## Before production

- Choose production database, migrations, backups, gym approval, role administration, and offerings/session schemas.
- Implement token refresh/revocation, email verification/password recovery, and a distributed authentication limiter before horizontal scaling.
- Terminate HTTPS at the deployment boundary, configure exact CORS origins, and manage JWT secrets outside source control. Configure reverse-proxy trust only for a known proxy topology.
- Keep credit, booking, subscription, payment, cancellation, and entitlement rules unresolved until designed; this server implements no purchase or reservation writes.
- Add hosting and EAS pipelines when deployment targets are selected; this change only checks/builds affected code in CI.

## Dependency maintenance

A targeted root override updates Nx's Undici dependency within its existing major version to remove the high-severity advisories reported during setup. Keep this override until upstream Nx includes the patched version. npm still reports moderate advisories in transitive Expo/Lerna tooling; do not use a forced audit fix that changes the Expo SDK or downgrades Nx without compatibility review.
