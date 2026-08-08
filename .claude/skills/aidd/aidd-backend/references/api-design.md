# API Design

The contract is the part you cannot change later without breaking someone. Design it before anything
behind it.

Security aspects live in `aidd-security`'s `api-security.md`. This file is the shape.

---

## Design from the consumer backward

Write the client call you wish existed, then build to it. An API designed outward from the database
schema produces endpoints that mirror your tables and force every client to reassemble your domain.

Two useful checks:

- **Can a client complete a real user task in one call?** If a screen needs four requests, the
  granularity is wrong and you have pushed your data model onto every consumer.
- **Does the client need to know your internals to use it?** Requiring a caller to know that an order
  has line items in a separate table is a leaked implementation detail.

---

## The envelope

Decide once, apply everywhere. Thirty handlers each inventing a response shape is a permanent tax on
every client.

```jsonc
// Single resource
{ "data": { "id": "ord_123", "status": "open" } }

// Collection — the envelope carries pagination
{ "data": [ ... ], "pagination": { "nextCursor": "eyJ...", "hasMore": true } }

// Error — always the same shape
{ "error": { "code": "LIMIT_EXCEEDED", "message": "limit must be 100 or less",
             "details": [ { "field": "limit", "issue": "max_exceeded", "max": 100 } ] } }
```

Whether you wrap in `data` is a style choice; **consistency is not.** The one real argument for
wrapping: you can add top-level metadata later without breaking clients that parse the root.

---

## Errors

The most under-designed part of most APIs, and the part consumers hit when they most need help.

**`code` is the contract. `message` is not.** Clients branch on `code`; `message` is for humans and
may be reworded or localized at any time. Say this in the documentation, or clients will parse the
message and you will break them with a copy edit.

```
code:    LIMIT_EXCEEDED          — stable, machine-readable, SCREAMING_SNAKE
message: "limit must be 100 or less"   — human, changeable
details: field-level specifics for validation failures
```

**Enumerate every error a caller can receive**, with cause and remedy. This table is what makes an
API usable:

| Code | HTTP | Cause | Client should |
|---|---|---|---|
| `VALIDATION_FAILED` | 400 | Malformed input | Fix the request; see `details` |
| `UNAUTHENTICATED` | 401 | Missing or invalid credentials | Re-authenticate |
| `PERMISSION_DENIED` | 403 | Authenticated, not permitted | Do not retry |
| `NOT_FOUND` | 404 | Absent, or not visible to this caller | Do not retry |
| `CONFLICT` | 409 | State conflict — already exists, version mismatch | Re-read and retry |
| `PRECONDITION_FAILED` | 412 | `If-Match` failed | Re-read, merge, retry |
| `LIMIT_EXCEEDED` | 429 | Rate or quota | Back off per `Retry-After` |
| `INTERNAL` | 500 | Our fault | Retry with backoff |
| `UNAVAILABLE` | 503 | Dependency down or overloaded | Retry with backoff |

**Do not overload 400.** A client cannot distinguish "you sent bad input" (do not retry) from "you
exceeded a limit" (back off) if both are 400 with a generic message. That distinction determines
whether the client's retry loop makes things better or worse.

**Never leak internals** in an error — no stack traces, SQL fragments, internal hostnames, or
versions.

---

## Pagination

**Cursor over offset for anything that grows or accepts concurrent writes.**

Offset pagination has two defects that are not theoretical. When rows are inserted or deleted between
page requests, the client **skips and duplicates** rows — silently, so a batch consumer misses records
and nobody notices. And `OFFSET 10000` requires the database to walk and discard 10,000 rows, so page
500 is 500× the cost of page 1.

```
# Offset — acceptable only for small, stable sets
GET /orders?limit=50&offset=100

# Cursor — stable under concurrent writes, constant cost per page
GET /orders?limit=50&cursor=eyJpZCI6IjEyMyIsImNyZWF0ZWQiOiIyMDI2LTAxLTAxIn0
```

Cursor rules:
- Encode the sort key plus a tiebreaker (usually the primary key). Sorting by `created_at` alone
  breaks on ties
- Opaque to the client — base64 a JSON payload. If clients can construct cursors, you cannot change
  the scheme
