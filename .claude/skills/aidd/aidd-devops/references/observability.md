# Observability

Logs, metrics, traces, and alerts. The test that decides whether a system is observable:

**When it breaks at 3am, can someone find out why without adding logging first?**

If the answer is no, it is not observable, and on anything meaningful that is a release blocker.

---

## Monitoring versus observability

A distinction worth keeping, because it changes what you build.

**Monitoring** answers questions you knew to ask. Dashboards, threshold alerts, known failure modes. It
handles the failures you have seen before.

**Observability** lets you answer questions you did not anticipate. High-cardinality data, arbitrary
slicing, correlation across signals. It handles the failure you have not seen — which is the one that
will page you.

Both are needed. Teams usually have monitoring and think they have observability, and discover the gap
during a novel incident.

---

## Logs

**Structured, one event per line.** Unparseable prose is not a log; it is a diary.

```json
{"ts":"2026-07-30T14:22:01Z","level":"error","msg":"payment_failed",
 "trace_id":"4bf92f","user_id":"8842","order_id":"ord_01H8","provider":"stripe",
 "code":"card_declined","attempt":2,"duration_ms":847}
```

Every field is queryable. The prose equivalent — `"Payment failed for user 8842 after 847ms"` — requires
a regex to analyze and breaks when someone rewords it.

### What makes a log line useful

**Enough context to diagnose without reproducing.** The identifiers, the state, the input that failed,
the duration, the attempt number. A log line saying `"operation failed"` costs storage and provides
nothing.

**A correlation ID threading every log line for one request**, propagated across services and into
background jobs. Without it, debugging a distributed request means guessing which lines belong together.
This is the single highest-value logging investment.

**Consistent field names** across services. `user_id` in one service and `userId` in another makes
cross-service queries painful forever.

### Levels, used consistently

| Level | Means | Action |
|---|---|---|
| ERROR | Something failed that should not have | Someone should look |
| WARN | Something unexpected, handled | Trend worth watching |
| INFO | Significant business events | Audit and context |
| DEBUG | Detailed flow | Off in production, or sampled |

**ERROR must mean "someone should look".** If ERROR fires routinely for expected conditions — a user
typing a wrong password, a validation failure — the level is meaningless and real errors are invisible in
the noise. A wrong password is INFO or WARN, not ERROR.

### Never log

Passwords, tokens, session IDs, API keys, full card numbers, government IDs, health data, or full request
bodies on authenticated endpoints.

**A log aggregator is a lower-trust environment than your database** — broader read access, longer
retention than intended, often replicated to a third party. Redact at the serializer, not at the call
site; see `aidd-security`'s `data-protection.md`.

### Volume

Logging everything at high volume is expensive and makes the useful lines harder to find. Sample
high-frequency success paths; never sample errors.

---

## Metrics

Four signals per service, and they answer most questions:

| Signal | Metric | Why |
|---|---|---|
| **Rate** | Requests/sec by endpoint and status | Load, and traffic anomalies |
| **Errors** | Error rate by type | The primary health indicator |
| **Duration** | Latency **distribution** | What users experience |
| **Saturation** | CPU, memory, connections, queue depth | How close to a limit |

**Never a mean latency.** An average of 200ms with a p99 of 8 seconds describes a system that fails
visibly for one request in a hundred, and the mean conceals it completely. Use p50, p95, p99 — the p99 is
what your most engaged users experience, because they make the most requests.

**Add one or two business metrics.** A technically healthy service can have stopped doing its job:
orders per minute, signups per hour, payments succeeded. These catch the failure where every technical
signal is green and nothing is actually working — a broken feature flag, a full queue, a silently failing
integration.

**Cardinality is the cost driver.** A metric labeled with `user_id` creates one time series per user and
will bankrupt your metrics backend. High-cardinality data belongs in logs or traces, not in metric
labels.

---

## Traces

For anything crossing more than two services or involving async work. Without traces, "it is slow" costs
a day of correlating timestamps across log files.

A trace shows the full request as a tree of spans with timings, revealing:

- Which hop is slow
- Sequential calls that could be parallel
- The N+1 pattern — twenty near-identical spans in a row
- Where an error originated versus where it surfaced

