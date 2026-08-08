# Data Protection

Handling sensitive data: what to collect, where it may go, how long it lives, and how it leaks.
Covers A04 (Cryptographic Failures) and A09 (Logging) from the design side, plus secrets
management.

The cheapest control in this entire document: **do not collect it.** Data you do not have cannot
leak, cannot be subpoenaed, and does not need encrypting, rotating, or deleting.

---

## Classify first

You cannot protect data uniformly — the cost would be absurd. Classify, then apply controls per
class. Put this table in the threat model.

| Class | Examples | Encrypt at rest | In logs | In analytics | Retention |
|---|---|---|---|---|---|
| **Public** | Marketing copy, public profiles | No | Fine | Fine | Indefinite |
| **Internal** | Aggregate metrics, non-personal config | No | Fine | Fine | Business need |
| **Personal** | Name, email, IP, device ID, user ID | Recommended | ID only, never value | Pseudonymized | Defined, enforced |
| **Sensitive personal** | Health, biometric, precise location, ethnicity, orientation | Required | Never | Never without consent | Minimal |
| **Credential** | Passwords, tokens, API keys, session IDs | Hashed, not encrypted | **Never** | Never | Until rotated |
| **Financial** | Card numbers, bank details | Required, or do not store | **Never** | Never | Tokenize instead |

Two rows deserve emphasis. **Credentials are hashed, not encrypted** — encryption is reversible,
which is the opposite of what you want. And **financial data should be tokenized**: let a
processor hold the card and keep a token. Storing card numbers moves you into a compliance regime
that will cost more than the feature.

---

## Data minimization in practice

At design time, for each field the feature collects, ask:

1. **What breaks if we do not collect this?** If the answer is "nothing, it might be useful
   later" — do not collect it. "Might be useful" is how a breach gets worse.
2. **Can we collect less precise data?** A birth year instead of a birth date. A city instead of
   coordinates. An age bracket instead of an age. Most analytics needs the bucket, not the value.
3. **Can we derive it when needed instead of storing it?**
4. **How long does it need to live?** Write the number down now; nobody will define it later.

Then, for each field the feature *returns*: does the client need it? An API that returns whole
entities exports every column added in the next three years (see `api-security.md`, API3).

---

## Encryption

**At rest.** Full-disk or database-level encryption protects against a stolen disk or a
mis-decommissioned volume. It does *not* protect against a compromised application, SQL
injection, or an over-broad query — the application has the key.

For that, you need **field-level encryption**: encrypt specific columns in the application so a
database compromise alone yields ciphertext. Costs you the ability to query or index those
columns, which is why you apply it selectively to the Sensitive and Financial classes.

**In transit.** TLS everywhere, including service-to-service inside your own network. Verify
certificates — disabled verification is common in internal code, usually added to unblock a local
setup, and it silently defeats the point.

**Keys.**
- Never in the repository, in an environment variable if you have a secret manager, or in the
  same store as the data they protect
- Distinct keys per environment. A shared key means a staging compromise is a production
  compromise
- A documented rotation path, **tested before you need it**. Rotation you have never executed is
  a plan, not a capability
- Envelope encryption for anything at scale: a data key per record, encrypted by a master key.
  Rotating the master then does not require re-encrypting every row

**Never implement crypto.** Use a vetted library's high-level interface. Nearly every finding in
this category comes from composing primitives — ECB mode, a static IV, unauthenticated
encryption where tampering matters, a MAC computed over the wrong bytes.

---

## Log hygiene

Logs are the most common accidental data store and the least protected. A log aggregator
typically has broader read access than your database, longer retention than you intended, and
replication to a third party.

**Never log:** passwords (including in a failed-login payload dump), tokens, session IDs, API
keys, full card numbers, government IDs, health data, or full request bodies on authenticated
endpoints.

**Log identifiers, not values.** `user_id=8842` is diagnosable. `email=a@b.com` is a breach
waiting for a log export.

The mechanisms that actually work, because relying on discipline at 400 call sites does not:

```
// 1. Redact at the serializer, not at the call site
const REDACT = new Set(['password','token','authorization','cookie','ssn','card']);
function safe(obj) {
  return Object.fromEntries(Object.entries(obj).map(
    ([k,v]) => [k, REDACT.has(k.toLowerCase()) ? '[REDACTED]' : v]
  ));
}

// 2. Make sensitive types unloggable
class Secret {
  #v;
  constructor(v){ this.#v = v; }
  toString(){ return '[REDACTED]'; }
  toJSON(){ return '[REDACTED]'; }
  reveal(){ return this.#v; }        // explicit, greppable, reviewable
}
```

