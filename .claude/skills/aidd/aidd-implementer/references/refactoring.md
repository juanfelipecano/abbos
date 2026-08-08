# Refactoring

Changing structure without changing behavior — safely, and only when asked.

The definition is strict and it is the whole discipline: **a refactor changes how the code is
organized, not what it does.** The moment behavior changes, it is not a refactor; it is a change
that needs criteria, tests, and review.

Conflating the two is how "just a cleanup" becomes a production incident.

---

## When you may refactor

Article III is tight here, deliberately.

| Situation | Allowed |
|---|---|
| A task in the plan says to refactor | Yes — that is the task |
| The spec's criteria cannot be met without restructuring | Yes — but say so in the report |
| Preparatory: the change is unsafe without it first | Yes — as a **separate commit**, before |
| The code near your change is ugly | **No.** Backlog it |
| You noticed duplication elsewhere | **No.** Backlog it |
| Renaming for clarity while you are in there | **No.** Backlog it |

The preparatory case is the one worth internalizing. When a change is hard because the code is
shaped wrong, the sequence is: **first make the change easy (a behavior-preserving refactor, its own
commit), then make the easy change.** Two commits, each independently revertible, each independently
reviewable.

Doing both in one commit is what makes a reviewer unable to tell which part broke it.

---

## The safety net comes first

Never refactor code you cannot verify. The order is non-negotiable:

```
1. Confirm tests exist and pass    ← if they do not, write them first
2. Refactor
3. Confirm the same tests still pass, unchanged
```

**The tests must not change.** That is the entire proof. If you had to modify a test to make it pass,
you changed behavior, and the test was documenting the behavior you just altered. Stop and check
whether that was intended.

### Characterization tests

When the code has no tests, write tests that document what it *currently* does — including behavior
that looks wrong.

```js
// Characterization: documents current behavior, not desired behavior.
// Empty input returns [] rather than throwing. Preserved deliberately;
// unknown whether any caller relies on it.
it('returns an empty array for empty input', () => {
  expect(parseRows('')).toEqual([]);
});
```

Two rules: **capture actual behavior, not intended behavior**, and **say so in a comment.** If you
find something that looks like a bug, characterize it anyway and report it separately. Fixing it
during a refactor means the refactor changed behavior, and now nobody can tell which change caused
what.

This is often the largest part of the work in a brownfield refactor, and skipping it is why
refactors get a bad reputation.

---

## Small steps

The failure mode is a large restructure that "should be equivalent" and is not, with no intermediate
state that worked.

- **One transformation at a time.** Extract the method. Run the tests. Then rename it. Run again.
- **Green between every step.** If the suite is red, the previous step was wrong — and you know
  exactly which one.
- **Commit at meaningful boundaries.** A revertible history of small structural moves.
- **If a step breaks something you cannot explain in two minutes, revert it.** Do not debug forward
  through a refactor. Return to green and take a smaller step.

That last rule saves more time than any other. Debugging forward from an unclear state compounds;
reverting costs the step you just took.

---

## Transformations worth knowing

| Move | When | Watch for |
|---|---|---|
| **Extract function** | A block needs a comment to explain it | Hidden coupling to local state |
| **Inline function** | The indirection adds nothing | Other callers |
| **Extract variable** | A complex expression is unreadable | Evaluation order and side effects |
| **Rename** | The name lies about what it does | Every reference, including strings and configs |
| **Introduce parameter object** | Four-plus parameters, often passed together | Existing callers |
| **Replace conditional with polymorphism** | The same `switch` appears in several places | Only worth it at three-plus sites |
| **Extract class** | One class changes for unrelated reasons | Shared mutable state between the halves |
| **Introduce seam** | You need to test something that reaches out | Do not change behavior while adding it |

**Renaming is riskier than it looks** in dynamic languages: reflection, serialized field names,
database columns, API responses, configuration keys, and log-based dashboards all reference names
that no compiler checks. Grep for the string, not just the symbol.

---

## Refactoring toward testability

The common legitimate case: the criteria require testing something that currently cannot be tested.

The usual cause is a hard dependency — code that constructs its own collaborators, reads the clock
directly, or calls the network inline. The fix is a **seam**: a place where the dependency can be
substituted.

```js
// Before — untestable: constructs its own clock and client
function expiryFor(order) {
  return new Date(Date.now() + config.ttl);
}

// After — same behavior, now injectable
function expiryFor(order, now = () => Date.now()) {
  return new Date(now() + config.ttl);
}
```

Note the default parameter: **every existing caller is unaffected.** That is what makes it a
refactor rather than a change. Introducing a seam should never require touching callers; if it does,
it is a breaking change.

If the restructure needed is larger than a seam — the logic is embedded in a controller and must
move layers — **that is a design finding, not an implementation task.** Escalate it. `aidd-qa`
treats untestable design as blocking for exactly this reason.

---

## What is not a refactor

Say so explicitly in your report when any of these is true, because the review requirements differ:

- Changing a public signature — that is an API change; callers and consumers are affected
- Changing an error message, status code, or response shape — observable behavior
- Changing performance characteristics materially — an N+1 fix is a change, and a welcome one, but
  it needs its own verification
- "Fixing" behavior you found odd — that is a bug fix and it needs a criterion
- Upgrading a dependency — that is a change with its own risk profile

Labeling a behavior change as a refactor is how it skips the scrutiny it needed.

---

## Reporting

```markdown
### Refactor — <what>
**Why**: <the task or criterion that required it>
**Behavior change**: none
**Evidence**: existing suite passes unchanged — <n> tests, no test files modified
**Commits**: <sha> (refactor), <sha> (the actual change)
```

**"No test files modified" is the proof.** If you had to touch a test, state which and why — that is
the flag a reviewer needs, and hiding it is how a behavior change ships as a cleanup.

---

## Anti-patterns

- **Refactoring nobody asked for.** Unreviewed risk; obscures the real change in the diff.
- **Refactor and behavior change in one commit.** A reviewer cannot tell which part broke it.
- **Refactoring without tests.** No proof of equivalence. Characterize first.
- **Modifying tests to make a refactor pass.** You changed behavior. Stop.
- **Characterizing intended behavior instead of actual.** The tests now document a fiction.
- **Fixing a bug found mid-refactor.** Report it separately; do not blend the two.
- **Large restructures with no green intermediate state.** No way back except forward.
- **Debugging forward through a broken refactor.** Revert and take a smaller step.
- **Renaming without grepping for the string.** Configs, serialized fields, and dashboards break
  silently.
- **Calling a signature change a refactor.** Skips the scrutiny it needed.
- **Absorbing a layer-crossing restructure as an implementation task.** It is a design finding.
