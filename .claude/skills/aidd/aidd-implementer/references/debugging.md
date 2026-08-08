# Debugging

Finding the cause systematically, within a three-attempt budget.

The three-strike cap (Article VI) changes how you debug. You cannot afford three guesses — you get
three *hypotheses*, each of which should eliminate a class of causes whether it is right or wrong.

Undisciplined debugging spends all three attempts on variations of one idea, then escalates with
nothing useful. Disciplined debugging escalates with a map of what has been ruled out, which is what
makes the architect's decision fast.

---

## Hypothesis, not guess

The difference:

> **Guess:** "Maybe it's the cache." *Change something. Re-run. Still broken.*
>
> **Hypothesis:** "If the cache is stale, then querying the store directly returns the correct value
> while the endpoint returns the wrong one." *Check. Now you know, either way.*

A hypothesis makes a **prediction that can be false.** Testing it produces information regardless of
outcome. A guess produces information only if it happens to be right.

Before each attempt, write down:

```
Hypothesis: <what I believe is wrong>
Prediction: <what I will observe if this is true>
Check:      <how I will observe it>
```

Thirty seconds, and it converts three attempts into three eliminated classes of cause.

---

## Read the error completely

Including the parts you assume you understand. This sounds trivial and it resolves a large fraction
of bugs on its own.

- **The exact message.** Not your summary. The type name and the operation are usually the answer.
- **The first frame in your own code.** Stack traces start in library code; scroll to your file.
- **The line number.** Then read that line and the three above it.
- **The "caused by" chain.** The root cause is usually the innermost, and it is usually the last
  thing anyone reads.

Skimming an error is how a null-handling bug gets three attempts at the wrong layer.

---

## Narrow before you fix

Locate the defect precisely before changing anything. Changing code to learn where the bug is turns
your working tree into a second problem.

**Bisect the data flow.** The bug is somewhere between input and output. Check the midpoint: is the
value correct there? That halves the search space per check, and three checks isolate one step out
of eight.

**Bisect the history.** If it worked before, `git bisect` finds the commit mechanically:

```bash
git bisect start
git bisect bad                  # current
git bisect good <known-good>    # then test at each step
```

Worth it whenever "it used to work" is true and the range is more than a few commits. It is the
highest-value debugging tool that is almost never reached for.

**Bisect the change.** If your own uncommitted change broke something, revert half of it.

**Minimize the reproduction.** Strip the case until removing anything more makes the bug vanish.
What remains is the bug, and it is usually one line — often a line you would not have suspected.

---

## Make it observable

You cannot debug what you cannot see. Before hypothesis three, make the failure visible.

| Technique | Use when |
|---|---|
| Log the value at each boundary | The data is wrong somewhere in a chain |
| Assert the invariant mid-flow | You believe something is always true; prove it |
| Print the actual SQL and its parameters | An ORM is producing something unexpected |
| Log the full request and response | An integration behaves differently than documented |
| Count invocations | You suspect something runs twice, or not at all |
| Dump the object, not one field | The field you are watching is not the one that is wrong |

**Print the whole thing.** Logging `user.id` when the bug is in `user.role` costs an attempt. Dump
the object.

Remove the instrumentation before committing — or, better, if a log line was genuinely useful for
diagnosis, note it as a backlog item for `aidd-devops`. If you needed it once, the on-call engineer
will need it at 3am (`observability.md`).

---

## Common causes, in rough order of frequency

When you have no hypothesis, work down this list.

1. **It is not running the code you think.** Stale build, wrong branch, cached module, a different
   environment, a shadowing file. Check first — it is embarrassing and it is common. Add a
   deliberate syntax error and confirm it breaks.
2. **The data is not what you assume.** Print it. Nulls, empty strings, unexpected types, extra
   whitespace, a number as a string.
3. **State from a previous operation.** A cache, a session, a database row, a module-level variable
   that persists across requests.
4. **Order of operations.** Something runs before its dependency is ready, or twice.
5. **The boundary transformed it.** Serialization, parsing, defaulting, coercion, timezone
   conversion.
6. **Concurrency.** Two things touched the same state. Suspect this when the failure is intermittent.
7. **The dependency does not behave as documented.** Verify against reality, not the README.

**Number one is genuinely number one.** Confirm you are executing the code you edited before
theorizing about logic.

---

## Intermittent failures

Different discipline, because you cannot confirm a fix by seeing it pass once.

- **Establish the rate first.** Run it fifty times. "Fails 3 in 50" is a baseline; "sometimes fails"
  is not.
- **Suspect concurrency, time, and order.** Almost all intermittency is one of these three.
- **Never fix by retry.** Retrying hides the defect and moves it somewhere less diagnosable.
- **A fix must change the rate.** Re-run fifty times after fixing. One passing run proves nothing
  about a 6% failure.

An intermittent failure that you cannot make deterministic is usually worth escalating — it is often
a design-level concurrency issue, which is `aidd-backend`'s and `aidd-architect`'s territory
(`concurrency.md`).

---

## Logging the attempts

Write the attempt log as you go, in `specs/<feature>/plan.md`:

```markdown
| Task | Attempt | Change made | Result |
|---|---|---|---|
| 4 | 1 | Added authz check in controller | Fails: batch path bypasses controller — `POST /orders/batch` calls the repo directly |
| 4 | 2 | Moved check into OrderService.get | Fails: batch path calls OrderRepository directly, not the service |
```

Note what those two entries produce: by attempt three you know the check must live in the repository
layer or the batch path must be rerouted — **which is a design decision, not an implementation one.**
The log has converted a stuck task into a specific architect question.

That is what the log is for. Not accountability — diagnosis.

---

## Escalating well

At three attempts, the log is already written. Add the two sections that make it actionable:

**What I ruled out.** The most valuable part. "The cache is not involved — bypassing it reproduces
the failure." This stops the next reader from repeating attempt one.

**The decision needed.** A question with two or three answers, not "help". "Should the authz check
move to the repository layer, or should the batch path route through the service?"

An escalation with those two sections gets resolved in one turn. Without them it produces a
conversation.

---

## Anti-patterns

- **Guesses instead of hypotheses.** Information only when lucky.
- **Changing code to find the bug.** Your working tree becomes a second problem.
- **Skimming the error message.** It usually names the cause.
- **Not checking you are running the changed code.** The most common cause, checked last.
- **Logging one field.** The bug is in the field you did not print.
- **Not using `git bisect` when "it used to work".** Mechanical answer, rarely reached for.
- **Fixing intermittency with a retry.** Hides the defect, relocates it.
- **Declaring an intermittent bug fixed after one pass.** Proves nothing about a 6% rate.
- **Three attempts on variations of one idea.** Escalating with nothing ruled out.
- **An escalation that says "help".** Produces a conversation, not a decision.
