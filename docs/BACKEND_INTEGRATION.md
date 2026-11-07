# Backend integration and session contract

## Current state — read this before development

The mobile app no longer imports fixture users, venues, bookings, favorites, or owner gyms. All these screens use HTTP through `apps/mobile/src/api/client.ts` and the reusable transport in `packages/api-client/src/index.ts`. Login and signup require a real server response; there is no fake success, mock token, local user identity, or fallback catalog. Without configuration or a reachable backend, the UI reports a connection error and preserves guest navigation.

This document supersedes earlier prototype/mock instructions for authentication and data access. It specifies a proposed client contract, not an implemented backend, final database schema, or approved booking/payment rules.

## Connect a backend

1. Copy `apps/mobile/.env.example` to `apps/mobile/.env.local`.
2. Set `EXPO_PUBLIC_API_URL` to the API base URL including its prefix, for example `https://api.example.com/api`.
3. Implement the contract below, or change the centralized `endpoints` map and response adapters in `apps/mobile/src/api/client.ts` to match the backend. The base URL alone is sufficient only when the backend follows these paths and response shapes.
4. Restart Metro (`npm run start`) so Expo picks up the environment change. On an Android phone, localhost refers to the phone; use an address reachable from the device. The transport enforces HTTPS in release builds; HTTP is allowed only during development. Public Expo environment variables are bundled into the app: never put secrets there.

## Proposed endpoints

Responses are direct JSON values, without a `data` envelope. Non-2xx statuses are errors. Arrays must be actual arrays, including when empty. The adapter checks core response structure before storing data; the complete field contract is in `apps/mobile/src/data/models.ts`. Align and strengthen runtime validation when the final backend contract is approved.

| Method | Path | Request / response |
| --- | --- | --- |
| POST | `/auth/login` | Body `{ email, password }`; response `{ accessToken: string }` |
| POST | `/auth/signup` | Body `{ name, email, password, onboardingPreference: "member" or "owner" }`; response `{ accessToken: string }` |
| GET | `/discovery` | Public response `{ gyms: Gym[], listings: { "Gyms": MapListing[], "Classes": MapListing[], "Personal training": MapListing[] } }` |
| GET | `/me` | Authenticated `Profile`, including `id`, `name`, `email`, `phone`, and nullable `plan` |
| GET | `/me/bookings` | Authenticated `{ upcoming: Booking[], previous: Booking[], canceled: Booking[] }` |
| GET | `/me/favorites` | Authenticated array of gym ID strings |
| PUT | `/me/favorites/:gymId` | Authenticated save; response updated array of gym ID strings |
| DELETE | `/me/favorites/:gymId` | Authenticated removal; response updated array of gym ID strings (not 204) |
| GET | `/owner/gyms` | Owner-authenticated `OwnerGym[]` |
| POST | `/owner/gyms` | Owner-authenticated body `Omit<OwnerGym, "id">`; response saved `OwnerGym` with server ID |

All authenticated calls send `Authorization: Bearer <accessToken>`. The backend derives the acting user from its verified token; the client does not send a trusted userId or ownerId in mutation bodies. Signup's onboardingPreference is a preference, never a permission grant. The backend decides returned capabilities and per-gym ownership.

The current discovery response is a full catalog. Gym and service details look up IDs in it, showing unavailable when missing. Geographic search, pagination, dedicated details endpoints, schedules, media, facilities, booking writes, and payments are not implemented. Do not present those as existing API capabilities.

## JWT and persistent sessions

Login stores the server-issued JWT in Expo SecureStore on Android/iOS before publishing the session. The mobile app restores it before rendering routes. Web deliberately keeps tokens in memory only; a persistent browser session needs a separately designed HttpOnly cookie contract.

Required JWT payload:

```json
{ "userId": "user-123", "type": ["member", "owner"], "exp": 1900000000 }
```

`sub` is accepted instead of `userId`; IDs must be nonempty strings. `type` accepts a string or a nonempty array of `member`, `owner`, and `admin`; arrays support combined capabilities. `exp` is mandatory Unix seconds. Malformed, unsigned, expired, or unsupported claims are rejected. Align claim mapping if the issuer uses different names.

Decoding reads claims for identity display and UI navigation; it does not cryptographically verify the JWT. The backend must verify signatures, allowed algorithms, issuer, audience, expiry, revocation, capabilities, and object ownership on every relevant call. Never embed a signing secret in the app or treat UI guards as authorization.

Expired tokens are cleared when accessed, on foreground resume, and by an expiry timer. Authenticated 401 responses clear only the session whose token made that request, protecting a newer login from an older request's failure. 403 means forbidden and does not log out. Network errors do not erase a valid session. Logout clears in-memory and securely stored credentials; local logout is not server revocation. Account-specific data is scoped to the current session and old requests cannot populate a new account's data.

**There is no refresh token or refresh endpoint yet.** An expired token requires login again. Token lifetime is chosen by the backend. Do not invent a refresh route or store the password to log in silently.

## Agent rules: do and don't

- Read this document, `PROJECT_SPECS.md`, and `DATA_MODEL.md` before changing API/session code.
- Keep transport reusable; keep endpoint paths, DTO mapping, auth persistence, and product behavior in their documented layers.
- Preserve generic map/UI props. Supply backend data from features, never import API or session state into `packages/ui`.
- Show loading, empty, unavailable, and request-error states. Await successful writes before reporting success. Never restore fixture fallbacks to hide missing endpoints.
- Never log tokens or passwords, store them in source/environment files, or persist credentials in plain preferences.
- Preserve guest discovery; guard profile, bookings, favorites, and owner routes. Owner controls use server-issued capabilities; the server remains authoritative.
- Do not invent plan prices, credit costs, subscription rules, booking eligibility, payments, or ownership policy.

## Backend integration TODOs

- Confirm every endpoint, envelope, field, claim name, and identifier type with backend owners. Add final runtime DTO schemas/adapters and pagination/search contracts.
- Implement token issuance and verification, account creation, `/me`, ownership checks, 401/403 semantics, and rate limiting on the server.
- Decide access-token lifetime, refresh-token rotation/reuse detection, revocation/logout, and password-reset/verification flows. Add client refresh only after this contract exists.
- Decide web cookie/session strategy and CORS; native and web have different persistence requirements.
- Test real Android/iOS login, restart restoration, expired/revoked tokens, offline launch, logout storage failures, account switching, denied owner access, and all data/mutation errors against a staging backend.
- Implement API search by location and dedicated details endpoints before scaling beyond a complete in-memory catalog.
- Add approved scheduling/booking/credit/payment functionality in separate work; this change does not implement it.

## Local checks

Run `npm run lint`, `npm run typecheck`, and `node --test packages/api-client/tests/client.test.cjs`. The tests exercise bearer headers, public requests, 401/403 behavior, missing config/session, JWT expiry/capabilities, logout racing a pending login, and startup restoration/rejection of stored sessions. They use isolated fake fetch/storage; production app code has no mock transport.

Secure storage follows the [Expo SDK 58 SecureStore documentation](https://docs.expo.dev/versions/v58.0.0/sdk/securestore/).
