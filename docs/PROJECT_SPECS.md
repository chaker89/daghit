# Daghit — Project Context

> Current integration stage: fixture data and mock login have been replaced with HTTP adapters and a persistent native JWT session. Read [Backend integration](BACKEND_INTEGRATION.md) for the active contract, setup, limitations, and TODOs. Earlier prototype descriptions below are historical where they conflict with that document. No backend is deployed by this client change.

This document records product decisions and unresolved questions. It is not a production specification for backend behavior.

## Product

- Name: Daghit.
- Market: Lebanon.
- Concept: A fitness marketplace for discovering and booking fitness services.
- Platforms: Android and iOS from one React Native, Expo, and TypeScript codebase.
- Stage: Mobile prototype; there is no production backend or real authentication yet.

## Services and credit source

Members can book these service types:

1. A fitness class at a gym or studio.
2. A personal training session at a gym or studio.
3. A personal trainer who visits the member at home.

Bookings can use subscription-based credits or a one-off option. Whether the one-off option buys credits or pays directly for a session remains unresolved. The interface must not imply that either path, a balance, a price, or a booking is live before backend support exists.

## Participants and access

- Member: discovers venues and services, obtains credits, and books sessions.
- Gym owner: registers and manages one or more gyms and their offerings.
- Administrator: manages the platform, partners, and approvals; detailed scope is later work.
- One person may have member and gym-owner capabilities. They are not mutually exclusive account types.
- Gym ownership and permissions relate a user to specific gyms; a client-side role choice is not authorization.
- Browsing without an active subscription is supported as a product need. Exact guest and unsubscribed booking permissions remain unresolved.

## Prototype boundaries

- Keep mock interfaces and data separate from production API and business logic.
- The client does not establish authorization, credit balances, booking eligibility, payment success, or ownership.
- Do not add production payments, subscriptions, authentication, or booking behavior until specified.
- Discovery should support both an interactive map and a list view. Use the device's current location when foreground permission is granted; fall back to Beirut when permission is denied or location is unavailable. Current mock listings are located in Beirut.

## Open questions (do not silently decide)

- Authentication method, backend/API stack, and permission storage.
- Gym/provider approval and trainer representation in the data model.
- Subscription plans, prices, included credits, lifecycle, and eligibility.
- Whether a one-off booking means credit purchase or direct session payment; if credits, pack options, prices, expiration, and eligibility.
- Session credit costs, holds/debits, refunds, and ledger/accounting behavior.
- Booking cutoff, cancellation, no-show, and gym payout rules.
- Home visit service areas, address privacy/collection, travel constraints, and fulfillment.
- External payment provider, invoices, and transaction reconciliation.
- Gym location capture and final map provider.
