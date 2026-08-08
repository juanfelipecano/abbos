# Remediation Patterns

Fixes by vulnerability class. A finding without a fix is half a report, and "sanitize the input"
is not a fix — it is a category.

Language-agnostic; adapt to the stack in `PROJECT-CONTEXT.md`. The patterns matter more than the
syntax.

---

## How to write a remediation

Four parts, always:

1. **The exploitation path** — the request an attacker sends and what they get. If you cannot
   write this, you have a hardening suggestion, and calling it a vulnerability spends credibility
   you will need for a real one.
2. **The fix** — before and after, minimal.
3. **The verification** — the command or request that proves it fixed.
4. **The class** — so the reviewer can look for siblings. One IDOR usually means several.

```markdown
### [HIGH] Order endpoint returns any user's order
**Location**: `src/orders/handler.ts:34`
**Class**: A01 Broken Access Control / API1 BOLA
**Exploitation**: `GET /api/orders/1001` with any valid token returns order 1001 regardless of
owner. Sequential IDs make enumerating all orders trivial.
**Impact**: Full read of every customer's order history, including addresses and line items.
**Fix**: scope the query by the caller's tenant (below).
**Verified by**: `npm test -- orders.tenant-isolation`
**Siblings to check**: every handler in `src/**/handler.ts` taking an `:id` param — 7 files.
```

That last line is what makes a remediation report worth more than a bug ticket.

---

## Broken access control

**Scope the query, do not filter the result.**

```
// Before — authorization is a separate, forgettable step
const order = await db.query('SELECT * FROM orders WHERE id = ?', [id]);
if (order.tenantId !== session.tenantId) throw new Forbidden();  // often absent
return order;

// After — authorization is part of the query. Impossible to forget at the call site.
const order = await db.query(
  'SELECT * FROM orders WHERE id = ? AND tenant_id = ?',
  [id, session.tenantId]
);
if (!order) throw new NotFound();   // 404, not 403 — do not confirm existence
```

**Move the check to the shared layer.** If the controller checks and a job does not, the job is
the bypass:

```
// Before: check at the edge
class OrderController { cancel(id) { authorize(user, id); orderService.cancel(id); } }
class CleanupJob    { run()      {                       orderService.cancel(id); } }  // bypass

// After: the service requires an authorization context it cannot proceed without
class OrderService {
  cancel(id, actor) {
    const order = this.repo.findForActor(id, actor);   // scoped fetch
    if (!order) throw new NotFound();
    ...
  }
}
```

The signature change is the fix. An optional context parameter will be omitted.

**Mass assignment — allowlist the bindable fields.**

```
// Before
Object.assign(user, req.body);           // role, tenantId, balance all writable

// After
const ALLOWED = ['name', 'displayName', 'locale'];
for (const k of ALLOWED) if (k in req.body) user[k] = req.body[k];
```

Allowlist, never denylist. A denylist fails on the next migration, silently.

**SSRF — allowlist the destination and re-validate after redirects.**

```
// Before
const res = await fetch(req.body.url);

// After
const ALLOWED_HOSTS = new Set(['api.partner.com', 'cdn.partner.com']);

function assertAllowed(u) {
  const url = new URL(u);
  if (url.protocol !== 'https:') throw new BadRequest('scheme');
  if (!ALLOWED_HOSTS.has(url.hostname)) throw new BadRequest('host');
  return url;
}

let url = assertAllowed(req.body.url);
const res = await fetch(url, {
  redirect: 'manual',              // never follow blindly
  signal: AbortSignal.timeout(5000)
});
if (isRedirect(res)) {
  url = assertAllowed(res.headers.get('location'));   // re-validate — the standard bypass
  ...
}
```

Do not denylist internal ranges instead. DNS rebinding, decimal and hex IP encodings, IPv6
mapping, and redirects all defeat denylists. If you must resolve dynamic hosts, resolve the name
yourself, check the resulting IP against blocked ranges, and connect to that IP with the original
`Host` header.

---

## Injection

**SQL — parameterize, including inside the ORM's escape hatch.**

```
// Before
db.raw(`SELECT * FROM users WHERE email = '${email}'`);

// After
db.raw('SELECT * FROM users WHERE email = ?', [email]);
```

For identifiers that genuinely cannot be parameterized (a sort column), use an allowlist map:

```
const SORTABLE = { created: 'created_at', name: 'display_name' };
const col = SORTABLE[req.query.sort];
if (!col) throw new BadRequest('sort');
```

Never interpolate a user string as an identifier, even after escaping.

**Command — never touch a shell.**

```
// Before
exec(`convert ${filename} out.png`);       // filename = "x.jpg; rm -rf /"

// After
spawn('convert', [filename, 'out.png']);   // argument array, no shell
```

If a shell is unavoidable, the argument must come from an allowlist, not from escaping.

**XSS — encode for the destination context.**

```
// Before
el.innerHTML = userInput;

// After
el.textContent = userInput;                    // text context
// attribute: use the framework's binding, not string building
// URL: validate the scheme — reject javascript:, data:
// HTML that must be rich: sanitize with a vetted library and an allowlist of tags
```

Then add a CSP without `unsafe-inline` as defense in depth. A CSP is not a substitute for
encoding, and encoding is not a substitute for a CSP.

**NoSQL — reject operator objects from request bodies.**

