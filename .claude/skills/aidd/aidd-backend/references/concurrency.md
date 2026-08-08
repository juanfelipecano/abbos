# Transactions and Concurrency

The highest-value reference in this role, because these defects **corrupt data rather than crashing**.
They pass every test on a single request, produce no error, and are discovered weeks later by an
auditor or a customer whose balance is wrong.

They are also invisible to code review by inspection and obvious under a concurrent test. That
asymmetry is why these belong in the spec as criteria, not in a review checklist.

---

## The read-modify-write hazard

The one pattern to internalize. Any sequence that **reads a value, decides based on it, and writes
back** is broken under concurrency unless explicitly protected.

```
Request A: read balance → 100
Request B: read balance → 100
Request A: 100 >= 50 ✓ → write 50
Request B: 100 >= 50 ✓ → write 50
Result: two redemptions, one deduction
```

Both requests are correct in isolation. Both pass their tests. The bug exists only in the interleaving,
and the interleaving happens in production under load.

**Where it lives:** balance, credit, quota, inventory, seat count, single-use tokens, coupon
redemption, rate-limit counters, state machine transitions, "first one wins" claims, uniqueness checks.

If a feature touches any of those, the protection mechanism belongs in the spec.

---

## Four correct answers

Pick deliberately and name the choice in the backend spec.

### 1. Atomic conditional write — usually the right answer

Let the database do the check and the write in one statement.

```sql
UPDATE accounts
   SET balance = balance - 50
 WHERE id = $1 AND balance >= 50;
-- Zero rows affected means insufficient funds. Not an error — the expected negative case.
```

- ✅ No locks held across round trips, no retry loop, no extra column, cheapest option
- ❌ Only works when the decision is expressible in SQL
- 📌 Counters, balances, inventory, quota — the majority of cases

**Check the affected row count.** Ignoring it turns a correctly-rejected write into a silent success,
which is worse than the original bug.

For claims and single-use tokens, the same idea:

```sql
UPDATE jobs SET status = 'running', worker = $1
 WHERE id = $2 AND status = 'pending';
-- Zero rows: someone else claimed it. Exit cleanly.
```

### 2. Optimistic locking

A `version` column; the write asserts the version it read.

```sql
UPDATE orders SET status = 'shipped', version = version + 1
 WHERE id = $1 AND version = $2;
-- Zero rows: someone else modified it. Reload, re-decide, retry — or surface a conflict.
```

- ✅ No locks; scales well; surfaces genuine conflicts to the user
- ❌ Requires a retry path or a 409; wasted work under high contention
- 📌 User-facing edits with low contention. Exposes as `If-Match`/ETag at the API boundary

**Do not retry blindly.** For a user editing a form, the correct response is usually a 409 telling
them the record changed — re-applying their stale edit silently discards someone else's work.

### 3. Pessimistic locking

Lock the rows before deciding.

```sql
BEGIN;
SELECT * FROM accounts WHERE id = $1 FOR UPDATE;   -- blocks other writers
-- decide
UPDATE accounts SET balance = ... WHERE id = $1;
COMMIT;
```

- ✅ Straightforward to reason about; handles decisions too complex for SQL
- ❌ Locks held for the transaction's duration; **deadlock risk**; serializes throughput
- 📌 Multi-row invariants, or logic that cannot be expressed as a conditional update

**If you use row locks, specify a lock ordering.** Two transactions locking A then B, and B then A,
deadlock. Always acquire in a deterministic order — ascending primary key is the usual convention.
Without a stated ordering you have specified a deadlock.

Use `FOR UPDATE NOWAIT` or `SKIP LOCKED` where waiting is worse than failing. `SKIP LOCKED` is
particularly useful for queue-like tables — each worker takes rows nobody else holds.

### 4. Serializable isolation

Let the database detect the conflict and abort one transaction.

- ✅ Correct without reasoning about every interleaving
- ❌ Aborts under contention, so you **must** implement a retry loop; throughput cost
- 📌 Complex invariants across several tables where the alternatives are error-prone

Serializable without a retry loop is not a solution — it converts a data corruption into an
intermittent 500.

---

## Transaction boundaries

**Name the atomic scope for every write path.** What must succeed or fail together, and what state
exists if the process dies midway?

Rules that matter:

**Keep transactions short.** A transaction holds locks and a connection for its whole duration. Long
transactions cause lock contention, connection exhaustion, and — in MVCC databases — bloat that
degrades everything.

**Never hold a transaction across a network call to another service.** This is the highest-impact
rule here. A transaction waiting on someone else's five-second timeout holds its locks for five
seconds, and under load that is an outage. Do the external call outside the transaction, or use the
outbox pattern.

```
// Before — locks held for the duration of a third-party call
BEGIN;
  UPDATE orders SET status = 'paid' WHERE id = $1;
  await paymentProvider.charge(...);        // 200ms–30s, holding locks
COMMIT;

// After — the transaction is local and fast; the external effect is decoupled
BEGIN;
  UPDATE orders SET status = 'pending_charge' WHERE id = $1;
  INSERT INTO outbox (type, payload) VALUES ('charge_requested', $2);
COMMIT;
// A separate worker reads the outbox and calls the provider, idempotently.
```

**Do not span a transaction across a request boundary.** "Open a transaction, return to the user, wait
for confirmation" is not a transaction; it is a held lock with a human in the loop.

---

