# OWASP Top 10:2025 — Concrete Checks

The 2025 list, released January 2026, with what to actually check for each category. Use this
as the sweep when you need coverage; use `threat-modeling.md` when you need depth on one
feature.

Two structural changes from 2021 worth knowing, because they change where you look:

- **SSRF was absorbed into A01.** It is no longer its own category. Server-side fetches of
  user-supplied URLs are now an access-control question, which is the right framing — the
  server is being made to access something the caller could not.
- **A10 is new: Mishandling of Exceptional Conditions.** Error paths, failing open, and
  logic errors under abnormal conditions became their own category. This is the least-tested
  code in most applications and now has a name.

| # | Category | Change from 2021 |
|---|---|---|
| A01 | Broken Access Control | Unchanged at #1; absorbed SSRF |
| A02 | Security Misconfiguration | Up from #5 |
| A03 | Software Supply Chain Failures | Expanded from "Vulnerable and Outdated Components" |
| A04 | Cryptographic Failures | Down from #2 |
| A05 | Injection | Down from #3 |
| A06 | Insecure Design | Down from #4 |
| A07 | Authentication Failures | Renamed |
| A08 | Software or Data Integrity Failures | — |
| A09 | Security Logging and Alerting Failures | Renamed to stress alerting |
| A10 | Mishandling of Exceptional Conditions | **New** |

---

## A01 — Broken Access Control

Still first, and in practice still the category that produces the worst real incidents. It is
also the one automated tooling is worst at, because "may this user touch this row" is
application logic a scanner cannot infer.

**Per-object authorization.** The check that gets forgotten. Authentication is usually
centralized and correct; authorization is scattered across handlers and missed on one of them.

For every endpoint accepting an identifier, ask: is there a server-side check that *this*
caller may act on *this* object?

```
# The failure — authenticated, therefore authorized
GET /api/orders/1001   → 200, someone else's order

# What to verify
- Swap the ID for another user's. Expect 404.
- 404, not 403: a 403 confirms the record exists, which is itself a disclosure.
```

**Where to look for it:**
- List endpoints that filter *after* fetching instead of in the query
- Any handler that reads an ID from the path, body, or a JWT claim without re-checking scope
- Nested resources — `/accounts/{a}/orders/{o}` often checks `a` and not that `o` belongs to it
- Batch and bulk endpoints, which frequently check the first item only
- Admin routes protected only by not being linked in the UI
- GraphQL resolvers, where a field resolver may bypass the parent's check

**Mass assignment.** Can a request body set a field the client should not control?

```
POST /api/users  {"name":"x","email":"y","role":"admin"}
```
Verify with an allowlist of bindable fields, not a denylist. A denylist fails the day someone
adds a column.

**SSRF (now here).** Any server-side fetch of a user-supplied URL.

- Allowlist destinations by host. Never a denylist of internal ranges — encodings,
  redirects, and DNS make denylists leak.
- Block link-local (`169.254.0.0/16`, including cloud metadata endpoints), loopback, and
  private ranges.
- **Re-validate after every redirect.** Validating only the initial URL is the standard bypass.
- Disable unneeded protocols (`file://`, `gopher://`, `dict://`).

**Path traversal.** Any file operation on a user-supplied name. Resolve to an absolute path
and confirm it is still inside the intended directory *after* normalization.

**Also check:** CORS with a reflected origin and credentials; force-browsing to authenticated
pages; JWTs where the signature is decoded but not verified; permissions cached at login and
never re-checked after a role change.

---

## A02 — Security Misconfiguration

Up to #2 because default-insecure configurations scale: one bad default affects every
deployment.

**Headers.** Verify what the server actually sends, not what the config says.

| Header | Value | Why |
|---|---|---|
| `Content-Security-Policy` | No `unsafe-inline`, no `unsafe-eval` | The only real defense-in-depth against XSS |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Prevents protocol downgrade |
| `X-Content-Type-Options` | `nosniff` | Stops MIME confusion |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Prevents URL leakage |
| `Cache-Control` | `no-store` on authenticated responses | Keeps private data out of shared caches |

