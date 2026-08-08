# Technology Evaluation

Choosing between technologies without producing a comparison matrix that rationalizes the answer
someone already wanted.

The core discipline: **decide the criteria and their weights before you look at the candidates.**
Criteria chosen after the fact will favor whatever you already preferred, and the matrix becomes
theatre.

---

## Frame the decision first

Half of technology evaluations should not happen. Before comparing anything:

**What problem does this solve, and is it a real one?** Name the force. "We need a message queue"
is a solution; "order confirmation emails block the checkout response for 2–4 seconds" is a problem,
and it may be solvable without new infrastructure.

**What breaks if we do nothing?** If the answer is "nothing yet", you are evaluating a bet on a
future. That can be legitimate — say so explicitly and price it.

**Can we solve it with what we already run?** A capability you already operate is worth a large
handicap against a better tool you do not. You already have the expertise, the monitoring, the
runbooks, the on-call familiarity, and the backup story.

**Is the real constraint engineering time or infrastructure cost?** The answer flips most
recommendations.

Always include these two options, even when they lose:

- **Do nothing.** Establishes the actual cost of inaction.
- **Buy instead of build.** A $200/month service beats six engineer-weeks more often than engineers
  like to admit. Compute the fully loaded cost of building, including the maintenance you will owe
  forever.

---

## Criteria and weights

Write these down, with weights, **before** looking at candidates. Then fill in the matrix.

| Criterion | Ask |
|---|---|
| **Fit for purpose** | Does it solve the actual problem, or a nearby one? |
| **Operational burden** | Who runs it at 3am? What does upgrading involve? What is the backup and restore story? |
| **Team capability** | Does the team know this? What is the ramp, honestly? |
| **Maturity** | How long in production elsewhere at our scale? Known failure modes documented? |
| **Community and support** | Release cadence, issue response, commercial support if needed |
| **Escape cost** | How hard to leave in two years? What does it couple to? |
| **Total cost** | Licence + infrastructure + operations + the engineering time to adopt |
| **Security posture** | CVE history and response time. Auth model. Audit capability |
| **Observability** | Does it expose metrics and traces, or is it a black box? |

**Weight them for this decision.** For a two-person team, operational burden and team capability
should dominate — a technically superior tool nobody can operate is a liability. For a platform team
with a dedicated SRE function, the weights are different.

The two criteria most often underweighted:

**Operational burden.** Evaluations focus on the happy path — does it do the thing? — and skip who
maintains it, upgrades it, restores it, and gets paged for it. That cost is paid for years.

**Escape cost.** Every adoption is a bet. Ask what leaving looks like *before* entering. A tool
touching only one module is a cheap bet; one whose data model spreads through your domain is
expensive to reverse, and should be held to a higher bar.

---

## The matrix

```markdown
## Evaluation: <problem>

**Problem**: <the force, concretely>
**Doing nothing costs**: <what breaks, when>
**Weights set on**: <date, before candidates reviewed>

| Criterion | Weight | Option A | Option B | Buy | Do nothing |
|---|---|---|---|---|---|
| Fit for purpose | 3 | 3 | 2 | 3 | 0 |
| Operational burden | 3 | 1 | 3 | 3 | 3 |
| Team capability | 2 | 1 | 3 | 3 | 3 |
| Maturity | 2 | 3 | 3 | 2 | — |
| Escape cost | 2 | 1 | 2 | 2 | — |
| Total cost | 1 | 3 | 2 | 1 | 3 |
| **Weighted** | | **28** | **33** | **34** | — |

Scale: 0 = unacceptable, 1 = poor, 2 = adequate, 3 = strong.
```

**The number is an input, not the answer.** If the score contradicts your judgment, interrogate both
— usually the weights were wrong, or a criterion is missing. Then say so in the recommendation
rather than deferring to arithmetic.

**A zero on any criterion is disqualifying regardless of total.** A tool that cannot meet a hard
requirement does not get to win on convenience.

---

## Proof of concept

