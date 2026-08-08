# Migrations

Schema changes without downtime and without losing the ability to roll back. The most common source of
an unrecoverable deploy.

Schema *design* belongs to `aidd-backend`; this is execution — sequencing, reversibility, timing, and
what makes a rollback possible.

---

## The rule that makes rollback possible

**The previous application version must still work against the new schema.**

This is the constraint everything else follows from. If version N-1 cannot run against the schema you
just applied, you cannot roll back the code without also rolling back the schema — and rolling back a
schema after writes have occurred means data loss.

Consequences:

- Never drop or rename a column in the same release as the code that stops using it
- Never add a `NOT NULL` column without a default in one step
- Never tighten a constraint in the same release that starts satisfying it

Every violation of this rule converts "roll back the deploy" into an incident with a data-recovery
component.

---

## Additive first

Adding is cheap and reversible. Removing and renaming are not.

**Safe in one step:** add a nullable column · add a column with a default (see the caveat below) · add a
table · add an index concurrently · add a permissive check constraint · widen a type
(`varchar(50)` → `varchar(200)`).

**Never in one step:** drop a column · rename anything · narrow a type · add `NOT NULL` · add a unique
constraint to existing data · add a foreign key to existing data.

**The default-value caveat:** in older database versions, adding a column with a default rewrote the
entire table while holding a lock. Modern versions of most engines do this as a metadata-only change.
Know which behavior your version has before assuming a column addition is free on a 40-million-row
table.

---

## Expand and contract

The pattern for anything renamed or removed. Each step is independently deployable and reversible.

Renaming `users.name` → `users.full_name`:

| Step | Release | Action | Rollback |
|---|---|---|---|
| 1 | R1 | Add `full_name` (nullable) | Drop the column |
| 2 | R1 | Code writes **both**, reads `name` | Revert code |
| 3 | R1 | Backfill `full_name` in batches | Nothing to undo |
| 4 | R2 | Code reads `full_name`, still writes both | Revert code |
| 5 | R3 | Code writes only `full_name` | Revert code |
| 6 | R4 | Drop `name` | **Not reversible** |

Steps 4, 5, and 6 must be in **separate releases**. Combining them is exactly what makes rollback
impossible, and it is where impatience does the damage.

**Before step 6, verify nothing reads the old column.** Not by grepping — by instrumenting. Log a
warning on any access to the deprecated column and watch production for a full business cycle. Forgotten
consumers include reports, admin tooling, exports, background jobs, and other services.

The dual-write window (steps 2–5) is uncomfortable and people want to shorten it. That discomfort is the
price of reversibility.

---

## Locking

The mechanism behind most migration incidents: a migration that takes 4ms on 100 rows locks a table for
20 minutes on 40 million, and every request queues behind it.

**Before applying any migration to a large table:**

- [ ] What lock does this take, and for how long?
- [ ] Tested against production-sized data, with the timing recorded
- [ ] Can it run concurrently? (`CREATE INDEX CONCURRENTLY` and equivalents)
- [ ] Is there a lock timeout, so a blocked migration fails fast instead of queueing traffic?
- [ ] What is the rollback if it is still running after N minutes?

**Set a lock timeout.** A migration waiting for a lock queues every subsequent query behind it — the
migration itself is idle while the application falls over. Failing fast and retrying later is far better
than a queue that grows until connections are exhausted.

```sql
SET lock_timeout = '3s';        -- fail rather than block traffic
SET statement_timeout = '5min';  -- bound the migration itself
```

**Index creation should be concurrent** on any table with live traffic. It is slower and does not hold a
write lock. It can also fail and leave an invalid index behind, so check for that afterward.

---

## Backfills

Never in the migration itself. A migration that updates 40 million rows in one transaction holds locks
for the duration, generates enormous write-ahead volume, and cannot be interrupted safely.

**Batch it, in a separate job:**

```
loop:
  UPDATE users SET full_name = name
   WHERE full_name IS NULL
   LIMIT 1000;               -- or a keyset range
  if 0 rows affected: done
  sleep 100ms                -- let replication and other traffic breathe
```

Requirements:

- **Idempotent** — safe to re-run, because it will be interrupted
- **Resumable** — track progress so a restart does not begin again
- **Throttled** — monitor replication lag and slow down if it grows. An unthrottled backfill is a
  replica-lag incident, which looks like a read outage
- **Observable** — rows processed, rows remaining, estimated completion
- **Interruptible** — a kill switch, because you will need it

