# Escalation and Stopping

Enforcing the iteration limits, and handing off to a human well when the limit is reached.

The hard stop is the method's termination proof. Everything else — testable criteria, frozen scope,
triage — reduces the *chance* of a spiral. The iteration cap guarantees one ends.

Its value depends entirely on it being enforced. A cap that bends is a suggestion, and a pipeline
with a suggestion instead of a cap has no upper bound on cost.

---

## The two counters

They are different and both are yours to track.

**Attempts per criterion** — owned by the executing role, capped at 3 (Article VI). The implementer
counts its own; you see the escalation when it fires.

**Iterations per run** — yours, capped at 3.

| Iteration | Permitted when |
|---|---|
| **Iter-1** | Normal execution |
| **Iter-2** | The escalation came with a concrete diagnosis — three logged attempts, exact errors |
| **Iter-3** | The architect justifies **in writing** why the run can still close |
| **Iter-4** | **Never.** Stop and escalate to a human |

**Announce the counter every turn.** `Iter-2 of 3`. A counter nobody sees does not constrain
anything, and roles calibrate their thoroughness to how much runway they believe remains.

---

## Gating Iter-2

An escalation earns an iteration only if it arrives with a real diagnosis. Otherwise you are
granting a retry, and retries do not converge.

Require:
- [ ] Three attempts logged, each with the **exact error**, not a summary
- [ ] What was ruled out — the hypotheses now known false
- [ ] A probable root cause with the evidence for it
- [ ] A specific decision needed, phrased as a question with two or three answers

If the escalation lacks these, **send it back for the diagnosis rather than granting the
iteration.** That is not bureaucracy: an architect issuing a spec patch from "it didn't work" will
guess, and the guess costs Iter-3.

---

## Gating Iter-3

Higher bar. The architect must write down why the run can still close:

```markdown
## Iter-3 justification

**What we now know that we did not at Iter-1**: <the specific new information>
**Why the remaining work will close**: <concrete, not optimistic>
**What changes if it does not**: <the fallback>
```

**The test: is there new information, or just a new attempt?** If Iter-3 is the same approach with
more care, stop now rather than at Iter-4. You already have the answer.

---

## Stopping at Iter-4

Say this, verbatim in structure:

> The pipeline has reached 3 iterations without closing. This needs a human decision:
> **[the specific blocking problem]**.
>
> The options I see:
> 1. [option] — [cost, consequence]
> 2. [option] — [cost, consequence]
> 3. [option] — [cost, consequence]
>
> My recommendation is [n] because [reason].

Then **stop.** Do not offer a fourth iteration. Do not restate the problem and try again. Do not
suggest a smaller scope and continue without an answer.

An agent that has cycled three times is missing information no additional cycle will produce. The
cap exists because that state is recognizable from the outside and invisible from the inside.

---

## Writing the human handoff

The quality of this document determines whether the human resolves it in five minutes or asks six
questions.

```markdown
# Escalation to human — <run name>

**Status**: Stopped at Iter-3 of 3.
**Blocking problem**: <one sentence>

## What works
<Green criteria, with evidence. These are frozen and will not be redone.>

## What does not
| Criterion | Attempts | Why it fails |
|---|---|---|

## What we ruled out
<The most valuable section. Hypotheses now known false, with the evidence.
This is what stops the human from suggesting attempt one.>

## The decision needed
<Specific. Two or three answers, not "how should we proceed".>

## Options
| Option | Cost | Consequence | Reversible |
|---|---|---|---|

## Recommendation
<Which, and why.>

## What is on disk
Committed and green: <sha range>
Reverted: <what>
Uncommitted: <should be nothing>
```

**"What we ruled out" is the section that earns its keep.** Without it, the first thing a human
suggests is usually something already tried twice — and having to say "we tried that" three times
erodes confidence in the whole run.

---

## Stopping early

Sometimes the right move is to stop before Iter-3. Do it when:

- **The blocker is external.** A vendor API cannot do what the design assumed. More iterations
  cannot change that.
- **The blocker is a product decision.** Two criteria contradict because the requirements do.
  Iterating on implementation cannot resolve a requirements conflict.
- **The blocker needs authority you do not have.** Changing a `PROJECT-CONTEXT.md` boundary, accepting
  a security risk, changing a public contract.
- **The cost has exceeded the value.** If the run has consumed far more than the work was worth,
  that is worth surfacing even at Iter-1.

**Stopping early is a stronger move than exhausting the budget.** The budget is a ceiling, not a
target, and spending it to reach a conclusion you could have reached at Iter-1 is waste with extra
steps.

---

## After a stop

Two things, before anything else happens.

**Preserve the state.** Everything green stays committed. Nothing gets reverted "to start clean" —
the frozen criteria are the run's product, and Rule 2 protects them precisely so a stop does not
throw away working code.

**Run the retrospective anyway.** A stopped run is the highest-information event the method
produces. Article XII asks: which document, had it been clearer, would have prevented this?

For a stop, the answer is usually one of:
- The spec had a criterion that was never achievable
- `PROJECT-CONTEXT.md` was missing a constraint the run collided with
- Discovery was skipped and the requirement was wrong
- A specialist's pre-freeze pass missed something structural

Fix the document. That is the entire return on a failed run, and skipping it means paying the same
cost again.

---

## Anti-patterns

- **A silent iteration counter.** It only constrains if it is visible.
- **Granting Iter-2 on "it didn't work".** The architect will guess; the guess costs Iter-3.
- **Iter-3 as the same approach with more care.** You already have the answer. Stop now.
- **Offering a fourth iteration.** The cap is the termination proof.
- **Restating the problem and continuing.** The stop is the deliverable.
- **A handoff with no "ruled out" section.** The human suggests attempt one.
- **"How should we proceed?"** Give options with costs and a recommendation.
- **Reverting green work to start clean.** Rule 2 exists so a stop preserves value.
- **Exhausting the budget out of completeness.** It is a ceiling, not a target.
- **Skipping the retrospective on a stopped run.** The only return on the cost already paid.
