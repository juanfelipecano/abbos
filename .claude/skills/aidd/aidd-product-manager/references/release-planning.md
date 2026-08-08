# Release Planning

Deciding what ships together, to whom, and what would make you stop.

Deploying and releasing are different acts. Deploying puts code on a server; releasing exposes
behavior to users. Keeping them separate is what makes everything else in this file possible.

---

## Phase by learning

Each phase should answer a question you cannot answer from a desk. If a phase teaches you nothing,
it is a schedule, not a plan — merge it with its neighbor.

```markdown
| Phase | Contents | Question it answers | Gate to next |
|---|---|---|---|
| 1 | Core flow, CSV only, 5 design partners, flagged | Does anyone finish the flow unaided? | 20 completions, error rate < 1%, no escalations |
| 2 | All formats + scheduling, 10% of accounts | Does it hold at volume? | p95 < 800ms, support contacts flat for 2 weeks |
| 3 | General availability | — | — |
```

**A gate is a condition, not a date.** "Two weeks later" tells you when, not whether. The condition
is what makes it a decision point — and it converts directly into `aidd-devops`'s watch-window abort
threshold, which is where it does its real work.

Write the gate so that failing it is a real possibility. A gate everyone knows will pass is
paperwork.

---

## Rollout mechanisms

| Mechanism | Exposes to | Use when | Cost |
|---|---|---|---|
| **Feature flag** | A chosen cohort | Almost always. Decouples deploy from release | Flag hygiene; branching complexity |
| **Percentage rollout** | Random n% | You need volume-representative signal | Users get inconsistent experiences across sessions unless you bucket by user |
| **Ring / cohort** | Internal → design partners → all | You want friendly eyes first | Slower; internal users are not representative |
| **Canary** | Small slice of traffic | Infrastructure or performance risk | Needs per-cohort metrics to be worth anything |
| **Dark launch** | Nobody — runs, output discarded | Validating a rewrite against the original | Double cost; only for high-stakes replacements |

**Bucket percentage rollouts by a stable key** — user or account ID, not per request. Otherwise the
same person sees the feature appear and vanish between page loads, which generates support tickets
that look like bugs.

**Dark launch is underused for rewrites.** Run the new implementation alongside the old, compare
outputs, discard the new one. You get production-traffic validation with zero user risk. It is the
only honest way to validate a replacement of something complex.

---

## Feature flags decay

Every flag is a branch. A codebase with 40 stale flags has an enormous number of nominal
configurations and one that is actually tested.

Rules that keep this from happening:

- **Every flag gets an owner and a removal date when it is created.** Not later — later never comes.
- **The removal task goes in the backlog at creation time**, not at cleanup time.
- **Flags used for release are temporary.** Flags used for entitlement (plan tiers, permissions) are
  permanent and belong in a different system — do not mix them, because the cleanup rules differ
  completely.
- **A flag older than two releases is either permanent or forgotten.** Decide which, in writing.

`aidd-devops` owns flag hygiene operationally; you own not creating flags you never intend to remove.

---

## What ships together

Two constraints usually decide this, and they pull in opposite directions.

**Smaller releases are safer.** Fewer changes, clearer attribution when something breaks, easier
rollback. Default here.

**Some things cannot ship apart.** A schema change and the code that depends on it. A UI that shows
a field the API does not yet return. These have to be sequenced deliberately — usually additive
first, dependent code second, cleanup third, across separate releases (`aidd-devops`'s
`migrations.md`).

The failure is treating "must ship together" as the default rather than the exception. Most things
that feel coupled are only coupled because nobody sequenced them.

---

## Communicating a release

| Audience | Needs | Where |
|---|---|---|
| Users | What changed for them, what to do differently | In-product notice, changelog |
| Support | What changed, known gaps, how to identify affected users, the workaround | Before release, not with it |
| Sales / CS | What is now possible, what is still not | Before, if it changes what they can promise |
| Engineering | What is flagged, the rollback path, what to watch | Release record |

**Support gets told before the release, not with it.** A support team that learns about a change from
a confused customer will spend the first day of every release rediscovering it, and their confidence
in your process is what determines whether they escalate early or late.

Include the **known gaps** explicitly. Support handling a known limitation with a known workaround is
routine; support discovering it live is an incident.

---

## Deciding to stop

Define this before releasing, when it is still an analytical question rather than an emotional one.

```markdown
## Abort conditions
| Signal | Threshold | Action |
|---|---|---|
| Error rate | > 1% for 5 min | Flag off, investigate |
| p95 latency | > 2s for 10 min | Flag off |
| Support contacts | > 5 on this feature in 1 hour | Pause rollout, assess |
| Data integrity | Any confirmed instance | Full rollback, incident |

**Watch window**: 60 minutes at each rollout step, with a named owner watching.
```

Two properties that make this work: **numbers, not judgment**, and **a named person**. "We will
monitor" means nobody is watching. Someone must own the window and have the authority to flag off
without a meeting.

**Rolling back is not a failure.** Treat it as the mechanism working. A team that treats rollback as
embarrassing will hesitate, and hesitation is what turns a contained problem into an incident.

---

## After the release

- **Verify the gate condition** actually held, with numbers, before moving to the next phase. This is
  the step everyone skips once phase 1 goes smoothly.
- **Check the metric you promised** in the PRD, at the interval you promised.
- **Close the loop on the leading indicator** — did it predict what you assumed it would? That is how
  the next PRD's metrics get better.
- **Remove the flag** once the rollout completes. Now, not next quarter.
- **Feed what you learned back into the retrospective**, per Article XII: which document, had it been
  clearer, would have prevented the surprise?

---

## Anti-patterns

- **Phase gates that are dates.** When, not whether.
- **A gate that cannot fail.** Paperwork.
- **Percentage rollout bucketed per request.** The feature flickers; users file bugs.
- **Flags with no owner or removal date.** Permanent untested branching.
- **Mixing release flags and entitlement flags.** Different lifecycles, different cleanup rules.
- **Shipping a destructive migration with the code that stops using the column.** Rollback becomes
  impossible.
- **Telling support at release time.** They rediscover every change from confused customers.
- **Omitting known gaps from the support brief.** A routine limitation becomes an incident.
- **"We will monitor."** Nobody is watching. Name the person and the window.
- **Treating rollback as failure.** Hesitation turns a contained problem into an incident.
- **Skipping gate verification after a smooth phase 1.** The habit is the point.
