# Prioritization

Deciding what not to build, which is the actual job.

Most prioritization frameworks produce false precision — a score to three decimal places built from
five guesses. The useful ones do one thing: they force a conversation that was being avoided. Pick
the lightest tool that forces yours.

---

## Two questions first

Before any framework, ask these. They resolve most decisions and cost nothing.

**1. What breaks if this is missing?**
If the answer is "nothing, it is just nicer" — it is not a must. This question alone deflates most
inflated priorities, because it demands a consequence rather than a benefit.

**2. What is the cost of being wrong about this?**
High cost of wrong → build the smallest version and learn. Low cost of wrong → just decide and move.
This question routes you toward experiments versus commitments, which matters more than ranking.

If those two settle it, stop. You do not need a scoring model.

---

## MoSCoW

Enough for most releases. The whole discipline is in the definition of Must.

| Level | Means | Test |
|---|---|---|
| **Must** | The release cannot ship without it | Would you delay the launch for this? If no, it is not a must |
| **Should** | Painful to omit, but shippable | There is a workaround, even an ugly one |
| **Could** | Genuine value, first thing cut | Nobody escalates if it slips |
| **Won't** | Explicitly out, this time | Named so it stops being re-raised |

**If most items are Must, nothing has been prioritized.** A useful forcing rule: Musts should be
roughly 60% of the effort, leaving room for the estimate being wrong — which it is.

**The Won't list is the most valuable column** and the one usually left empty. Writing down what you
are not doing, by name, is what stops the same three items being re-proposed every planning cycle.

---

## Cost of delay

The most useful economic frame, because it makes the argument about *time* rather than *value* —
and time is where the real cost lives.

> If this shipped three months later, what would it cost us?

Four shapes, and knowing which one you have changes the decision more than any score:

| Shape | Behavior | Example | Implication |
|---|---|---|---|
| **Linear** | Steady loss per week of delay | Efficiency improvement | Sequence by size; no urgency cliff |
| **Deadline** | No cost, then a cliff | Regulatory compliance, a contract date | Schedule backward from the date. Do not start early |
| **Expedite** | Loss starts immediately and is steep | Active outage, security exposure | Everything else waits |
| **Intangible** | No cost now, growing later | Platform work, debt paydown | The one that never wins on a scoreboard and eventually costs the most |

**Intangible is why pure scoring models produce codebases nobody can change.** Debt paydown always
loses to a feature this quarter. If your process cannot fund intangible work, fund it structurally
instead — a fixed percentage of capacity — rather than expecting it to win a comparison it is
designed to lose.

### WSJF

Cost of delay divided by job size. Do the highest quotient first.

```
WSJF = cost of delay / job size
```

The arithmetic is trivial; the value is entirely in the discussion of the numerator. Two cautions:

- **Relative estimates only.** Score cost of delay on a 1–10 or Fibonacci scale, comparatively. Any
  currency figure will be treated as a forecast.
- **The quotient is a sorting aid.** A ranking to two decimals built from two guesses is still two
  guesses. Use it to order, then sanity-check the top of the list against judgment. If the model's
  top item feels wrong, the model has surfaced a disagreement about the inputs — go find it.

---

## Opportunity cost

The framing that fixes the most common failure: evaluating each item in isolation, where everything
looks worth doing.

Never ask "is this worth building?" — almost everything is, at some price. Ask **"is this the best
use of the next four weeks?"** That question has one answer.

Practically: keep an explicit ranked list, and require every new proposal to name what it displaces.
"This is important" is not a prioritization claim. "This is more important than the export work,
because…" is.

---

## RICE, and when scoring helps

```
RICE = (Reach × Impact × Confidence) / Effort
```

Useful in exactly one situation: **a long list of comparable small items where you need a defensible
order and have no strong opinion.** Growth backlogs, in other words.

It is a poor fit for strategic decisions, because Confidence is doing enormous work and is a guess,
and because Impact on a 0.25–3 scale flattens the difference between a nice improvement and a
business change.

**The honest use of any scoring model:** compute it, look at the ranking, and check whether you agree.
Where you disagree, find out which input you disagree about. The model's value is locating the
disagreement, not settling it.

---

## Prioritizing bugs and debt

Different from features and usually done badly by feature frameworks.

| Class | Rule |
|---|---|
| Data loss or corruption | Immediate. Nothing else matters |
| Security — Critical/High | Immediate. `aidd-security` blocks the run |
| Broken core flow, no workaround | This iteration |
| Broken flow with a workaround | Next iteration; document the workaround now |
| Cosmetic, low frequency | Batch with related work in that area |
| Debt in a file nobody touches | Leave it. Debt only costs when you pay interest |

That last row matters. Debt is not uniformly bad — it is a loan, and the interest is paid only when
you change the code. Ugly code in a stable, working, untouched module is a loan at zero interest.
Sequence debt paydown by **change frequency**, not by ugliness. `aidd-architect`'s `tech-debt.md`
covers the quantification.

---

## Saying no

The output of prioritization is refusals, and how you deliver them determines whether the process
survives.

- **Say no to the item, with the reason, in writing.** Silence gets read as "not yet" and the request
  returns every cycle.
- **Name the trade.** "Not this quarter — it would displace the export work, which three customers
  are waiting on." A trade is arguable; a flat no is a relationship problem.
- **Record it in the Won't list.** So the answer persists past the conversation.
- **Give the condition that would change the answer.** "If two more customers ask, this moves up."
  That converts a rejection into a rule, and the requester can act on it.

---

## Anti-patterns

- **Everything is a Must.** Nothing has been prioritized.
- **An empty Won't list.** The same items return every cycle.
- **Scoring to three decimals from five guesses.** False precision, real confidence.
- **Cost of delay in currency.** It will be quoted as a forecast.
- **Evaluating items in isolation.** Everything is worth building at some price.
- **Letting intangible work compete on a scoreboard.** It is designed to lose. Fund it structurally.
- **Prioritizing debt by ugliness.** Sequence by change frequency; untouched debt costs nothing.
- **Deferring a Critical security finding to next iteration.** Not a prioritization decision.
- **A no with no reason and no condition.** Read as "not yet"; returns forever.
- **Using RICE for a strategic bet.** Confidence is carrying the whole model, and it is a guess.
