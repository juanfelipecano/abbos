# Architecture Audit

How to assess an existing system. The rule that makes an audit worth reading: **read the code, not
the documentation.** Documentation describes intent; the code describes reality, and the gap between
them is usually the most interesting finding.

Every finding needs a concrete failure scenario. A finding without one is a style preference, and a
report full of preferences gets filed.

---

## Before you start

Establish scope and get the context, or the audit produces generic advice.

- **What decision does this audit inform?** "Should we rewrite?", "Can we support 10× volume?",
  "Why are we slow to ship?", "Are we secure enough to sell to enterprise?" Each demands a different
  audit. An audit with no decision behind it becomes a list nobody acts on
- **What is the system for**, and what are its actual quality requirements? A prototype judged
  against production standards produces 40 findings and no insight
- **What is already known?** Do not spend a day rediscovering what the team complains about weekly
- **What is off-limits?** Some things cannot change; assessing them wastes the reader's time

---

## Orientation, in order

Roughly two hours before forming any opinion.

1. **Build and run it.** Time this. A setup that takes a day is itself a significant finding, and it
   tells you what the team's daily friction is
2. **Read the entry points** — routes, handlers, jobs, consumers. This is the real surface area,
   and it is often much larger than anyone believes
3. **Read the data model.** Schema plus migrations. The schema reveals the actual domain model; the
   migration history reveals how it evolved and where the scars are
4. **Trace one important request end to end.** Every layer, every hop. You will learn more from this
   than from any diagram
5. **Read the tests.** What is tested reveals what the team is afraid of. What is untested reveals
   what they cannot test — which is usually the architectural finding
6. **Read the git log.** Which files change constantly? Which change together? Which have the most
   authors? This is the cheapest coupling analysis available and it is objective

Step 6 deserves emphasis. Files that always change together are coupled regardless of what the
package structure claims:

```bash
# Files most frequently changed — the churn hotspots
git log --format=format: --name-only --since=12.months | sort | uniq -c | sort -rn | head -20

# Files changed in the same commits as a given file — actual coupling
git log --format='%H' --follow -- path/to/File | \
  xargs -I{} git show --format= --name-only {} | sort | uniq -c | sort -rn | head -20
```

A file with high churn and many authors is where your defects are. Combine that with "hard to test"
and you have found the thing to fix first.

---

## What to examine

### Dependency direction

The highest-value structural check, and the most objective.

- Does the domain depend on infrastructure, or the reverse? Business logic importing a database
  driver or an HTTP framework means it cannot be tested or reused
- Are there **cycles** between modules? A cycle means the two modules are one module with extra
  ceremony, and neither can be changed or deployed independently
- Do inner layers know about outer ones? A domain entity aware of its JSON representation is coupled
  to a transport concern

**Failure scenario to write**: "The pricing rules cannot be unit tested because `PriceCalculator`
imports the ORM session. Every pricing change requires a database, so pricing is verified only
through integration tests that take 4 minutes, which is why pricing bugs reach production twice a
quarter."

That is a finding. "The layering is not clean" is not.

### Cohesion and coupling

- Does one module change for unrelated reasons? Use the git log, not intuition
- Is the same business rule implemented in more than one place? These *will* diverge, and the
  divergence will be reported as intermittent incorrectness
- Can you change one thing without touching many? Count the files in recent feature commits
- Is there a module everything depends on? That is your bottleneck for every change

### Boundaries

- Where is business logic actually living? Controllers, templates, migrations, and database triggers
  are all places rules hide where nobody finds them
- Are transaction boundaries explicit and sensible, or incidental?
- Do services own their data, or share tables? A shared table between services is the most common
  reason a decomposition delivers no benefit
- Is validation at the boundary, or scattered and inconsistent?

### Failure handling

The least-examined area in most systems, and now its own OWASP category (A10).

- What happens when each dependency is down, slow, or returns garbage? Trace it
- Is there a timeout on every network call? Missing timeouts are near-universal and mean someone
  else's outage becomes yours
- Does anything **fail open** on a security check? Highest-severity finding available
- Does a partial failure leave inconsistent state?
- Are retries applied to non-idempotent operations?

### Observability

- Could you diagnose last month's incident from what the system emits today? Ask the team what they
  could not answer
- Structured logs with a correlation ID, or unparseable strings?
- Metrics on the four signals — rate, errors, latency distribution, saturation?
- Are alerts on symptoms users feel, or on causes that fire during every healthy deploy?

