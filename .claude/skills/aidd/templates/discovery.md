# Templates — Discovery & Definition

Used by `aidd-analyst` and `aidd-product-manager`. L3 runs start here.

---

## Product Brief

Owner: `aidd-analyst` → `docs/product/brief.md`

```markdown
# Product Brief — <name>

## Problem
<The problem in the user's words, not the solution's. If this paragraph contains a
technology name, it is probably a solution in disguise.>

## Evidence
<Why we believe this problem is real: support tickets, interviews, analytics, a
competitor's existence. If there is no evidence, say "assumption, untested".>

## Who has it
| Segment | Size | Pain intensity | Currently does |
|---|---|---|---|

## Job to be done
When <situation>, I want to <motivation>, so I can <expected outcome>.

## Alternatives considered
| Approach | Why it could work | Why we are not doing it |
|---|---|---|
<Always include "do nothing" and "buy instead of build".>

## Recommended direction
<One paragraph. What we propose and the single reason it beats the alternatives.>

## Success metrics
| Metric | Baseline today | Target | How measured |
|---|---|---|---|
<A metric with no baseline cannot show improvement. If the baseline is unknown,
measuring it is the first task.>

## Non-goals
<What we are explicitly not solving. This section prevents more scope creep than any
other.>

## Open questions
- [NEEDS CLARIFICATION: <question>] — blocks: <what it blocks>

## Risks
| Risk | Likelihood | Impact | Early signal we would see |
|---|---|---|---|
```

---

## PRD

Owner: `aidd-product-manager` → `docs/product/prd.md`

```markdown
# PRD — <name>

Brief: docs/product/brief.md
Status: draft | in review | approved
Scale level: L2 | L3

## Summary
<Three sentences: problem, what we are building, how we will know it worked.>

## Goals
| # | Goal | Metric | Target |
|---|---|---|---|

## Non-goals
<Carried forward from the brief, plus anything cut during PRD review.>

## Users and permissions
| Role | Can | Cannot |
|---|---|---|

## Epics

### Epic 1 — <name>
**Outcome**: <the user-visible change when this epic ships>
**Priority**: must | should | could
**Depends on**: <epic, or none>

#### Story 1.1 — <name>
As a <role>, I want <capability>, so that <benefit>.

Acceptance criteria:
- [ ] Given <state>, when <action>, then <observable result>
- [ ] Given <state>, when <action>, then <observable result>

Edge cases:
- <empty state / concurrent action / permission denied / offline / invalid input>

Out of scope for this story:
- <the adjacent thing a reader will assume is included>

## Cross-cutting requirements
Stated once here rather than repeated per story. The planner attaches the relevant ones
to each story.

| Area | Requirement |
|---|---|
| Auth | |
| Data retention | |
| Audit | |
| Accessibility | |
| Performance | |
| Localization | |
| Error handling | |

## Release strategy
| Phase | Contents | Gate to next phase |
|---|---|---|

## Open questions
- [NEEDS CLARIFICATION: <question>] — owner: <who decides> — blocks: <story>
```

---

## Story shard

Owner: `aidd-planner`. One file per story for L3 work: `specs/<epic>/<story>.md`

````markdown
# Story <epic>.<n> — <name>

PRD: docs/product/prd.md#story-<n>
Architecture: docs/architecture/architecture.md#<section>
Status: ready | in progress | in review | done
Estimate: <S | M | L — L means shard it further>

## Context the implementer needs
<The point of sharding. Everything needed to implement this without reading the PRD or
the architecture doc: the relevant patterns, the files involved, the existing code to
follow, the decisions already made and not to be reopened.>

## Acceptance criteria
- [ ] <functional, from the PRD>
- [ ] <security, appended by aidd-security>
- [ ] <a11y / UX, appended by aidd-frontend>
- [ ] <coverage / testability, appended by aidd-qa>

## Artifacts
| Path | Change |
|---|---|

## Verification
```bash
<the exact command that proves this story is done>
```

## Do not change
<Files or behaviors this story must leave alone.>
````
