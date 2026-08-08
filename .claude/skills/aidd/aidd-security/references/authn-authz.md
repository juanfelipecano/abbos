# Authentication and Authorization

The two get discussed together and fail differently. Authentication is usually centralized,
well-tested, and correct. Authorization is scattered across every handler, and that asymmetry is
why nearly every serious access-control incident is an authorization bug.

Read this when reviewing auth, designing a new permission model, or when a feature adds an
endpoint that accepts an identifier.

---

## The distinction that matters

| | Authentication | Authorization |
|---|---|---|
| Question | Who are you? | May you do this to this? |
| Frequency | Once per session | Every single request |
| Location | One place | Everywhere |
| Failure mode | Nobody gets in / anyone gets in | *One* endpoint lets the wrong person through |
| Found by | Tests, scanners | Reading every handler |

The consequence: spend your review time on authorization. A login flow gets tested by everyone.
The nineteenth endpoint added last sprint does not.

---

## Password handling

**Hashing.** In order of preference:

| Algorithm | Parameters | Notes |
|---|---|---|
| argon2id | m=19456 (19 MiB), t=2, p=1 | Current best default. Memory-hard. |
| scrypt | N=2^17, r=8, p=1 | Good if argon2 unavailable |
| bcrypt | cost ≥ 12 | Acceptable. Note the 72-byte input truncation |

Never: MD5, SHA-1, SHA-256 alone, unsalted anything, or a scheme someone designed. A fast hash
is the vulnerability — the whole point is to be slow.

Verify the **actual** algorithm and parameters in the running code. "We use bcrypt" with cost 4
is a finding.

**Policy.** Length over composition. A 12-character minimum with no composition rules beats an
8-character minimum requiring symbols — composition rules reduce entropy by making passwords
predictable (`Password1!`).

- Check against a breached-password list on set and change
- Maximum length high enough not to truncate (at least 64), but bounded to prevent DoS
- No password hints, no security questions — both are weaker than the password
- No forced periodic rotation without cause; it drives predictable increments

**Never** log a password, echo it in an error, store it reversibly, or email it.

---

## Sessions

**On successful authentication, issue a new session identifier.** Reusing a pre-authentication
identifier is session fixation and it is still found in production.

| Property | Requirement |
|---|---|
| Entropy | ≥ 128 bits, from a cryptographically secure generator |
| Transport | `Secure`, `HttpOnly`, `SameSite=Lax` or `Strict` |
| Scope | Host-only where possible; avoid domain-wide cookies with subdomains you do not control |
| Idle timeout | Yes — 15–30 min for sensitive apps |
| Absolute timeout | Yes — a session that never expires is a permanent credential |
| Server-side invalidation | Required. A stateless "logout" that only clears the client is not logout |

**Invalidate on password change, everywhere.** This is the check that gets missed. A user
changing their password because they think they are compromised expects every other session to
die. If only the current device's session is invalidated, the attacker keeps access and the user
believes they are safe.

Same for: role or permission change, MFA enrollment change, and account deactivation.

---

## Tokens (JWT and friends)

Stateless tokens trade revocability for scale. Make that trade knowingly.

**Verification checklist** — every item is a real-world bypass:

- [ ] Signature **verified**, not merely decoded. A decode-only path is a total bypass
- [ ] Algorithm pinned server-side. Never take `alg` from the token header
- [ ] `alg: none` rejected
- [ ] Asymmetric keys: an RS256 token must not be verifiable as HS256 using the public key as
      the HMAC secret — algorithm confusion
- [ ] `exp` enforced, with minimal clock skew tolerance
- [ ] `aud` checked — a token for another service must not work here
- [ ] `iss` checked
- [ ] `kid` used to select a key from a known set, never to fetch a key from a URL in the token
- [ ] Claims used for authorization re-checked against the source of truth when they matter

**Lifetime.** Access tokens short (5–15 min), refresh tokens longer and revocable. A 24-hour
access token is a 24-hour window after a revocation that does nothing.

**Refresh token rotation.** Issue a new refresh token on each use and invalidate the old one.
If an old one is presented, that indicates theft — revoke the whole family.

**Storage in a browser.** `HttpOnly` cookie beats `localStorage`, because `localStorage` is
readable by any XSS. If you must use a header-based scheme, accept that XSS means token theft
and weight your XSS defenses accordingly.

**Revocation.** If you need immediate revocation, you need server-side state — a denylist keyed
by token ID, or short access tokens plus a revocable refresh token. There is no third option;
"stateless and instantly revocable" is not a thing.

