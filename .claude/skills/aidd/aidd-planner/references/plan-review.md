# Plan Review

Checking a plan before it goes to the implementer, when fixing it is still free.

A plan is reviewed once, by you, in about ten minutes. The alternative is discovering the gap at
task 6, after five commits have been built on an assumption that was wrong.

---

## Coverage, both directions

The single highest-value check, and the most commonly skipped because the plan looks complete
without it.

```markdown
| Criterion | Covered by task |
|---|---|
| AC-F1 | 2, 3 |
| AC-F2 | 4 |
| AC-B1 | 5 |
| AC-U1 | 6, 7 |
| AC-S1 | 5, 8 |
| AC-Q1 | 3, 4, 7 |
```

**Criterion → task.** A criterion covered by no task means the plan is incomplete. This is the
failure where every task passes and the spec is still unmet — the implementer reports green, QA
finds the gap, and it costs an iteration.

**Task → criterion.** A task covering no criterion is out of scope (Article III). Delete it, or ask
the architect whether a criterion is missing. This direction is how scope creep enters a plan that
looks rigorous, and it is the one people forget to run.

Build the table explicitly. Do not eyeball it — the whole point is that the gaps are not visible by
reading.

---

## The review checklist

Run all of it. Each item corresponds to a real failure mode.

**Structure**
- [ ] Every task is atomic — one commit, revertible alone
- [ ] Every task names a verification command, not a description of one
- [ ] Every task names the files it touches
- [ ] Dependencies are marked
- [ ] No task contains "and"
- [ ] No task contains a design decision

**Sequence**
- [ ] The riskiest assumption is exercised early, not late
- [ ] Walking skeleton is task 1, for anything new
- [ ] Build is green at every task boundary
- [ ] Schema changes are additive and land before their consumers
- [ ] Test infrastructure lands before the tests needing it

**Coverage**
- [ ] Every criterion maps to at least one task
- [ ] Every task maps to at least one criterion
- [ ] No criterion spans 5+ tasks without an intermediate check

**Reality**
- [ ] I read the code, not just the spec
- [ ] Every file path in the plan exists, or the task creates it
- [ ] The pattern-to-follow is named by path
- [ ] Prerequisite work is flagged separately from scoped work
- [ ] Planning assumptions are written down

**Executability**
- [ ] The verify command is correct and I confirmed it runs
- [ ] An implementer could start task 1 without asking me anything

That last item is the summary of all the others. If you cannot honestly check it, find what is
missing.

---

## Estimation

Give relative size, never hours. Hours get treated as commitments, and a plan is not a commitment —
it is a hypothesis about decomposition.

| Size | Means |
|---|---|
| **S** | One task, one file, obvious |
| **M** | 2–5 tasks, a few files, no unknowns |
| **L** | Needs sharding further before execution |

**L is a signal, not an estimate.** A story sized L has not been decomposed enough; do not hand it
over. Split it or say explicitly why it cannot be split.

**Flag uncertainty rather than padding.** A task you suspect is larger than it looks gets a note:

```
- [ ] 5. Migrate the legacy price rows → src/migrations/, src/pricing/ → `test -- pricing`
        ⚠ Uncertain: the legacy rows may contain nulls the new constraint rejects.
          If so, this splits into a cleanup task plus the migration.
```

That flag is worth more than any number. It tells the implementer where to expect trouble and gives
the orchestrator early warning that the plan may grow.

**Do not estimate to justify the plan.** The estimate is an output, not an argument.

---

## The cone of uncertainty

Early estimates are wrong by large multiples, and the error shrinks only as ambiguity resolves — not
as time passes.

Practical consequences:

- **Estimate the next few tasks precisely, the rest coarsely.** Precision on task 12 is theater.
- **Re-estimate after the walking skeleton.** That is when the largest uncertainty collapses, and the
  revision is information rather than failure.
- **An estimate given before gap analysis is a guess.** Say so if asked for one anyway.

Treat a changed estimate as the process working. A team that punishes revision gets estimates that
never change and are never right.

---

## When the plan reveals a spec problem

Planning is the second-best defect-detection step in the method, after review. You are the first
person to read the spec while thinking concretely about execution, and that surfaces things.

| What you find | Route |
|---|---|
| A criterion with no possible verification | `aidd-qa` — it needs rewriting before freeze |
| Two criteria that contradict | `aidd-architect` — a design question |
| A criterion requiring a boundary change | `aidd-architect` — needs explicit approval |
| A criterion whose cost is wildly disproportionate | `aidd-product-manager` via the orchestrator — worth a scope conversation |
| Missing prerequisite work | Add it, flag it as prerequisite |
| The approach will not work at all | `aidd-architect` — do not plan around it |

**Do not plan around a spec problem.** A plan that quietly works around a bad criterion produces
code that satisfies the plan and fails the spec, and nobody can see where it diverged. Raise it while
the spec is still open — after the freeze, the same finding costs an iteration.

This is the last moment before Article V takes effect. Use it.

---

## Handing off

```markdown
## Handoff → aidd-implementer

### Plan
specs/<feature>/plan.md — <n> tasks
Spec: specs/<feature>/spec.md — FROZEN
Active pointer: .aidd-active → <feature>
Verify: `<command>` (confirmed running)

### Start here
Task 1: <exact task, and why it is first>

### Coverage
All <n> criteria mapped. All <n> tasks mapped to a criterion.

### Prerequisite work
| Task | Why the spec assumed it existed |

### Risk front-loaded
Task <n> first because <what it invalidates if it fails>.

### Patterns
| Task | Follow |

### Assumptions
<If any is wrong, the sequence is wrong.>

### Flagged uncertainty
<Tasks I suspect are larger than they look.>
```

---

## Anti-patterns

- **No coverage table.** The most common cause of a plan that passes every task and fails the spec.
- **Only checking criterion → task.** The reverse direction is how scope creep passes review.
- **Eyeballing coverage.** The gaps are not visible by reading; build the table.
- **Hour estimates.** Treated as commitments.
- **Handing over an L-sized story.** It has not been decomposed.
- **Padding instead of flagging.** The flag is more useful than the number.
- **Precise estimates for task 12.** Theater.
- **Punishing revised estimates.** You get stable estimates that are never right.
- **Planning around a bad criterion.** Produces code that satisfies the plan and fails the spec.
- **An unverified verify command.** The loop burns three attempts on your typo.
