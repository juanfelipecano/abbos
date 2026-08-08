# Severity and Routing

Calibrating how bad a finding is, and where it goes.

Severity is not a feeling about code quality. It is a claim about consequence, and it determines
routing: minor findings go straight back to the implementer, blocking findings go to the architect
as a spec patch and cost an iteration.

Miscalibration is expensive in both directions. Everything marked blocking stops the run for
nothing; nothing marked blocking ships the defect.

---

## The levels

| Level | Definition | Route |
|---|---|---|
| **BLOCKING** | Data loss, security hole, incorrect behavior on a realistic input, or a criterion not actually met | Architect if the design is wrong; implementer if the design is right |
| **MAJOR** | A real defect on an unusual-but-reachable path, or a maintainability problem with a named future failure | Implementer, as a minor per Rule 3 |
| **MINOR** | Small correctness gap, missing test case, untraceable hunk | Implementer |
| **OBSERVATION** | Context for the next reader. No action, no response expected | — |

---

## Calibrating BLOCKING

Reserve it. Two questions, both must be yes:

1. **Would a realistic user or input trigger this?** Not "an attacker with database access" or "if
   someone passes -1 to an internal function nothing calls".
2. **Is the consequence data loss, a security exposure, wrong output, or an unmet criterion?**

Things that are blocking:
- Money computed wrongly under any reachable condition
- A race condition on shared state that a second concurrent user reaches
- A new endpoint with no authorization check
- A criterion the diff claims to satisfy and does not
- An error path that leaves data half-written with no compensation
- Secrets or PII in a log or response

Things that are **not** blocking, however much you dislike them:
- Code you would have structured differently
- A missing test for a case that already works
- A performance concern with no measurement
- A pattern inconsistency
- Something that would only break under conditions the system prevents

**If everything is blocking, nothing is.** The label works by being rare. A reviewer who blocks
routinely gets routed around within a month.

---

## The failure scenario test

Every finding at MINOR or above names a **concrete failure**: specific inputs or state → wrong
output, crash, or corruption.

If you cannot write that sentence, the finding is an Observation. This single test resolves most
severity disputes before they happen, because writing the scenario forces you to check whether the
path is reachable.

```markdown
### BLOCKING — Concurrent redemption allows double credit
**Location**: `src/credits/redeem.ts:44`
**Problem**: Balance is read, checked, then written without a lock or version check.
**Failure scenario**: Two requests with the same coupon arrive in the same tick. Both read
balance 100, both pass the `>= 50` check, both write 50. The user redeemed twice for one
deduction.
**Fix**: Conditional update — `UPDATE ... SET balance = balance - 50 WHERE id = ? AND
balance >= 50` — and treat zero affected rows as insufficient funds.
```

Note what the scenario does: it makes the finding **arguable**. The author can say "those requests
cannot arrive concurrently because X", and either they are right and you learn something, or they
are wrong and the finding is confirmed. A finding with no scenario cannot be argued with, only
complied with or ignored.

---

## Routing: minor or blocking

Pipeline Rule 3. The orchestrator classifies, but your severity is the input.

The distinguishing question: **does fixing this change the design?**

| Finding | Design change? | Class |
|---|---|---|
| Missing `await` on a promise | No | Minor |
| Missing authorization check on one endpoint | No — the pattern exists, this one is missing it | Minor |
| Authorization checked in the wrong layer, so the batch path bypasses it | Yes | Blocking |
| N+1 fixable with a batch fetch | No | Minor |
| N+1 that the data model forces | Yes | Blocking |
| Missing edge-case test | No | Minor |
| Code that cannot be tested without restructuring | Yes | Blocking |
| Error message exposes a stack trace | No | Minor |
| Retry wrapper around a non-idempotent charge | Yes — needs idempotency design | Blocking |

Note the pattern in the "yes" rows: the fix requires deciding something, not just writing something.
That is the line.

**When you cannot tell, say so and let the architect decide.** A cheap consultation beats
mis-routing — a blocking finding sent to the implementer produces two failed corrections and reaches
the architect anyway, one iteration later.

---

## The two-correction cap

Rule 3: two minor corrections per criterion, then it promotes to blocking.

Three "small" corrections on one criterion means the criterion was underspecified — a design problem
wearing an execution costume. Watch for this when reviewing a second or third round on the same
criterion, and say so rather than issuing a third minor.

---

## Verdicts

| Verdict | Means |
|---|---|
| **APPROVE** | No blocking or major findings. Minors are optional |
| **APPROVE WITH MINOR** | Merge once the listed minors are fixed. No re-review needed |
| **REQUEST CHANGES** | At least one blocking finding. Fix and re-review |

**APPROVE WITH MINOR is the most useful and least used.** It keeps the run moving while still
recording the findings. Reserve REQUEST CHANGES for actual blockers; using it for a preference costs
a full cycle and teaches the author to negotiate rather than fix.

---

## Severity inflation and deflation

Both are failure modes and both are common.

**Inflation** — marking preferences as majors. Usually comes from wanting the fix to actually
happen. The result is that severity stops carrying information and everything gets triaged by the
author's judgment instead of yours.

**Deflation** — softening a real finding to avoid conflict, especially with a senior author. This is
the worse one, because the defect ships and the review provided false assurance.

The corrective for both is the same: **write the failure scenario.** It is hard to inflate a finding
whose scenario reads "if someone manually passes a negative number to an internal function that
nothing calls", and hard to deflate one that reads "two concurrent users double-spend a coupon."

---

## Disagreement

When the author disputes a finding:

1. **Re-read their argument for the thing you might have missed.** They know the code better.
2. **If you were wrong, say so plainly and withdraw the finding.** No hedging, no "well, still".
3. **If you were right, restate the failure scenario** — not the opinion. The scenario is the
   argument.
4. **If it is still unresolved, it goes to the architect.** Cite the driver ranking in the
   architecture doc. Do not escalate on authority.

Never trade a finding away to preserve goodwill, and never hold one to win. Both corrupt the signal
that makes reviews worth running.

---

## Anti-patterns

- **Everything blocking.** The label stops carrying information; you get routed around.
- **A finding with no failure scenario.** Cannot be argued with, only complied with or ignored.
- **Blocking on a preference.** Costs a full cycle, teaches negotiation over fixing.
- **Softening a real finding for a senior author.** The defect ships with false assurance.
- **Mis-routing a design problem as minor.** Two failed corrections, then the architect anyway.
- **Issuing a third minor on the same criterion.** It was underspecified; promote it.
- **Never using APPROVE WITH MINOR.** Either you block unnecessarily or minors go unrecorded.
- **Escalating on authority rather than the scenario.** The scenario is the argument.
- **Holding a finding to win an argument.** Corrupts the signal.
