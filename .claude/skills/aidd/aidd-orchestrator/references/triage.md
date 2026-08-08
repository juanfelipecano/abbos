# Triage

Classifying post-implementation findings and routing them, which is what keeps a validation phase
from becoming an unbounded loop.

Three roles validate after implementation — `qa`, `code-reviewer`, and the specialists. Each
produces findings. Without triage, every finding routes to whoever is nearest, and the run cycles.

---

## The classifying question

> **Does fixing this change the design?**

| Answer | Class | Route | Cost |
|---|---|---|---|
| No — the approach is right, a detail is incomplete | **Minor** | `implementer`, one added criterion | One turn |
| Yes — the approach is wrong, or the spec had a design error | **Blocking** | `architect` → spec patch → Iter-N+1 | One iteration |

Everything else is elaboration on that question.

---

## Worked classifications

The pattern to internalize: minor findings need someone to *write* something; blocking findings need
someone to *decide* something.

| Finding | Class | Why |
|---|---|---|
| Missing `aria-label` on an icon button | Minor | Add the attribute |
| A custom `div` widget with no keyboard support | Blocking | The component must be rebuilt on native semantics |
| Missing rate limit on one endpoint | Minor | The pattern exists; apply it here |
| Authorization checked in the controller, so the batch path bypasses it | Blocking | Which layer owns the check is a design decision |
| N+1 fixable with a batch fetch | Minor | Add the batch fetch |
| N+1 that the data model forces | Blocking | The model changes |
| `limit` not capped | Minor | Add the cap |
| Coverage at 78% against an 80% bar | Minor | Add tests |
| Code that cannot be tested without restructuring | Blocking | Untestable design is a design defect |
| Error message exposes a stack trace | Minor | Change the handler |
| Retry wrapper around a non-idempotent charge | Blocking | Needs idempotency design |
| A criterion the implementer skipped | Neither — unfinished work | Back to `implementer`; no new criterion |
| A regression in previously-green behavior | Neither — new run | Rule 2: green criteria are frozen |

Those last two matter. **An unmet criterion is not a finding** — it is work that was reported done
and was not. It goes back without ceremony. **A regression opens a separate run** rather than
reopening a frozen criterion, which is what stops the fix-one-break-another cycle.

---

## The two-correction cap

Rule 3: **two minor corrections per criterion, then it promotes to blocking.**

Three "small" fixes on one criterion means the criterion was underspecified. That is a design
problem wearing an execution costume, and continuing to issue minors will produce a fourth.

Track it. The count is per criterion, not per finding:

```
AC-U3 — correction 2 of 2. A third promotes to blocking.
```

When you hit the cap, say why explicitly:

> AC-S2 has taken two corrections. Promoting to blocking — the criterion "session handling is
> secure" is not specific enough to implement against, which is why each fix reveals another gap.
> → aidd-architect: spec patch splitting this into specific criteria.

---

## Scope, not severity

The distinction most often confused. **Severity is how bad it is. Class is where it goes.** They are
independent.

- A **Critical security finding** with a one-line fix is *minor* by class — it routes to the
  implementer — while being the most urgent thing in the run.
- A **cosmetic layout issue** caused by the wrong state-management approach is *blocking* by class,
  because fixing it properly changes the design.

The one place severity overrides routing: **Critical and High security findings stop the run
regardless of class.** Article V protects convergence, not shipping a known compromise. A High
finding does not go to the backlog.

---

## Findings outside the criteria

Validators will find things nobody specified. Article V says these go to `BACKLOG.md` — with three
exceptions.

| Finding | Where |
|---|---|
| Something that would be nice | Backlog |
| A pre-existing issue the diff did not cause | Backlog |
| A gap in a criterion nobody wrote | Backlog, **and** a retrospective item |
| **Critical or High security** | Stops the run |
| **A regression in existing behavior** | New run, immediately |
| **Data loss or corruption** | Stops the run |

The middle column of that table is what keeps validators honest. A validator who cannot backlog
anything will inflate findings to get them addressed; one who can backlog everything will let real
problems through. Both routes need to exist and be used.

**The "gap in a criterion nobody wrote" row deserves attention.** It means a specialist missed
something pre-freeze. That is exactly the Article XII signal — the fix is not just the backlog item,
it is asking why the specialist's pass did not catch it.

---

## Who classifies

**You do.** Not the finder.

A finder naturally over-rates their own finding — they just spent effort on it and it feels
significant. That is not dishonesty, it is proximity. Independent classification is the same
principle that makes the pipeline work at all.

When you cannot tell, **ask the architect.** A cheap consultation beats mis-routing:

- Mis-routing a blocking finding as minor produces two failed corrections, then reaches the architect
  anyway — one iteration later and with two wasted turns.
- Mis-routing a minor as blocking costs a full iteration for something that needed one line.

The first error is more common and more expensive.

---

## Batching

Do not route findings one at a time. Collect everything from a validation round, classify together,
and route once.

```markdown
## Triage — Iter-1 validation

### Blocking (1) → aidd-architect
- Authorization in controller layer; batch path bypasses it. (from code-reviewer)

### Minor (4) → aidd-implementer
- Missing `aria-label` on export button (frontend)
- `limit` not capped (backend)
- Stack trace in 500 response (security)
- No test for the empty-result case (qa)

### Backlog (3)
- `formatRow` duplicates `src/csv/format.ts` (reviewer, observation)
- Pre-existing: invoices endpoint has the same missing cap (backend)
- Consider a shared pagination helper (reviewer)

### Counts
AC-S1: correction 1 of 2. All others: first correction.
```

Batching matters because the implementer can fix four minors in one pass with one verify run.
Serial routing produces four round trips and four verify cycles for the same work.

---

## Anti-patterns

- **Letting the finder self-route.** Proximity inflates severity.
- **Confusing severity with class.** A Critical one-liner is minor by class and urgent by severity.
- **Backlogging a High security finding.** Article V protects convergence, not compromise.
- **Reopening a frozen criterion for a regression.** That is a new run (Rule 2).
- **Treating an unmet criterion as a finding.** It is unfinished work; no new criterion needed.
- **Issuing a third minor on one criterion.** It was underspecified. Promote it.
- **Routing findings serially.** Four round trips for what one pass would fix.
- **Never using the backlog.** Validators inflate findings to get them addressed.
- **Backlogging everything.** Real problems ship.
- **Guessing on an unclear classification.** Ask the architect; it is one cheap turn.
