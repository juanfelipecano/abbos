# API Security

APIs fail differently from server-rendered applications. There is no browser enforcing anything,
the client is untrusted and often not yours, and the attack surface is enumerable from a schema
you probably publish.

Read alongside `authn-authz.md` (which covers the auth mechanics) and `aidd-backend`'s
`api-design.md` (which covers the contract shape this document secures).

---

## OWASP API Security Top 10 — what to check

A separate list from the main Top 10, and more useful for APIs because the ranking reflects how
APIs actually get broken.

| # | Risk | The check |
|---|---|---|
| API1 | Broken object level authorization (BOLA/IDOR) | Every endpoint taking an ID: does it verify *this* caller may touch *this* object? |
| API2 | Broken authentication | See `authn-authz.md`. Token verification, rate limits, enumeration |
| API3 | Broken object property level authorization | Does the response include fields the caller should not see? Can the request set fields it should not? |
| API4 | Unrestricted resource consumption | What is unbounded? Page size, upload size, fan-out, complexity |
| API5 | Broken function level authorization | Can a normal user call an admin function directly? |
| API6 | Unrestricted access to sensitive business flows | Can the flow be automated to cause harm — bulk purchase, mass signup, scraping? |
| API7 | Server-side request forgery | Any server-side fetch of a client-supplied URL |
| API8 | Security misconfiguration | Headers, CORS, verbose errors, debug endpoints |
| API9 | Improper inventory management | Undocumented, deprecated, or forgotten versions still serving traffic |
| API10 | Unsafe consumption of third-party APIs | Do you trust the upstream response as much as you distrust your client? |

**API1 and API3 together account for most real API breaches.** They are both authorization, one
at the object level and one at the field level, and both are invisible to scanners.

---

## Object-level authorization (API1)

Covered in `authn-authz.md`, but the API-specific angles:

- **Sequential IDs make enumeration free.** Non-sequential identifiers are not an
  authorization control, but they raise the cost of discovery. Do both.
- **Nested paths check only the outer ID** more often than not. `/accounts/{a}/orders/{o}`
  frequently validates `a` and then loads `o` globally.
- **Batch endpoints check the first item.** `POST /orders/bulk-cancel` with 50 IDs — is every
  one checked, or just enough to pass the happy-path test?
- **GraphQL field resolvers** can bypass the parent's check entirely, because each resolver runs
  independently.

---

## Field-level authorization (API3)

Two directions, both commonly missed.

**On the way out — over-exposure.** A serializer that returns the whole entity leaks every field
added later, silently. The person adding `internal_risk_score` to the user table has no idea it
is now in a public API response.

```
# The failure
GET /api/users/me → {id, email, name, password_hash, internal_notes, referrer_ip, is_flagged}
```

Fix with an **explicit allowlist per response**, defined by what the client needs. Not a denylist
of sensitive fields — a denylist fails on the next migration.

Verify by diffing the actual response against the documented contract. Fields present but
undocumented are the finding.

**On the way in — mass assignment.** Can the request body set a field the caller should not
control?

```
PATCH /api/users/me  {"name":"x", "role":"admin", "account_id":"other", "credit_balance":9999}
```

Fix with an explicit bindable-field allowlist per endpoint. Verify by sending every sensitive
field you can think of and confirming it is ignored — not rejected necessarily, but ignored.

---

## Resource consumption (API4)

APIs have no browser to slow the client down. Everything unbounded is a denial of service, and
often a cheap one.

| Vector | Control |
|---|---|
| Page size | Cap server-side. Reject above the cap rather than silently clamping |
| Request body size | Limit at the gateway, before your code allocates |
| Upload size and type | Limit both; validate type by content, not extension |
| Query complexity (GraphQL) | Depth limit, complexity budget, disable introspection in production |
| Fan-out | An endpoint that issues one downstream call per item is an amplifier |
| Regex on user input | Catastrophic backtracking is a single-request outage |
| Recursion / nesting depth | JSON bombs, deeply nested filters |
| Concurrent operations per user | One in-flight export, not unlimited |
| Rate limits | Per identity **and** per IP; both, because each defeats a different attack |

**Rate limit scope is a design decision.** Per-account limits do nothing against an attacker
with 10,000 accounts. Per-IP does nothing against a distributed attacker. Limit the *resource*
being protected — password reset attempts per target account, not per requester.

Return `429` with `Retry-After`. A limit that manifests as a timeout teaches clients to retry
harder.

---

## Business flow abuse (API6)

The category that is not a coding bug. Your API works exactly as designed; the design permits
harm at scale.

Ask, for each significant flow: **what happens if someone automates this 10,000 times?**

- Signup → fake accounts, referral fraud, free-tier abuse
- Purchase → inventory hoarding, scalping, card testing
- Password reset → mailbombing a target user
- Search → data scraping, competitive intelligence
- Coupon redemption → the race condition, plus systematic enumeration of valid codes
- Invite → spam sent from your domain, damaging your sending reputation

Controls are usually not technical rejections but friction and detection: proof of work, CAPTCHA
at anomalous rates, velocity limits per resource, anomaly alerting, and a manual review queue for
the top percentile.

