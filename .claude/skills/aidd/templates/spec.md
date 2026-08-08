# Templates — Specification & Planning

The SDD spec is the contract between design and implementation. Every role reads the same
format, which is what makes handoffs mechanical instead of interpretive.

---

## SDD Spec

Owner: `aidd-architect` (L2+) or `aidd-planner` (L1) → `specs/<feature>/spec.md`

```markdown
# Spec: <name>  [Iter-N]

Level: L1 | L2 | L3
Status: draft | criteria open | FROZEN | closed
Owner: <role that wrote it>
Sources: <PRD section, architecture section, issue link>

## Current state
<What exists today. Cite file:line. If the answer is "nothing", say so — greenfield and
brownfield need different implementation approaches and this line is how the implementer
knows which one this is.>

## Target state
<What exists after. Observable from outside the code: an endpoint responds, a screen
renders, a job runs.>

## Acceptance criteria

Each criterion is a claim that is either true or false, checkable by a named command.
Prefixes let downstream roles append without collision, and let the implementer report
per-criterion.

### Functional
- [ ] AC-F1: <criterion> → verified by `<command>`
- [ ] AC-F2: <criterion> → verified by `<command>`

### Backend / data — appended by aidd-backend
- [ ] AC-B1: <criterion> → verified by `<command>`

### UX / accessibility — appended by aidd-frontend
- [ ] AC-U1: <criterion> → verified by `<command or manual check>`

### Security — appended by aidd-security
- [ ] AC-S1: <criterion> → verified by `<command>`

### Coverage / testability — appended by aidd-qa
- [ ] AC-Q1: <criterion> → verified by `<command>`

## Artifacts
| Path | Change | New or modified |
|---|---|---|

## Constraints
<What must not change: public contracts, schemas, behaviors other code depends on. Also
what is out of scope, phrased so an eager implementer cannot read it as an invitation.>

## Dependencies
<What must exist first. Blocked criteria are named here rather than discovered mid-loop.>

## Open questions
- [NEEDS CLARIFICATION: <question>] — blocks: AC-Fn

---
## Freeze record
Frozen at: <timestamp>
Criteria count at freeze: <n>
From this point, Article V applies. New findings → BACKLOG.md.
```

**The criteria test.** Before freezing, read each criterion and ask: *could two engineers
disagree about whether this is met?* If yes, it is not a criterion yet. "Handles errors
gracefully" fails. "A malformed payload returns 400 with `{code, message}` and logs at
WARN" passes.

---

## Spec Patch

Owner: `aidd-architect`. Issued on escalation. Never a rewritten spec — the delta is the
whole point, because a rewrite silently invalidates criteria that were already green.

```markdown
# Spec Patch [Iter-N] — <original spec name>

Original: specs/<feature>/spec.md
Trigger: <implementer escalation | qa blocking finding | review blocking finding>

## Failed criterion
<Exact criterion text.>

## Diagnosis received
<The implementer's three attempts, verbatim. Do not paraphrase — the exact errors are
the evidence for the design change.>

## Root cause
<Why it failed. Distinguish: wrong design, missing information, or a bad criterion.>

## Design adjustment
<Only what changes. If nothing about the design changes and the criterion was simply
wrong, say that — a bad criterion is a legitimate outcome and cheaper to admit than to
engineer around.>

## Criteria changes
Removed:  - AC-Fn <why it was wrong>
Modified: - AC-Fn: <new text>
Added:    - [ ] AC-Fn: <new criterion> → verified by `<command>`

## Unchanged
Every other criterion remains in force and keeps its current green/red state.

## Routing
Goes to: aidd-implementer
Re-review needed by: <none | aidd-security if security surface changed | aidd-frontend if
UI changed>
```

---

## Plan — `specs/<feature>/plan.md`

Owner: `aidd-planner` (creates) → `aidd-implementer` (updates).

The Ralph loop's state file. Read from disk at the start of every iteration and written at
the end of every iteration. Never held in context.

Lives **next to its spec**, never at the repo root. `.aidd-active` at the root holds one line —
the feature slug — and is the loop's entry point:

```
.aidd-active            → csv-export
specs/csv-export/
  spec.md               the frozen contract
  plan.md               this file
```

Plans are never archived or moved. A closed run's plan stays in place with its attempt log; a
second feature gets its own directory, so nothing is ever overwritten.

```markdown
# Implementation Plan — <feature>

Spec: specs/<feature>/spec.md
Iteration: Iter-N
Verify: `<the project's verify command>`
Status: planning | executing | escalated | DONE

## Tasks

Ordered. Atomic — one task, one commit. Each names the check that proves it.

- [x] 1. <task> → <files> → `<check>` — commit a1b2c3d
- [ ] 2. <task> → <files> → `<check>`                    ← NEXT
- [ ] 3. <task> → <files> → `<check>`                    (blocked by 2)
- [ ] 4. <task> → <files> → `<check>`

## Criteria coverage

Proves the plan actually satisfies the spec. An uncovered criterion means the plan is
incomplete; a task covering nothing means it is out of scope.

| Criterion | Covered by task |
|---|---|
| AC-F1 | 2, 3 |
| AC-S1 | 4 |

## Attempt log

Append on every failure. This table is the escalation report when a task hits three.

| Task | Attempt | Change made | Result |
|---|---|---|---|
| 2 | 1 | <what> | <exact error output> |

## Escalations
<none>
```

---

## Escalation Report

Owner: whichever role hits the three-attempt cap. Article VI.

```markdown
# Escalation — blocking criterion

Criterion: <exact text>
Task: <plan task number>
Iteration: Iter-N of 3
Attempts: 3/3

## Attempts
| # | Hypothesis | Change | Result |
|---|---|---|---|
| 1 | <what I thought was wrong> | <what I did> | <exact error> |
| 2 | | | |
| 3 | | | |

## What I ruled out
<Explicitly: the hypotheses now known to be false. This is the most valuable part of the
report — it is what stops the next reader from repeating attempt 1.>

## Probable root cause
<Technical hypothesis, with the evidence supporting it.>

## What I need
<The specific decision required. Not "help" — a question with two or three answers.>

## State
Committed: <what is on disk and green>
Reverted: <what I backed out>
Green criteria: <list — these are frozen per Rule 2>
```