The second pattern is stronger: the value cannot leak into a log through string interpolation,
an error message, or a stack trace, and `reveal()` gives you one thing to grep for in review.

**Also:** exception handlers that log the full request; ORM debug logging in production, which
prints query parameters; and third-party error trackers, which capture local variables by default
— configure their scrubbing explicitly.

---

## Retention and deletion

Retention without enforcement is a wish. If nothing deletes the data, "90 days" means forever.

- Define retention per data class, and implement the deletion job in the same release as the
  collection. Otherwise it is never written
- **Deletion must cover every copy**: primary store, read replicas, caches, search indexes,
  backups, exports, logs, analytics warehouses, and third-party processors. This list is why
  deletion is a design decision, not a later feature
- Backups are the hard part. Either accept that deletion is eventually-consistent to the backup
  retention window and document that, or encrypt per-subject so destroying the key destroys the
  data
- Soft delete is not deletion. If a user requested erasure, a `deleted_at` timestamp does not
  satisfy it
- Log the deletion — you need to prove it happened, without logging what was deleted

**Right-to-access requests** need an export path. Building it after the first request arrives
means a manual database query under a deadline, performed by someone with production access,
which is its own risk. And the export itself is a maximally sensitive artifact: authenticated,
short-lived URL, encrypted, expiring, and logged.

---

## Secrets management

| Approach | Verdict |
|---|---|
| Committed to the repository | Never. Rotate immediately if found |
| `.env` file, gitignored | Acceptable for local development only |
| Environment variables in the platform | Acceptable baseline. Visible to anyone who can read the config or exec into the container |
| Secret manager with short-lived leases | Target state. Auditable access, rotation without redeploy |
| Workload identity (no secret at all) | Best where available — nothing to leak |

**Rules regardless of approach:**
- Distinct values per environment, always
- Least privilege per credential. A CI token with production write access is the highest-value
  target in most organizations
- Rotation on a schedule, and rotation *tested*
- Support two valid values during rotation, or every rotation is an outage
- Fail loudly at startup on a missing required secret. A service that boots and fails on first
  request is much harder to diagnose
- Secret scanning in pre-commit **and** CI. Pre-commit alone is bypassable with `--no-verify`

**When a secret leaks:** rotate, then check access logs for the exposure window, then fix the
system that allowed it. History rewriting is last and often not worth it — see
`remediation.md`.

---

## Third parties

Every integration is an extension of your data perimeter, and your users cannot tell the
difference between your breach and your vendor's.

Before sending data to any external service:
- What is the minimum it needs? Send that, not the whole object
- Where does it store it, for how long, and can you delete it?
- What does its subprocessor list look like? Your data may travel further than one hop
- Is it in the request path? Then its outage is your outage, and it needs a timeout and a
  fail-closed decision
- Client-side scripts (analytics, session replay, chat widgets) can read the whole DOM,
  including form fields. Session replay tools capture what users type unless explicitly
  configured not to — that includes passwords and card numbers

That last point is a routine finding: a session replay tool installed for UX research, recording
credentials into a third-party system indefinitely.

---

## Design checklist

For any feature touching personal data:

- [ ] Every collected field justified by a broken-without-it answer
- [ ] Data classified, with controls per class
- [ ] Response fields allowlisted; no whole-entity serialization
- [ ] Retention period defined **and** the deletion job written in the same release
- [ ] Deletion covers replicas, caches, indexes, backups, logs, and processors
- [ ] Sensitive fields redacted at the serializer, not per call site
- [ ] Encryption at rest for Sensitive and Financial; keys separate from data
- [ ] TLS with certificate verification on every hop
- [ ] Nothing sensitive in URLs, query strings, or referrers
- [ ] `Cache-Control: no-store` on authenticated responses
- [ ] Export path exists, is authenticated, and expires
- [ ] Third parties reviewed for what they receive and retain
- [ ] Client-side scripts audited for form-field capture

---

## Anti-patterns

- **Collecting it because it might be useful.** Increases breach severity for a hypothetical.
- **Encrypting credentials instead of hashing them.** Reversible is the wrong property.
- **Storing card numbers.** Tokenize; the compliance cost exceeds the feature.
- **Full-disk encryption presented as protection against application compromise.** The app has
  the key.
- **Sharing a key across environments.** Staging compromise becomes production compromise.
- **A rotation path never executed.** A plan, not a capability.
- **Logging the email instead of the user ID.**
- **Redacting at the call site.** Four hundred places to forget.
- **A retention policy with no deletion job.** Means forever.
- **Soft delete satisfying an erasure request.** It does not.
- **Session replay recording form fields.** Credentials, into a vendor, indefinitely.
