# Technical Debt

Identifying it, quantifying it in terms someone will fund, and sequencing the paydown.

The reason this needs a method: technical debt is the only category of engineering work whose cost is
invisible to everyone outside engineering. It never appears on a dashboard, no customer reports it,
and it competes for time against features that do. So it loses, until it is a crisis. Quantification
is how you stop losing that argument.

---

## What is actually debt

The metaphor is precise and worth using precisely: debt is a **deliberate trade of long-term cost for
short-term speed**, and like financial debt it accrues interest.

Not all bad code is debt. The distinction matters because the response differs.

| Type | Origin | Response |
|---|---|---|
| **Deliberate, prudent** | "We know the right design; we are shipping the quick one to hit the date" | Track it with a paydown condition. This is legitimate |
| **Deliberate, reckless** | "We do not have time for design" | Stop. This is not debt, it is a process problem |
| **Inadvertent, prudent** | "Now we understand the domain, we see the better design" | Normal learning. Refactor as you go |
| **Inadvertent, reckless** | "What is layering?" | A capability gap. Training, not a refactor project |

The first row is the only one that should appear in a debt register. The others need different
interventions, and filing them as debt means the wrong fix gets scheduled.

**Also not debt:** code you find inelegant, a pattern you would not have chosen, an old-but-working
library, or anything whose only cost is your discomfort. Calling those debt spends the credibility
you need for the real items.

---

## The test for a real debt item

Three questions. All three must have answers.

1. **What does it cost, per unit time or per event?** "Every change to pricing takes three days
   instead of half a day, and pricing changes twice a month."
2. **What is the interest rate?** Is the cost stable, growing, or compounding? Debt that gets worse
   is urgent; debt that is stable can wait indefinitely.
3. **What is the trigger?** What upcoming work or growth makes this expensive enough to fix now?

If you cannot answer 1, it is a preference. If the answer to 2 is "stable" and there is no answer to
3, it is a legitimate never-fix — and saying so explicitly is more useful than leaving it on a list
for three years.

---

## Quantifying

The part that determines whether debt gets funded. Translate engineering pain into a business number.

### Interest per change

The most persuasive framing, because it is directly observable.

```
Feature work touching <area>: 4 changes/month
Time with current design:     3 days each
Time with fixed design:       0.5 days each
Interest:                     10 engineer-days/month
Cost to fix:                  15 engineer-days
Payback:                      1.5 months
```

That table gets funded. "The code is messy" does not.

Get the numbers from the git log and the ticket tracker, not from feeling — and say where they came
from.

### Defect attribution

```
Production incidents in <area>, last 6 months: 7
Average cost per incident (response + fix + support): 1.5 days
Attributable to <specific design problem>: 5 of 7
Interest: ~1.2 days/month, plus reputational cost
```

### Blast radius

```
Files changed per feature in <area>: median 14 (repo median: 3)
Reviewers required: 3 (repo median: 1)
Change failure rate in <area>: 22% (repo average: 6%)
```

Blast radius is a strong argument because it predicts future cost, not just past cost.

### Growth ceiling

```
Current: 400 req/s peak, p95 340ms
This design's ceiling: ~600 req/s before p95 exceeds 1s
Growth: 15%/quarter → ceiling reached in ~3 quarters
Cost to fix now: 3 weeks
Cost to fix under load, with an incident: unknown, higher
```

This is the framing that gets pre-emptive work approved, because it puts a date on the problem.

---

## The register

Keep it short. A register with sixty entries is a list nobody reads; ten real items with numbers get
acted on.

```markdown
# Technical Debt Register

| ID | Area | Problem | Interest | Trigger | Effort | Status |
|---|---|---|---|---|---|---|
| D1 | Pricing | Rules duplicated in service + template + report | 10 eng-days/mo | Any pricing change | 15 d | Open |
| D2 | Orders | No transaction boundary on multi-item writes | 2 incidents/qtr | — | 5 d | Open |
| D3 | Auth | Sessions in memory; blocks horizontal scale | 0 today | Before multi-instance | 8 d | Accepted |

## D1 — Pricing rules duplicated
**Introduced**: 2025-03, commit abc123, to hit the launch date. Deliberate and prudent at the time.
**Cost now**: every pricing change requires three synchronized edits; two of the last five
diverged, producing incorrect invoices for 3 days.
**Interest rate**: growing — each new pricing feature adds a fourth site.
**Fix**: extract a pricing module; service, template, and report call it. 15 days.
**Trigger**: the tiered-pricing epic, planned for Q3, would add a fourth implementation.
**Do not fix by**: adding a shared helper that all three call while keeping three call sites.
That is the version that looks done and is not.
```

