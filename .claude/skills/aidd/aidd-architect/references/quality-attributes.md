# Quality Attributes

How to elicit, quantify, and rank the non-functional requirements that actually drive a design.

This is the highest-leverage architectural work, and the most commonly skipped. A design that claims
to optimize performance, scalability, availability, maintainability, security, observability, and
cost has made no decisions, and it will fail at all seven. Ranking them *is* the architecture.

---

## Why ranking is the work

Quality attributes conflict. That is not a flaw in your requirements — it is the nature of the
problem, and the conflicts are where the design lives.

| Tension | The trade |
|---|---|
| Performance vs maintainability | Caching, denormalization, and hand-tuned queries all add coupling |
| Availability vs consistency | You cannot have both during a partition. Pick per operation |
| Security vs usability | Every additional check is friction someone will route around |
| Scalability vs simplicity | Horizontal scale means statelessness, coordination, and distributed failure |
| Cost vs everything | Redundancy, headroom, and observability all cost money |
| Time-to-market vs all of the above | The real constraint, usually unstated |

When you rank them and write down why, every subsequent decision has a tie-breaker, and role
disagreements later have an answer you can cite instead of relitigating.

---

## Eliciting real numbers

Vague attributes produce vague designs. The questions below turn adjectives into numbers.

Ask a maximum of three per turn. A wall of questions gets one answer and a request to just get
started.

### Performance
- What operation, at what percentile, in what time? "p95 checkout under 500ms" is a requirement;
  "fast" is not
- What is the current baseline? Without one you cannot show improvement
- What is the user actually waiting for? Perceived latency is often improvable without making
  anything faster
- Where is the time going today — network, queue, compute, database?

**Always specify percentiles, never averages.** A mean latency of 200ms with a p99 of 8s is a
system that fails visibly for one request in a hundred, and the mean conceals it entirely.

### Scalability
- Volume today, and the growth shape — linear, seasonal, spiky, viral?
- What is the unit of scale: users, requests, tenants, data volume, events?
- Read-heavy or write-heavy? The answers differ completely
- What is the largest single tenant? A design that works for the average often fails for the
  outlier, and the outlier is usually your most important customer

**Get an order of magnitude, and design for one more.** Designing for 100× today's volume is
over-design; designing for exactly today's is a rewrite next year.

### Availability
- What does an hour of downtime cost — in money, in trust, in regulatory exposure?
- Is partial availability useful? Read-only during an outage is often most of the value
- Planned maintenance windows, or must upgrades be zero-downtime?
- What is the dependency floor? You cannot exceed the availability of anything you synchronously
  depend on

| Target | Downtime/year | Downtime/month | What it demands |
|---|---|---|---|
| 99% | 3.65 days | 7.3 hours | Careful single instance |
| 99.9% | 8.8 hours | 43 min | Redundancy, health checks, fast deploys |
| 99.95% | 4.4 hours | 22 min | Multi-AZ, automated failover |
| 99.99% | 53 min | 4.4 min | Multi-region, no manual steps in recovery |
| 99.999% | 5.3 min | 26 s | Rarely justified. Often not achievable given dependencies |

The right conversation is usually "does 99.9% cost less than the downtime it prevents?" Teams ask
for four nines and are surprised by the price, which includes eliminating every manual step from
recovery.

### Maintainability
- Team size, seniority, and expected turnover?
- Expected lifetime? A six-month campaign site and a ten-year platform want opposite designs
- How often will this change, and which parts?
- Who is on call, and have they seen this code?

Maintainability is the attribute most often sacrificed silently, because its cost appears months
later and never on a dashboard.

