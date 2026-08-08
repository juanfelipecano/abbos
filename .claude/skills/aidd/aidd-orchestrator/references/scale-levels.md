# Scale Levels

Choosing how much method to apply, which is the first decision of every run and the one that
determines whether the method helps or gets abandoned.

Two failure modes, and they are not symmetric. Over-ceremony on a small change teaches everyone the
process is theater, and once that belief sets in it applies to the big changes too. Under-ceremony
on a large change costs a rewrite. **The first failure is more damaging because it is contagious.**

When genuinely torn, pick lower. Escalating mid-run costs one handoff.

---

## The levels

| Level | Trigger | Roles | Spec |
|---|---|---|---|
| **L0** | No behavior change | `implementer` | None |
| **L1** | Approach is obvious; you can name the files | `planner` → `implementer` → `qa` | Inline spec |
| **L2** | Multiple layers, or an ADR is warranted | `architect` → specialists → `planner` → build → validate → sign-off | Tech spec + specialist criteria |
| **L3** | Problem not yet defined, or spans systems | `analyst` → `product-manager` → L2 chain | Brief → PRD → architecture → shards |

---

## Deciding, concretely

Run these tests in order. The first one that fires sets the level.

**Does behavior change?** No → **L0**. Typos, copy, config values, version bumps, comment fixes. The
constitution still applies — evidence, minimum diff, atomic commit — but there is no spec and no
pipeline.

Careful: a config value that changes a timeout *is* a behavior change. "No behavior change" means
genuinely none.

**Do you know what problem you are solving?** No → **L3**. This is the most commonly missed
promotion. A request arriving as "users are complaining about reports" has no defined problem, and
starting at L2 means the architect invents one.

**Would a competent engineer want an ADR?** Yes → at least **L2**. A useful proxy: is there a
decision here that someone will ask about in a year? Storage choice, a new dependency, a contract
shape, a consistency model.

**Can you name the files that will change?** No → at least **L2**. Not being able to name them means
you do not yet understand the change, which is the architect's work.

**Does it cross a system boundary or a team?** Yes → **L3**. Coordination is the cost driver, not
code.

Otherwise → **L1**.

---

## Signals you got it wrong

Levels are revisable. Detecting the mistake early is cheap; detecting it at review is not.

### Promote L1 → L2 when

- The planner reports the approach is not obvious after all
- Gap analysis reveals the change touches a boundary in `PROJECT-CONTEXT.md`
- The implementer's first escalation is a design question rather than a bug
- Two criteria turn out to contradict
- The work needs a schema change nobody anticipated

**Promotion is a legitimate outcome, not a planning failure.** Say so explicitly when you do it — a
team that treats promotion as embarrassment will under-level to avoid it.

### Promote L2 → L3 when

- The PRD does not exist and the architect is inventing requirements
- Stakeholders disagree about what the feature is for
- The architecture work keeps stalling on an unanswered product question

That last one is the tell. An architect who cannot proceed without a product decision is
demonstrating that discovery was skipped.

### Demote when

- L2 was chosen but the architect's output is one paragraph and no ADR
- L3 was chosen but the analyst finds the problem was already well understood
- The specialists all append zero criteria

Demoting mid-run is rare but correct when it happens. The signal is roles producing empty artifacts
because there is nothing for them to say.

---

## Level does not mean importance

A common confusion worth stating plainly. A one-line change to a payment calculation is **L0 or L1
by scope** and maximum importance by consequence.

Level determines **how much process**, not **how much care**. The constitution applies at every
level: evidence before done, minimum diff, atomic commits, tests as the contract.

Where importance changes the routing at low levels:

| Situation | Adjustment |
|---|---|
| L1 touching auth, money, or permissions | Route through `aidd-security` anyway |
| L1 touching a `PROJECT-CONTEXT.md` boundary | Requires architect approval regardless of level |
| L0 in a file with no test coverage | Add the test; it is not really L0 |
| L1 with a concurrency-sensitive write path | Route through `aidd-backend` |

These are surgical additions, not promotions. Adding one specialist to an L1 run is much cheaper
than running the full L2 chain, and it is the right answer more often than either extreme.

---

## Skipping specialists at L2

At L2 the specialist set is `backend` + `frontend` + `security` + `qa`. Two may be skipped, one may
not.

- **Skip `frontend`** when there is genuinely no UI. Check rather than assume — a feature that adds a
  field the client renders has a UI surface.
- **Skip `backend`** when there is genuinely no server-side behavior. Same caution: a UI-only change
  that reads a new field has changed a contract.
- **Never skip `security`.** "This has no security surface" is a conclusion the security role
  reaches after looking, not an assumption you make before. The cost of asking is one turn; the cost
  of being wrong is a vulnerability that shipped through a process designed to catch it.
- **Never skip `qa`.** They make the criteria testable, which everything downstream depends on.

---

## Worked examples

| Request | Level | Why |
|---|---|---|
| "Fix the typo in the login header" | L0 | No behavior change |
| "The export button should say Download" | L0 | Copy only |
| "Increase the API timeout to 30s" | L1 | Behavior changes; consequences worth a criterion |
| "Add a `status` filter to the orders list" | L1 | Obvious approach, nameable files |
| "Non-owners shouldn't see other people's orders" | L1 + security | Small change, high consequence |
| "Let users export reports as CSV" | L2 | Multiple layers, contract decisions |
| "Add scheduled exports" | L2 | Needs a job design; an ADR is warranted |
| "Move to event-driven order processing" | L3 | Cross-system, architectural, high risk |
| "Users are complaining about reports" | L3 | No defined problem |
| "We should add AI to this" | L3 | A solution with no stated problem |

The last two are the same category and the most common real-world input. Both start with the
analyst.

---

## Stating the decision

One line, at the top of the run. It sets expectations for every downstream role.

```
IADD Run: csv-export | Level: L2 | Iter-1 of 3 | Phase: design
Reason: touches API, data, and UI; storage format is a decision worth an ADR.
Specialists: backend, frontend, security, qa. (frontend included — new UI surface.)
```

If the user disagrees with the level, **take theirs.** They have context you do not. Note the
disagreement and proceed; if the level turns out wrong, the promotion signals above will catch it.

---

## Anti-patterns

- **Routing without stating a level.** Every downstream role guesses how much rigor applies.
- **Defaulting to L2 for safety.** Ceremony on small changes teaches everyone the process is theater.
- **Confusing level with importance.** A one-line payment fix is L1 and maximum care.
- **Treating promotion as a planning failure.** Teams then under-level to avoid the embarrassment.
- **Skipping security because the change looks safe.** That is a conclusion, not an assumption.
- **Assuming no UI without checking.** A new rendered field is a UI surface.
- **Starting at L2 when the problem is undefined.** The architect invents requirements.
- **Overriding the user's level choice.** They have context you do not.