```
// Before — {"password": {"$ne": null}} authenticates as anyone
db.users.findOne({ email: req.body.email, password: req.body.password });

// After — coerce to primitives, and validate types at the boundary
const email = String(req.body.email ?? '');
const password = String(req.body.password ?? '');
```

A schema validator at the edge that rejects non-string types fixes the whole class at once.

---

## Authentication and session fixes

**Upgrade password hashing without breaking logins.** Rehash on successful login:

```
async function verify(user, password) {
  if (user.hashAlgo === 'sha256') {                    // legacy
    if (!legacyVerify(user.hash, password)) return false;
    user.hash = await argon2.hash(password);           // upgrade in place
    user.hashAlgo = 'argon2id';
    await save(user);
    return true;
  }
  return argon2.verify(user.hash, password);
}
```

This migrates the active population without a forced reset. Set a deadline after which remaining
legacy hashes are invalidated and those users must reset.

**Invalidate every session on password change.**

```
// Before
await updatePassword(user, newPassword);
// current session survives; so does the attacker's

// After
await updatePassword(user, newPassword);
await sessions.deleteAllForUser(user.id);     // every device
await issueNewSession(res, user);             // keep the current actor logged in
```

For stateless tokens, bump a per-user `tokenVersion` claim and reject tokens below it. That
requires one lookup per request — which is the price of revocability.

**Close enumeration.**

```
// Before
if (!user) return res.status(404).json({error:'No account with that email'});
if (!ok)   return res.status(401).json({error:'Wrong password'});

// After — identical response, and identical work
const user = await findUser(email);
const hash = user?.hash ?? DUMMY_HASH;        // always hash, to equalize timing
const ok = await verify(hash, password);
if (!user || !ok) return res.status(401).json({ code: 'INVALID_CREDENTIALS' });
```

The dummy hash matters: skipping the expensive comparison for unknown users leaks existence
through timing even with identical responses.

---

## Failing open (A10)

The highest-value fix in the new category. Any security check that cannot complete must deny.

```
// Before — the outage is the bypass
let allowed;
try {
  allowed = await authz.check(user, resource);
} catch (e) {
  log.warn('authz unavailable', e);
  allowed = true;                       // vulnerability
}

// After
let allowed = false;                    // deny by default
try {
  allowed = await authz.check(user, resource);
} catch (e) {
  log.error('authz unavailable — denying', e);
  metrics.increment('authz.unavailable');   // so the outage is visible, not silent
  throw new ServiceUnavailable();           // 503, not a silent allow
}
```

The pattern generalizes: initialize the decision to the safe value, and let the happy path be the
only thing that changes it. Then alert, because the safe-fail should not be quiet.

**Also fix:** empty catch blocks on security paths; retries on non-idempotent operations;
resources not released on the error path; a timeout treated as a failure when the remote side
may have succeeded.

---

## Secrets in the repository

**Rotate first.** Removing the commit is not remediation — the value is already cloned onto every
machine that ever pulled, and it is in forks, CI caches, and backups.

1. Rotate the credential at the provider. Now.
2. Check access logs for use during the exposure window.
3. Replace with an environment variable or a secret manager reference.
4. Add a pre-commit and CI secret scan so it cannot recur.
5. Only then consider history rewriting — and only if you accept invalidating every clone.

Step 4 is the one that matters long-term (Article XII): fix the system that allowed it.

---

## Configuration fixes

```
# CSP — start restrictive, add what breaks, never add unsafe-inline
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-{random}';
  object-src 'none'; base-uri 'self'; frame-ancestors 'none'
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Cache-Control: no-store          # on authenticated responses
```

```
# CORS — explicit allowlist, never reflection with credentials
const ALLOWED = new Set(['https://app.example.com']);
const origin = req.headers.origin;
if (ALLOWED.has(origin)) {
  res.setHeader('Access-Control-Allow-Origin', origin);   // the specific origin, not '*'
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Vary', 'Origin');                        // or caches will cross-serve
}
```

The `Vary: Origin` header is routinely forgotten and causes a CDN to serve one origin's CORS
response to another.

---

## Fix sequencing

When you have many findings, order matters — not by severity alone.

1. **Rotate any exposed credential.** Minutes, not sprints.
2. **Fix Critical and High** in the order of cheapest-per-severity.
3. **Fix the class, not the instance.** One IDOR means auditing every handler. A remediation that
   fixes one of seven leaves a false sense of completion.
4. **Add the guardrail** that prevents recurrence: a lint rule, a repository base class that
   requires a scope, a CI check, a test that runs cross-tenant reads.
5. **Then the Mediums**, batched into one change where they share a mechanism.

Step 4 is what makes the effort compound. Without it you will write this same report next quarter.

---

## Verification

Never close a finding on code reading. For each fix, the check that would have caught the
original:

| Class | Verify by |
|---|---|
| Access control | The exploit request, with a second account. Expect 404 |
| Injection | The payload that worked. Expect rejection or literal treatment |
| Auth | Log in twice, change password, confirm the other session dies |
| Enumeration | Compare status, body, and timing across cases |
| Rate limit | Fire N+1. Expect 429 |
| Failing open | Kill the dependency. Expect denial, and an alert |
| Secrets | The old credential returns 401 at the provider |
| Headers | `curl -I` against the running environment, not the config file |

Paste the output into the report (Article II). A security sign-off from reading the diff is how
"should be fixed now" ships.