A CSP with `unsafe-inline` provides approximately no XSS protection. If inline scripts are
required, use a nonce or hash.

**Configuration checks:**
- Debug mode, stack traces, and verbose errors off in production
- Directory listing disabled; source maps not served publicly
- Default credentials changed everywhere, including databases, admin panels, and message brokers
- Management ports not reachable from the internet
- Cloud storage buckets not public by accident — check both bucket policy and object ACLs
- Unused features, endpoints, sample apps, and ports removed
- Cookies: `HttpOnly`, `Secure`, `SameSite`, and host-scoped

**The verification that matters:** check the running environment, not the repository. Config
drift between what is committed and what is deployed is the normal state of things.

---

## A03 — Software Supply Chain Failures

Expanded from "vulnerable components" to the whole ecosystem: dependencies, build systems,
and distribution. The reasoning is that compromising a build pipeline is more efficient than
compromising an application, so that is where attention went.

**Dependencies:**
- Lockfile committed and honored in CI — a build that resolves fresh versions is not reproducible
- Known-vulnerable versions: run the scan in CI, and fail the build on High and Critical
- Unmaintained packages: last release, open critical issues, single maintainer
- Typosquatting on any newly added package — check the name character by character
- Transitive depth: a direct dependency with 400 transitive dependencies is 400 trust decisions

**Build and distribution:**
- CI credentials scoped to least privilege. A CI token with production write access is the
  highest-value target in most organizations
- Pinned action/plugin versions by digest, not by mutable tag
- Build runs on a clean, ephemeral environment
- Artifacts signed, and the signature verified at deploy
- Same artifact promoted through environments — never rebuilt per environment

**Install-time script execution** is worth calling out: many ecosystems run arbitrary code on
install. That code runs with your developers' and CI's credentials.

---

## A04 — Cryptographic Failures

Down to #4, mostly because libraries got better defaults, not because the failures changed.

- **Never implement crypto.** Use a vetted library's high-level interface. Nearly every
  finding here comes from someone composing primitives.
- Passwords: argon2id (or scrypt, or bcrypt). Never SHA-family alone, never MD5, never
  unsalted, never a homegrown scheme.
- Encryption at rest for sensitive fields, with a documented key rotation path.
- TLS everywhere including internal service-to-service. "It's behind the VPC" assumes the
  network is trusted, which is the assumption that keeps failing.
- Randomness: a cryptographically secure generator for tokens, session IDs, and reset codes.
  A general-purpose PRNG is predictable.
- Do not encrypt what you can avoid storing. The cheapest way to protect data is to not have it.

**Check for:** hardcoded keys; keys in the repository history; the same key across environments;
ECB mode; a static IV; unauthenticated encryption where tampering matters.

---

## A05 — Injection

Down to #5 because parameterized queries became the default, but the category widened — it now
clearly covers anywhere untrusted input reaches an interpreter.

| Sink | Defense |
|---|---|
| SQL | Parameterized queries. Also the ORM's raw escape hatch — that is where it hides |
| HTML | Contextual output encoding; auto-escaping on; never a raw/unescaped directive on user input |
| OS command | Avoid the shell. Pass an argument array, never a concatenated string |
| LDAP / XPath | Library-provided escaping |
| NoSQL | Reject operator objects from request bodies — `{"$ne": null}` as a password is the classic |
| Template engine | Never build a template from user input — that is server-side template injection, which is remote code execution |
| Log | Strip newlines from user input before logging, or an attacker forges log entries |

**Context matters for encoding.** A value safe in an HTML body is not safe in an attribute, a
`<script>` block, a URL, or CSS. One encoder applied everywhere leaves holes.

**Validate as an allowlist** where the shape is known — a length, a character class, an enum.
Denylists of dangerous characters are bypassed by encoding.

---

## A06 — Insecure Design

The category you cannot scan for. These are flaws in what the system does, not in how it was
coded, and they are the reason `threat-modeling.md` exists.

**Business logic to attack:**
- Race conditions on anything with a balance, quota, inventory, seat count, or single-use token.
  Fire N parallel requests and count the effects
