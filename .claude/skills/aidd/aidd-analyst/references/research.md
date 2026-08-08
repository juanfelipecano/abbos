# Research

Desk research, competitive analysis, and market context — done at a depth that informs a decision
without becoming a project of its own.

The discipline is knowing when to stop. Research has no natural endpoint, and an analyst without a
stopping rule produces a thorough document three weeks after the decision was made.

---

## Start from the decision

Before opening anything, write down: **what decision does this research inform, and what would
change my recommendation?**

If you cannot answer, you are not researching — you are reading. The answer also gives you the
stopping rule: stop when you can make the decision, or when you have established that the available
evidence cannot settle it.

Timebox it. Half a day for most questions, two days for a significant commitment. Announce the box
before starting, because research expands to fill whatever time it is given.

---

## Competitive analysis

The common failure is a feature matrix. It is easy to build, looks rigorous, and answers a question
nobody asked — features are not why people choose, and a matrix converges every product toward the
same feature set.

Ask instead:

| Question | Why it matters |
|---|---|
| What job does each competitor's positioning claim? | Reveals the segment they are actually serving |
| Who do they say they are *not* for? | The clearest strategy signal available, and rare |
| What do their negative reviews say? | The real gaps, from real users, in their words |
| What do people who left them say? | Even better. Search "<product> alternative" and "migrating from <product>" |
| What is their pricing model? | Encodes their assumption about value and their target buyer |
| What did they build last year? | Their roadmap direction, revealed rather than stated |
| How long have they existed at this size? | A ten-year-old product that never grew found a ceiling |

**Negative reviews and churn posts are the highest-yield source in competitive research**, and the
least used. They are specific, honest, unprompted, and they name the exact friction.

**Include the non-obvious competitors.** Spreadsheets, email, an intern, an internal tool, and doing
nothing. These usually hold the largest share and never appear in a feature matrix.

### A useful output shape

```markdown
| Product | Job it claims | Segment | Priced by | Loudest complaint | Where we would differ |
|---|---|---|---|---|---|
```

The last column is the point. If you cannot fill it in for the market leader, you have found
something important, and it is worth saying out loud before anyone writes a PRD.

---

## Sizing a market

Rarely needs precision. It needs an order of magnitude and a stated method, because the number will
be quoted for a year regardless of how it was derived.

**Bottom-up beats top-down.** "1% of a $4B market" is a rhetorical device — every plan claims 1% and
1% of a market is not a customer. Build it from units instead:

```
<number of organizations that have this problem>
  × <fraction reachable through channels we actually have>
  × <realistic price point>
  = addressable revenue
```

State each input's basis and its confidence. The output inherits the weakest input, so a number
built on one guessed multiplier is a guess wearing arithmetic.

**Sanity-check against a known comparable.** If your bottom-up number implies you would be larger
than an established player in the same space, an input is wrong.

---

## Evaluating sources

| Source | Trust | Watch for |
|---|---|---|
| Primary interviews you ran | Highest | Your own leading questions |
| Public support forums, reviews, churn posts | High | Loud minority; only the frustrated post |
| Vendor documentation | High on capability, zero on suitability | Roadmap items described as present |
| Analyst reports | Medium | Often vendor-funded; check who paid |
| Vendor case studies | Low | Selected, edited, and sometimes fictional |
| Benchmarks by a vendor | Low | Configured to win. Assume so unless the config is published |
| A blog post repeating a statistic | Zero until traced | Chains of citation that end nowhere |

**Trace statistics to the primary source.** A large fraction of widely-repeated industry statistics
either do not survive tracing or turn out to mean something narrower than the claim. If you cannot
find the study, do not use the number.

---

## Labeling

Every claim gets a status marker. Same discipline as `assumption-testing.md`, applied to secondary
research:

```
[verified: <source, date>]
[inferred: <the reasoning>]
[assumption: untested]
```

Do this as you write, not afterward. Retrofitting labels is unpleasant enough that it does not
happen, and an unlabeled claim is indistinguishable from a verified one two documents downstream.

Prefer a date on anything time-sensitive. "Competitor X has no API `[verified: their docs,
2026-03]`" ages honestly; without the date it becomes permanently true.

---

## Synthesis

Raw findings are not a deliverable. The synthesis step is the work.

```markdown
## Research summary — <question>

**Decision this informs**: <the decision>
**Timebox**: <spent>

### Answer
<Two or three sentences. The recommendation, up front.>

### What I found
| Finding | Source | Confidence | Implication |
|---|---|---|---|

### What contradicts it
<Findings that cut against the recommendation. If this section is empty, you did not look —
every real question has counter-evidence.>

### What I could not establish
<Explicit gaps. These become assumptions to test, not silences.>

### Sources
<Links, with dates.>
```

**The contradicting section is mandatory.** A research summary with no counter-evidence is either
incomplete or is advocacy, and both mislead the person who acts on it.

---

## Anti-patterns

- **Researching without a decision in mind.** No stopping rule; the document arrives after the
  decision.
- **A feature matrix as competitive analysis.** Converges everyone toward the same product.
- **Omitting spreadsheets, email, and doing nothing.** Usually the market leaders.
- **Top-down sizing.** "1% of a big market" is a rhetorical device, not a plan.
- **Quoting a statistic you did not trace.** Many do not survive tracing.
- **Vendor benchmarks taken at face value.** Configured to win.
- **Case studies as evidence.** Selected, edited, sometimes fictional.
- **Undated claims about a competitor.** Permanently true, increasingly wrong.
- **No contradicting-evidence section.** Advocacy in the shape of research.
- **Findings without implications.** A list of facts is not a synthesis; someone else has to do the
  thinking you were asked to do.