Two fields carry the weight. **"Introduced"** with the reason keeps the register honest — much of
what people call debt was a correct decision under different constraints, and knowing that changes
how you talk about it. **"Do not fix by"** prevents the half-fix that closes the ticket without
removing the cost.

**Mark items `Accepted`** when the honest answer is "not worth fixing". D3 above has zero interest
today; fixing it now is speculative work. It has a trigger, and until that trigger it is a
deliberate, documented position — not a failure.

---

## Sequencing paydown

Not by size, and not by how much the code annoys you.

1. **Anything actively causing incidents or data loss.** This is not debt paydown, it is a fix.
2. **Anything blocking committed work.** If Q3's epic requires it, it is Q3 work, not debt work.
3. **Testability first, among equals.** This is the highest-leverage sequencing decision available:
   remediating a system you cannot test is slow and risky, so fixing testability makes every
   subsequent fix cheaper and safer. It looks like a lower priority than a list of specific problems,
   and it is the thing to do first.
4. **Highest interest × churn.** Fixing a file nobody touches produces no observable benefit,
   regardless of how bad it is.
5. **Batch by area.** Three fixes in the same module cost less than three fixes in three modules.

Step 3 is the one most plans miss.

---

## Funding it

Three models. The first two mostly fail.

**Dedicated debt sprints** — reliably deferred when a deadline appears, and they frame debt work as
separate from real work, which is the framing that loses.

**A fixed percentage of capacity** (e.g. 20%) — better, but tends to be spent on whatever is
irritating rather than on what has the highest interest. Needs the register to direct it.

**Attached to feature work** — the model that actually holds. When a feature touches an area with
debt, the paydown is part of that feature's scope and estimate. The debt is paid where it is already
costing you, by people already in the context, and the business is funding a feature.

This is why the trigger field in the register matters: it tells you which feature to attach each item
to.

**The one thing that does not work:** hoping. Debt with no owner, no trigger, and no funding model
stays open until it becomes an incident, and the incident is more expensive than every version of
fixing it would have been.

---

## Preventing accrual

Cheaper than paydown, and Article XII applied to design.

- **Record deliberate debt at the moment you take it.** A comment linking to the register entry, plus
  the entry. Undocumented debt is indistinguishable from ignorance six months later, and nobody knows
  whether it was a decision
- **Enforce dependency direction** with a lint rule or module-boundary check. Structural debt accrues
  one import at a time, and no single import is worth blocking in review
- **Make the right thing the easy thing.** If the correct pattern requires more typing than the wrong
  one, the wrong one wins on a deadline. Provide the base class, the generator, the helper
- **Scope freeze** (Article V) prevents the specific accrual where "while I'm in here" changes pile up
  unreviewed
- **Every escalation ends by naming the document that would have prevented it.** That is the
  retrospective's job, and it converts one incident into a permanent improvement

---

## Talking about debt

To engineers: name the specific design problem and its blast radius.

To product and management: **never say "technical debt".** The phrase has been diluted into
"engineers want to rewrite things". Say what it costs in their terms:

- ❌ "We have a lot of technical debt in pricing."
- ✅ "Pricing changes take three days instead of half a day, and two of the last five produced
  incorrect invoices. Fifteen days of work removes that. The tiered-pricing epic will hit this
  directly."

The second version is a business case with a payback period. The first is a complaint.

---

## Anti-patterns

- **Calling code you dislike debt.** Spends credibility you need for real items.
- **A register with sixty entries.** Nobody reads it; nothing gets fixed.
- **No cost figure.** Then it is a preference and it will always lose to a feature.
- **No trigger.** Nothing ever makes it urgent, so it stays open until it is an incident.
- **Never marking anything `Accepted`.** Items sit for years, diluting the register.
- **Debt sprints.** Deferred the moment a deadline appears.
- **Percentage capacity with no register.** Spent on the most irritating, not the most expensive.
- **Sequencing by size.** Fixing untouched files produces no benefit.
- **Not fixing testability first.** Every subsequent fix stays slow and risky.
- **Undocumented deliberate debt.** Indistinguishable from ignorance in six months.
- **A rewrite proposed as debt paydown.** Almost always the wrong answer; needs its own case with a
  migration path.
- **Saying "technical debt" to product.** Reads as "engineers want to rewrite things".
- **The half-fix.** A shared helper called from three sites that still exist. Looks done; is not.
