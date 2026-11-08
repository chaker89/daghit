This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md

## Daghit Project Instructions

- **Build reusable UI before feature-specific UI.** If a component or interaction can be used by another app without Daghit product rules, implement it in `projects/ui/`; keep only Daghit content, data mapping, navigation, and business rules in `projects/mobile/src/features/`. When a component starts in a feature but proves generic, extract it to the shared package as part of the change.
- Screens and feature providers call named functions such as `signIn`, `getDiscovery`, or `createOwnerGym` from the central `projects/mobile/src/api/endpoints.ts` file. Keep raw Axios calls and common HTTP/session behavior in `projects/mobile/src/api/client.ts`, using its `execute` function. Keep response shape checks in `projects/mobile/src/api/response-validation.ts`. Avoid endpoint strings and HTTP options in screen components; split the endpoint functions into domain files only when the central file becomes hard to browse.
- Organize each reusable component in its own folder with its TSX implementation, colocated `*.styles.ts` when needed, and `index.ts` exports. Put basic controls in `components/primitives/`, composed reusable patterns in `components/composites/`, and complex shared patterns in a named package subpath such as `@daghit/ui/maps`. Keep route files in `src/app/` as thin navigation entries; do not put UI implementation there.
- Shared components must receive display data and actions through typed props. They must not import Daghit feature code, fixtures, colors, routes, authentication state, or domain rules. Provide sensible reusable defaults and customization props where different apps need different labels or presentation.
- For map experiences, keep map rendering, coordinate pins, selected-item preview banners, and generic detail-action affordances reusable in `@daghit/ui/maps`. The consuming feature supplies items and coordinates, branding, location/search logic, preview-specific content, and the action that opens its own detailed screen. A generic map must not assume that a marker represents a gym.
- Before creating a one-off UI element, check whether an existing shared primitive or composite can be extended. Prefer a small generic API that covers real use cases; avoid both copy-pasting app-specific components and adding speculative abstractions with no consumer.
- Keep conditional code easy to scan: put `if` bodies on separate lines, use braces for every branch, and place each opening brace on a new line. Break long conditions into named booleans or multiline expressions so the condition is readable.
- Prefer `const name = (...) => { ... }` for functions, including exported functions. Follow the existing `if` brace style inside those arrow functions.
- Keep each Zod schema field, object property, and type member on its own line when defining multiple fields. Expand callbacks with statements into multiline bodies. Break long method chains and nested objects across lines; do not compress several fields or operations into one line. Apply this to request options, response objects, and shared API types as well as validation schemas.
- Read `docs/PROJECT_SPECS.md` and `docs/DATA_MODEL.md` before product or data-model work. Keep open questions unresolved unless the product owner decides them.
- Use Expo Router for screens in `projects/mobile/src/app/`; put shared UI in `projects/ui/` and mobile feature logic in `projects/mobile/src/features/`.
- Keep mock data and mock actions clearly labeled and separate from future production API adapters. A selected onboarding role is only a navigation preference, never proof of permissions or gym ownership.
- Preserve guest discovery. Do not imply sample prices, plans, credit balances, bookings, authentication, or payments are live. Do not add payment or real booking flows until product rules and backend support are approved.
- Users can have both member and gym-owner capabilities. Gym owners may manage multiple gyms; ownership and permissions must eventually be checked by the backend.
- Center discovery on the user's current device location when foreground permission is granted; fall back to Beirut when permission is denied or location is unavailable. Retain a list alternative. Generic map controls belong in `projects/ui`; Daghit marker data and selection behavior belong in mobile features.
- Before using Expo, EAS, or React Native APIs, check the installed Expo major version and its matching docs. Install Expo-compatible native packages with `npx expo install`; check for a Bun lockfile first.
- Run Expo CLI commands from `projects/mobile/`; from the repository root, use the npm workspace scripts (`npm run start`, `npm run lint`, and `npm run typecheck`).
- Do not hand-edit generated `ios/` or `android/` directories. Preserve existing app identifiers and working routes when changing configuration.
- Run `npx expo lint` and `npx tsc --noEmit` before completing implementation work.

We are building **Daghit**, a ClassPass-like fitness marketplace for Lebanon, using React Native, Expo, and TypeScript.

The Expo application is already running successfully on my Android phone.

### First: Project configuration