### Security
- What is the worst thing an attacker could do?
- What data classes are involved? (See `aidd-security`'s `data-protection.md`)
- What compliance regime applies, and what does it actually mandate?
- Who are the realistic adversaries — opportunistic scanners, competitors, insiders, a targeted
  actor?

### Observability
- When it breaks at 3am, how does someone find out why?
- What signals exist today? What question could you not answer last incident?
- What is the acceptable time-to-diagnosis?

The test: **could you diagnose last month's incident from what the system emits today?** If not,
observability is a requirement, not a nice-to-have.

### Cost
- Infrastructure budget, and is it a constraint or a consideration?
- Cost per unit — per tenant, per request, per GB? A design can be technically fine and
  economically impossible
- Which is scarcer, engineering time or infrastructure spend? The answer flips the design

---

## Quantify with scenarios

The single most useful technique for making an attribute testable. A scenario has six parts, and
filling them in forces precision:

```
Source      — who or what initiates
Stimulus    — what happens
Artifact    — which part of the system
Environment — under what conditions
Response    — what the system does
Measure     — the number that makes it pass or fail
```

Vague:
> The system should be scalable and handle load well.

Scenario:
> **Source** 5,000 concurrent users · **Stimulus** submit checkout · **Artifact** order service ·
> **Environment** normal operation, one AZ lost · **Response** orders accepted and confirmed ·
> **Measure** p95 under 800ms, error rate under 0.1%, no data loss

The second version can be tested, designed against, and argued with. It also converts directly into
an acceptance criterion, which is the point.

Write three to five scenarios for your top-ranked attributes. Do not write them for the ones you
ranked last — that is how a requirements document becomes forty untestable statements.

---

## The ranking exercise

1. **List the attributes that matter** for this system. Usually four or five, not seven.
2. **Force a strict order.** No ties. Ties are how a decision gets deferred to whoever implements
   it.
3. **Write one sentence of justification per position**, tied to business context.
4. **State what you are sacrificing** at the bottom of the list, explicitly.
5. **Write scenarios** for the top two or three.

```markdown
## Quality attribute ranking

| # | Attribute | Requirement | Why here |
|---|---|---|---|
| 1 | Security | ASVS L2; no PII in logs | Health data. A breach is existential, not expensive |
| 2 | Availability | 99.9%, read-only degradation acceptable | Clinicians need access during appointments |
| 3 | Maintainability | Two engineers must own this | Small team, high turnover risk |
| 4 | Performance | p95 < 1s on record load | Users tolerate 1s; below that is not worth complexity |
| 5 | Cost | Under $2k/month | Budgeted, not tight |

**Explicitly sacrificed**: horizontal scalability. Expected ceiling is 500 concurrent
clinicians; a single well-sized instance with a replica handles 10× that. Revisit at 5,000.
```

That last block is what makes the document useful in a year. Someone will ask why this is not
horizontally scalable, and the answer is written down with its revisit condition.

---

## Attributes into acceptance criteria

An attribute that does not become a criterion does not get built. The handoff:

| Attribute | Criterion (AC) | Owner |
|---|---|---|
| Performance | `p95 of GET /records < 1s at 500 concurrent` → load test | backend |
| Availability | `Killing one instance causes no failed requests` → chaos test | devops |
| Security | `No PII in any log line` → log scan in CI | security |
| Observability | `Every request has a correlation ID traceable across services` → trace test | devops |
| Maintainability | Not directly testable — becomes review criteria and module boundary rules | architect |
| Cost | `Monthly infra under $2k at projected volume` → billing alert | devops |

Maintainability is the honest exception: it resists a single test. Express it as enforced dependency
rules, a module-boundary lint, and a documented review standard. Do not pretend a coverage number
measures it.

---

## Anti-patterns

- **Optimizing for all seven.** No decision has been made; the design will fail at all of them.
- **Adjectives instead of numbers.** "Fast", "scalable", "secure" cannot be designed for or tested.
- **Averages instead of percentiles.** A mean hides the tail, which is what users feel.
- **Availability targets chosen without pricing them.** Four nines means no manual recovery steps.
- **Designing for 100× current volume.** Complexity paid daily for a future that may not arrive.
- **Designing for exactly current volume.** A rewrite next year.
- **Ignoring the largest tenant.** The average works; your biggest customer breaks.
- **Ties in the ranking.** Defers the decision to whoever implements it.
- **No stated sacrifice.** Someone will re-open the question in six months with no record of why.
- **Attributes that never become criteria.** Documented, then not built.
- **Claiming an availability target above your dependency floor.** Arithmetically impossible.
