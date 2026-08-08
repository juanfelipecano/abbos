# Data Modeling

Schema design that stays correct as the system grows and as writers other than your application
appear. Migration *execution* belongs to `aidd-devops`; this is the target design.

The organizing principle: **the schema is the last line of defense.** Application code is one writer
among several that will eventually exist — a backfill script, an admin tool, a future service, a
manual fix during an incident. Rules enforced only in application code do not hold for any of them.

---

## Constraints belong in the database

The highest-value section here. Every constraint you can express in the schema is a rule that cannot
be violated by any writer, ever.

| Constraint | Prevents |
|---|---|
| `NOT NULL` | The "we always set it" field that is null on 4,000 rows |
| `UNIQUE` | Duplicates from a check-then-insert race |
| Foreign key | Orphaned rows pointing at deleted parents |
| `CHECK` | Negative quantities, invalid states, end-before-start |
| Enum or lookup table | Typo'd status values that silently never match |
| Partial unique index | "One active subscription per user" |

**"We check before inserting" is a race condition with extra steps.** Two concurrent requests both
check, both find nothing, both insert. The unique index is the only thing that actually prevents it,
and it converts a silent data corruption into a clean error you can handle.

```sql
-- Application validation is a better error message. The constraint is the guarantee.
ALTER TABLE orders ADD CONSTRAINT chk_quantity_positive CHECK (quantity > 0);
ALTER TABLE orders ADD CONSTRAINT chk_dates CHECK (ends_at IS NULL OR ends_at > starts_at);

-- "One active subscription per user" — expressible, so express it
CREATE UNIQUE INDEX idx_one_active_sub ON subscriptions (user_id) WHERE status = 'active';
```

That partial index is worth internalizing. A large class of business rules that people implement in
application code with a lock is a partial unique index instead — declarative, race-free, and free.

**The counter-argument** is that constraints make migrations harder and errors less friendly. Both
true, both worth it. Handle the constraint violation and produce a good message; do not remove the
constraint to avoid handling it.

---

## Null, empty, and absent

Model these deliberately. Conflating them produces bugs that survive for years because each layer
guesses differently.

| Value | Means |
|---|---|
| `NULL` | Unknown, or not applicable |
| `''` | Known to be empty |
| `0` | Known to be zero |
| Row absent | The thing does not exist |

A `middle_name` of `NULL` means "we do not know"; `''` means "they have none". Those are different
facts, and code that treats them identically will eventually display "John  Smith" or fail a
validation nobody expected.

**Prefer `NOT NULL` with a default** where a sensible default exists. Every nullable column is a
branch in every piece of code that reads it, forever.

**Do not use a sentinel** — `-1`, `9999-12-31`, `''` meaning "unset". Sentinels leak into
comparisons, aggregates, and sorts. `NULL` exists for this.

---

## Time

Where a surprising share of production bugs come from.

- **Store instants in UTC** with an explicit timestamp-with-timezone type. Not a local time, not a
  string, not an integer you will misinterpret
- **Keep the original timezone separately when wall-clock matters.** A recurring 9am meeting is not an
  instant — it is a local time plus a zone, and storing the UTC instant breaks it across a DST
  transition. This is the classic calendar bug
- **Distinguish "when it happened" from "when we recorded it."** `occurred_at` and `recorded_at`.
  Reporting needs both and cannot reconstruct either. Backfills, imports, and corrections all make
  them diverge
- **Half-open ranges** for periods: `[start, end)`. Inclusive-inclusive produces off-by-one bugs at
  boundaries and cannot represent adjacent periods without overlap
- **Never trust a client-supplied timestamp** for anything ordering-sensitive. Clocks are wrong

---

## Money

Short and non-negotiable.

- **Never floating point.** `0.1 + 0.2 != 0.3`, and after a few thousand aggregations your ledger is
  off by an amount someone has to explain
- Integer minor units (cents), or an exact decimal type with defined precision
- **Store the currency with every amount.** A column of amounts with the currency inferred from
  elsewhere is a bug waiting for your first international customer
- Store the rate used, and when, for any converted amount. "Recompute it later" gives a different
  answer
- Rounding is a business rule, not an implementation detail. Write down the mode and where it applies

---

## Identifiers

| Type | Pros | Cons |
|---|---|---|
| Auto-increment integer | Small, fast, ordered | Enumerable; leaks volume; painful to merge datasets |
| UUIDv4 | No coordination, not enumerable | Random insert order fragments indexes |
| UUIDv7 / ULID | Time-ordered, not enumerable | Reveals creation time |
| Prefixed string (`ord_01H...`) | Self-describing in logs and support tickets | Slightly larger |

**UUIDv7 or a prefixed variant is the good default** for anything externally visible: no enumeration,
no coordination, and time-ordered so index locality is preserved. The random-insert problem with
UUIDv4 is real at scale — it scatters writes across the index and inflates the working set.

**A prefixed identifier pays for itself in operations.** `ord_01H8...` in a log line or a support
ticket is unambiguous; `8f14e45f` requires asking which table.