- The sort order is part of the cursor's meaning. Changing `sort` mid-pagination must be an error, not
  a silently wrong result

**Always cap `limit` server-side, and reject above the cap** rather than clamping silently. Silent
clamping means the client believes it received everything; you carry the load and the client has a
correctness bug it cannot see.

Return `hasMore` explicitly. A client inferring "done" from a short page is wrong whenever a filter
removes rows after the limit is applied.

---

## Idempotency

Networks retry without asking. Any non-GET a client might retry needs defined semantics, or you get
duplicate orders and double charges.

```
POST /payments
Idempotency-Key: 8f14e45f-ea6a-4f2b-9c1e-3d5b7a9c2e10
```

The mechanism:

1. On receipt, attempt to insert the key with a `processing` state. A unique constraint makes this the
   concurrency control — do not check-then-insert
2. If the insert succeeds, do the work, store the response body and status against the key, return it
3. If the key exists and is `complete`, return the stored response. Do not redo the work
4. If the key exists and is `processing`, return 409 — a retry arrived while the original is in
   flight

**Specify three things** that implementations routinely omit:

- **Scope**: per-endpoint, or global? Per-endpoint plus caller is the usual right answer
- **Retention**: 24 hours is typical. Long enough to cover client retry windows
- **Collision with a different payload**: same key, different body. This must be an error (422), not a
  replay of the old response. Returning the stored response for a different request is how a client
  gets a confirmation for something that never happened

Naturally idempotent operations (PUT with a full representation, DELETE) do not need a key — but
document that they are idempotent, or clients will not rely on it.

---

## Versioning

Decide up front what counts as breaking, and write it in the contract. Ambiguity here is how a
"minor" change takes down a partner integration.

**Breaking**: removing a field, renaming a field, narrowing a type, adding a required parameter,
changing an error code, changing pagination style, tightening validation on an existing field,
changing a default.

**Not breaking**: adding an optional field to a response, adding an optional parameter, adding a new
error code for a *new* condition, adding an endpoint.

Note that **tightening validation is breaking**, which surprises people. If you previously accepted a
200-character name and now cap it at 100, existing clients start failing.

| Approach | Cost |
|---|---|
| URL path (`/v2/orders`) | Explicit and cache-friendly. Duplicates routing |
| Header (`Accept: application/vnd.api.v2+json`) | Clean URLs. Harder to test and debug by hand |
| No versioning, additive only | Simplest. Requires real discipline and eventually blocks a cleanup |

For internal APIs, **additive-only with no version** is often right and worth defending — versioning
has a real cost and internal consumers can be migrated. For public or partner APIs, version.

**Deprecation needs a mechanism, not an intention**: a `Deprecation` and `Sunset` header, a documented
date, and usage metrics per version so you know who is still calling. Without the metrics you cannot
ever turn it off — and "we'll remove v1 eventually" means v1's bugs are permanent.

---

## Resource modeling

**Nouns, not verbs.** `POST /orders` not `POST /createOrder`. The method is the verb.

When an operation genuinely is not CRUD, model the thing that happens as a resource:

```
POST /orders/{id}/cancellation      → creates a cancellation
POST /accounts/{id}/verification    → creates a verification attempt
```

This beats `POST /orders/{id}/cancel` because the result is addressable — you can `GET` it, it has an
ID, and it can carry a status. For simple state transitions, a `PATCH` with the new status is fine;
do not over-model.

**Nesting**: one level. `/accounts/{a}/orders` is fine; `/accounts/{a}/orders/{o}/items/{i}/notes` is
not. Once an entity has a unique ID, address it directly.

**Method semantics matter** because infrastructure relies on them: GET must be safe and cacheable,
PUT and DELETE idempotent, POST neither. A GET that mutates will be broken by a prefetcher or a
retrying proxy.

---

## Partial failure

For any endpoint touching more than one thing, state the semantics. This gets skipped and it is a
data-loss bug with a success status.

