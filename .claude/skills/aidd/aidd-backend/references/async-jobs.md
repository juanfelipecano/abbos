# Background Jobs and Async Work

Queues, workers, and scheduled tasks. This area has its own failure modes, and they are systematically
under-designed because a job that works in development looks finished.

The one property that matters most: **assume at-least-once delivery, therefore every handler must be
idempotent.** That is a design property. It cannot be added later without rewriting the handler.

---

## Delivery semantics

| Guarantee | Reality |
|---|---|
| At-most-once | Fire and forget. Messages are lost. Rarely what you want |
| **At-least-once** | What essentially every queue actually provides. Duplicates happen |
| Exactly-once | Mostly a marketing claim. Where offered, it holds only within one system's boundary and not across your side effects |

Design for at-least-once. Even systems advertising exactly-once cannot make *your* HTTP call to a
payment provider happen exactly once — that is your handler's job.

**Duplicates are not an edge case.** They happen on worker restarts, deploys, visibility-timeout
expiry, network partitions, and broker failover. Under normal operation, over a month, a handler will
run twice on the same input.

---

## Idempotent handlers

The core discipline. Running twice must produce the same end state as running once.

**Patterns, in order of preference:**

**1. Naturally idempotent operations.** Setting a value rather than adjusting it.

```
// Not idempotent — runs twice, counts twice
UPDATE stats SET views = views + 1 WHERE id = $1;

// Idempotent — the event's identity is recorded, so a repeat is a no-op
INSERT INTO view_events (event_id, item_id) VALUES ($1, $2)
  ON CONFLICT (event_id) DO NOTHING;
// The counter is then derived, or updated only when the insert actually happened.
```

**2. A deduplication key with a unique constraint.** Record that this event was processed, in the same
transaction as the effect.

```
BEGIN;
  INSERT INTO processed_events (event_id) VALUES ($1);   -- unique; conflict = already done
  -- the actual effect
COMMIT;
```

If the insert conflicts, the transaction aborts and the effect does not repeat. The atomicity is what
makes this correct — checking a "processed" table and then doing the work in a separate transaction is
the read-modify-write hazard again.

**3. Conditional state transitions.** Only act if the state permits it.

```
UPDATE orders SET status = 'shipped', shipped_at = now()
 WHERE id = $1 AND status = 'paid';
-- Zero rows: already shipped, or not payable. Either way, exit cleanly.
```

**4. Idempotency keys on external calls.** When the effect is someone else's system, pass a key they
honor (see `api-design.md`). If they do not support one, you need a local record of "I already called
this" written before the call and reconciled after.

**The hardest case** is a handler with several side effects — write a row, charge a card, send an
email. Split it into separate jobs, each idempotent, chained. A single handler doing three
non-idempotent things cannot be made safe by retrying it.

---

## Retries

**Exponential backoff with jitter.** Every word matters.

```
delay = min(base * 2^attempt, cap) * (0.5 + random() * 0.5)
// base=1s, cap=300s → ~1s, 2s, 4s, 8s ... with ±50% randomization
```

**Jitter is not optional.** Fixed-interval retries from many workers synchronize into a thundering
herd: the dependency recovers, all pending retries fire simultaneously, it falls over again. Jitter
spreads them.

**Do not retry everything.** Classify the failure:

| Failure | Retry? |
|---|---|
| Network timeout, connection reset | Yes |
| 500, 502, 503, 504 | Yes |
| 429 | Yes, respecting `Retry-After` |
| 400, 422 — malformed input | **No.** It will be malformed again. Dead-letter it |
| 401, 403 | No — unless credentials refresh, then once after refreshing |
| 404 | Usually no. Sometimes yes if the resource is being created concurrently |
| Any error from non-idempotent work | No, unless you are certain the effect did not happen |

Retrying a 400 forever consumes worker capacity to produce the same error, and it hides the real
problem behind a full queue.

**Cap attempts.** Five to ten is typical. Then dead-letter.

---

## Dead-letter queues

**An unmonitored DLQ is a silent data-loss sink.** This is the most common operational failure in
async systems: messages fail, land in the DLQ, and nobody looks — for months. The dashboard is green
because the main queue is empty.

Requirements for a DLQ to be a control rather than a hole:

- **An alert on depth > 0**, routed to someone. Not a dashboard panel — an alert
- **A named owner** for triage
- **The original message plus the failure reason and attempt history** stored together. A DLQ message
  with no context cannot be triaged
- **A replay path** that is tested. Discovering during an incident that you have no way to reprocess
  is the wrong time
- **A retention policy** — and awareness that when retention expires, the data is gone

**Poison messages** — one permanently-failing message must not block the queue. With per-message
retries and a DLQ this is handled. With a strict-ordering queue that stops on failure, one bad message
halts everything, which is a design decision to make consciously.

---

## Ordering

**Most queues do not guarantee order.** If your handler depends on order, say so explicitly and design
for it.

Where order matters — a sequence of updates to one entity — the answer is **partitioning by key**:
all messages for entity X go to the same partition and are processed sequentially, while different
entities process in parallel. This gives per-key ordering without serializing everything.

Better still, **make handlers order-independent.** Include a version or timestamp in the message and
discard anything older than the current state:

```
UPDATE profiles SET name = $1, updated_at = $2
 WHERE id = $3 AND updated_at < $2;   -- an out-of-order older update is a no-op
```

