# Gates

Running the five checkpoints, and refusing well when something is missing.

A gate is worth exactly as much as your willingness to fail it. A gate that has never sent anything
back is not a checkpoint — it is a status update, and every role downstream has learned it can be
ignored.

---

## What a gate verdict looks like

Never "looks fine". Two forms only:

```
GATE 3 — SCOPE FREEZE: PASS
All 11 criteria testable and prefixed. Specialists confirmed complete.
specs/csv-export/plan.md covers all 11; all 9 tasks map to a criterion. .aidd-active set.
Article V now in force. Frozen at 2026-07-30T14:22.
```

```
GATE 3 — SCOPE FREEZE: HELD
AC-F4 "handles large exports gracefully" has no verification command.
→ aidd-qa: rewrite as a testable criterion, or drop it.
Everything else is ready; this is the only blocker.
```

The held form names **one specific missing item and who fixes it.** A vague hold ("needs more
detail") produces a revision that misses the point and a second hold, which is how gates acquire
their reputation for being obstacles.

---

## Gate 1 — Definition (L3 only)

Passing the analyst's brief to the product manager.

- [ ] The problem is stated as a problem, not a solution
- [ ] There is evidence, or the absence of evidence is labeled `[assumption: untested]`
- [ ] Success metrics have baselines, or measuring the baseline is task one
- [ ] Non-goals are named specifically
- [ ] Alternatives include "do nothing" and "buy instead of build"
- [ ] Open questions have owners

**The common hold:** a metric with no baseline. Without one the project can never be evaluated, which
means it can never be stopped. Holding here costs a day; not holding costs the ability to ever know
whether it worked.

**The other common hold:** the problem statement names a technology. That is a solution wearing a
problem's grammar, and it will constrain the architecture before anyone has evaluated alternatives.

---

## Gate 2 — Design (L2+)

Passing the architect's work to the specialists.

- [ ] Quality attributes are ranked, strictly, with justification
- [ ] Trade-offs record the options considered and why one won
- [ ] Rejected alternatives are named — they will be re-proposed otherwise
- [ ] Decisions have "revisit when" conditions, stated as conditions not dates
- [ ] Component dependencies have a direction, with no cycles
- [ ] Cross-cutting concerns are decided once
- [ ] Failure modes are named for each external dependency
- [ ] Base criteria are observable from outside the code

**The common hold:** a design that optimizes for everything. If the quality attributes are unranked
or tied, no decision has been made and every downstream disagreement will have no tie-breaker.

**The second:** criteria that describe implementation rather than behavior. "Uses the repository
pattern" is a design note, not a criterion — it belongs in the architecture doc where it will not be
mistaken for something testable.

---

## Gate 3 — Scope freeze

**The important one.** Everything after this operates under Article V, and you are the one who says
no.

- [ ] Every criterion is testable by a **named command**
- [ ] Every criterion has an owner prefix (AC-F / AC-B / AC-U / AC-S / AC-Q)
- [ ] Each participating specialist has appended and confirmed they are done
- [ ] No `[NEEDS CLARIFICATION]` blocks any criterion
- [ ] `specs/<feature>/plan.md` covers every criterion
- [ ] `.aidd-active` names this feature
- [ ] Every task maps to at least one criterion
- [ ] The verify command has been run and works
- [ ] The freeze record is stamped in the spec

**Run the two-engineer test on every criterion.** Could two competent engineers disagree about
whether it is met? If yes, hold. This takes about a minute per criterion and prevents the most
expensive category of iteration.

**Expect pressure here.** Someone will want to freeze with one criterion still vague, or to add "one
small thing" after freezing. The whole value of the gate is that it holds — a gate that yields under
pressure has taught everyone that pressure works.

The freeze is also where you check the *last* opportunity for cheap changes. After this, a spec
change costs an iteration.

---

## Gate 4 — Validation

After QA reports.

- [ ] QA **independently re-ran** every check — did not quote the implementer's evidence
- [ ] Every criterion has evidence attached
- [ ] Discrepancies between claimed and verified are stated explicitly
- [ ] The existing suite ran, and regressions are reported or explicitly absent
- [ ] Untested risk is named rather than omitted

**The common hold:** a QA report whose evidence column is copied from the implementation report. That
is not a second opinion, and independence is the entire reason this gate exists. Send it back.

**The second:** a report with no "not done" or "untested risk" section. A clean-looking report is
usually a report with omissions, because real work has loose ends.

---

## Gate 5 — Closure

Before the architect signs off.

- [ ] All criteria green, each with pasted evidence
- [ ] Review verdict is APPROVE or APPROVE WITH MINOR
- [ ] Listed minors are actually fixed
- [ ] No unexplained deviations from the spec
- [ ] Release path documented, rollback verified not just written
- [ ] Backlog items from the run are recorded in `BACKLOG.md`
- [ ] Retrospective produced at least one **applied** instruction fix
- [ ] The plan's `Status:` is set to `DONE`
- [ ] `.aidd-active` is cleared — an empty pointer means no run is in flight

The plan stays at `specs/<feature>/plan.md`. It is never moved, archived, or deleted: its
attempt log is what answers "why was this built this way" a year from now, and it belongs
next to the spec it implemented. A second feature gets its own directory, so nothing
collides and nothing needs cleaning up.

**The common hold:** a retrospective that lists observations and changes nothing. Article XII is the
compounding mechanism of the method — a run that produced no instruction improvement wasted its most
valuable output. Ask directly: *which document, had it been clearer, would have prevented each
escalation?* Then require the edit before closing.

---

## Holding without stalling

The risk of taking gates seriously is that the run stops moving. Three practices prevent it.

**Hold once, specifically.** Name every problem in one verdict rather than discovering them
serially. A gate that holds three times in a row for three different reasons was not run carefully
the first time.

**Distinguish blocking from noted.** Not every imperfection holds the gate:

```
GATE 2 — DESIGN: PASS with notes
Blocking: none.
Noted (not blocking): the caching decision has no "revisit when" condition.
→ aidd-architect: add it before sign-off, not now.
```

**Route the fix, do not do it.** You do not write the missing criterion or the ADR. Name what is
missing and who owns it (Article XI). An orchestrator who fills gaps becomes the bottleneck and
removes the incentive for roles to do it properly.

---

## Anti-patterns

- **A gate that has never held anything.** A status update wearing a checkpoint's name.
- **"Needs more detail" as a hold reason.** Produces a revision that misses the point.
- **Holding serially for different reasons.** The first pass was not careful.
- **Yielding at the freeze under pressure.** Teaches everyone that pressure works.
- **Passing criteria that fail the two-engineer test.** The most expensive iterations start here.
- **Accepting QA evidence copied from the implementer.** Not a second opinion.
- **Passing a clean report with no loose ends.** Real work has them; their absence means omission.
- **Closing on a retrospective that changed no document.** The run's most valuable output, discarded.
- **Fixing the gap yourself.** You become the bottleneck and roles stop owning their output.
- **Holding on something that could be noted.** Costs a cycle for nothing.
