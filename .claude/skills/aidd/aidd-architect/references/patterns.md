# Pattern Catalog

Patterns worth reaching for, anti-patterns worth naming, and — the part that matters — the context
in which each is correct. A pattern applied outside its context is not a neutral choice; it is
complexity with no offsetting benefit, permanently.

The diagnostic tables at the end of each section are the fastest way to use this file.

---

## How to use a pattern

Three questions, in order:

1. **What force is pushing me toward this?** Name the specific pressure — a change that touches
   nine files, a failure that cascades, a query that cannot scale. No force, no pattern.
2. **What does it cost?** Every pattern trades something. Indirection, latency, operational
   surface, or cognitive load.
3. **What breaks without it, at today's volume?** If the answer is "nothing yet", the pattern is a
   bet on a future. State the bet.

The most common architectural failure in AI-assisted work is a design sized for a scale that never
arrives, whose complexity cost is paid every single day in the meantime.

---

## Structural patterns

### Ports and Adapters (Hexagonal)

Domain logic depends on interfaces it defines; infrastructure implements them.

- ✅ Vendor churn is contained; domain logic is testable without infrastructure
- ❌ Indirection on every boundary; over-applied it produces an interface per class
- 📌 **Best when**: the domain has real rules, or you expect to swap a major dependency
- 🚫 **Skip when**: the application is a thin CRUD layer over a database. An interface with one
  implementation that will never have a second is pure cost

The signal you needed it: you cannot test your business rules without a database.

### Backend for Frontend (BFF)

One backend per client type, shaping data for that client's needs.

- ✅ Each client gets exactly what it needs; no lowest-common-denominator API; clients evolve
  independently
- ❌ Another deployable per client; logic duplicated across BFFs if you are careless
- 📌 **Best when**: web and mobile have genuinely divergent data needs, or a chatty API is causing
  latency
- 🚫 **Skip when**: one client. A BFF for a single web app is a proxy

### Strangler Fig

Route traffic through a facade; migrate capability by capability; delete the old path last.

- ✅ Incremental with continuous value; each step reversible; no big-bang cutover
- ❌ Two systems live at once; the facade is a real component to build and operate
- 📌 **Best when**: replacing a system you cannot stop, which is nearly always
- 🚫 **Skip when**: the system is small enough to rewrite in one release, honestly assessed

The failure mode is stopping halfway. Budget for the deletion, or you have permanently doubled your
surface.

### Sidecar

Cross-cutting concerns in a co-deployed process rather than in every application.

- ✅ Language-agnostic; upgrade independently of the app
- ❌ Operational complexity; resource overhead per instance; another failure mode
- 📌 **Best when**: polyglot services needing uniform mTLS, telemetry, or policy
- 🚫 **Skip when**: one language and a library would do

---

## Data and consistency patterns

### Outbox

Write the domain change and an event row in the same local transaction; a separate process publishes
the event.

- ✅ Solves the dual-write problem — no lost events, no phantom events
- ❌ A publisher to operate; at-least-once delivery, so consumers must be idempotent
- 📌 **Best when**: a state change must reliably produce an event. Any "update the row and publish"
  code path
- 🚫 **Skip when**: losing the event is acceptable

**This is the most under-used pattern on the list.** The naive alternative — write to the database,
then publish — silently loses events whenever the process dies between the two, and that failure is
invisible until someone reconciles.

### Saga

A long-running business transaction as a sequence of local transactions with compensating actions.

- ✅ Consistency across services without distributed transactions
- ❌ Every step needs a compensating action; intermediate states are visible; hard to reason about
- 📌 **Best when**: a multi-service workflow must complete or unwind — order, payment, inventory
- 🚫 **Skip when**: it fits in one transaction. If one database can do it, let it

Orchestrated (a coordinator drives) is easier to debug. Choreographed (services react to events) is
more decoupled and much harder to trace. Prefer orchestrated unless you have a specific reason.

### CQRS

Separate the write model from the read model.

- ✅ Each side optimized independently; complex reads do not distort the write model
- ❌ Two models to keep consistent; eventual consistency the UI must handle
- 📌 **Best when**: read and write loads or shapes diverge sharply — heavy reporting over a
  transactional model
