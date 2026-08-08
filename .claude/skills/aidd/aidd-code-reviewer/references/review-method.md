# Review Method

How to run a review so that it finds things, in a bounded amount of time.

Most reviews fail not from lack of skill but from sequence: reading the author's explanation first,
starting at file one, and stopping when nothing obvious appears. Order determines yield.

---

## Read the spec before the diff

Know what *should* have been built before seeing what was. Otherwise you are evaluating the code
against itself, and code always looks like a reasonable implementation of whatever it implements.

This is what makes you able to notice the *absent* — the criterion nobody implemented, the edge case
with no branch. Absence is invisible when you read the diff first, and absence is where the
expensive defects live.

---

## Read the diff cold

**Do not read the author's explanation first.**

Their rationale is persuasive and it anchors you onto the parts they already thought carefully about
— which are, by definition, not where the bug is. You will find yourself verifying their reasoning
rather than examining their code.

Read the diff and form your own model of what it does. *Then* read their notes, and treat every
discrepancy between your model and theirs as a finding: either they explained it badly or you
misread it, and both are worth knowing.

The same applies to their tests. Read the implementation first, decide what you would test, then see
what they tested. The gap is your finding list.

---

## The order

1. **Spec.** What should exist.
2. **Diff, cold.** Build your own model. No explanations.
3. **Criterion → code.** Every criterion: where is it, and is it faithful?
4. **Code → criterion.** Every hunk: which criterion required this? (Article III)
5. **Attack it.** Find inputs and states that break it.
6. **Tests.** Would they catch a regression here?
7. **Report,** severity ordered.

Steps 3 and 4 are mechanical and take five minutes. Step 5 is where the real defects come from.
Step 4 is the one people skip, and it is how scope creep passes review.

---

## Faithful, not just present

A criterion can be satisfied in letter and missed in intent. This is the most common finding that
requires actually thinking.

> **Criterion:** Non-owner `GET /orders/{id}` returns 404.
> **Implementation:** Fetches the order, checks ownership, returns 404 if it fails.
>
> The status is right. But the record was fetched and discarded — the database was hit, and the
> timing difference between "exists but not yours" and "does not exist" is measurable. The criterion
> said 404; the intent was *not-found-by-authorization*.

Ask, for each criterion: **what was this criterion protecting against, and does the implementation
actually protect against it?**

---

## Attacking the code

Where findings come from. Work through concrete states rather than reading for style.

**Pick hostile inputs.** For each new input: empty, null, zero, negative, maximum, maximum+1, wrong
type, very large, unicode, and something with a quote in it. Trace one of them through the code by
hand.

**Ask what runs twice.** Networks retry. Users double-click. Queues redeliver. What happens on the
second execution?

**Ask what happens concurrently.** Two requests, same record, same instant. Any read-then-write
sequence without protection is a finding.

**Ask what happens when the dependency fails.** Down, slow, returns a 500, returns malformed data,
returns success with the wrong shape. Trace each.

**Follow the error path.** It is the least-executed and least-tested code in any diff, and it is
where the resource leaks and the swallowed exceptions are.

**Check the boundaries.** Most defects live where data crosses a layer — parsed, serialized,
defaulted, coerced.

---

## Cognitive traps

Reviewer-side failures. Each has a counter.

| Trap | What happens | Counter |
|---|---|---|
| **Anchoring** | The author's explanation frames what you examine | Read the diff first |
| **Satisficing** | You find one issue and stop looking | Finish the pass before writing anything |
| **Familiarity** | Code that looks like your own reads as correct | Trace a hostile input by hand |
| **Fatigue** | Quality collapses after ~400 lines | Split large diffs; review in sessions |
| **Author bias** | A senior author's code gets a lighter read | Review the diff, not the author |
| **Nit fixation** | Naming debates crowd out the real defect | Cap nits; put them in Observations |
| **Absence blindness** | You review what is there, not what is missing | Run criterion → code explicitly |

**Fatigue is real and measurable.** Review effectiveness drops sharply past a few hundred lines. If
a diff is 2,000 lines, either split the review across sessions or say plainly that you reviewed part
of it — a review that claims full coverage of a diff you skimmed is worse than no review, because it
retires the risk without addressing it.

---

## Timeboxing

A review has a budget. Spend it where defects are.

| Priority | Where |
|---|---|
| Highest | New logic on money, permissions, or data mutation |
| High | Error paths and concurrency in new code |
| High | The criterion → code and code → criterion passes |
| Medium | New tests: do they fail when the code breaks? |
| Low | Mechanical changes — renames, formatting, generated files |
| Skip | Lock files, generated code, vendored dependencies |

Say what you skipped. "I did not review the generated migration or the lock file" is honest and
useful; silently skipping them implies coverage you did not provide.

---

## Reviewed and sound

End every review with what you checked and found correct.

```markdown
## Reviewed and sound
- Authorization on all three new endpoints — checked server-side, per-object, before fetch
- Error envelope matches the existing convention in `invoices/handler.ts`
- The migration is additive; the previous app version runs against the new schema
- Tests fail when I invert the ownership check (verified)

## Not reviewed
- The generated OpenAPI file
- The lock file diff
```

Three reasons this section earns its space: it tells the next reader where not to re-spend effort,
it makes your actual findings more credible, and it forces you to be honest about coverage.

The "verified" note on the test check is worth copying. Actually breaking the code to confirm the
test catches it takes thirty seconds and is the only way to know.

---

## When you find nothing

A legitimate outcome — but only after steps 3 through 6 actually ran.

Before approving, confirm:
- [ ] I traced at least one hostile input by hand
- [ ] I checked the error path
- [ ] I ran criterion → code and code → criterion
- [ ] I confirmed at least one test fails when the code is broken
- [ ] I know what happens if this runs twice

If all five are honest yeses, approve and say what you checked. "Looks good" with no reviewed-and-
sound section is indistinguishable from not having looked.

---

## Anti-patterns

- **Reading the author's explanation first.** Anchors you away from the defect.
- **Starting at file one.** Start at the criteria and at the risky code.
- **Stopping at the first finding.** Finish the pass.
- **Reviewing 2,000 lines in one sitting.** Effectiveness collapses; the claim of coverage does not.
- **Claiming coverage you did not provide.** Worse than no review — it retires the risk.
- **Skipping code → criterion.** How scope creep passes review.
- **Checking presence, not faithfulness.** The letter satisfied, the intent missed.
- **Reviewing the author instead of the diff.** Senior code gets the lighter read and the worse bug.
- **Nit debates.** They crowd out the finding that mattered.
- **Approving without breaking a test to confirm it catches anything.** Thirty seconds, always worth
  it.
