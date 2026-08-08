# Acceptance Criteria

The only part of a PRD that gets verified. Everything else is context.

A criterion is a claim that is either true or false, checkable by someone who was not in the room.
Everything in this file serves that one definition.

---

## The two-engineer test

> Could two competent engineers read this criterion and disagree about whether it is met?

If yes, it is not a criterion yet. This test is faster than any checklist and it catches almost
everything.

| Fails | Passes |
|---|---|
| Page loads fast | LCP under 2.5s on a throttled 4G profile, 75th percentile |
| Handles errors gracefully | A 500 from the pricing service shows the cached price with a stale-data notice and logs at WARN |
| Intuitive interface | A first-time user completes setup without opening help — 5 of 6 in usability test |
| Secure endpoint | Requests without a valid token return 401 with no response body |
| Reasonable limits | `limit` above 100 returns 400 with code `LIMIT_EXCEEDED`; no query executes |
| Works on mobile | Usable at 320px width with no horizontal scroll |

The left column takes ten seconds to write and produces weeks of rework. The right column takes two
minutes and produces a testable contract. That ratio is the entire argument.

---

## Given / When / Then

The format is not magic. It works because it forces three things that vagueness cannot survive: a
starting state, a trigger, and an observable result.

```
Given a user with an expired subscription
When they open the reports page
Then they see the upgrade prompt and no report data
```

**Given** — the precondition. Be specific about state. "Given a user" is almost always
underspecified; which user, in what state, with what data?

**When** — one action. If you need "and", you have two criteria.

**Then** — what an observer could confirm. Not "the system knows" or "the state updates" — what is
*visible*: a response, a screen, a row, a log line, an email.

### Common malformations

| Malformation | Example | Fix |
|---|---|---|
| Implementation in the Then | "Then `updateUser()` is called" | State the observable effect instead |
| Multiple actions in the When | "When they submit and confirm" | Two criteria |
| Unfalsifiable Then | "Then the experience is smooth" | Name what is observed |
| Missing Given | "When they click delete…" | Deleting *what*, as *whom*? |
| Vague quantity | "Then results appear quickly" | Under what time, at what percentile |

You do not need Given/When/Then for everything. A flat statement works when the precondition is
obvious: "`limit` above 100 returns 400." Use the format when state matters, which is most of the
time and always for anything involving permissions.

---

## The edge case taxonomy

The single highest-yield section of a PRD. The most expensive defects come from states nobody
specified, and specifying one costs a line.

Run all seven against every story:

| State | Question | Typical miss |
|---|---|---|
| **Empty** | First use, no data. What is shown, what is the next action? | A blank panel |
| **Boundary** | Zero, one, maximum, maximum+1, negative | Off-by-one on the limit |
| **Invalid** | Malformed input. What exactly is shown? | An invented error message |
| **Denied** | Right user, wrong permission. Hide or disable? | 403 where 404 was needed |
| **Concurrent** | Two users on one record. Last write wins, or conflict? | Silent overwrite |
| **Failure** | A dependency is down or slow. Degrade how? | An infinite spinner |
| **Partial** | Half the data loaded. Show partial or block? | Half a screen, no explanation |

**Denied and concurrent are the two most often skipped and the two most often exploited.** They are
also the two an engineer is least likely to invent correctly, because both have several defensible
answers and only one is right for your product.

On **denied**, decide deliberately between hiding a control and showing it disabled with a reason.
Hiding is cleaner; showing teaches the user the feature exists and how to get it. Also decide 403
versus 404 — 403 confirms the record exists, which is an information leak on anything ID-addressable.

---

## Non-functional criteria

These belong in the PRD, stated once in a cross-cutting section rather than repeated per story. The
planner attaches the relevant ones to each story.

```markdown
| Area | Requirement | Applies to |
|---|---|---|
| Performance | p95 under 300ms at 10k rows | All list endpoints |
| Accessibility | WCAG 2.2 AA | All UI |
| Auth | Per-object authorization, server-side | Everything ID-addressable |
| Audit | Actor, timestamp, before/after on any change to billing data | Billing |
| Retention | Deleted records purged after 30 days | User data |
| Localization | All user-facing strings externalized | All UI |
```

State the number. "Should be performant" written in a cross-cutting section is just a vague
criterion applied to more things.

---

## User-visible copy

Every string a user can see is a specification, including error messages. If you do not write it,
the implementer will invent it — that is Article X, and invented copy is remarkably hard to find and
fix later because it looks intentional.

```markdown
| Location | Text | Notes |
|---|---|---|
| Empty state heading | No reports yet | |
| Empty state body | Reports appear here once you run your first export. | |
| Empty state CTA | Run an export | Links to /exports/new |
| Error — export failed | We couldn't finish this export. Try again, or contact support if it keeps happening. | Never expose the underlying error |
| Error — limit exceeded | You can export up to 100 rows at a time. | |
```

`aidd-frontend` owns the *requirement* that copy be specified; you own the copy itself.

---

## Traceability

Every criterion traces up to a goal and down to a test. Both directions get checked.

- **Up:** which goal does this serve? A criterion serving no goal is scope you invented.
- **Down:** what command verifies it? If none exists, `aidd-qa` will send it back at the freeze
  gate — better to catch it here.

Criteria get prefixes so downstream specialists can append without collision (`AC-F` functional,
`AC-B` backend, `AC-U` UX, `AC-S` security, `AC-Q` coverage). You write `AC-F`; the others are not
yours to pre-empt.

---

## Handling unknowns

Never invent a requirement to close a gap.

```
[NEEDS CLARIFICATION: what happens to scheduled exports when a user's trial expires?]
— owner: <who decides> — blocks: Story 2.3
```

Then keep going on everything that does not depend on it. A PRD with three labeled unknowns is far
more useful than one that looks complete because you guessed three times. The guesses will be
implemented, tested, and defended for a year.

---

## Anti-patterns

- **Adjectives as criteria.** "Fast", "intuitive", "robust" cannot be tested, so they will not be.
- **Implementation in the Then clause.** Constrains the design and cannot be observed.
- **"And" in the When clause.** Two criteria wearing one.
- **Skipping denied and concurrent.** Where the security and data-integrity bugs live.
- **A precondition of "given a user".** Which user, in what state?
- **403 where 404 was needed.** Confirms the record exists.
- **Unspecified error copy.** It gets invented, and invented copy looks intentional.
- **Non-functional requirements as adjectives in a cross-cutting table.** Same vagueness, wider
  blast radius.
- **Criteria that trace to no goal.** Scope you invented.
- **Guessing at an open question.** Worse than leaving it open, because it looks decided.