### Testability

Treat this as an architectural concern, not a testing complaint.

- Can business logic be tested without standing up the system? If not, that is a design finding
- How long does the suite take? Over ten minutes and people stop running it
- Are there flaky tests? A tolerated flake trains the team to ignore red
- What is untested, and is it the risky part?

### Data

- Does the schema match the domain, or is it a historical accident?
- Are constraints in the database, or only in application code? Application-only constraints do not
  hold when a second writer appears
- Indexes matched to actual query patterns? Check the plans, not the intentions
- N+1 patterns in the hot paths?
- Is there a migration history that suggests a rewrite was abandoned halfway?

### Operational

- How long from merge to production? This number predicts almost everything else about the team's
  ability to respond
- Is rollback possible, and has it been tested?
- Is configuration environment-driven, with one artifact promoted?
- Any manual steps in deployment or recovery? Manual steps are where 3am incidents go wrong

---

## Severity

Every finding gets a severity and a failure scenario. Buckets with timeframes make the report
actionable:

| Severity | Definition | Timeframe |
|---|---|---|
| 🔴 **Critical** | Active risk of data loss, breach, or outage. Or blocks the decision this audit informs | < 30 days |
| 🟡 **Important** | Materially slows delivery or will fail at expected growth | < 90 days |
| 🟢 **Improvement** | Real but tolerable. Worth doing when nearby | Backlog |
| ⚪ **Observation** | Context for the reader. No action | — |

**Cap the criticals honestly.** If everything is critical, nothing is, and the report will be
skimmed. Three well-argued criticals get acted on; twelve get deferred wholesale.

---

## Report format

```markdown
# Architecture Audit — <system>

**Decision this informs**: <the question the reader is trying to answer>
**Scope**: <what was examined, what was not>
**Method**: <what you read and ran; hours spent>
**Date** / **Commit**: <so the report can be dated against the code>

## Verdict
<Three sentences answering the decision directly. The reader may read only this.>

## Strengths
<Genuine ones, specific. This is not politeness — it tells the reader what not to break during
remediation, which is real information.>

## Findings

### 🔴 C1 — <one-line title>
**Location**: `path/to/file:line` (and how widespread)
**Problem**: <what is structurally wrong>
**Failure scenario**: <specific conditions → specific consequence. If you cannot write this,
downgrade the finding.>
**Evidence**: <the code, the query plan, the git log, the timing>
**Fix**: <the concrete change, and its rough size>
**Cost of delay**: <what gets worse while this is open>

## Prioritized plan
| # | Finding | Effort | Impact | Sequence rationale |
|---|---|---|---|---|

## What I did not examine
<Honest gaps. An audit claiming complete coverage is not credible.>

## Metrics to track
<How the reader will know remediation worked. Numbers, with today's baseline.>
```

Two sections carry disproportionate weight. **Verdict** because it may be all that gets read.
**Cost of delay** because it is what turns a finding into a scheduled piece of work.

---

## Sequencing remediation

Do not order by severity alone.

1. **Stop the bleeding.** Anything actively losing data or exposing it.
2. **Unblock the decision.** If the audit exists to answer "can we scale?", fix what prevents
   answering it.
3. **Buy leverage.** Fix the thing that makes other fixes cheaper — usually testability. Remediating
   a system you cannot test safely is slow and risky, so fixing testability first accelerates
   everything after.
4. **Highest churn first** among equals. Fixing a file nobody touches produces no observable benefit.
5. **Then the rest**, batched by area to avoid repeated context-switching.

Step 3 is the one most reports miss. "Extract the domain logic so it can be unit tested" looks like
a lower priority than a list of specific bugs, and it is the change that makes fixing them safe.

---

## Anti-patterns

- **Auditing the documentation.** It describes intent, not reality.
- **No decision behind the audit.** Produces a list nobody actions.
- **Findings without failure scenarios.** Preferences wearing severity labels.
- **Twelve criticals.** The label stops meaning anything.
- **Judging a prototype by production standards.** Forty findings, no insight.
- **Recommending a rewrite** without a migration path and a cost. Almost always the wrong answer.
- **Skipping the git log.** The cheapest, most objective coupling analysis available.
- **No strengths section.** The reader breaks something good during remediation.
- **Claiming complete coverage.** Not credible; state the gaps.
- **Ordering purely by severity.** Fix testability first and everything else gets cheaper.