## The dual-write problem

You must update your database **and** cause an external effect — publish an event, call a service, send
an email. There is no transaction spanning both.

Whichever order you choose, the failure between them is silent:

```
// Write then publish: process dies after commit → the event is lost forever
// Publish then write: process dies after publish → the event describes something that did not happen
```

**Solution: the outbox.** Write the domain change and an outbox row in the same local transaction. A
separate process reads the outbox and publishes, marking rows sent.

- The database transaction is the only atomicity you need
- Delivery becomes at-least-once, so **consumers must be idempotent** — see `async-jobs.md`
- Ordering is preserved if you publish in insertion order

This is the most under-used pattern in backend design. The naive write-then-publish loses events
whenever a process dies at the wrong moment, and that loss is invisible until someone reconciles two
systems and finds them different.

---

## Isolation levels

Most defaults permit phenomena people do not expect. Know your default and design for it, or state the
level you need.

| Level | Prevents | Still permits |
|---|---|---|
| Read Committed (common default) | Dirty reads | Non-repeatable reads, phantoms, lost updates |
| Repeatable Read | + non-repeatable reads | Phantoms (in some engines), write skew |
| Serializable | Everything | Nothing — but aborts under contention |

**Under Read Committed, two reads in one transaction can return different values.** This surprises
people who assume a transaction gives them a stable snapshot. Code that reads a balance, does
unrelated work, then reads it again and compares is not doing what its author thinks.

**Write skew** is the failure Repeatable Read does not prevent and is worth knowing by name: two
transactions each read a set, each verify a constraint holds, each write a different row — and the
constraint is now violated even though neither transaction violated it alone. "At least one doctor on
call" is the canonical example. Two doctors each check that another is on call, and both sign off.

Write skew requires Serializable, or an explicit lock on the thing being asserted about.

---

## Distributed concurrency

When state spans services, local transactions do not help.

**Saga** — a sequence of local transactions, each with a compensating action. Intermediate states are
visible; every step needs an undo. Orchestrated (a coordinator drives) is far easier to debug than
choreographed (services react to events).

**Idempotency keys** — the client supplies a key; you store the result and replay it. The standard
answer for "the network retried our payment". See `api-design.md`.

**Distributed locks** — treat with suspicion. A lock in Redis or similar is not safe by default: the
holder can pause (GC, scheduling) past the lease expiry, and two holders then believe they own it.
Correct use requires fencing tokens that the protected resource validates. **If you can restructure to
an atomic conditional write on the resource itself, do that instead** — it is correct without a
distributed protocol.

---

## Testing concurrency

Sequential tests cannot find these bugs. The test must be concurrent.

```js
it('permits exactly one redemption of a single-use coupon', async () => {
  const results = await Promise.all(
    Array.from({ length: 20 }, () => redeem(couponId, userId).catch(e => e))
  );
  const ok = results.filter(r => r.status === 'redeemed');
  expect(ok).toHaveLength(1);                       // exactly one
  expect(await balanceOf(userId)).toBe(50);         // and one deduction
});
```

Points that make this test actually work:

- **20 parallel attempts, not 2.** Two rarely interleave; twenty reliably do
- **Assert the count, not just the absence of an error.** A silent double-write throws nothing
- **Assert the end state too.** One successful response with two deductions is still the bug
- **Run it repeatedly in CI.** A concurrency test that passes once proves less than one that passes
  fifty times, so loop it or run it on every build

For deadlocks, run two operations in opposite lock orders concurrently and assert neither hangs.

---

## Criteria for the spec

```markdown
### Backend / data — appended by aidd-backend
- [ ] AC-B1: 20 concurrent redemptions of one coupon produce exactly one redemption and one
      deduction → `npm test -- coupon.concurrency`
- [ ] AC-B2: Balance decrement uses an atomic conditional update; affected-row count checked
      → review + `npm test -- balance.concurrency`
- [ ] AC-B3: Concurrent edits to one order return 409 for the loser, not a silent overwrite
      → `npm test -- order.optimistic-lock`
- [ ] AC-B4: No transaction encloses an external network call → review
- [ ] AC-B5: Order status change and its event are written in one transaction via the outbox;
      killing the publisher loses no events → `npm test -- outbox.durability`
```

AC-B4 is a review criterion rather than a test, and it is worth writing anyway — it is the rule most
often violated and the one with the largest blast radius.

---

## Anti-patterns

- **Read-modify-write with no protection.** The default bug in money, quota, and inventory code.
- **Check-then-insert for uniqueness.** A race; use a unique index.
- **Ignoring the affected row count.** Turns a correct rejection into a silent success.
- **Retrying an optimistic-lock failure blindly.** Silently discards the other person's edit.
- **Row locks with no stated ordering.** You have specified a deadlock.
- **Serializable with no retry loop.** Corruption becomes an intermittent 500.
- **A transaction around an external call.** Locks held for someone else's timeout.
- **Write-then-publish.** Loses events invisibly whenever the process dies between them.
- **Publish-then-write.** Events describing things that did not happen.
- **Assuming a stable snapshot under Read Committed.** Two reads can differ.
- **A distributed lock without fencing tokens.** Two holders, both confident.
- **Testing concurrency sequentially.** Cannot find the bug by construction.
- **Two parallel requests in the test.** Rarely interleave. Use twenty.
- **Asserting only that no error was thrown.** The bug is silent.
