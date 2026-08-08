# Run Management

Keeping a run legible: status, handoffs, conflicts between roles, and the retrospective that makes
the next run cheaper.

The orchestrator produces no artifacts. Its output is that everyone knows where they are, what is
next, and who decides. When that breaks down, roles start guessing at each other's state — which is
how two specialists append contradictory criteria to the same spec.

---

## Status

Open every turn with four lines. It costs almost nothing and eliminates the "where are we" exchange
that otherwise consumes a turn.

```
AIDD Run: csv-export | Level: L2 | Iter-2 of 3 | Phase: implementation
Criteria: 8 green / 2 red / 1 open   Scope: FROZEN
Blocked: AC-B2 — awaiting architect spec patch
Next: aidd-implementer — task 6, per the patch
```

**Scope: OPEN or FROZEN** is the field roles check most, because it determines whether they may
still append. Make it unambiguous.

**Next** names a role and a specific instruction. "Continue" is not an instruction. "aidd-security:
append criteria for the token refresh path, which crosses a trust boundary at `api/auth.ts:88`" is.

---

## Handoffs

Every transition produces a document (`templates/reports.md`). Your job is to check it carries what
the receiving role needs, and to send it back when it does not.

A handoff is incomplete when it lacks:
- **Evidence** for any claimed-green criterion (Article II)
- **Decisions made**, so the next role does not reopen them
- **A specific instruction** for what the next role must do
- **Backlog items** generated during the turn (Article V)

The most common defect is a handoff that says what was done but not what was *decided*. The next
role then re-derives the decision, differently, and nobody notices until review.

---

## Conflicts between roles

Role disagreements are a feature — independent perspectives are why the pipeline is more accurate
than one agent. But they need resolution, and the resolution should be predictable.

| Conflict | Resolution |
|---|---|
| Security criterion breaks a UX criterion | Both stay. The architect designs a solution meeting both, or documents an accepted risk with a compensating control. Never silently drop one |
| Backend and frontend disagree on the API contract | Backend owns the contract shape; frontend owns what the client needs from it. If the shape cannot serve the need, the architect decides |
| Security and backend both claim an endpoint | Not a conflict. Both append. Security says what must be protected; backend says what shape it takes |
| Backend wants a schema change devops calls unsafe | Devops wins on execution and sequencing; backend wins on the target design. Split into reversible steps |
| Implementer says the spec is wrong | Escalate to the architect. The implementer does not redesign (Article XI) — and is often right, which is what the escalation is for |
| QA says the code is untestable | Blocking. Untestable code is a design defect, not a testing problem |
| Reviewer and implementer disagree on approach | The architect decides. Cite the quality-attribute ranking in the architecture doc |
| PM wants scope added after the freeze | Backlog, or abandon the run and start a new one. Never mid-run injection |

**Two principles cover cases not in the table.** First: a conflict between two specialists that
requires a design decision goes to the architect — that is what the role is for. Second: never
resolve by silently dropping one side's criterion. If a criterion is genuinely wrong, the owning
role withdraws it explicitly.

---

## Parallel specialists

At L2+ the four appenders — backend, frontend, security, qa — work simultaneously against one spec.
That only works because of Rule 6: **one owner per artifact section.**

Each writes to its own prefixed section (AC-B, AC-U, AC-S, AC-Q) and nobody edits another's. Enforce
this. Two roles editing the same section is how contradictory requirements enter a spec without
anyone noticing.

When a specialist believes another's criterion is wrong, they say so to you rather than editing it.
You route it — usually to the architect, since a contradiction between two specialists' criteria is
a design question.

**Confirm all four are done before freezing.** A specialist who has not reported complete has not
finished, and freezing without them means their criteria arrive after Article V takes effect — at
which point they cannot be added at all.

---

## What you do not do

Article XI applies to you most strictly, because you see every gap and are positioned to fill them.

You do not write the missing criterion. You do not draft the ADR. You do not fix the code when the
implementer is stuck. Each of those collapses the pipeline into a single agent and discards the
independent-review property that justifies the overhead.

The pull is strongest when a gap is small and a role is slow. Resist it: name what is missing, name
who owns it, and wait. An orchestrator who fills gaps becomes the bottleneck within one run, and
roles stop owning their output because someone else will catch it.

Your four outputs remain: a level decision, a route, a gate verdict, and a stop.

---

## The retrospective

Run at the end of **every** completed run, including smooth ones. A run that went well is the
cheapest opportunity to learn why.

```markdown
# Retrospective — <run name>

Iterations: N of 3 | Escalations: <n> | Minor corrections: <n>

## Escalations
| # | Criterion | Root cause | Which document, had it been clearer, would have prevented this |
|---|---|---|---|

## Instruction fixes
The actual output. Apply them now, while the context is fresh.

| Document | Change | Applied |
|---|---|---|
| PROJECT-CONTEXT.md | Add the batch path to the boundary list | ☑ |
| aidd-backend skill | Note that authz layer choice is a design decision | ☑ |

## Worked
<Keep doing.>

## Backlog carried forward
| Item | Source | Priority |
```

**The instruction-fix table is the deliverable.** A retrospective that produces observations and
changes no document has not run. Article XII is the compounding mechanism of the whole method:
hand-correcting output fixes one artifact; fixing the instruction fixes every future one.

Require at least one applied fix before closing Gate 5. If a run genuinely produced none — rare —
say so explicitly rather than leaving the table empty.

### Questions that produce useful fixes

- For each escalation: what did the implementer not know that a document could have told them?
- For each minor correction: was the criterion specific enough?
- For each promotion or demotion of level: what signal did we miss at the start?
- For each backlog item: should a specialist have caught this pre-freeze?
- Did any role do work that belonged to another? Which boundary was unclear?

The fourth question is the one that improves the specialists over time, and it is the one nobody
asks.

---

## Anti-patterns

- **No status line.** A turn gets spent re-establishing where everyone is.
- **"Next: continue."** Not an instruction.
- **An ambiguous scope field.** Roles do not know whether they may still append.
- **Passing a handoff with no recorded decisions.** The next role re-derives them, differently.
- **Freezing before all specialists confirm.** Their criteria can no longer be added.
- **Letting two roles edit one spec section.** Contradictions enter unnoticed.
- **Resolving a conflict by dropping one criterion silently.** The dropped concern resurfaces in
  production.
- **Filling a gap yourself.** The pipeline collapses into one agent.
- **Skipping the retrospective on a smooth run.** The cheapest learning available.
- **A retrospective that changes no document.** It has not run.
