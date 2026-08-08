# Story Splitting

How to cut work into slices that each deliver something, rather than halves that only work together.

The test of a good split: **each piece could ship alone and someone would be better off.** A split
that produces "the backend part" and "the frontend part" has not split the story — it has scheduled
two thirds of a story and a integration risk.

---

## Vertical, not horizontal

Slice through the layers, not between them.

```
        ✅ VERTICAL                    ❌ HORIZONTAL

   ┌───┬───┬───┐                  ┌───────────────┐
UI │ 1 │ 2 │ 3 │               UI │       3       │
   ├───┼───┼───┤                  ├───────────────┤
API│ 1 │ 2 │ 3 │              API │       2       │
   ├───┼───┼───┤                  ├───────────────┤
DB │ 1 │ 2 │ 3 │               DB │       1       │
   └───┴───┴───┘                  └───────────────┘

  each slice ships              nothing ships until 3
```

Horizontal slicing feels efficient — one person owns a layer, the work looks parallel. It defers all
integration risk to the end, delivers nothing verifiable until the last piece lands, and produces
the classic "95% done for three weeks" state.

The vertical slice may be absurdly narrow. That is fine. "A user can export exactly one report as
CSV, no filters, no scheduling" touches every layer and is genuinely usable.

---

## SPIDR

Five cuts that cover most real situations. Five is few enough to run through mentally during
refinement, which is why this one gets used and larger catalogs do not.

### Spike
The story is not splittable because nobody knows enough. Cut off a timeboxed investigation, then
split the remainder with real information.

> "Investigate whether the vendor API supports date filtering — 1 day, output is a decision"

Use sparingly. A spike is not a way to avoid deciding, and a backlog of spikes is a backlog of
deferred thinking. Timebox it and require a written answer.

### Path
The story has multiple flows. Ship one; defer the rest.

> Original: "A user can pay for their order"
> - Pay with a saved card (happy path)
> - Pay with a new card
> - Pay with a card that gets declined
> - Pay with a card requiring 3DS

Happy path first — it proves the whole chain works end to end. Then the paths in order of frequency.

### Interface
Split by how the capability is reached, or by fidelity of presentation.

> - Export via an API endpoint
> - Export via a button in the UI
> - Export with a progress indicator and email on completion

Also splits browsers, devices, and locales. A rough interface that works beats a polished one that
does not exist.

### Data
Split by which data it handles.

> - Export the five core fields
> - Export custom fields
> - Export nested line items

Often the largest real reduction, because the long tail of field types is where most of the effort
hides.

### Rules
Relax a business rule now, add it later.

> - Export up to 100 rows synchronously
> - Support exports up to 1M rows via a background job

The most powerful cut and the most often missed. Ask: **which rule, if we relaxed it, would make
this a quarter of the size?** Then ship with the relaxed rule and a stated limit.

---

## Other reliable cuts

| Cut | Example |
|---|---|
| **Happy path / sad path** | Working flow first, error handling as a follow-on with explicit criteria |
| **Manual then automated** | Ops runs it by hand for the first ten customers; automate once the workflow is proven |
| **Hardcode then configure** | One fixed template, then user-defined templates |
| **Single then bulk** | One record, then multi-select, then whole-account |
| **Defer the non-functional** | Works correctly at 100 rows; performance work is a separate story with its own budget |

That last one needs care. Deferring performance is legitimate when the criterion is explicit
("correct at 100 rows; 10k is story 4"). It is not legitimate as a silent omission that surfaces in
production.

---

## INVEST

A checklist for a finished story, not a splitting technique.

| Letter | Means | The check |
|---|---|---|
| **I**ndependent | Can be built without waiting on another story | If it cannot, say what blocks it |
| **N**egotiable | Describes the need, not the implementation | No prescribed solution in the story |
| **V**aluable | Someone is better off when it ships | If you cannot name who, it is a task |
| **E**stimable | The team can size it | If not, it needs a spike |
| **S**mall | Fits comfortably in an iteration | 3–8 tasks once planned |
| **T**estable | Has verifiable criteria | See `acceptance-criteria.md` |

**Valuable is the one that catches horizontal slices.** "Build the export API" fails it — no user is
better off. That single check prevents most bad splits.

---

## When to stop splitting

Splitting has a cost: coordination, more handoffs, more review. Signals you have gone too far:

- The story is smaller than the overhead of tracking it
- It cannot ship alone and never could
- Its criteria are a single line with no edge cases
- You are splitting to hit a number rather than to reduce risk

**Rule of thumb: 3–8 implementation tasks per story.** More means split. Fewer probably means it is a
task in a story's clothing, and it can join a neighbor.

---

## Ordering after the split

Splitting produces a set; ordering makes it a plan. Sequence by **dependency, then risk, then
value** — risk before value is the part people get wrong.

Front-load the slice that would invalidate the plan if it fails. If story 6 depends on the vendor API
doing something unconfirmed, story 6 becomes story 1 — or it becomes a spike that runs first.

Discovering in week four that an assumption was wrong is the classic avoidable failure, and one
reordering avoids it.

`aidd-planner` owns the final sequencing, but a PM who hands over an unordered pile has deferred a
decision that needed product context to make.

---

## Anti-patterns

- **Horizontal slices.** Nothing ships until the last one; all integration risk at the end.
- **"Build the API" as a story.** Fails Valuable. Nobody is better off.
- **Splitting by team.** Organizational convenience masquerading as a plan.
- **Spikes instead of decisions.** A backlog of deferred thinking.
- **An untimeboxed spike.** It becomes the implementation, carrying every shortcut.
- **Splitting to hit a story count.** Overhead without risk reduction.
- **Deferring performance silently.** Legitimate only with an explicit stated limit.
- **Stories with "and" in the title.** Two stories.
- **Value ordering before risk ordering.** The bad assumption surfaces in week four.
- **Handing over an unordered set.** Defers a decision that needed your context.