Do one when the decision is expensive to reverse and the matrix is close. Otherwise it is a way to
spend two weeks confirming what you already knew.

**A PoC must have a falsifiable question and a deadline.** "Let's try it and see" produces a demo
that proves nothing, because a demo always works.

```markdown
## PoC — <technology>

**Question**: Can it sustain 5,000 writes/sec with p99 under 50ms on our hardware profile?
**Falsifiable by**: measured throughput and latency under the load harness
**Timebox**: 3 days. Hard stop.
**Success**: meets the numbers, and one engineer unfamiliar with it got it running from docs in
under 2 hours
**Failure**: either number missed, or setup exceeded a day
**Out of scope**: production hardening, HA configuration, our full schema
```

Test the thing you are worried about, not the thing that is easy to test. If the concern is
operational burden, the PoC should include an upgrade and a restore from backup — not a hello-world
throughput benchmark.

**Include a second engineer's onboarding time as a measure.** It is a direct proxy for the ramp cost
you will pay across the whole team, and it is the number most evaluations omit.

---

## Failure modes

**Resume-driven architecture.** Introducing technology because it is interesting, or good for a CV.
The tell: enthusiasm precedes the problem statement. Ask what force is pushing you toward it; if the
answer is vague, that is the finding.

**Hype-cycle timing.** Adopting at peak attention means adopting before the failure modes are
documented. You get to discover them. Being 18 months late to a technology is usually cheaper than
being 18 months early.

**Comparing against a strawman.** Evaluating a new tool against the worst possible use of the
incumbent. Compare against the incumbent used well.

**Ignoring the incumbent's option.** "We could add an index" rarely appears in a matrix beside "we
could add a search cluster", and it is often the right answer.

**Benchmarks from the vendor.** Every benchmark is designed to be won. Run your own workload, on your
hardware profile, or do not cite numbers.

**Underestimating migration.** The evaluation compares end states. The cost is in the transition —
dual-writing, backfilling, cutting over, and running both for a quarter.

**Choosing for a scale you do not have.** A design sized for 100× today's volume pays its complexity
cost every day for a future that may not arrive.

**Deciding by committee consensus.** Produces the option nobody objects to, which is usually the
least interesting one. Name a decider.

---

## Writing the recommendation

```markdown
## Recommendation: <option>

**Because**: <one sentence tied to the top-weighted criterion>

**We are accepting**: <the specific costs — operational burden, ramp time, escape cost>

**We are betting that**: <the assumption that makes this right. Name it, so it can be checked.>

**This is wrong if**: <the condition under which this becomes the wrong call>

**Revisit when**: <a condition, not a date>

**First reversible step**: <how to start without full commitment — one service, one workload,
behind a flag>
```

Two sections do the real work. **"We are betting that"** makes the assumption checkable instead of
invisible. **"First reversible step"** is what turns a large commitment into a small one — adopting a
technology for one non-critical workload first gives you real operational experience at a fraction of
the exposure.

Then write the ADR (see `documentation.md`). The evaluation is the analysis; the ADR is the record,
and it is what a reader in two years will find.

---

## Anti-patterns

- **Criteria chosen after seeing the candidates.** The matrix becomes theatre.
- **No "do nothing" option.** Removes the baseline that sometimes wins.
- **No "buy" option.** Six engineer-weeks against $200/month, unexamined.
- **Underweighting operational burden.** The cost you pay for years, skipped in the comparison.
- **Not asking the escape cost.** Entering a bet without pricing the exit.
- **A PoC with no falsifiable question.** A demo always works.
- **A PoC that tests throughput when the worry is operations.** Answers the wrong question.
- **Vendor benchmarks.** Designed to be won.
- **Comparing to a strawman incumbent.** Compare against it used well.
- **Treating the weighted score as the decision.** It is an input.
- **Ignoring a zero because the total is high.** A hard requirement is hard.
- **Enthusiasm before the problem statement.** Resume-driven; name the force.
- **Committee consensus.** Produces the blandest option. Name a decider.
