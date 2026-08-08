# Defect Taxonomy

What actually breaks, roughly ordered by how often each turns out to be a real bug rather than a
style preference.

Use this as a search pattern, not a checklist to tick. The value is in knowing where to look first
when review time is finite.

---

## 1. Error handling

The least-executed code in any diff, and therefore the least tested. Consistently the highest-yield
place to look.

**Swallowed exceptions.** A `catch` that logs and continues turns a failure into corrupt state.
The caller believes it succeeded.

```js
try { await saveOrder(order); }
catch (e) { logger.warn(e); }          // caller now proceeds as if saved
return { status: 'confirmed' };
```

**Partial failure with no compensation.** Two writes, the second fails, the first stands. Is there a
transaction? An outbox? A compensating action? "It won't fail" is not one.

**Errors from a dependency indistinguishable from our own.** A 500 from a vendor and a bug in our
mapping produce the same log line, and diagnosis costs a day.

**Retrying something non-idempotent.** A retry wrapper around a charge, an email, or an append.

**Missing timeouts.** Every network call needs one. Without it, one slow dependency exhausts the
connection pool and takes down everything.

**Cleanup only on the happy path.** Files, connections, locks, and streams released in the success
branch but not in `catch` or `finally`.

---

## 2. Concurrency

Corrupts rather than crashes, so it is found by an auditor rather than a test.

**Read-modify-write without protection.** The canonical defect. Any sequence that reads a value,
decides on it, and writes back:

```js
const acct = await get(id);
if (acct.balance >= amount) {          // two requests both pass here
  await update(id, { balance: acct.balance - amount });
}
```

Suspect it on anything involving balance, quota, inventory, seat count, single-use tokens, or a
state machine. Correct forms: atomic conditional update, optimistic version check, or a row lock —
see `aidd-backend`'s `concurrency.md`.

**Check-then-act.** "Does this exist? No? Create it." Two requests, two creations. Needs a unique
constraint, not a check.

**Non-idempotent handlers on at-least-once queues.** It will be delivered twice.

**Shared mutable state across requests.** Module-level variables, caches keyed without tenant,
singletons holding request state.

**Lock ordering.** Two paths acquiring the same two locks in different orders is a deadlock waiting
for load.

---

## 3. Boundary and input handling

**Off-by-one.** Inclusive versus exclusive ranges, `<` versus `<=`, pagination arithmetic.

**Null, empty, and absent conflated.** `null`, `''`, `0`, `[]`, and "key not present" mean different
things. Conflating them produces bugs that survive years because each layer guesses differently.

**Unvalidated input reaching an interpreter.** SQL, HTML, shell, path, template. Deeper checks are
`aidd-security`'s, but you should catch the obvious ones.

**Unbounded input.** No cap on `limit`, on upload size, on array length, on nesting depth.

**Type coercion at boundaries.** A number arriving as a string, a boolean as `"false"` (truthy), a
date as an ISO string parsed in the wrong timezone.

---

## 4. Data correctness

**Money in floating point.** Any `float`/`double` touching currency is a finding.

**Timezone handling.** Storing local time, comparing naive datetimes, assuming the server's zone,
DST arithmetic. "Recurring 9am" is not an instant.

**Rounding.** Where it happens, and whether it happens twice.

**Missing database constraints.** Validation only in application code does not survive a backfill
script, an admin tool, or a manual fix.

**Sort instability** where the order is user-visible — pagination that reorders between pages.

---

## 5. Resource handling

**N+1 queries.** Fetch a list, then one query per item. Passes on 10 rows, collapses on 10,000. The
most common performance defect and usually visible in the diff.

**Unbounded growth.** A cache with no eviction, a list accumulating per request, a log line per
element.

**Loading everything into memory.** `SELECT *` with no limit, reading a whole file, materializing a
full result set.

**Connections not returned.** Especially on the error path.

---

## 6. Security surface

Deeper analysis is `aidd-security`'s. What a reviewer should always catch:

- A new endpoint with no per-object authorization check, server-side
- Authorization checked in the client only
- Mass assignment — a request body that can set `role`, `isAdmin`, `accountId`
- Secrets or PII in logs, errors, or responses
- A response serializer returning the whole entity rather than named fields
- 403 where 404 was needed on an ID-addressable resource

---

## 7. Maintainability

Only a finding when you can name the **concrete future failure**. Otherwise it is Observations.

**Duplicated logic** that the diff does not touch. Two copies of a rule will diverge; name where.

**A function whose name lies.** `validateUser()` that also saves. The next caller will be surprised.

**A comment contradicting the code.** One of them is wrong; both mislead.

**Business logic in the wrong layer** — a template, a migration, a controller. It will not be found
when it needs to change.

**A new pattern where one already existed.** Two conventions, no resolution.

---

## What is not a finding

Be strict, because every non-finding dilutes the ones that matter.

- Naming you would have chosen differently
- Formatting the linter accepts
- A structure you find less elegant
- Preference between two equivalent idioms
- "I would have used X instead"

These go in Observations, or nowhere. A review with twelve nitpicks and one real bug will have the
real bug lost — and the author will read the next review less carefully.

**The test for every finding: can you write a concrete failure scenario?** Specific inputs or state
→ wrong output, crash, or corruption. If you cannot write that sentence, it is a preference.

---

## Frequency, honestly

If review time is short, spend it in this order:

```
1. Error paths in new code
2. Any read-modify-write on shared state
3. Per-object authorization on new endpoints
4. N+1 and unbounded queries
5. Null/empty/absent handling at boundaries
6. Money and time arithmetic
7. Whether the new tests fail when the code breaks
```

The first three account for most of the serious defects that reach production in code that passed a
review.

---

## Anti-patterns

- **A finding with no failure scenario.** A preference wearing a severity label.
- **Reviewing style before correctness.** The budget is spent before reaching the bug.
- **Assuming the happy path is the code.** The error path is where the defects are.
- **Skipping concurrency because it is hard to reason about.** It is where corruption comes from.
- **Trusting application-level validation as a constraint.** Backfills and admin tools bypass it.
- **Treating N+1 as a performance nicety.** It is a production outage on a timer.
- **Flagging duplication without naming the divergence.** Not yet a finding.
- **Twelve nitpicks and one real bug.** The bug is lost and the next review is skimmed.