Decide this at design time. Retrofitting abuse controls onto a live flow means either breaking
legitimate clients or accepting the abuse.

---

## Webhooks

Inbound webhooks are an unauthenticated internet-facing endpoint that writes to your database.
Treat them accordingly.

**Verify the signature before parsing the body.** Parsing first means you have run your JSON
parser on attacker input before establishing any trust.

```
1. Read the raw body (exact bytes — not re-serialized)
2. Compute the expected signature over those bytes with the shared secret
3. Compare in constant time
4. Only now parse
```

Three details that break real implementations:

- **Raw bytes, not a re-serialized object.** Any reordering or whitespace change invalidates the
  signature. Frameworks that parse JSON automatically will break this; capture the raw body first.
- **Constant-time comparison.** A short-circuiting `==` leaks the signature byte by byte.
- **Timestamp window.** A valid signature is valid forever without one. Reject anything older
  than a few minutes, and include the timestamp in the signed payload so it cannot be changed.

**Replay protection.** The signature proves authenticity, not freshness. Store the event ID and
reject duplicates. Providers legitimately re-deliver, so your handler must be idempotent
regardless — see `aidd-backend`'s `async-jobs.md`.

**Also:**
- Respond fast (queue the work); providers time out and re-deliver, multiplying load
- Never trust webhook payload data over your own records for anything financial — re-fetch from
  the provider's API using the ID
- Rotate the shared secret on a schedule, supporting two valid secrets during rotation
- The endpoint is discoverable. It needs rate limiting too

**Outbound webhooks** are SSRF by design: you are fetching a customer-supplied URL. Allowlist
schemes, block internal ranges, re-validate after redirects, use a dedicated egress path, and
set aggressive timeouts.

---

## Inventory (API9)

The vulnerability nobody looks for: an old version still serving traffic.

- Enumerate what is actually deployed and reachable, not what is documented. Check the gateway
  config and the access logs, not the repository
- `/v1` still live after `/v2` shipped means `/v1`'s bugs are still live
- Staging and preview environments with production data and weaker auth
- Debug, health, and metrics endpoints that leak version numbers, config, or internals
- Deprecated endpoints: is there a sunset date, and is anyone actually calling them? The access
  log answers this

---

## Consuming third-party APIs (API10)

You validate your client's input rigorously and then trust an upstream response completely. The
upstream can be compromised, misconfigured, or simply return something unexpected.

- Validate the shape of upstream responses. A missing field that becomes `undefined` and flows
  into a permission check is a real bug class
- Set timeouts on every call. No timeout means their outage is your outage
- Never render upstream content unescaped — supplier-side XSS is still your XSS
- Do not follow upstream redirects blindly
- Bound what you accept: a response size limit, a maximum array length
- Fail **closed** on a security-relevant upstream call (see A10, mishandling exceptional
  conditions). If the fraud check times out, do not approve

---

## Transport and configuration

- TLS everywhere, including service-to-service. Verify certificates — disabled verification is
  common in internal code and defeats the point
- **CORS**: explicit origin allowlist. Never reflect the `Origin` header with
  `Access-Control-Allow-Credentials: true` — that is a same-origin-policy bypass. Never `*` with
  credentials
- `Cache-Control: no-store` on authenticated responses, so shared caches do not serve one user's
  data to another
- Errors: a stable machine-readable `code`, a generic message, and no stack traces, SQL
  fragments, internal hostnames, or version numbers
- Do not put anything sensitive in a URL — query strings land in access logs, browser history,
  referrer headers, and analytics

---

## Test checklist

Two accounts, one script, run it against every endpoint:

- [ ] A's token + B's resource ID → 404 on every endpoint
- [ ] Normal token → every admin route → 403 or 404
- [ ] Response fields diffed against the documented contract; no extras
- [ ] Every sensitive field sent in a PATCH body → ignored
- [ ] `limit` above the cap → 400
- [ ] Oversized body → rejected at the gateway
- [ ] N+1 requests at login, reset, and MFA → 429 with `Retry-After`
- [ ] Webhook with a wrong signature → rejected before parsing
- [ ] Webhook replayed with a seen event ID → 200, no duplicate effect
- [ ] Webhook with an old timestamp → rejected
- [ ] Server-side URL fetch pointed at `169.254.169.254` and at a redirect to it → blocked
- [ ] CORS preflight from an unexpected origin → not allowed
- [ ] Error responses contain no stack traces or internal detail
- [ ] Old API versions enumerated from the gateway config and the access log

---

## Anti-patterns

- **Parsing the webhook body before verifying the signature.**
- **Comparing signatures with `==`.** Timing leak.
- **No timestamp window on a signed webhook.** Valid forever.
- **Returning whole entities.** Every future column joins the public API.
- **Denylisting sensitive fields.** Fails on the next migration.
- **Rate limiting the requester when the target is what needs protecting.**
- **Reflecting `Origin` with credentials enabled.** Same-origin policy bypass.
- **Trusting upstream responses.** You validated the wrong side.
- **Failing open when a security-relevant upstream times out.**
- **`/v1` still routed after `/v2` shipped.**
- **Silently clamping an over-cap `limit`.** The client never learns; you carry the load.
