# Ralph Execution

Running the loop in practice: state, iterations, commits, and surviving context loss.

The loop's power is counterintuitive. It works not because the agent remembers more, but because it
is forced to **re-derive its state from files that are actually true**. Context rots — it gets
compacted, summarized, truncated. Files do not.

Everything here is a consequence of that.

---

## The iteration

```
0. LOCATE     Read .aidd-active → the feature slug
1. ORIENT     Re-read from disk: PROJECT-CONTEXT.md, specs/<slug>/spec.md, specs/<slug>/plan.md
2. SELECT     One task — the highest-priority unchecked item
3. IMPLEMENT  The minimum change that advances it
4. VERIFY     Run the verify command
5. RECORD     Check the task off, commit atomically
6. ITERATE    On failure: exact diagnosis → minimum adjustment → step 3 (max 3 attempts)
7. DONE       All criteria green → report with evidence
```

Steps 1 and 5 are the ones that get dropped, and dropping them turns the loop into thrashing.

**Step 1 is not from memory.** "As established earlier, the remaining tasks are…" is the failure. Read
the file. Your recollection after a compaction is a summary of a summary, and it will confidently
contradict the repository.

**Step 5 is what makes step 1 work next time.** An unchecked plan after a completed task means the
next iteration — possibly in a fresh session — redoes it or skips past it.

---

## Surviving compaction

Assume every iteration might begin with no memory of the previous one. Design your working habits
for that.

| Habit | Why |
|---|---|
| Re-read the plan at the start of every task | Your memory of it is stale by construction |
| Write the attempt log as it happens | Reconstructed logs are fiction |
| Commit after every task | The git log becomes the durable record of progress |
| Never hold "what's left" in your head | It is in the file; the file is right |
| Put decisions in the plan, not the conversation | Conversations are compacted; files are not |

**The test:** if this session ended right now and a fresh one resumed from the repository alone,
would it know where to continue? If not, the state is in the wrong place.

This is Article VII, and it is the single highest-leverage habit in the method.

---

## Task selection

**Exactly one task per iteration.** Not "these two are related". Not "this is trivial so I'll bundle
it."

The temptation to bundle is strongest when tasks look small, and that is exactly when bundling costs
most — a small bad task buried in a commit with four good ones is the hardest kind to find and
revert.

Take the highest-priority unchecked task whose dependencies are satisfied. If the top task is
blocked, say so and take the next unblocked one — do not silently reorder the plan. The planner owns
sequencing (Rule 6); a blocked top task is information the orchestrator needs.

**If the plan is wrong, do not fix the plan.** Escalate. Build mode does not re-prioritize.

---

## Verification

The verify command from `PROJECT-CONTEXT.md`. Every task. Non-zero exit is a hard stop.

**Paste the output** (Article II). Not "tests pass" — the actual lines. This single habit eliminates
the most expensive failure mode in AI-assisted development: plausible code that was never executed.

For behavior a test suite cannot express, get real evidence:

```bash
# HTTP status
curl -s -o /dev/null -w "%{http_code}\n" localhost:3000/api/orders/9
# → 401

# A log line
grep -c "AUTHZ_DENIED" logs/app.log
# → 1

# Actual database state
psql -c "select status from orders where id=42"
# → shipped
```

**Never verify by reading the code.** Concurrency, query counts, and error paths are invisible to
inspection and obvious under a test. This is precisely where "looks right" fails.

---

## Commits

One task, one commit, green. Article VIII.

```
Add per-object authz check to GET /orders/{id}

Non-owner requests now return 404 rather than the record. 404 rather than 403
so the response does not confirm the record exists.

Satisfies AC-S1. Two tests added.
```

Structure that works:
- **Subject**: what changed, imperative, under ~70 characters
- **Body**: why, and any non-obvious decision. The 404-versus-403 note above is exactly the kind of
  thing that gets "fixed" later by someone who does not know