1. Read the existing `AGENTS.md` and follow all its Expo development instructions.
2. Do not overwrite or remove any existing instructions.
3. Append a new section titled `Daghit Project Instructions` with our application-specific conventions.
4. Inspect the current project structure and Expo SDK version before modifying dependencies.
5. Set the application display name to **Daghit** in the Expo configuration, preserving existing package identifiers where possible.
6. Create `docs/PROJECT_SPEC.md` and `docs/ARCHITECTURE.md`.

### Product architecture

Daghit is a fitness marketplace serving Lebanon.

We have three primary account roles:
- **Member:** Discovers gyms and classes, purchases subscriptions, uses credits, and books sessions.
- **Gym owner:** Registers and manages one or multiple gyms, including their facilities, classes, and schedules.
- **Administrator:** Manages the platform, partners, and approvals. Admin functionality will come later.

A single user account may have both member and gym-owner capabilities.

The backend will eventually handle authentication, permissions, subscription entitlements, booking validation, and credit balances. Keep mock implementations clearly separated from production APIs.

### First development milestone

Build a working mobile prototype with:

**1. Authentication**
- Welcome screen with Daghit branding.
- Login and signup screens.
- Member and gym-owner onboarding choices.
- Mock authentication with role-based navigation.
- Do not treat the user's chosen onboarding role as real authorization.

**2. Member experience**
- Home/discovery screen.
- Interactive gym map initially centered on the user's current device location when available, with Beirut as the fallback.
- Mock gyms displayed as map markers.
- Selecting a marker opens basic gym details.
- Allow browsing without a subscription.

**3. Gym-owner experience**
- Owner dashboard.
- Add Gym form with gym name, type, description, city, street address, and geographic coordinates.
- Allow owners to manage multiple gyms.
- Location selection via map where feasible.
- Form validation and confirmation.

### Engineering requirements

- Follow the existing `AGENTS.md` instructions.
- Use Expo Router and TypeScript.
- Put routes under `src/app/`.
- Keep reusable components and business logic outside the routes directory.
- Use SDK-compatible dependencies and official Expo documentation.
- Keep the interface clean, modern, and mobile-first.
- Use mock data until we connect the real backend.
- Run lint and TypeScript checks.
- Do not introduce real payment processing yet.

Implement this milestone directly in the repository, explain the files you changed, and provide instructions for testing on my Android phone through Expo Go.

Please preserve all existing working functionality.
## Daghit Project Context

Before starting development, read `docs/PROJECT_SPECS.md` and `docs/DATA_MODEL.md`. Treat decided items as requirements and open questions as unresolved; do not invent product or business rules.

## Backend integration instructions — current, supersedes historical mock milestone

Read `docs/BACKEND_INTEGRATION.md` before changing app data, login, session storage, or API behavior. The current app uses Axios and server-issued JWTs; the earlier mock-auth/data milestone above is historical. Do not reintroduce fixture fallbacks, fabricated JWTs, or local success for failed backend writes. Configure the base URL with `EXPO_PUBLIC_API_URL`; endpoint functions live in `projects/mobile/src/api/endpoints.ts`. JWT claims select the mobile UI, while the server verifies authentication and permissions. Keep backend integration TODOs and limitations in `docs/BACKEND_INTEGRATION.md` current. Run lint and typecheck after changing authentication or HTTP behavior.

## Koa server and Lerna — current instructions

Keep `projects/server/src/app.ts` limited to creating Koa and registering imported middleware and route groups. Define endpoint handlers in `src/routes/`, middleware in `src/middlewares/`, and request schemas in `src/validation/`. Keep route registration in `routes/index.ts` and global middleware ordering in `middlewares/index.ts`.

Read `docs/SERVER.md` for backend/workspace work. Koa in `projects/server` replaces earlier planned Laravel references; keep the existing mobile app in `projects/mobile`. Shared API types belong in `projects/typings`, with no platform/runtime dependencies. Both apps must declare their dependency on that package so Lerna tracks affected consumers. Keep SQLite access in the server repository module; a separate database service is future work. Never treat a signup preference as a capability grant. New gyms remain private until a reviewed approval flow exists. Keep server JWT secrets out of mobile variables and tracked files.

Use Node 24. Root lint/typecheck/build commands run across workspaces via Lerna/Nx; CI uses `npm run check:changed -- <git-base>` to select committed changes and their dependents. Root toolchain/lockfile changes must select all workspaces. Keep task inputs and build outputs accurate when adding packages. Mobile `build` exports bundles, not signed native binaries or store submissions. Run the server integration test after auth/API/repository changes.