- Negative, zero, or fractional quantities; integer overflow on a total
- Workflow steps skippable by calling step 3 directly
- Replay of a signed or paid request without an idempotency guard
- Price, discount, or total computed client-side and trusted server-side
- Rate limits per account when the attack is per resource, or vice versa

**Design-level questions:** Where is trust established, and is it re-established after
privilege changes? What is the blast radius of one compromised credential? Which operations
are irreversible, and do they have a confirmation and an audit trail?

---

## A07 — Authentication Failures

Renamed from "Identification and Authentication Failures".

**Credentials:**
- Modern password hashing (see A04). Verify the actual algorithm and parameters, not the intent
- Rate limiting and lockout on login, password reset, MFA challenge, and token refresh
- Check credentials against a breached-password list; block the known-common ones
- No password composition rules that reduce entropy; length over character classes

**Sessions and tokens:**
- New session ID on authentication. Fixation is still real
- Invalidate on logout and **on password change, everywhere** — not just the current device
- Absolute and idle timeouts both
- JWT: signature verified, `alg` pinned server-side, `exp` enforced, `aud` and `iss` checked.
  Never trust claims from a token you did not verify
- Reset tokens: single-use, short-lived, high entropy, invalidated after use and after a
  successful reset

**User enumeration:** identical response body, status, *and* timing for unknown-user versus
wrong-password. Registration and password reset leak this most often.

---

## A08 — Software or Data Integrity Failures

- Unsigned or unverified updates, plugins, or configuration pulled at runtime
- **Insecure deserialization** — never deserialize untrusted data into arbitrary types. Prefer
  a data-only format with an explicit schema
- Integrity of data in transit between your own services
- Audit trails for security-relevant changes that cannot be edited by the actor
- CI/CD that can be influenced by an unreviewed pull request

---

## A09 — Security Logging and Alerting Failures

Renamed to stress alerting: a log nobody reads is not a control.

**Log these:** authentication success and failure, authorization denials, input validation
failures on security-relevant fields, privilege changes, access to sensitive data,
administrative actions.

**Never log:** passwords, tokens, session IDs, full card numbers, or PII beyond what an
investigation needs. A log aggregator is a lower-trust environment than your database, and it
usually has broader read access.

**Make it usable:** structured, one event per line, with a correlation ID and enough context to
diagnose without reproducing. Tamper-evident storage for anything that matters legally.

**Alert on symptoms with a response.** Credential stuffing patterns, privilege escalation
attempts, anomalous data volume. An alert whose response is "look and dismiss" trains people
to ignore the one that matters.

---

## A10 — Mishandling of Exceptional Conditions (new)

24 CWEs about error handling, failing open, and logic errors under abnormal conditions. It is a
new category because this code is the least executed and least tested in most applications.

**Failing open** is the core pattern to hunt:

```
try {
  authorized = authService.check(user, resource);
} catch (e) {
  log.warn("auth service unavailable");
  authorized = true;          // fails open — the vulnerability
}
```

Under normal conditions this is invisible. Under load, during a deploy, or during a targeted
outage of the auth service, it is a complete authorization bypass. **When a security check
cannot be completed, the request must be denied.**

**Also check:**
- Empty `catch` blocks, and catches that log and continue on a security-relevant path
- A partial failure leaving inconsistent state — half a transaction, a charge without an order
- Error responses that leak stack traces, SQL fragments, internal paths, or version numbers
- Retries on a non-idempotent operation, producing duplicate effects
- Timeout handling: what is the state when a call times out but the remote side succeeded?
- Resources not released on the error path — the connection leak that only appears under failure

**Verification approach:** inject the failure. Make the dependency return a 500, time out, and
return malformed data. Reading the error path is not testing it, and this category exists
precisely because nobody runs it.

---

## Sweep order

When you have limited time, this order finds the most severe issues fastest:

1. **A01** — per-object authorization on every new endpoint. Highest hit rate, highest severity.
2. **A10** — failing open on any security check. New, so rarely reviewed.
3. **A07** — session invalidation and token verification.
4. **A05** — injection at every new sink.
5. **A02** — headers and config in the running environment.
6. Everything else.

Then read `threat-modeling.md` and go deep on the one feature that scared you most.
