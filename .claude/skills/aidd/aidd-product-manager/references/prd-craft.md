# PRD Craft

Writing a requirements document that engineers can build from and testers can verify against.

The failure mode is not length. It is a document that reads as complete while leaving every hard
question unanswered — and hard questions left unanswered get answered by whoever implements them,
silently, at the worst moment.

---

## What a PRD is for

One thing: **so that the person building it does not have to guess.**

That reframes every editing decision. Not "is this section conventional?" but "would an engineer
have to guess without it?" Sections that fail that test are ceremony. Sections that pass it stay,
however awkward.

It is also read by people who were not in any of the meetings — a reviewer three months from now, a
new engineer, `aidd-qa` at the freeze gate. Write for them.

---

## Structure

```markdown
# PRD — <name>

Brief: docs/product/brief.md
Status: draft | in review | approved
Scale level: L2 | L3

## Summary
<Three sentences: the problem, what we are building, how we will know it worked.>

## Goals
| # | Goal | Metric | Target |

## Non-goals
<What we are explicitly not solving.>

## Users and permissions
| Role | Can | Cannot |

## Epics and stories
<With acceptance criteria per story.>

## Cross-cutting requirements
<Stated once, applied to all.>

## Release strategy
| Phase | Contents | Gate to next |

## Open questions
- [NEEDS CLARIFICATION: …] — owner — blocks
```

**The summary earns the rest of the document.** Three sentences that state the problem, the shape of
the solution, and the success measure. If you cannot write it, the PRD is not ready — and writing it
last, after the body, is usually how you find that out.

---

## Write for the engineer who will implement it

Concrete moves that raise a PRD's usefulness more than any structural change:

**Give real examples, not schemas.** `"name": "Acme Corp"` teaches more than `"name": "string"`.
Realistic sample data reveals shape, size, and edge cases in a way a type never does.

**State the numbers.** How many records typically? What is the largest a customer has? How often
does this run? These determine the design and are invisible to someone who has not talked to users.
An engineer who does not know will assume "small", and that assumption becomes an outage.

**Name the existing thing.** "Like the invoice export, but for reports" saves a page of description
and produces a more consistent product.

**Say what happens on failure.** For every external dependency: what does the user see when it is
down, slow, or wrong? This is the most common gap between a PRD that looks complete and one that is.

**Do not specify the solution.** If your PRD names a database, a queue, or a framework, you have made
an architectural decision without the architect's analysis. Describe the requirement — including its
performance and consistency needs — and let `aidd-architect` choose.

The line: **"exports must be available within 5 minutes and survive a server restart"** is a
requirement. **"use a Redis-backed job queue"** is a solution.

---

## Users and permissions

A short table that prevents a whole class of defects, because permission questions are the ones
engineers most often answer by guessing.

```markdown
| Role | Can | Cannot |
|---|---|---|
| Viewer | Read reports in their own workspace | Export; see other workspaces |
| Editor | Everything Viewer can, plus create and edit | Delete; manage members |
| Admin | Everything | Change billing (owner only) |
```

Then answer, once, in cross-cutting: **when someone lacks permission, is the control hidden or shown
disabled?** And: **does an unauthorized request to a specific record return 403 or 404?** Both have
defensible answers; only one is right for your product, and 403 leaks the record's existence.

---

## Cross-cutting requirements

State once, apply everywhere. Repeating them per story guarantees they diverge.

```markdown
| Area | Requirement |
|---|---|
| Auth | Per-object authorization, server-side, on every ID-addressable resource |
| Audit | Actor, timestamp, before/after for any change to billing or permissions |
| Retention | Soft-deleted records purged after 30 days |
| Accessibility | WCAG 2.2 AA |
| Performance | p95 under 300ms for list endpoints at 10k rows |
| Localization | All user-facing strings externalized; dates in the user's locale |
| Error handling | User-facing errors never expose internal detail; all logged with correlation ID |
```

`aidd-planner` attaches the relevant rows to each story so they arrive with the work rather than
living in a document nobody re-reads.

---

## Release strategy

Phase by **learning**, not by convenience. Each phase names the condition that opens the next.

```markdown
| Phase | Contents | Gate to next |
|---|---|---|
| 1 | Core export, CSV only, one workspace, flagged to 5 design partners | 20 exports completed; error rate under 1%; no support escalations |
| 2 | Scheduled exports + all formats, general availability | Phase-1 metrics hold for 2 weeks |
```

**A gate that is a date is not a gate.** "Two weeks later" tells you when, not whether. The condition
is what makes it a decision point, and it is what `aidd-devops` needs for the watch window.

---

## Open questions

The section that distinguishes an honest PRD from a complete-looking one.

```
[NEEDS CLARIFICATION: what happens to scheduled exports when a workspace is deleted?]
— owner: legal — blocks: Story 3.2
```

Three parts, all required: the question, who decides, and what it blocks. Without the owner it stays
open forever; without the blocked item nobody knows its urgency.

A PRD shipped with three labeled unknowns is more useful than one that looks finished because you
guessed three times (Article X). The guesses become requirements, then code, then defended behavior.

---

## Reviewing your own draft

Before handing off, read it as the implementer:

- [ ] Could I build this without asking a question? Mark every place the answer is no
- [ ] Is every criterion verifiable by a named command?
- [ ] Are all seven edge-case states answered for each story? (`acceptance-criteria.md`)
- [ ] Is every user-visible string specified, including errors?
- [ ] Have I stated volumes, frequencies, and the largest realistic case?
- [ ] Have I said what happens when each dependency fails?
- [ ] Does the Non-goals section name what a reader will assume is included?
- [ ] Have I accidentally specified a solution?
- [ ] Does every story trace to a goal, and every goal to a metric?
- [ ] Would a reader who attended no meetings understand why we are doing this?

---

## Anti-patterns

- **A summary written first and never revised.** It is the last thing you should be able to write.
- **Specifying the solution.** Removes the architect's ability to weigh trade-offs you did not see.
- **Schemas instead of examples.** `"string"` teaches nothing about shape or size.
- **No volumes.** The engineer assumes "small"; production disagrees.
- **Silence on dependency failure.** The most common gap in a complete-looking PRD.
- **Permission behavior left unstated.** Hidden or disabled? 403 or 404? Both get guessed.
- **Cross-cutting requirements repeated per story.** They will diverge.
- **Phase gates that are dates.** Tells you when, not whether.
- **Open questions with no owner.** Open forever.
- **A document that reads as complete because you guessed.** The guesses become defended behavior.