---

## Authorization models

Pick the simplest that expresses your rules. Complexity here becomes bugs, because every
additional dimension is another combination nobody tested.

| Model | Rule shape | Use when | Cost |
|---|---|---|---|
| **RBAC** | Role → permissions | Roles are stable and coarse | Role explosion when exceptions appear |
| **ABAC** | Attributes → decision | Rules depend on data (owner, tenant, state) | Hard to audit "who can see what" |
| **ReBAC** | Relationship → decision | Sharing, hierarchies, teams | Needs a real engine; do not hand-roll |
| **Ownership** | `resource.owner == caller` | Simple multi-tenant CRUD | Insufficient the moment sharing appears |

Most applications need **ownership plus a small RBAC layer** and reach for more too early.

### Where the check belongs

**Not in the controller only.** Business logic reachable from more than one entry point — an
HTTP handler, a job, a CLI, a GraphQL resolver — needs the check at the layer they share.

The failure pattern:

```
Controller  → checks authorization → Service.transfer()
Batch job   → no check             → Service.transfer()   # bypass
```

Put the check in the service, or in a policy layer the service calls. A check that lives only
at the edge is a check with an internal bypass, and internal callers get added later by someone
who does not know the check was at the edge.

### Scope in the query, not after the fetch

```sql
-- Wrong: fetch then filter. Leaks via timing, count, and any code path that forgets the filter.
SELECT * FROM orders WHERE id = ?

-- Right: authorization is part of the query. No row, no problem.
SELECT * FROM orders WHERE id = ? AND tenant_id = ?
```

The second form makes the authorization impossible to forget at the call site, and returns
"not found" naturally.

### 404, not 403

For resources the caller has no relationship to, return 404. A 403 confirms the resource exists,
which lets an attacker enumerate valid IDs and learn about other tenants' data volume.

Use 403 when the caller can legitimately know the resource exists — a shared document they lack
edit rights on, for example.

---

## Multi-tenancy

The highest-consequence authorization context, because one missed filter exposes every customer.

- Derive the tenant from the **session or token**, never from a request parameter. A tenant ID
  in the body is a request to be someone else
- Enforce the tenant filter in the data layer where it cannot be forgotten — a query builder
  default, a row-level security policy, or a repository that requires it
- Verify with a test that runs every read as tenant A and asserts zero rows from tenant B.
  Make it a criterion (AC-S), not a convention
- Audit the exceptions: admin tooling, exports, background jobs, and analytics queries are where
  cross-tenant leaks actually happen, because they are written outside the normal request path

---

## MFA

- TOTP or WebAuthn. SMS is weak (SIM swap) but far better than nothing
- Rate limit and lock the MFA challenge — an un-throttled 6-digit code is a 6-digit password
- One-time use per code, with a small time window
- Recovery codes: high entropy, single use, shown once, hashed at rest
- **Enrollment and recovery are the attack surface.** Strong MFA with an email-based reset that
  bypasses it provides the security of email
- Re-prompt for sensitive operations (changing email, adding a payout account), not only at login

---

## What to actually test

Reading the code is not verification for this category. Send the requests.

| Check | How |
|---|---|
| Per-object authorization | Two accounts. Every endpoint. A's token, B's resource ID. Expect 404 |
| Vertical escalation | Normal user's token against every admin route |
| Session invalidation | Log in on two clients. Change the password on one. Second must be dead |
| Token verification | Tamper a claim; expect rejection. Try `alg: none`. Try a token from another environment |
| Enumeration | Compare response body, status, and timing for unknown user vs wrong password |
| Rate limiting | Fire N+1 requests at login, reset, and MFA. Expect throttling |
| Tenant isolation | Every read as tenant A asserting zero tenant-B rows |
| Internal bypass | Call the service layer directly, as a job would. Is the check still there? |

The last row finds what code review misses.

---

## Anti-patterns

- **Authorization checked only in the controller.** Internal callers bypass it.
- **Fetch then filter.** Leaks existence, and one forgotten filter leaks data.
- **Tenant ID from the request body.** A request to be someone else.
- **Permissions cached at login.** A revoked role stays live until logout.
- **Password change invalidating only the current session.** The user believes they are safe.
- **Decoding a JWT without verifying it.** Total bypass.
- **`alg` taken from the token.** The attacker picks the algorithm.
- **A long-lived access token with no revocation path.** Revocation that does nothing.
- **403 for resources the caller cannot know about.** Free enumeration.
- **Strong MFA behind an email reset that skips it.** Security of email.