```jsonc
// All-or-nothing — atomic, simple to reason about
POST /orders/bulk-cancel  → 400 with the first failure, nothing changed

// Per-item — the client must handle mixed results
POST /orders/bulk-cancel  → 207 { "results": [
  { "id": "1", "status": "cancelled" },
  { "id": "2", "status": "failed", "error": { "code": "ALREADY_SHIPPED" } } ] }
```

A bulk endpoint returning **200 with a silent failure list** is the anti-pattern: clients check the
status code, see success, and never read the body. Use 207, or fail the whole batch.

---

## Field-level contract

**Allowlist response fields per endpoint.** A serializer that returns the whole entity exports every
column added in the next three years — the person adding `internal_risk_score` has no idea it is now
public.

**Allowlist bindable request fields.** Otherwise a request body can set `role`, `accountId`, or
`balance`. Allowlist, never denylist — a denylist fails on the next migration.

**Nullability is part of the contract.** Distinguish "field absent" (not requested, or not applicable)
from "field present and null" (known to have no value). PATCH semantics depend on this: omitting a
field means "leave it", sending null means "clear it". If you conflate them, clients cannot clear a
field.

**Types**: strings for identifiers, even numeric ones — they survive scale changes and avoid
precision loss in JavaScript clients. ISO 8601 with timezone for timestamps. Integer minor units or
decimal strings for money, never floats. Enums as strings, and document the full set plus what a
client should do with an unrecognized value.

---

## Long-running operations

Do not hold a connection open for 30 seconds.

```
POST /exports                → 202 { "id": "exp_1", "status": "pending" }
GET  /exports/exp_1          → 200 { "status": "processing", "progress": 0.4 }
GET  /exports/exp_1          → 200 { "status": "complete", "downloadUrl": "..." }
```

Return 202 with a resource to poll, and include a `Retry-After` hint so clients do not poll every
100ms. Webhooks are a better fit when the client can receive them, but polling must still work —
webhook delivery fails.

---

## GraphQL notes

Different failure modes, same underlying concerns.

- **Depth and complexity limits are mandatory**, not optional hardening. Without them one query can
  be a denial of service
- **The N+1 problem is structural**, not accidental — batch with a dataloader pattern from the start
- **Per-field authorization**: each resolver runs independently, so a field resolver can bypass its
  parent's check
- Disable introspection in production
- Errors are per-field with a 200 status, so clients need different handling than REST

---

## Design checklist

- [ ] Consumer's ideal call written before the schema
- [ ] One envelope across all endpoints
- [ ] Every error code enumerated with cause and client action
- [ ] `code` documented as the contract; `message` documented as not
- [ ] Cursor pagination on anything growing; `limit` capped and rejected above the cap
- [ ] `hasMore` returned explicitly
- [ ] Idempotency on every retryable non-GET, with scope, retention, and collision behavior
- [ ] Breaking-change definition written down
- [ ] Deprecation mechanism plus per-version usage metrics
- [ ] Partial-failure semantics stated for every multi-item endpoint
- [ ] Response fields allowlisted; bindable fields allowlisted
- [ ] Absent vs null distinguished; PATCH semantics defined
- [ ] Money as integer minor units or decimal; identifiers as strings
- [ ] Long operations return 202 with a pollable resource

---

## Anti-patterns

- **Designing outward from the schema.** Every client reassembles your domain.
- **Thirty response shapes.** A permanent tax on every consumer.
- **Overloading 400.** The client cannot tell "fix it" from "back off".
- **Clients parsing `message`.** A copy edit becomes a breaking change.
- **Offset pagination on a growing set.** Skips and duplicates rows, silently.
- **Silently clamping `limit`.** The client believes it got everything.
- **Inferring "done" from a short page.** Wrong whenever filtering happens after the limit.
- **A retryable POST with no idempotency key.** Duplicate charges.
- **Returning the stored response for a different payload.** Confirms something that never happened.
- **Verbs in paths.** `POST /createOrder`.
- **Five levels of nesting.** Address entities directly.
- **A GET that mutates.** A prefetcher will find it.
- **200 with a silent per-item failure list.** Data loss with a success status.
- **Whole-entity serialization.** Every future column becomes public.
- **Conflating absent and null.** Clients cannot clear a field.
- **Floats for money.**
- **No per-version usage metrics.** You can never turn the old version off.