- 🚫 **Skip when**: reads and writes are symmetric. **Do not adopt CQRS to "be scalable."** It is a
  response to a measured divergence

### Event Sourcing

State is the fold of an append-only event log.

- ✅ Complete audit trail; temporal queries; rebuild any projection
- ❌ Significant complexity — versioning, snapshots, replay, no simple `UPDATE`. Querying current
  state requires projections
- 📌 **Best when**: the audit trail is a *requirement* (finance, healthcare, compliance), or history
  is the product
- 🚫 **Skip when**: you want an audit log. An audit table gives you 90% of the value for 5% of the
  cost

Event sourcing is the pattern most often adopted for the wrong reason. Adopt it because immutable
history is a business requirement, not because it sounds rigorous.

### Materialized View / Read Model

A denormalized projection maintained for a specific query.

- ✅ Fast reads without contorting the write model
- ❌ Staleness; a rebuild path you must actually build
- 📌 **Best when**: a query is expensive and its data changes far less often than it is read
- 🚫 **Skip when**: an index would do. Try the index first

---

## Resilience patterns

### Circuit Breaker

After N failures, stop calling and fail fast; probe periodically to recover.

- ✅ Prevents a slow dependency from exhausting your threads; gives the dependency room to recover
- ❌ State to tune; a mis-tuned breaker causes outages it was meant to prevent
- 📌 **Best when**: a synchronous call to a dependency that can be slow or down
- 🚫 **Skip when**: the call is async and queued

**Always pair with a timeout.** A circuit breaker without timeouts never trips — the calls hang
rather than failing, so the failure counter never increments. This pairing is missed constantly.

### Retry with backoff and jitter

Retry transient failures with exponentially increasing, randomized delays.

- ✅ Absorbs transient faults invisibly
- ❌ **Amplifies load during an outage.** Retrying a non-idempotent operation duplicates effects
- 📌 **Best when**: the operation is idempotent and the failure is plausibly transient
- 🚫 **Skip when**: the operation is not idempotent, or the error is a 4xx — retrying a 400 just
  gets another 400

Jitter is not optional. Synchronized retries from many clients are a self-inflicted thundering herd,
and fixed-interval retry guarantees synchronization.

### Bulkhead

Isolate resource pools so one dependency's saturation cannot consume everything.

- ✅ One slow dependency degrades one feature instead of the whole service
- ❌ Lower utilization; more configuration
- 📌 **Best when**: several dependencies with different reliability share a thread or connection pool
- 🚫 **Skip when**: a single dependency

### Idempotency key

The client supplies a key; the server stores the result and replays it on repeat.

- ✅ Safe retries on non-idempotent operations
- ❌ Storage and expiry to manage; must handle a key reused with a *different* payload
- 📌 **Best when**: any non-GET a client might retry. Payments especially
- 🚫 **Skip when**: naturally idempotent

Networks retry without asking permission. See `aidd-backend`'s `api-design.md`.

---

## Behavioral patterns worth naming

The GoF catalog is largely absorbed into language features now. These four still earn explicit
mention because they solve problems that recur.

### Strategy
Interchangeable algorithms behind one interface. **Use when** you have a conditional on a type or
mode that keeps growing — pricing rules, export formats, payment providers. The signal is a
`switch` that gains a case per feature.

### State machine
Explicit states and permitted transitions. **Use when** an entity has a lifecycle with rules about
what may happen when — order status, subscription, approval workflow. The signal is a pile of
boolean flags (`isPaid`, `isShipped`, `isCancelled`) that can combine into impossible states. Making
the state explicit makes those combinations unrepresentable.

### Chain of responsibility
A pipeline where each handler may handle or pass along. **Use when** processing has ordered,
composable, independently-testable stages — validation, middleware, enrichment. **Skip when** the
order is fixed and short; two ifs beat a pipeline.

### Observer / event-driven
Publishers emit; subscribers react. **Use when** one action must trigger several unrelated effects
and you do not want the publisher to know about them. **Cost**: control flow becomes hard to trace
— a "who else runs when this happens" question with no static answer. Do not use it for flows that
must be sequential and reliable; use an explicit orchestration.

---

## Anti-patterns

Each with the signal that reveals it and the remedy.

### Distributed monolith
Services that must be deployed together.