This is more robust than relying on delivery order, because delivery order fails during retries even in
ordered queues — a retried message arrives after messages that came later.

---

## Visibility timeout

The setting that causes the subtlest bugs.

A worker claims a message for N seconds. If it has not acknowledged by then, the message becomes
visible again and **another worker picks it up — while the first is still running.** Two workers, one
message, concurrently.

- Set the timeout above the realistic p99 duration, not the average
- **Extend the lease** for long-running work (heartbeat), rather than setting a very long timeout —
  a long timeout means a genuinely crashed worker's message is stuck for that whole period
- Alert on duration approaching the timeout; that is the leading indicator
- This is another reason handlers must be idempotent: the duplicate here is concurrent, not sequential

---

## Scheduled jobs

- **Never assume exactly one run.** Scheduler failover, clock issues, and manual triggers all cause
  double execution. Same idempotency requirement
- **Overlap**: what if the previous run is still going? Either enforce a lock (an atomic conditional
  claim on a row) or design the job to tolerate overlap
- **Missed runs**: if the scheduler was down at 02:00, should the job run late or skip? Decide, and say
  which
- **Timezones and DST**: a job scheduled at local 02:00 runs twice or zero times on transition days.
  Schedule in UTC unless local wall-clock is genuinely required
- **Long-running scheduled work should be chunked** and resumable. A six-hour job that fails at hour
  five and restarts from zero never completes

---

## Sizing and backpressure

- **Enqueue rate versus consumption rate.** If a spike can outpace consumption, the queue grows
  without bound. Know the ratio
- **Fan-out amplification**: a job that enqueues one job per row turns one message into 50,000. That is
  the mechanism behind most queue incidents
- **Concurrency limits per job type**, so one heavy type cannot starve the rest. Separate queues for
  separate priorities
- **Rate-limit calls to external dependencies** from the worker pool. Twenty workers hitting an API
  with a 10 req/s limit produces nothing but 429s
- **Backpressure**: when the queue is deep, is it better to reject new work at the API than to accept
  it and never process it? Usually yes — an accepted request that will not be processed is a lie

---

## Observability

Two signals matter more than the rest:

- **Queue depth** — how much work is waiting
- **Age of the oldest message** — the one that catches a dead consumer. **A stopped worker looks
  identical to a quiet period if you only watch depth.** Age is what distinguishes them

Also: processing duration (p50/p95/p99), failure rate by job type, retry rate, DLQ depth, and worker
saturation.

**Alert on age, not just depth.** A queue with 5 messages that are 4 hours old is broken; a queue with
5,000 messages that are 10 seconds old is busy.

Include a correlation ID in every message so a job's work can be traced back to the request that
enqueued it. Without it, debugging async work means guessing.

---

## Specification format

For each job in the backend spec:

```markdown
| Job | Trigger | Rate | Idempotent by | Retry | Max | DLQ owner | Ordering |
|---|---|---|---|---|---|---|---|
| send-receipt | order.paid | ~200/hr, 2k peak | dedup on event_id | exp backoff + jitter, base 2s | 6 | #billing | none needed |
| sync-inventory | cron */5 | 288/day | conditional update on version | exp backoff, base 10s | 3 | #ops | per-SKU |
```

Plus, per job: visibility timeout, expected duration, concurrency limit, and what happens if it never
succeeds.

---

## Criteria for the spec

```markdown
### Backend / data — appended by aidd-backend
- [ ] AC-B1: Running send-receipt twice on one event sends one email and leaves identical state
      → `npm test -- receipt.idempotent`
- [ ] AC-B2: A 422 from the provider dead-letters immediately without retrying
      → `npm test -- receipt.retry-policy`
- [ ] AC-B3: Retry delays are exponential with jitter → `npm test -- retry.backoff`
- [ ] AC-B4: DLQ depth > 0 raises an alert routed to #billing → devops config review
- [ ] AC-B5: Out-of-order profile updates leave the newest value → `npm test -- profile.ordering`
- [ ] AC-B6: A worker killed mid-job leaves no partial state; the message is reprocessed cleanly
      → `npm test -- worker.crash-recovery`
```

AC-B6 is the one that finds real bugs. Kill the worker mid-handler and check what is left behind.

---

## Anti-patterns

- **A non-idempotent handler on an at-least-once queue.** It will run twice this month.
- **`views = views + 1` in a job.** Double-counts on every duplicate.
- **Checking a "processed" table in a separate transaction from the effect.** The race is back.
- **Retrying a 400.** Burns capacity to reproduce the same error, and hides it behind a full queue.
- **Fixed-interval retries.** Synchronized thundering herd when the dependency recovers.
- **No jitter.** Same problem.
- **Unbounded retries.** The message never leaves and the queue never drains.
- **An unmonitored DLQ.** Silent data loss with a green dashboard.
- **A DLQ with no replay path.** Discovered during the incident.
- **Depending on delivery order.** Retries break order even in ordered queues.
- **A visibility timeout below p99 duration.** Two workers, one message, concurrently.
- **A very long visibility timeout instead of lease extension.** A crashed worker blocks the message.
- **Alerting on depth but not age.** A dead consumer looks like a quiet period.
- **A job that enqueues one job per row, unbounded.** The mechanism behind most queue incidents.
- **Twenty workers against a 10 req/s API.** Nothing but 429s.
- **A six-hour job with no chunking or resume.** Never completes once it starts failing.
- **A cron job scheduled in local time.** Runs twice, or zero times, on DST transitions.