- **Footer**: which criterion it satisfies

**Never combine tasks.** Never commit red. If the verify command fails, you are not done — fix it or
escalate, but do not commit and continue.

If you must set work aside mid-task, stash it or commit to a scratch branch. The main branch's
history is a sequence of green states, and that property is what makes bisecting and reverting
possible.

---

## The attempt log

Written as it happens, in `specs/<feature>/plan.md`:

```markdown
| Task | Attempt | Change made | Result |
|---|---|---|---|
| 4 | 1 | Added check in the controller | Fails: batch path bypasses the controller entirely |
| 4 | 2 | Moved check into OrderService.get | Fails: batch path calls the repository directly |
```

Two reasons this matters more than it looks:

**It survives compaction.** Three attempts across a compaction boundary become one remembered attempt
and two forgotten ones, and you will repeat them.

**It is the escalation report.** When the third attempt fails, the log is already written. An
escalation reconstructed from memory loses the exact errors, which are the evidence the architect
needs.

Record the **exact error**, not your interpretation of it. "Fails with a type error" is useless;
the actual message names the type and the line.

---

## Three strikes

Article VI. Three attempts per task, then stop.

The rule exists because an agent that has failed the same task three times is not one guess from
success — it is missing information or working from a wrong design. Attempt four spends budget
confirming what attempt three established.

**Signals you should escalate before hitting three:**
- The fix requires changing something in `PROJECT-CONTEXT.md`'s boundary list
- Two criteria contradict each other
- A dependency cannot do what the spec assumed
- The fix would require a design change

Escalating early is not failure. It is the cheapest available outcome, and the escalation format
(`templates/spec.md`) exists to make it fast.

**Do not reset the counter after a partial success.** Three attempts on the task, not three
consecutive.

---

## Running it unsupervised

Only with four things in place: a container or disposable worktree, a throwaway branch, a hard
iteration ceiling, and a real verify command. Without all four it is not autonomy — it is an
unsupervised process with commit access.

```bash
while :; do cat PROMPT_build.md | claude -p --dangerously-skip-permissions; done
```

`PROMPT_build.md` stays thin, because the discipline lives in the skill files:

```markdown
Read .aidd-active to get the active feature slug.
Read PROJECT-CONTEXT.md, specs/<slug>/spec.md, and specs/<slug>/plan.md from disk.
Follow the aidd-implementer skill.
Execute exactly one task: the highest-priority unchecked item.
Run the verify command. If it fails, fix it; do not commit red.
Update specs/<slug>/plan.md, commit atomically, then exit.
If all tasks are checked, set Status: DONE in the plan and exit.
If any task has 3 logged failed attempts, write the escalation report and exit.
```

The supervised equivalent, using `/loop`:

```bash
/loop Read .aidd-active for the feature slug, then specs/<slug>/plan.md. Execute the single next unchecked task per the aidd-implementer skill, verify, commit, update the plan. Stop and report if a task fails 3 times or the plan is complete.
```

**Sit on the loop, not in it.** When output is wrong, fix the instruction — the spec, the project
context, the skill — not the artifact (Article XII). Hand-correcting each output makes you the
bottleneck and automates nothing.

---

## Anti-patterns

- **"Should work now."** Run it.
- **Trusting your memory of the plan.** Read the file.
- **Bundling small tasks.** The bad one hides among the good ones.
- **Committing red.** The next iteration's guardrail is gone.
- **Reconstructing the attempt log afterward.** The exact errors are the evidence, and they are lost.
- **Attempt four.** Confirms what attempt three established.
- **Resetting the counter after partial progress.** Three per task, not three consecutive.
- **Verifying by reading the code.** Invisible exactly where it matters.
- **Silently reordering the plan.** The planner owns sequencing; a block is information.
- **Fixing the plan instead of escalating.** Build mode does not re-prioritize.
- **Unsupervised loops without a ceiling and a sandbox.** Not autonomy.
