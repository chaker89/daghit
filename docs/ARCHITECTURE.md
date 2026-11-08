# Daghit — Architecture Notes

> Current integration stage: fixture data and mock login have been replaced with HTTP adapters and a persistent native JWT session. Read [Backend integration](BACKEND_INTEGRATION.md) for the active contract, setup, limitations, and TODOs. Earlier prototype descriptions below are historical where they conflict with that document. No backend is deployed by this client change.

## Monorepo layout

- `projects/mobile/` is the Expo SDK 58 client. Expo Router route files are kept thin in `projects/mobile/src/app/`; reusable page implementations, domain-facing feature logic, and screen components live in `projects/mobile/src/features/`.
- `projects/ui/` is the cross-project React Native component package. `components/primitives/` contains basic controls, `components/composites/` contains composed building blocks, and `components/maps/` exposes a generic map surface, pins, callouts, selection preview banner, and overlay boxes. `MapExplorer` accepts generic coordinate items and delegates opening a full detail view to its consumer.
- Feature-specific state and screen coordination belong in feature pages or feature hooks; presentation primitives stay in the UI package. Extract logic into hooks when it is shared or when keeping a page focused on composition improves clarity.
- Mobile HTTP calls use Axios in `projects/mobile/src/api/client.ts`; named endpoint functions and response validation are centralized in the same dedicated API folder. Laravel is the planned backend, but contracts remain subject to backend agreement.
- Workspace package and folder names use plain names without route-group parentheses or dynamic-segment brackets. Routes that need an entity identifier use a stable detail path with query parameters.

## Mobile client

- React Native, Expo SDK 58, and TypeScript.
- Expo Router owns file-based routing. Member destinations are nested in a persistent tab navigator; gym and session detail routes sit outside the member tabs.
- Daghit brand tokens and mock data live outside the router directory. The reusable controls and map components live in the workspace UI package; the discovery feature adapts Daghit listings and supplies its own location controls and detail navigation.
- Discovery shows mock gyms, studio classes, and personal training offers on an interactive map or in a list. A foreground location hook obtains the device location; the discovery feature fits up to three nearest results into the initial viewport when practical. Beirut is the fallback when permission is denied or location is unavailable.
- `projects/mobile/src/app/` contains welcome/authentication, member tab, gym/session detail, and owner route entries. Each route imports a feature page from `projects/mobile/src/features/`.
- `projects/mobile/src/data/mock-discovery-map.ts` and `projects/mobile/src/data/mock-gyms.ts` supply discovery fixtures. `projects/mobile/src/data/mock-data-context.tsx` stores local owner gyms and favorites for the running prototype.
- `projects/mobile/src/features/discovery/hooks/useDeviceLocation.ts` owns foreground permission and one-time location reads. `location/geo.ts` owns distance and initial viewport calculations. The generic map package receives the resulting region, user coordinate, and listing props.
- A client onboarding role only selects a demo destination. It must never be treated as authorization; the backend will verify account capabilities and per-gym ownership.

## Prototype and future production boundary

Current screens use local mock data and demo-only actions. Authentication, role checks, credit entitlements and balances, booking validation, and payments must eventually be supplied by backend services. Do not use mobile UI state as authorization or as proof of payment/booking.

Keep future production API adapters separate from mock data/context modules. UI components should consume replaceable interfaces rather than assuming mock data has production validity. Mark all sample listings and account data clearly, and do not show sample prices or credit costs as if they were available offers.

The product supports subscription-based credits and a one-off option. Whether one-off means buying credits or paying directly for a session remains undecided. The client does not implement either transaction path yet. Keep future API adapters separate from mock providers so the prototype can be replaced without coupling screen components to production rules.

## Service concepts

The user-facing service modes are:

- A class at a gym or studio.
- Personal training at a gym or studio.
- Personal training at a member's home.

The current prototype represents these as map/list listings. Their final provider/session schema, booking workflow, credit cost, schedule, home service boundary, and cancellation rules are undecided. Preserve those as open product and data-model questions until specified.

## Server implementation update

A Koa server now lives in `projects/server`, with shared API contracts in `projects/typings` and Lerna/Nx affected builds. Earlier Laravel/no-backend notes are historical. See `SERVER.md` for current implementation, local SQLite adapter, limits, and setup. The local storage schema does not settle outstanding booking/payment/business rules.