**Signal**: a release requires coordinating three deployments; a schema change breaks another
service; teams cannot deploy independently.
**Remedy**: fix the coupling — usually a shared database or synchronous chains. Merging the services
back is often the right answer, and admitting it early is cheap.

### Shared database between services
Two services reading and writing the same tables.

**Signal**: a migration requires checking another service's code.
**Remedy**: one owner per table. Others get an API or an event stream. This is the single most
common reason a service decomposition fails to deliver anything.

### God service / God object
One component that everything depends on.

**Signal**: every feature touches it; it has more than a handful of reasons to change; nobody
refactors it because everything breaks.
**Remedy**: split by reason to change, not by size. Extract the piece with the fewest inbound
dependencies first.

### Chatty API
One user action requires many round trips.

**Signal**: a page fires 15 requests; latency dominated by round trips, not work.
**Remedy**: an aggregate endpoint or a BFF. Do not fix it with client-side parallelism — that hides
the design problem behind more connections.

### Anemic domain + forwarding service layer
Entities are field bags; the service layer only delegates to a repository.

**Signal**: services with methods that are one line of repository call; business rules duplicated
across callers.
**Remedy**: move invariants into the model. Or accept it — for genuine CRUD, this is fine and the
"fix" is over-engineering. Judge by whether business rules are actually being duplicated.

### Cache with no invalidation story
A cache added for latency with no defined invalidation.

**Signal**: "we just set a short TTL". Stale-data bugs that reproduce inconsistently.
**Remedy**: define what invalidates it and the tolerable staleness, before adding it. A cache with
no invalidation story is a correctness bug with better latency.

### Business logic in the wrong layer
Rules in templates, migrations, triggers, or controllers.

**Signal**: you cannot find where a rule lives; it is implemented twice; you cannot test it without
the framework.
**Remedy**: one home per rule, testable in isolation.

### Configuration in code
Environment-specific values compiled in.

**Signal**: a deploy to change a timeout; different branches per environment.
**Remedy**: environment configuration, one artifact promoted everywhere.

### Nanoservices
Services so small that most logic is network calls.

**Signal**: a feature spans six repositories; the failure modes are all network.
**Remedy**: merge. Service boundaries should follow ownership and change frequency, not lines of
code.

---

## Diagnostic table

Start from the force, not the pattern.

| Force you are feeling | Consider | Not |
|---|---|---|
| A conditional on type grows with every feature | Strategy | More cases |
| Boolean flags combine into impossible states | State machine | Another flag |
| One action must trigger several unrelated effects | Events, or explicit orchestration | Inline calls to five services |
| A state change must reliably emit an event | **Outbox** | Write-then-publish |
| A workflow spans services and must unwind on failure | Saga | Distributed transaction |
| Reads are expensive and shaped differently from writes | Read model, then CQRS | Event sourcing |
| The audit trail is a legal requirement | Event sourcing | An audit table |
| You want an audit trail | An audit table | Event sourcing |
| A dependency is slow and exhausting threads | Timeout + circuit breaker | Retry alone |
| Transient failures are surfacing to users | Retry with backoff **and jitter** | Fixed-interval retry |
| Clients retry a payment and double-charge | Idempotency key | Hoping |
| One slow dependency takes down everything | Bulkhead | More instances |
| Replacing a system you cannot stop | Strangler Fig | Big-bang rewrite |
| Web and mobile need different shapes | BFF | One API for both |
| Vendor SDK types leak through your domain | Ports and Adapters | Wrapper classes everywhere |
| A page makes 15 requests | Aggregate endpoint | Client-side parallelism |
| You cannot test business rules without a database | Ports and Adapters | Integration tests only |

---

## The default position

For a new system with unknown scale:

- **One well-modularized deployable.** Module boundaries inside it, enforced by dependency
  direction. Extract a service when something needs independent scaling, independent deployment, or
  a different team's ownership — and not before
- **One database, one owner per table**
- **Synchronous calls** until you have a reason for async, then the outbox
- **Timeouts everywhere** from day one. This is the cheapest resilience you will ever buy
- **Idempotency keys** on anything financial from day one — retrofitting is painful
- **No cache** until you have measured the query

Migration paths beat correct-at-final-scale designs. "Start with a module boundary; extract when it
needs independent scaling" is right for almost every team that is not already operating at scale.
