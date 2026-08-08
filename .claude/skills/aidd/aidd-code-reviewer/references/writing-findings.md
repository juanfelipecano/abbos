# Writing Findings

Producing review output that gets acted on rather than argued with or ignored.

A correct finding that is badly written is a finding that does not get fixed. The technical work of
review is finding the defect; the remaining work is making it undeniable and actionable.

---

## The four parts

Every finding, at MINOR or above:

```markdown
### <SEVERITY> — <one-line title>
**Location**: `file.ext:line`
**Problem**: <what is wrong>
**Failure scenario**: <specific inputs or state → wrong output, crash, or corruption>
**Fix**: <the concrete change>
```

**Location** — a path and line, not "in the order service". The reader should not have to search.

**Problem** — what is wrong with the code, stated about the code.

**Failure scenario** — the load-bearing part. Specific enough that the author can check it. If you
cannot write it, you have a preference, not a finding.

**Fix** — the concrete change. Not "handle this properly". A reviewer who identifies a problem
without a direction has done half the work and passed the harder half back.

---

## Write about the code

| Instead of | Write |
|---|---|
| "You forgot the null check" | "`user.email` is dereferenced without a null check at line 44" |
| "This is wrong" | "This returns 200 when the order does not exist" |
| "Why did you do it this way?" | "This approach re-fetches on every render; the memoized version in `useOrders` avoids it" |
| "Didn't you test this?" | "No test covers the non-owner case (AC-S1)" |
| "Obviously this should be a transaction" | "Both writes can partially apply; a failure at line 61 leaves the order created with no line items" |

This is not about softening. It is about precision — "you forgot" is a claim about the author's
mental state, which is unverifiable and irrelevant. "`user.email` is dereferenced without a null
check" is a claim about the code, which can be checked and fixed.

Rhetorical questions are the worst form. "Why would you fetch inside the loop?" reads as an
accusation and contains no information. State what is wrong and what to do.

---

## Make it checkable

The best findings can be verified by the author in under a minute.

**Give the reproduction where one exists:**

```
curl -X POST localhost:3000/api/orders -d '{"quantity": -1}'
# → 201, order created with negative quantity
```

**Give the concrete values:**

> With `limit=101`, line 22 computes `offset = 101 * page`, which skips 101 rows on page 2 instead of
> 100. Page 2 begins at row 202 rather than 101.

**Point at the existing correct example:**

> `src/invoices/handler.ts:44` does this with a conditional update. Same shape applies here.

That last move is the highest-leverage thing in a review. It converts "you did it wrong" into "here
is the pattern", takes ten seconds, and produces a consistent codebase rather than a corrected one.

---

## Separate the levels clearly

Group by severity, blocking first. A reader triaging under time pressure should be able to stop
after the blocking section and know they have the essentials.

```markdown
# Code Review — export scheduling [Iter-1]

Verdict: **REQUEST CHANGES**

## Blocking (1)
### BLOCKING — Concurrent redemption allows double credit
...

## Minor (3)
### MINOR — `limit` is not capped
...

## Reviewed and sound
- Authorization on all three endpoints — server-side, per-object, before fetch
- Migration is additive; previous version runs against the new schema

## Not reviewed
- Generated OpenAPI file, lock file
```

**Put the count in the heading.** "Minor (3)" tells the author the size of the task before they read
it, which determines whether they do it now or schedule it.

---

## Observations

Things worth saying that are not findings. Mark them clearly and state that no response is expected —
otherwise the author spends effort replying to each.

```markdown
## Observations
No action needed.
- The `formatRow` helper here overlaps with `src/csv/format.ts`. Not worth consolidating in this
  diff; noted in case a third copy appears.
- This is the third endpoint to reimplement cursor pagination. Might be worth a shared helper
  eventually — backlog item, not this change.
```

This section is where preferences, style thoughts, and future ideas go. Having a designated place
for them is what keeps them out of the findings list, where they would dilute the real defects.

---

## Reviewed and sound

Every review ends with what you checked and found correct.

Three functions: it tells the next reader where not to re-spend effort, it makes your findings more
credible by showing the review was thorough rather than opportunistic, and it forces you to be
honest about what you actually covered.

Include a **"not reviewed"** line when you skipped anything. Silence implies coverage you did not
provide, which is worse than admitting a gap — it retires risk that nobody addressed.

---

## Volume

A review with twenty findings will not be acted on well. The author will fix the easy ones and lose
the important one in the noise.

If you have twenty:
- **Cut the nits.** Anything without a failure scenario goes to Observations or is dropped
- **Group repeats.** "The same missing null check appears at lines 44, 61, 78" is one finding
- **Consider whether the diff is too large to review** — that is itself a finding worth raising

Aim for the real defects plus a short minor list. Fewer, better-argued findings get fixed; long lists
get triaged by the author, which means they get to decide which of your findings mattered.

---

## Handling disagreement

1. **Re-read their argument** for what you might have missed. They know the code better than you do.
2. **If you were wrong, withdraw it plainly.** "You're right, the batch path validates upstream —
   withdrawing." No hedging, no "but still".
3. **If you were right, restate the scenario**, not the opinion. The scenario is the argument.
4. **If unresolved, route to the architect.** Cite the driver ranking. Do not escalate on seniority
   or persistence.

Never trade a finding away to preserve goodwill; never hold one to win. Both corrupt the signal that
makes review worth running, and both are visible to everyone watching.

---

## Anti-patterns

- **A finding with no failure scenario.** Cannot be checked, only complied with or ignored.
- **A problem with no fix.** Half the work, passed back.
- **Rhetorical questions.** Read as accusation, contain no information.
- **Claims about the author rather than the code.** Unverifiable and irrelevant.
- **Twenty findings.** The important one is lost; the author triages your review for you.
- **Repeats listed separately.** One finding with three locations.
- **No severity grouping.** The reader cannot stop early with confidence.
- **Observations mixed into findings.** Dilutes the defects that matter.
- **No "reviewed and sound".** Indistinguishable from not having looked.
- **Silence about what you skipped.** Implies coverage you did not provide.
- **Withdrawing with a hedge.** "You're right, but still" is not a withdrawal.
