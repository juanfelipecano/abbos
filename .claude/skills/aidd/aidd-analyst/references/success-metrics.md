# Success Metrics

How to define a number that will actually tell you whether this worked.

The failure mode is not picking the wrong metric. It is picking a metric that cannot move, cannot be
attributed, or has no baseline — and therefore can never falsify the decision to build.

---

## The four requirements

A metric that fails any of these is decoration.

| Requirement | Test | Failure |
|---|---|---|
| **Baselined** | What is it today? | "Improve conversion" — from what? |
| **Measurable** | What query or instrument produces it? | "Better experience" — with what? |
| **Attributable** | Would this feature move it, distinguishably? | "Revenue" — moved by everything |
| **Time-bound** | By when? | "Eventually" — never evaluated |

**Baseline is the one people skip**, because measuring it is work and it delays the interesting part.
The consequence is permanent: ship without a baseline and you will never know whether it worked,
which means you can never justify the follow-up investment, and the feature becomes unkillable
because nobody can prove it failed.

If the baseline is unknown, **measuring it is the first task of the project.** Say so explicitly in
the brief rather than hoping someone does it.

---

## Leading and lagging

Lagging indicators tell you whether it worked. Leading indicators tell you in time to react.

| | Lagging | Leading |
|---|---|---|
| Example | Quarterly retention | Week-1 activation |
| Tells you | The truth | Something early |
| Moves | Slowly | Quickly |
| Risk | You learn too late | It may not actually predict the lagging one |

**Pick one of each.** The lagging metric is what you promised; the leading one is what you watch
during the release window.

The trap is assuming the link. A leading indicator is a *hypothesis* that it predicts the lagging
one. Write the hypothesis down — "we believe week-1 activation predicts 90-day retention" — so that
when activation rises and retention does not, you learn something instead of celebrating.

---

## Attribution

The hardest requirement, and the one that quietly invalidates most metric claims.

Ask: **if this number moves, what else could have caused it?** Seasonality, a pricing change, a
marketing push, a competitor's outage, a different team's release in the same window. If you cannot
distinguish your effect from those, you have not defined a metric — you have defined a coincidence.

Options, in descending order of rigor:

1. **Controlled experiment.** Split traffic, measure the difference. The only method that isolates
   cause. Needs enough volume to detect the effect you expect.
2. **Cohort comparison.** Users who used the feature versus those who did not — but adopters
   self-select and are usually already your best users, which inflates the result. Almost every
   naive "users who use X retain better" claim is this error.
3. **Segment-limited metric.** Narrow to the population the feature touches. "Trial-to-paid rate for
   users who reached the export step" beats "trial-to-paid rate".
4. **Before/after with a control segment.** Weakest defensible option. Requires a comparable
   population that did not receive the change.

Naked before/after on a global metric is not evidence. It is the most commonly presented form of
non-evidence in product work.

---

## Sizing the effect before you build

If you expect a 2% improvement on a metric with 3% weekly noise, you will not detect it. That is
worth knowing before spending six weeks, not after.

Three questions:
- **How big an effect do we expect?** If nobody will guess, that itself is a finding — it means
  nobody has a model of how this works.
- **How noisy is the metric week to week?** Look at the last quarter's variance.
- **How long until we would see it?** Longer than the patience of whoever asked for it?

If the expected effect is inside the noise, either pick a more sensitive metric (usually narrower and
closer to the change) or accept that the decision will be made on judgment and say so honestly.

---

## Goodhart's law

> When a measure becomes a target, it ceases to be a good measure.

This is not a curiosity. It is a prediction about what your team will do, and it is reliable.

| Target | Gamed by | Fix |
|---|---|---|
| Tickets closed | Closing without resolving | Pair with reopen rate |
| Time on site | Making things hard to find | Pair with task completion |
| Signups | Buying low-intent traffic | Pair with activation |
| Velocity | Inflating estimates | Do not target velocity at all |
| Test coverage | Tests with no assertions | Pair with mutation survival |
| Response time | Closing conversations early | Pair with resolution rate |

**The general defense: pair every target with a counter-metric that degrades if the first is gamed.**
State both in the brief. A single-metric target is an instruction to optimize the measurement.

---

## Guardrails

Distinct from counter-metrics. A guardrail is something that must *not* get worse, even if the
primary metric improves. It defines a failed success.

```markdown
| Guardrail | Threshold | If breached |
|---|---|---|
| p95 latency | < 800ms | Roll back |
| Support contacts per 100 users | No increase | Investigate before phase 2 |
| Error rate | < 0.5% | Roll back |
| Accessibility audit | No new violations | Block release |
```

These become `aidd-devops`'s watch-window abort conditions directly, which is the point of writing
them as numbers.

---

## Writing them down

```markdown
## Success metrics

### Primary (lagging)
| Metric | Baseline | Target | By when | Measured by |
|---|---|---|---|---|
| <metric> | <today, with date measured> | <target> | <date> | <query/instrument> |

**Attribution**: <how we distinguish this feature's effect from everything else>
**Expected effect size**: <n>, against week-to-week noise of <n>
**Counter-metric**: <what degrades if we game the primary>

### Leading
| Metric | Baseline | Watch from | Hypothesis |
|---|---|---|---|
| <metric> | | | We believe this predicts <primary> because <reason> |

### Guardrails
| Guardrail | Threshold | If breached |
|---|---|---|

### If we are wrong
<What result would tell us this was not worth building, and what we would do then. A project
with no such condition cannot fail, which means it cannot succeed either.>
```

That last section is the one that makes the rest real. Write it before building, when it is still
cheap to be honest.

---

## Anti-patterns

- **No baseline.** The metric cannot show improvement; the feature becomes unkillable.
- **A metric nobody can query.** It will not be measured, whatever the document says.
- **Global metrics for local changes.** Revenue moves for a hundred reasons.
- **Naked before/after.** Not evidence. The most common form of non-evidence in product work.
- **Cohort comparison presented as causal.** Adopters self-select; they were already your best users.
- **An expected effect smaller than the noise.** Undetectable, and knowable in advance.
- **A single target with no counter-metric.** An instruction to game it.
- **Targeting velocity, coverage, or tickets closed.** Pure Goodhart; they degrade on contact.
- **Assuming the leading indicator predicts the lagging one.** Write it as a hypothesis and check.
- **No stated failure condition.** A project that cannot fail cannot succeed.
