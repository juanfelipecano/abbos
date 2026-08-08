# Templates — Handoffs & Reports

Every transition between roles produces one of these. A handoff without a document is a
handoff that loses information — which then gets re-derived, wrongly.

---

## Handoff

Every role ends its turn with this. Article II applies: claims carry evidence.

```markdown
## Handoff → <next role>

**From**: <role>  |  **Iteration**: Iter-N  |  **Level**: L<n>

### Produced
| Artifact | Path | Status |
|---|---|---|

### Decisions made
Do not reopen these without escalating.

| Decision | Rationale |
|---|---|

### State of criteria
| Criterion | Status | Evidence |
|---|---|---|
| AC-F1 | ✅ | <command output> |
| AC-F2 | ⬜ not started | |
| AC-S1 | ❌ | <failure> |

### What the next role must do
<Specific. "Review the spec" is not an instruction; "append security criteria for the
token refresh path, which crosses a trust boundary at api/auth.ts:88" is.>

### Open items
- [NEEDS CLARIFICATION: <question>] — blocks: <criterion>

### Backlog generated
Article V — found during this turn, deliberately not acted on.
| Finding | Why deferred |
|---|---|
```

---

## Implementation Report

Owner: `aidd-implementer`.

````markdown
## Implementation complete — <spec name> [Iter-N]

### Changes
| File | Lines | Change | Criterion |
|---|---|---|---|

### Criteria
| Criterion | Status | Evidence |
|---|---|---|
| AC-F1 | ✅ | `<command>` → <output> |

### Verification
```
<verbatim output of the verify command — pasted, not summarized>
```

### Tests
| Test | Covers | New or modified |
|---|---|---|

### Commits
| SHA | Task | Message |
|---|---|---|

### Deviations from spec
<none, or: what differed, why, and why it was not an escalation>

### Not done
<Criteria left red and why. Never omit this section to make the report look clean —
a silently skipped criterion is the most expensive kind of defect, because the next role
assumes it passed.>
````

---

## QA Report

Owner: `aidd-qa` → `docs/qa/<feature>-report.md`

```markdown
# QA Report — <feature> [Iter-N]

Spec: specs/<feature>/spec.md
Verdict: **PASS** | **PASS WITH MINOR FINDINGS** | **FAIL — BLOCKING**

## Criteria verification
Independent verification. Re-run every check rather than trusting the implementer's
report — that independence is the entire reason this gate exists.

| Criterion | Claimed | Verified | Evidence |
|---|---|---|---|
| AC-F1 | ✅ | ✅ | <output> |
| AC-F2 | ✅ | ❌ | <what actually happened> |

## Coverage
| Metric | Bar | Actual | Pass |
|---|---|---|---|
| New-code coverage | | | |

Untested paths that matter:
| Path | Risk | Recommendation |
|---|---|---|

## Test quality
Coverage percentage is a floor, not evidence of quality. Look for:
- [ ] Tests fail when the implementation is broken (mutate one line and confirm red)
- [ ] Assertions check behavior, not implementation detail
- [ ] Edge cases present: empty, boundary, invalid, concurrent, permission-denied
- [ ] No test depends on another test's side effects
- [ ] No sleeps or wall-clock timing
- [ ] Failure messages identify the cause without a debugger

## Exploratory findings
Beyond the criteria. Triaged per Rule 3.

| # | Finding | Class | Repro | Route |
|---|---|---|---|---|
| 1 | | minor / blocking | | implementer / architect |

## Regressions
| Area | Before | After |
|---|---|---|
<Empty is a valid answer, but only after you ran the existing suite.>
```

---

## Code Review

Owner: `aidd-code-reviewer`. Adversarial: the job is to find what is wrong, and "looks
good" is a finding only after a genuine attempt to break it.

```markdown
# Code Review — <feature> [Iter-N]

Diff: <range or PR>  |  Spec: specs/<feature>/spec.md
Verdict: **APPROVE** | **APPROVE WITH MINOR** | **REQUEST CHANGES — BLOCKING**

## Spec traceability
| Criterion | Implemented in | Faithful |
|---|---|---|

Changes not traceable to any criterion (Article III):
| File:line | Change | Assessment |
|---|---|---|

## Findings
Severity ordered. Each names a concrete failure, not a preference.

### <BLOCKING | MAJOR | MINOR> — <one-line title>
**Location**: `file.ext:line`
**Problem**: <what is wrong>
**Failure scenario**: <specific input or state → wrong output. If you cannot write this
line, it is a style opinion; move it to Observations or drop it.>
**Fix**: <the concrete change>

## Reviewed and sound
<What you checked and found correct. Tells the next reader where not to re-spend effort.>

## Observations
Not findings. No action required, no response expected.
```

---

## Release Record

Owner: `aidd-devops`.

````markdown
# Release — <version>

Date: | Contents: <specs and stories included>

## Pre-flight
- [ ] CI green on the release commit
- [ ] Migrations reversible, or forward-only with a documented reason
- [ ] Config and secrets present in the target environment
- [ ] Feature flags set to their intended launch state
- [ ] Rollback verified, not just written down

## Rollback
```bash
<the exact commands>
```
Data implications: <what a rollback cannot undo — this is the part people discover during
the incident>

## Observability
| Signal | Where | Alert threshold |
|---|---|---|

## Post-deploy verification
| Check | Command | Result |
|---|---|---|

## Watch window
Duration: <e.g. 60 min>  |  Abort if: <specific metric crosses a specific threshold>
````

---

## Retrospective

Run at the end of every completed run. Article XII: the output is a document to improve,
not a feeling.

```markdown
# Retrospective — <run name>

Iterations used: N of 3  |  Escalations: <n>  |  Elapsed: <time>

## Escalations
| # | Criterion | Root cause | Which document, had it been clearer, would have prevented this |
|---|---|---|---|

## Instruction fixes
The actual output of this retro. Apply them now, while the context is fresh.

| Document | Change | Applied |
|---|---|---|
| PROJECT-CONTEXT.md | | ☐ |
| <role> skill | | ☐ |
| CONSTITUTION.md | | ☐ |

## Worked
<Keep doing.>

## Backlog carried forward
| Item | Source | Priority |
|---|---|---|
```