**Never expose sequential integers externally** where enumeration matters. They are not an
authorization control, but they make discovery free (see `aidd-security`'s `api-security.md`).

---

## Normalization, and when to stop

Normalize by default. Denormalize deliberately, with a reason and a plan for keeping copies
consistent.

**Normalize** because duplicated data diverges. Not "might" — will. Two places holding a customer's
address means one gets updated.

**Denormalize** when a specific measured read pattern requires it. Then answer: what keeps the copy
correct, and what happens when it drifts? A denormalized field with no reconciliation path is a bug
with a schedule.

Legitimate denormalizations:
- A counter maintained atomically (`comment_count`) — must be updated in the same transaction, or via
  a trigger, never by a separate write
- A **snapshot of a value at a point in time** — the price on an order line is not a denormalization
  of the current product price. It is a different fact, and joining to the live product price to show
  a historical invoice is a real bug
- A materialized view with an explicit refresh strategy

That middle case is worth stating clearly because it is often mistaken for denormalization: historical
records must capture the values that applied *then*.

---

## Soft delete

**A decision, not a default.** It changes every query in the system, forever, and one missed filter
leaks deleted data.

Choose it when you have an audit or recovery requirement. Do not choose it reflexively.

If you do:
- **Enforce the filter where it cannot be forgotten** — a database view, row-level security, or a
  repository that requires it. Not "remember to add `WHERE deleted_at IS NULL`" at 200 call sites
- Unique constraints must account for it. `UNIQUE(email)` blocks re-registration after deletion;
  a partial unique index on `WHERE deleted_at IS NULL` is usually what you meant
- **Soft delete does not satisfy an erasure request.** If a user demands deletion, a timestamp is not
  deletion

Often better: move the row to an archive table. The live table stays clean, no query needs a filter,
and history is preserved.

---

## Indexes

Full treatment in `query-performance.md`. The modeling-time points:

- **Indexes follow queries.** Write the query patterns down first, then index for them. An index
  nobody queries is pure write cost
- **Column order matters**: equality columns before range columns, and the leftmost prefix is what can
  be used
- Every index costs write throughput, storage, and vacuum/maintenance work
- **Verify with the query plan**, never by reasoning about it

---

## Multi-tenancy

The schema decision with the largest downstream consequence.

| Approach | Isolation | Operational cost | Cross-tenant queries |
|---|---|---|---|
| Shared tables, `tenant_id` column | Application-enforced | Lowest | Easy |
| Shared database, schema per tenant | Stronger | Medium; migrations × N | Hard |
| Database per tenant | Strongest | Highest | Very hard |

Shared tables with a `tenant_id` is right for most products. It requires that the filter be
**structurally unforgettable** — row-level security, or a query layer that will not build a query
without it. Relying on discipline across every query is how cross-tenant leaks happen, and they happen
in the places written outside the normal request path: admin tools, exports, background jobs, and
analytics queries.

`tenant_id` should be the **leading column of most indexes**, since nearly every query filters on it.

---

## Schema evolution

Design for change; the migration mechanics are `aidd-devops`'s.

- **Additive changes are cheap; destructive ones are not.** Adding a nullable column is nearly free.
  Renaming or dropping requires expand/contract across releases
- **The previous application version must still work against the new schema.** This is what makes a
  code rollback possible at all, and it constrains what you can do in one step
- Do not reuse a column for a new meaning. Add a new one; the old data is still the old meaning
- A migration history that shows an abandoned half-migration is a finding — either finish it or revert

---

## Design checklist

- [ ] Every invariant expressible as a constraint is a constraint
- [ ] Unique indexes where uniqueness matters — not check-then-insert
- [ ] Partial unique indexes used for "one active X per Y" rules
- [ ] `NOT NULL` with defaults wherever a default exists
- [ ] Null vs empty vs absent deliberate and documented
- [ ] No sentinel values
- [ ] Timestamps UTC with timezone type; wall-clock cases store the zone
- [ ] `occurred_at` and `recorded_at` separated where they can diverge
- [ ] Ranges half-open
- [ ] Money as integer minor units or decimal; currency stored per amount
- [ ] Identifiers non-enumerable and time-ordered; prefixed if externally visible
- [ ] Historical records snapshot values, not join to live ones
- [ ] Denormalizations have a named consistency mechanism
- [ ] Soft delete justified, filter structurally enforced, unique constraints adjusted
- [ ] `tenant_id` leading in indexes; filter structurally unforgettable
- [ ] Indexes traced to written query patterns
- [ ] Previous app version works against the new schema

---

## Anti-patterns

- **Constraints only in application code.** The backfill script is a writer too.
- **Check-then-insert for uniqueness.** A race with extra steps.
- **Sentinel values.** `-1` and `9999-12-31` leak into aggregates and sorts.
- **Everything nullable.** A branch in every reader, forever.
- **Local time stored as an instant.** Breaks across DST.
- **One timestamp where two facts exist.** Reporting cannot reconstruct either.
- **Inclusive-inclusive ranges.** Off-by-one at every boundary.
- **Floats for money.**
- **Currency inferred from context.** Breaks on the first international customer.
- **Sequential public identifiers.** Free enumeration and volume disclosure.
- **UUIDv4 as a primary key at scale.** Fragments index locality.
- **Joining a historical invoice to the live product price.** Shows today's price for last year's sale.
- **Denormalizing with no reconciliation path.** A bug with a schedule.
- **Soft delete by default.** Changes every query forever; one miss leaks.
- **Soft delete as erasure compliance.** It is not.
- **`WHERE deleted_at IS NULL` by convention.** Two hundred chances to forget.
- **Reusing a column for a new meaning.** The old rows still mean the old thing.
