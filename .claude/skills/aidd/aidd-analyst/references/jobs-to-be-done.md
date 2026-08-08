# Jobs to be Done

A framing that keeps you focused on the progress someone is trying to make, rather than on the
product you are imagining.

The value is not the vocabulary. It is that JTBD makes competition visible: your real competitor is
whatever the person does *today*, which is usually a spreadsheet, a habit, or nothing at all.

---

## The frame

> When **<situation>**, I want to **<motivation>**, so I can **<expected outcome>**.

Three parts, each doing work:

**Situation** is the trigger. Not a demographic — a circumstance. "When a customer emails asking to
change an order that already shipped" is a situation. "Operations managers at mid-market retailers"
is a market segment, and it tells you nothing about when the need arises.

**Motivation** is what they are trying to do, stated without reference to any solution. If a
technology appears here, you have written a feature request.

**Outcome** is how they will judge success. This is what your metric should measure.

The test of a well-formed job: **it would have been true ten years ago and will be true in ten
years.** Jobs are stable; solutions are not. "Send a fax" is a solution. "Get a signed document to
someone quickly, with proof they received it" is a job — and it explains why fax survived two
decades past its obituary.

---

## Functional, emotional, social

Every job has three dimensions, and products fail by serving only the first.

| Dimension | The question | Example — expense reports |
|---|---|---|
| **Functional** | What task must be completed? | Get reimbursed accurately |
| **Emotional** | How do they want to feel? | Not anxious about an audit; not stupid for filing wrong |
| **Social** | How do they want to be seen? | Not the person finance chases every month |

The functional dimension is table stakes and usually already served. The emotional and social
dimensions are where switching actually happens, and where the copy, the defaults, and the error
messages do their work.

A feature that solves the functional job while worsening the social one gets rejected for reasons
nobody will state in a survey.

---

## Forces of progress

Why people switch, and — more usefully — why they do not. Four forces act on any change, and the
switch happens only when the first two exceed the second two.

```
        PUSH of the situation  ──┐
                                 ├──►  toward the new solution
        PULL of the new idea   ──┘

        HABIT of the present   ──┐
                                 ├──►  against switching
        ANXIETY about the new  ──┘
```

| Force | What it is | How you influence it |
|---|---|---|
| **Push** | The problem with today. Frustration, a triggering incident | You cannot create it. You can find people who already feel it |
| **Pull** | The appeal of the new way | Product, positioning, the demo |
| **Habit** | Existing investment, comfort, sunk cost | Reduce switching cost. Import their data. Match their vocabulary |
| **Anxiety** | Fear of the new thing failing, of looking foolish | Guarantees, trials, migration help, social proof |

**Most product effort goes into pull, and most lost deals are anxiety and habit.** Asking "what
almost stopped you?" of a customer who did adopt is the highest-yield interview question in this
whole frame — the answer names the anxiety that stopped ten others silently.

This also tells you who to sell to: someone with no push will not switch regardless of how good the
pull is. Find the people already in pain.

---

## The switch interview

An interview format for people who recently changed solutions — adopted yours, left yours, or
adopted a competitor. Recency matters; memory of the decision decays within weeks.

Work backward from the purchase, reconstructing the timeline:

1. **When did you first realize you needed something different?** (first thought — often months
   before the purchase)
2. **What was happening at that time?** (the push)
3. **What did you do next?** (passive looking — usually a long, quiet period)
4. **What made you start actively looking?** (the triggering event — this is the one that matters)
5. **What did you consider?** (the real competitive set, which is rarely what you assumed)
6. **What almost stopped you?** (anxiety and habit — the most valuable answer)
7. **Who else was involved in deciding?** (the hidden approver)
8. **What did you expect it to be like, and what was it actually like?** (the expectation gap)

Two findings show up almost every time and neither appears in a feature request:

- **The triggering event is more specific than anyone assumes.** Not "we grew" but "we hired a
  second bookkeeper and they disagreed about the numbers."
- **The competitive set is wrong.** People compare against a spreadsheet, an intern, and doing
  nothing far more often than against the product you benchmark against.

---

## Outcome statements

The rigorous form of a job, useful for prioritizing. Structure:

> **<direction>** the **<metric>** it takes to **<object of control>** **<context>**

- "*Minimize* the *time* it takes to *reconcile a payment* *when the reference is missing*"
- "*Reduce* the *likelihood* of *filing an expense in the wrong category*"

Rate each on two scales, 1–10, from your interviews: **how important is it** and **how satisfied are
they today**. Then:

```
Opportunity = Importance + max(Importance − Satisfaction, 0)
```

High importance with low satisfaction is where to build. High importance with high satisfaction is
where not to — you would be competing against something that already works, which is expensive and
usually loses.

Treat the number as a sorting aid, not a measurement. Its value is that it forces you to ask both
questions per outcome and to notice the important-but-already-solved ones you were about to build.

---

## Applying it

```markdown
## Job — <short name>

**Statement**: When <situation>, I want to <motivation>, so I can <outcome>.

**Dimensions**
| | |
|---|---|
| Functional | |
| Emotional | |
| Social | |

**Hired today**: <what they currently use, including "nothing" and "a spreadsheet">
**Why it underserves**: <specific — this is the opening>

**Forces**
| Push | Pull | Habit | Anxiety |
|---|---|---|---|

**Trigger**: <the specific event that starts active looking>

**Outcome statements**
| Outcome | Importance | Satisfaction | Opportunity |
|---|---|---|---|

**Evidence**: <interviews, n=; or: assumption, untested>
```

---

## Anti-patterns

- **A solution in the motivation clause.** "I want a dashboard" is a feature request wearing a job's
  grammar.
- **Demographics as the situation.** A segment is not a trigger; it tells you nothing about when.
- **Serving only the functional dimension.** Rejected for reasons nobody puts in a survey.
- **Ignoring "does nothing" as a competitor.** It usually has the largest market share.
- **Optimizing pull when you are losing to anxiety.** More features will not fix a trust problem.
- **Selling to people with no push.** No amount of pull moves someone who is not in pain.
- **Interviewing about the decision months later.** The reasoning is reconstructed, not recalled.
- **Treating the opportunity score as a measurement.** It is a sorting aid built from your own
  ratings.
- **A job statement that would not have been true ten years ago.** You have written down a solution.
