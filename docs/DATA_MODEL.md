## Daghit — Data Model Notes (Planning, Not a Final Schema)
These are the entities and relationships mentioned in architecture discussions. They are conceptual notes, not approved SQL tables or field definitions. Do not generate migrations from this document without a separate design review.
Entities raised in discussion
Concept	Why it exists	Status
Users	Common identity for members and owners	Discussed
Gym ownership / permissions	Link users to gyms they own or manage	Recommended design principle
Gyms / providers	Fitness facilities; possibly individual trainers	Discussed; trainer representation unresolved
Classes / scheduled sessions	Gym-linked offerings with time, cost and last booking chance	Discussed
Bookings	User reservations for classes/sessions	Discussed
Subscription definitions	Reusable plans with terms and benefits	Discussed
User subscriptions	A user's enrollment in a plan	Discussed
User credits	Track credit balances/usage; ledger details unresolved	Discussed
Costs / pricing	Costs for classes or other offerings; exact scope unresolved	Discussed
Original invoices	Internal record of what is owed/charged	Discussed
External payment transactions	Transactions maintained in external payment system	Discussed
Invoice–transaction link	Reconciles internal invoices with externally processed transactions	Discussed; shape/cardinality unresolved
Unsubscribed access	Recognize users without a subscription	Requirement discussed; rules unresolved


## Relationships under consideration
- A user can act as a member and be associated with multiple gyms as an owner or manager.
- A gym has classes/scheduled sessions.
- A class/session has a scheduled time, a cost, and a latest booking cutoff.
- A user makes bookings for sessions.
- Subscription definitions are separate from user-specific subscriptions.
- Credits are associated with users; whether a balance, entries ledger, or both is needed remains unresolved.
- Invoices are distinct from payment transactions in an external system; a link/reconciliation record may be needed. Do not presume one transaction per invoice.
Modeling cautions
- Avoid separate incompatible member_users and owner_users identities.
- Authorization and ownership must be verified by backend logic, not a self-selected mobile login type.
- Payment success does not follow simply from the existence of an invoice.
- No exact column names, keys, database vendor, API endpoints, or business rules have been finalized.
Next step when requested
Turn these notes into a reviewed ERD and API contracts only after the remaining business-rule questions are answered.

## Confirmed product scope

Bookable offerings include studio/gym classes, personal training at a gym or studio, and personal training at a member's home. Bookings support subscription-based credits and a one-off option; whether one-off means buying credits or paying directly for a session remains unresolved. These are product requirements only; trainer/provider representation, credit packs, ledger design, and business rules remain unresolved. Do not infer a database schema from these terms.
