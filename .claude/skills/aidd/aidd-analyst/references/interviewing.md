# Interviewing

How to extract what is true from people who are trying to be helpful.

The core difficulty: people are cooperative. Ask a leading question and they will agree. Ask what
they want and they will invent something. Ask what they did last Tuesday and you get a fact. Every
technique here is a way of steering toward the third case.

---

## The past is data, the future is fiction

The single most important rule. People are unreliable predictors of their own behavior and reliable
reporters of their own history.

| Ask this | Not this |
|---|---|
| "Walk me through the last time this happened" | "What would you do if this happened?" |
| "What did you do instead?" | "Would you use a tool that did X?" |
| "How long did that take you?" | "How much time would this save you?" |
| "Who else was involved?" | "Who would need to approve this?" |
| "What happened next?" | "What would you want to happen?" |

The right-hand column produces confident, specific, useless answers. People construct plausible
futures on the spot and believe them, and you will write that construction into a brief.

**The exception worth knowing.** Asking about the future is fine when you are asking about
*commitment*, not preference: "Would you pay for this?" is weak; "Here is the invoice, will you sign
it?" is strong. Anything between those is noise.

---

## Question design

**Open before closed.** Start with questions that cannot be answered yes or no. Closed questions
confirm what you already think; open questions surface what you did not think of. Move to closed
only to pin down specifics.

**One question at a time.** A double-barreled question gets one answer and you will not know which
half it addressed.

**Silence is a technique.** After an answer, wait. Three seconds of silence produces the second,
more honest half of the answer more reliably than any follow-up. Interviewers fill silence; the
discipline is not to.

**Ask for the story, not the summary.** "We have a manual process" is a summary. "Walk me through
what you did this morning" produces the steps, the workarounds, the spreadsheet nobody mentioned,
and the person they had to email.

### The five whys, done properly

The technique is widely misapplied as an interrogation. Used correctly it traces a causal chain, and
it stops when it reaches something actionable rather than at a fixed count.

Rules that make it work:
- Ask about the *process*, not the person. "Why did the step fail?" not "Why did you fail?"
- Stop when you reach something you can change. Five is a heuristic, not a quota.
- If two answers branch, follow both. Real causes are rarely a single chain.
- Verify each link. An unverified chain becomes a confident wrong answer very quickly.

---

## Biases to design around

These are not the interviewee's flaws. They are properties of the situation, and your questions
either amplify or dampen them.

| Bias | What it looks like | Counter |
|---|---|---|
| **Acquiescence** | Agreeing with whatever you propose | Never propose. Ask them to describe |
| **Social desirability** | Reporting the behavior they wish they had | Ask about specific past instances, not habits |
| **Recency** | Last week's incident dominates the account | Ask for the last three occurrences, not "typically" |
| **Expert blindness** | Skipping steps that are obvious to them | "Pretend I have never seen this" — then watch them do it |
| **Sunk cost** | Defending the current process because they built it | Ask what they would tell a new hire to avoid |
| **Your own confirmation bias** | Hearing support for your hypothesis | Write the hypothesis down first, then look for disconfirmation |

The last one is yours and it is the most dangerous, because nobody else in the room will catch it.

---

## Who to talk to

**The person doing the work, not the person who owns it.** Managers describe the process as designed.
Practitioners describe it as performed, and the gap between those is where the product opportunity
usually is.

**Talk to the people who churned or refused.** The strongest signal available and the most commonly
skipped, because it is uncomfortable. Someone who evaluated the alternative and chose not to adopt it
will tell you the actual objection in one sentence.

**Extremes over averages.** The heaviest user and the person who gave up after a week both know
things the median user cannot articulate.

**Enough is fewer than you think, for qualitative work.** Five to eight people in one segment
surfaces most recurring themes. If you are hearing the same three things by person five, more
interviews of the same segment will confirm rather than inform — spend the budget on a *different*
segment instead.

That number is for discovering themes, not measuring them. "Six of eight mentioned X" is a finding
worth pursuing; it is not a statistic, and writing it as a percentage misrepresents it.

---

## Running the session

1. **Say what this is and is not.** "I am trying to understand the problem, not sell you anything,
   and nothing is being built yet." This removes the pressure to be encouraging.
2. **Start broad and concrete.** "Tell me about your role" → "walk me through yesterday".
3. **Follow energy.** When someone becomes animated — frustrated, emphatic, funny — go there. That
   is where the real cost is.
4. **Ask for artifacts.** The spreadsheet, the checklist, the group chat. What people actually use
   contradicts what they describe more often than not.
5. **Close with two questions.** "What did I not ask about that I should have?" and "Who else should
   I talk to?"

**Record verbatim where you can.** Paraphrasing drifts toward the solution you are already imagining.
The exact words matter — they are also the best copy you will ever write for this product.

---

## Turning transcripts into findings

Raw notes are not a finding. The processing step is where most of the value is created and most
often skipped.

```markdown
## Interview synthesis — <segment>, n=<count>

### Recurring themes
| Theme | Mentioned by | Representative quote | Confidence |
|---|---|---|---|
| <theme> | 6/8 | "<verbatim>" | high |

### Contradictions
<Where interviewees disagreed. Do not average them — a split usually means two segments.>

### Surprises
<What contradicted our going-in hypothesis. The most valuable section.>

### Workarounds observed
<What people built to cope. A workaround is a specification written in frustration.>

### Quotes worth keeping
<Verbatim. These become the brief's evidence and often the product's copy.>
```

**Workarounds deserve their own section.** A spreadsheet someone maintains by hand every Friday is a
requirements document with a cost already attached. It tells you what to build, what it is worth,
and that someone is already paying for it.

**Label confidence on every theme.** `[verified: 6 of 8 said this]`, `[inferred: consistent with
what three described]`, `[assumption: nobody said this, I believe it]`. An unlabeled assumption
becomes a fact in the brief, then a requirement, then code (Article X).

---

## Anti-patterns

- **Pitching instead of asking.** Once you describe the solution, the interview is over — everything
  after is politeness.
- **Leading questions.** "Wouldn't it help if…" produces agreement, not information.
- **Asking people to predict their behavior.** Confident, specific, and wrong.
- **Interviewing only managers.** You get the process as designed, not as performed.
- **Skipping the people who said no.** The clearest signal available, avoided because it stings.
- **Filling silence.** The second half of the answer is the honest half.
- **Taking summaries instead of stories.** "It's manual" hides the six steps you needed.
- **Presenting qualitative counts as percentages.** Eight interviews is not a survey.
- **Averaging contradictory answers.** A split is a segmentation finding, not noise.
- **Unlabeled assumptions in the synthesis.** They become requirements within two documents.