**Propagate context everywhere**, including into queues. A trace that stops at the queue boundary loses
exactly the part that is hardest to debug — and async work is where the authorization-versus-execution
gap lives (see `aidd-security`'s `threat-modeling.md`).

**Sample intelligently:** a low baseline rate for volume, plus 100% of errors and slow requests. Those
are the traces you will actually open.

---

## Alerts

The area with the most waste. Most alert systems generate noise that trains people to ignore them, and
then the real page is missed.

### Two rules

**1. Alert on symptoms, not causes.**

| Alert on | Not on |
|---|---|
| Error rate above 1% for 5 minutes | CPU above 80% |
| p95 latency above 2s for 5 minutes | Memory above 70% |
| Orders per minute below expected floor | Disk I/O elevated |
| Queue oldest-message age above 10 min | A pod restarted |

CPU at 80% during a deploy is normal. Error rate at 5% is never normal. Cause-based alerts fire during
healthy operation, get muted, and then do not fire when it matters.

**2. Every alert must be actionable.** If the response is to look and dismiss it, **delete the alert**.
Alert fatigue is the mechanism by which a real page gets ignored, and every non-actionable alert
contributes to it.

### Practicalities

- **Duration thresholds**, not instantaneous. A single slow request is not an incident
- **Every alert links to a runbook.** An alert at 3am with no runbook is a research project
- **Severity tiers**: page (user impact now) versus ticket (needs attention this week). Most alerts are
  tickets
- **Review alerts quarterly.** Delete ones that never fired usefully; that review is what keeps the
  system trusted

### SLOs

A better foundation than arbitrary thresholds. An SLO states the target; the error budget states how much
failure is acceptable.

```
SLO: 99.9% of GET /orders return 2xx within 500ms, measured over 30 days
Error budget: 0.1% = ~43 minutes of failure per month
```

The error budget makes the reliability conversation concrete: budget remaining means you can ship
riskier changes; budget exhausted means reliability work takes priority over features. It converts an
argument about feelings into arithmetic.

**Alert on burn rate**, not on individual breaches — a fast burn (consuming a large fraction of the
budget in an hour) pages; a slow burn opens a ticket.

---

## What to instrument for a new feature

Decide before implementation, as criteria:

- [ ] Correlation ID present on every log line and propagated to downstream calls and queued jobs
- [ ] Error rate and latency distribution for each new endpoint
- [ ] One business metric capturing whether the feature is doing its job
- [ ] Queue depth **and age of oldest message** for each new job type
- [ ] A structured log at every failure branch, with enough context to diagnose
- [ ] Alert on the symptom a user would notice, with a runbook link
- [ ] Traces cover the new path, including its async portion

**Age of oldest message** is worth repeating: a dead consumer looks identical to a quiet period if you
only watch depth.

---

## Cost

Observability spend surprises teams. Three things drive it:

- **Log volume** — sample high-frequency success paths
- **Metric cardinality** — never label with a user or request ID
- **Trace retention** — sample the baseline, keep all errors

Set a budget and monitor it as a metric. Uninstrumented systems are expensive during incidents;
over-instrumented ones are expensive continuously.

---

## The incident test

The honest way to evaluate observability: **take the last incident and ask what you could not answer.**

- How long before anyone knew? (Detection)
- How long to find the cause? (Diagnosis)
- What did you have to add to figure it out?
- What question do you still not have an answer to?

Whatever you had to add during the incident is what was missing. Add it permanently — that is Article XII
applied to operations, and it is how observability improves rather than being rebuilt each time.

---

## Anti-patterns

- **Mean latency.** Hides the tail, which is what users feel.
- **Unstructured logs.** Require regex; break on rewording.
- **No correlation ID.** Distributed debugging becomes guessing.
- **ERROR for expected conditions.** Wrong passwords drown real errors.
- **Logging tokens or PII.** The aggregator is lower-trust than your database.
- **Redacting at the call site.** Four hundred chances to forget.
- **`user_id` as a metric label.** One time series per user; unbounded cost.
- **Alerting on CPU.** Fires during every healthy deploy; gets muted.
- **Non-actionable alerts.** Fatigue, then the real page is missed.
- **Instantaneous thresholds.** One slow request is not an incident.
- **An alert with no runbook.** A research project at 3am.
- **Traces that stop at the queue.** Loses the hardest part to debug.
- **No business metric.** Every technical signal green while nothing works.
- **Watching queue depth but not age.** A dead consumer looks quiet.
- **Adding instrumentation during an incident and not keeping it.** Rebuilt every time.
- **Never reviewing alerts.** The set decays until nobody trusts any of it.
