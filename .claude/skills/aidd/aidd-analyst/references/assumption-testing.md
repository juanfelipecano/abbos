# Assumption Testing

How to find the belief that would sink the project, and check it this week instead of next quarter.

Every plan rests on assumptions. Most are safe. Usually one or two are load-bearing and untested,
and the entire value of this practice is finding those two before they are expensive.

---

## Surfacing assumptions

Assumptions hide in confident prose. The way to find them is to read the brief and ask, at every
claim: **how do we know this?**

Four categories, and they fail in this order of frequency:

| Category | The assumption | Fails as |
|---|---|---|
| **Desirability** | People want this enough to change behavior | Built it, nobody switched |
| **Viability** | It works as a business | People love it, it loses money |
| **Feasibility** | We can build it | Six weeks in, the API cannot do that |
| **Usability** | People can figure it out | They want it, they cannot use it |

Desirability is by far the most common killer and the most commonly assumed away, because it is the
one everyone in the room already agrees on.

**A useful prompt: complete the sentence "this only works if…"** three times. The three completions
are your assumptions, and the one that makes you uncomfortable is the one to test.

---

## Ranking by risk

Two axes. Only one quadrant matters.

```
              high uncertainty
                     │
     TEST THIS       │      monitor
     ─────────────── ┼ ───────────────  high impact →
     ignore          │      note it
                     │
              low uncertainty
```

- **High impact, high uncertainty** — the riskiest assumption. Test it first. There is usually
  exactly one.
- **High impact, low uncertainty** — you have evidence. Cite it in the brief so nobody re-litigates.
- **Low impact** — do not spend a test on it, regardless of uncertainty.

**Impact** means: if this is false, does the project change or die? If being wrong costs a
paragraph, it is not high impact.

**Uncertainty** means: what would a skeptic say, and could you answer with evidence rather than
reasoning? Reasoning is not evidence — it is the thing that got you here.

---

## Designing the test

The riskiest-assumption test is the cheapest thing that could prove you wrong. Two properties:

**It must be falsifiable.** Define the failing result before running it. A test that cannot fail is
a demo, and demos always succeed.

**It must be cheap relative to the decision.** A two-day test protecting a six-week build is good
economics. A three-week test protecting a four-week build is not — just build it.

```markdown
## Assumption test

**Assumption**: <the specific belief>
**Category**: desirability | viability | feasibility | usability
**If false**: <what changes — be specific about the cost>

**Test**: <what we will do>
**Cost**: <time, money>
**Pass**: <the result that supports the assumption>
**Fail**: <the result that refutes it — decided in advance>
**Then**: <what we do on each outcome>
```

The **Fail** line is the one that gets skipped, and skipping it means the result will be interpreted
favorably whatever it is. Write it before running the test.

---

## Test types by category

### Desirability

| Test | Cost | Strength |
|---|---|---|
| Switch interviews with people who have the problem | Days | Strong on push and anxiety |
| Landing page with a real call to action | Days | Measures interest, not commitment |
| Concierge — deliver the outcome manually | Weeks | Strongest. You learn the real workflow |
| Pre-sale or signed letter of intent | Days | The strongest desirability signal that exists |
| Fake door — a button that leads to "coming soon" | Hours | Cheap, but annoys real users. Use sparingly and honestly |

**Concierge is undervalued.** Doing the job by hand for five customers teaches you the edge cases,
the real inputs, and whether anyone cares — usually in less time than building the wrong version.

### Feasibility

| Test | Cost |
|---|---|
| Timeboxed spike against the real API, with real data volumes | 1–3 days |
| Load test of the risky path with realistic data | Days |
| A proof of concept for the one algorithm nobody is sure about | Days |

Spikes have one rule: **timebox and throw away the code.** A spike that becomes the foundation
carries every shortcut you took while answering a different question.

### Viability

Unit economics on a spreadsheet, before building. Cost per transaction, per tenant, per GB. Many
technically sound features are economically impossible and the arithmetic takes an hour.

### Usability

Five people, a prototype, and a task. Watch where they stop. This is the cheapest high-yield test in
the set and it does not need a working product — paper works.

---

## Reading the result honestly

The hard part. You designed the test because you had a hypothesis, and you want it to be true.

- **Decide pass/fail criteria before running.** Non-negotiable.
- **A weak positive is a negative.** "Some people said it was interesting" means no. Interest is
  free; commitment is the signal.
- **Beware the sample you recruited.** If you tested with friendly users, you measured friendliness.
- **A failed assumption is a good outcome.** It cost days instead of months. Say so plainly — a team
  that treats disconfirmation as failure will stop running honest tests within two cycles.

**Record what you ruled out**, not just what you learned. "We confirmed the vendor API cannot filter
by date, so client-side filtering is required" saves the next person from re-deriving it.

---

## Labeling evidence

Every claim in a brief carries its status. This is Article X applied to discovery.

```
[verified: 6 of 8 interviews, Oct 2026]
[inferred: consistent with the support ticket pattern, not directly asked]
[assumption: untested — riskiest assumption, test scheduled]
```

Unlabeled claims become facts in the PRD, then requirements, then code. The label is a few
characters and it survives three documents downstream.

---

## Anti-patterns

- **Testing the assumption you are confident about.** Comfortable, and it teaches you nothing.
- **No failure criterion defined in advance.** The result will be read favorably.
- **A test as expensive as the build.** Then build it and learn from the real thing.
- **Treating interest as commitment.** "Sounds useful" is what people say to be polite.
- **Recruiting friendly users.** You measured friendliness.
- **A spike that ships.** Every shortcut taken while answering a different question, now in
  production.
- **Reasoning presented as evidence.** Reasoning is what produced the assumption.
- **Treating a disconfirmed assumption as a failure.** It is the cheapest possible outcome, and
  punishing it ends honest testing.
- **Unlabeled claims.** Three documents later they are requirements.