**Replication lag is the failure people do not anticipate.** A fast backfill saturates replication;
read replicas fall behind; the application serves stale data or read queries fail. Watch the lag as the
primary throttle signal.

---

## Data-destructive changes

Dropping a column or table is not reversible. Treat it as a separate, deliberate operation.

- **A separate release** that does nothing else, so rollback of anything else is unaffected
- **A verified backup immediately before**, with a tested restore path
- **Instrumented for a full business cycle first** — monthly reports mean a month of watching
- **Consider renaming instead of dropping.** `users_name_deprecated_20260730` is invisible to the
  application, trivially reversible, and can be dropped a quarter later with confidence

The rename-then-drop-later approach costs almost nothing and removes the entire class of "we dropped it
and something needed it".

---

## Migration hygiene

- **One logical change per migration.** Easier to review, reason about, and revert
- **Never edit an applied migration.** It has run in environments you cannot reach. Write a new one
- **Migrations in version control, applied in order**, tracked in the database
- **Test on a production-sized copy**, not on an empty schema. This is the step that catches the 20-minute
  lock
- **Every migration has a down path**, or a written reason it does not plus a recovery plan
- **Separate migration deploys from application deploys** so each can be reasoned about and reverted
  independently

**An abandoned half-migration is a finding.** A migration history showing an expand that never contracted
means the system has two representations of the same data and code somewhere reads the wrong one. Either
finish it or revert it.

---

## Migration versus application deploy order

| Change | Order |
|---|---|
| Additive (new nullable column, new table) | Migration first, then code |
| Removal (drop column) | Code first (stops using it), then migration in a **later** release |
| Index addition | Migration first, concurrently |
| Constraint tightening | Code enforces it first, backfill violations, then constraint |

**The general rule: the migration that expands goes before the code; the migration that contracts goes
well after.**

Constraint tightening deserves care: adding `NOT NULL` or a `CHECK` to a table with violating rows fails
outright. Backfill first, verify zero violations, then add the constraint — and validate it in a separate
step if your engine supports `NOT VALID` followed by `VALIDATE CONSTRAINT`, which avoids a long lock.

---

## Pre-flight checklist

- [ ] Reversible, or forward-only with a written reason **and** a recovery plan
- [ ] Tested on production-sized data; timing recorded
- [ ] Lock type and duration known; lock timeout set
- [ ] Previous application version verified working against the new schema
- [ ] Backfill batched, throttled, resumable, and observable — not in the migration
- [ ] Replication lag monitored during backfill
- [ ] Nothing destructive in the same release as anything else
- [ ] Backup verified immediately before any destructive step
- [ ] Rollback commands written and **executed in staging**
- [ ] What a rollback cannot undo is documented

That last item is the one omitted most often and discovered during the incident: rows already written in
the new shape, values already normalized, data already deleted.

---

## Criteria for the spec

```markdown
### Delivery — appended by aidd-devops
- [ ] AC-D1: Migration applied and reverted on a production-sized copy; timings recorded → output
- [ ] AC-D2: Application version N-1 passes its suite against the new schema → CI run
- [ ] AC-D3: Lock duration under 1s, or the migration runs concurrently → timing output
- [ ] AC-D4: Backfill is idempotent, resumable, and throttled on replication lag → review + test
- [ ] AC-D5: No destructive change in this release → migration review
- [ ] AC-D6: Rollback executed successfully in staging → recorded output
```

---

## Anti-patterns

- **Dropping a column in the same release the code stops using it.** Rollback becomes impossible.
- **Combining the read-switch and the drop.** Same problem, one release earlier.
- **`NOT NULL` in one step.** Fails, or locks, or both.
- **A unique constraint added to existing data** without checking for duplicates first.
- **Backfilling inside the migration.** Locks held for the whole update; not interruptible.
- **An unthrottled backfill.** Replication lag becomes a read outage.
- **No lock timeout.** The migration idles while queued traffic exhausts connections.
- **Non-concurrent index creation on a live table.** Write lock for the duration.
- **Testing on an empty schema.** Misses the 20-minute lock entirely.
- **Editing an applied migration.** It already ran elsewhere.
- **Assuming a column with a default is free.** Depends on your engine version.
- **A rollback plan that was never executed.** Discovered during the incident.
- **Not documenting what a rollback cannot undo.** The part people find out the hard way.
- **An abandoned expand with no contract.** Two representations; something reads the wrong one.
