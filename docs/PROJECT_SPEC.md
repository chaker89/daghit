# Daghit — Product Specification (Prototype)

> Current integration stage: fixture data and mock login have been replaced with HTTP adapters and a persistent native JWT session. Read [Backend integration](BACKEND_INTEGRATION.md) for the active contract, setup, limitations, and TODOs. Earlier prototype descriptions below are historical where they conflict with that document. No backend is deployed by this client change.

This document records confirmed product scope for the mobile prototype. It is based on `PROJECT_SPECS.md` and `DATA_MODEL.md`; planning notes are not authorization to invent unresolved business rules.

## Product and roles

- Daghit is a fitness marketplace for Lebanon, built for Android and iOS with React Native, Expo, and TypeScript.
- A Laravel backend is planned for a later phase; this repository currently contains the mobile app and a placeholder API-client boundary only.
- Members discover gyms and studios, fitness classes, personal training at a gym or studio, and personal trainers who visit the member at home.
- Gym owners can register and manage one or more gyms, their facilities, classes, and schedules.
- Administrators manage the platform, partners, and approvals; admin functionality is later work.
- One account may have both member and gym-owner capabilities. A client-side onboarding choice does not grant authorization or prove ownership.
- Browsing without an active subscription is supported. Guest and unsubscribed booking permissions are unresolved.

## First prototype milestone

- Welcome, login, signup, and member/gym-owner onboarding choice with clearly mocked authentication.
- Member discovery with an interactive map and a list view; mock venues appear as selectable markers with basic details. Use foreground device location when permitted; fall back to Beirut if access is denied or unavailable. Fit the initial viewport to the device location and up to three nearest mock results when they are in the same local area. Three is a viewport heuristic matching the fixtures, not a service-area or booking rule. Generic map primitives are shared from `packages/ui`; Daghit-specific map composition lives in the discovery feature.
- Guest browsing without subscription gating.
- Owner dashboard and add-gym form with name, type, description, city, street address, and geographic coordinates; support multiple locally stored mock gyms.
- Validate required form fields and confirm that a gym was saved as a local mock record.
- Use mock data only. Keep authentication, ownership, entitlements, booking validation, balances, and payments outside the production boundary until a backend exists.

## Prototype presentation limits

- Mark sample profiles, plans, balances, bookings, and listings as demo data. They do not represent live accounts, eligibility, availability, or transactions.
- Do not implement real payments, subscription purchases, or bookings.
- The product has subscription-based credits and a one-off option, but the one-off transaction meaning is unresolved. The UI must not claim either path is available.

## Open questions

The following remain undecided and must not be inferred in client behavior: API contracts and permission storage; authentication method; gym/provider approval and trainer representation; plan definitions, prices, credit amounts and eligibility; one-off purchase semantics; session credit costs; credit ledger, holds, debits, refunds; booking cutoff, cancellation, no-show, and payout rules; home-visit service areas and address handling; payment provider, invoices, reconciliation; and final map provider/location capture rules. Laravel is the planned backend framework, but no backend integration or domain/API contract is implemented here.

See `DATA_MODEL.md` for conceptual entities and relationships. Those notes are not an approved database schema.
