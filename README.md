# Daghit

> Current integration stage: fixture data and mock login have been replaced with HTTP adapters and a persistent native JWT session. Read [Backend integration](docs/BACKEND_INTEGRATION.md) for the active contract, setup, limitations, and TODOs. Earlier prototype descriptions below are historical where they conflict with that document. No backend is deployed by this client change.

Daghit is a Lebanon fitness marketplace prototype in an npm-workspaces monorepo. The mobile app is `apps/mobile/`; reusable React Native UI is published internally from `packages/ui/`; `packages/api-client/` reserves a place for adapters to the planned Laravel backend.

## Structure

```text
apps/
  mobile/
    src/app/          Expo Router route entries only
    src/features/     Pages and feature-specific components
    src/data/         Prototype fixtures and mock state
packages/
  ui/                 Reusable primitives, composites, and map building blocks
  api-client/         Future API boundary; no backend behavior yet
```

Route and folder names avoid parentheses and brackets. Entity detail screens use stable route paths and query parameters. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and [docs/REUSABLE_UI.md](docs/REUSABLE_UI.md) for the component layers and map API.

## Run on Android with Expo Go

```bash
npm run start
```

Connect the phone and development computer to the same network, scan the Expo Go QR code, and open the project. If the bundler is not reachable over the local network, run `npm run start --workspace @daghit/mobile -- --tunnel`.

## Checks

```bash
npm run lint
npm run typecheck
```

The app itself can also be run from `apps/mobile/` with `npx expo start`.

## Product boundary

The prototype uses mock authentication, listings, owner gym records, favorites, and sample profile/booking data. Client state is not authorization, ownership, payment, booking, subscription, or credit proof. Laravel is planned for the later backend; API/auth contracts and other product questions remain open. See [docs/PROJECT_SPEC.md](docs/PROJECT_SPEC.md) and [docs/DATA_MODEL.md](docs/DATA_MODEL.md).
