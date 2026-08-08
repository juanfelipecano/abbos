# Sequencing

Deciding what order the work happens in — which is where most of a plan's value is created or lost.

The default instinct is to sequence by value: build the most important thing first. That instinct is
wrong often enough to be worth overriding deliberately.

---

## Dependency, then risk, then value

**Dependency** is a hard constraint. A task that cannot start until another finishes goes after it.
Nothing to decide here except making it explicit.

**Risk** comes second, and this is the part people get wrong. Front-load the task that would
**invalidate the plan** if it fails.

**Value** comes last, among the tasks that remain genuinely interchangeable.

---

## Front-loading risk

The question that orders a plan:

> If this turns out to be impossible, how much of the rest becomes wasted?

A task with a high answer goes early regardless of its value. If task 9 depends on a third-party API
doing something nobody has confirmed, **task 9 becomes task 1** — or it becomes a spike that runs
first.

Discovering in week four that the vendor API cannot filter by date is the classic avoidable failure.
It is avoidable by one reordering, made in five minutes, before any code exists.

What counts as invalidating risk:

| Risk | Why it invalidates |
|---|---|
| An external API might not support what the design assumes | The whole integration approach changes |
| The data volume might make the chosen query pattern infeasible | The schema changes |
| A library might not do what its README implies | Build-versus-buy reopens |
| Two systems might disagree about a shared identifier | The data model changes |
| The performance budget might be unreachable in this architecture | Back to the architect |

Each of these is cheap to check early and catastrophic to discover late. Note that all of them route
to the architect — which is the point. **Finding them early means finding them while a spec patch is
still cheap.**

**Do not confuse risky with hard.** Hard work is work you know how to do that takes a while.
Risky work is work that might not be possible. Only the second gets front-loaded.

---

## The critical path

The longest chain of dependent tasks. It sets the floor on elapsed time, and nothing off it can
shorten the plan.

Two uses:

**Attack it first.** Time spent on a task off the critical path buys nothing in elapsed terms.

**Shorten it if you can.** Sometimes a dependency is real; often it is an artifact of how the work
was decomposed. If tasks 3→4→5 form a chain because they all touch one file, restructuring may break
the chain. That is worth ten minutes of thought before committing to a sequence.

For a single implementer working sequentially — the usual case in a Ralph loop — the critical path
matters less than risk ordering. It matters when work is parallelized across agents or people.

---

## Keeping the build green

Every task boundary is a commit, and every commit must be green. This constrains ordering more than
it first appears.

**Additive before destructive.** Add the new column, backfill, read from it, stop writing the old,
then drop it — across separate tasks, sometimes separate releases. Merging "add new" and "remove old"
into one task makes rollback impossible (`aidd-devops`'s `migrations.md`).

**Producer before consumer.** The endpoint that returns a field lands before the UI that renders it.
The reverse leaves a task boundary where the UI is broken.

**Behind a flag when the sequence cannot be made safe.** If a half-built feature would be visible,
the first task adds the flag, off. Then order stops constraining visibility, which frees the rest of
the sequence considerably.

---

## Grouping

Two competing pressures, and the resolution depends on which risk is larger.

**Group by file** to reduce merge conflict and context switching. An implementer touching one file
three times in one session works faster than three times across a week.

**Separate by concern** to keep each commit revertible and reviewable. Grouping unrelated changes to
one file into one task defeats atomicity.

The resolution: **group tasks that touch the same file adjacently in the sequence, but keep them as
separate tasks.** Same context, separate commits. You get both.

---

## Parallelism

Only worth planning when multiple agents or people will actually work simultaneously. Otherwise it
adds coordination overhead for no gain.

When it applies, mark tasks that can proceed independently:

```markdown
- [ ] 3. Add export endpoint → api/exports.ts → `test -- exports.api`     [parallel-safe]
- [ ] 4. Add export button → ui/Reports.tsx → `test -- Reports`           [parallel-safe, needs 3's contract]
```

**The contract must exist before parallel work starts**, even if the implementation does not. Two
agents building against an unfixed interface produce two incompatible halves — which is worse than
sequential, because the incompatibility surfaces at integration when both are "done".

Avoid parallelizing tasks that touch the same file. The merge conflict costs more than the
serialization saved.

---

## Recording the sequence

The plan itself carries the ordering. What it must also carry is the *reasoning*, for the two or
three non-obvious positions:

```markdown
### Sequence notes
- Task 1 is the vendor API spike, not the schema work, because if the API cannot filter by date the
  entire export design changes and tasks 3–8 are wasted.
- Task 2 (migration) is additive only. The column drop is deliberately not in this plan — it goes in
  the next release, after we confirm nothing reads it.
- Tasks 5–7 are adjacent because they all touch `handler.ts`; they remain separate commits.
```

Without this, the next person to touch the plan will "optimize" the order and reintroduce the risk
you deliberately front-loaded.

---

## Anti-patterns

- **Value ordering before risk ordering.** The invalidating assumption surfaces in week four.
- **Confusing hard with risky.** Only "might be impossible" gets front-loaded.
- **Leaving a task boundary with a red build.** The next iteration cannot trust the verify command.
- **Additive and destructive changes in one task.** Rollback becomes impossible.
- **Consumer before producer.** A broken commit sits in the history.
- **Parallelizing before the contract is fixed.** Two incompatible halves, both "done".
- **Parallelizing tasks that touch the same file.** The conflict costs more than the saving.
- **Grouping unrelated changes because they share a file.** Defeats atomicity.
- **Planning parallelism for a single sequential implementer.** Overhead, no gain.
- **No recorded reasoning for non-obvious order.** Someone will helpfully undo it.
