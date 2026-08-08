# Task Decomposition

Turning an approved spec into units an implementer can execute without making design decisions.

A task is not a description of work. It is a **commitment that can be verified and reverted
independently**. Everything here follows from that.

---

## The three properties

All three required. A task missing any one will stall the loop, and each fails in a distinct way.

### Atomic — one commit

The test: **could this be reverted alone without breaking the build?**

If a task's description contains "and", it is two tasks. If it touches an unrelated concern
"while we're in there", that part is a different task or a backlog item (Article III).

Why it matters beyond tidiness: in a Ralph loop, the commit is the unit of recovery. Ten tasks in
one commit means a single bad task costs the other nine, and nobody can tell from the log which
change caused the failure.

### Verifiable — a named check

The test: **what command tells me this is done?**

| Not verifiable | Verifiable |
|---|---|
| Implement the service layer | `npm test -- orders.service` — 4 new tests pass |
| Make the endpoint secure | `curl -s -o /dev/null -w "%{http_code}" localhost:3000/api/orders/9` returns 401 |
| Add validation | `npm test -- validation` — rejects limit > 100 with 400 |
| Improve performance | Query count on `GET /orders` is 2, asserted in `orders.perf.spec` |
| Refactor the parser | Existing `parser` suite passes unchanged; no new public API |

A task nobody can verify is a wish. The implementer will declare it done by inspection, and
inspection is exactly what fails on concurrency, query counts, and error paths.

**When you cannot name a check**, that is a finding, not an inconvenience. Either the criterion needs
rewriting (send it to `aidd-qa`) or the task is really "decide something", which is the architect's.

### Ordered — dependencies explicit

A task blocked by another says so. An implementer working from an unordered list will pick something
blocked, fail, and burn an attempt against the three-strike cap for a reason that was knowable.

```
- [ ] 4. Add authz check to GET /orders/{id} → src/orders/handler.ts
        → `npm test -- orders.authz` (owner 200, non-owner 404)     (blocked by 2)
```

---

## Task shape

```
- [ ] <n>. <verb phrase> → <files touched> → `<verification>`   (<blocking>)
```

**Verb phrase** — what changes, concretely. "Add", "extract", "replace", "wire". Not "handle" or
"support", which describe outcomes rather than edits.

**Files touched** — the planner's most valuable contribution. It forces you to have read the code
(see `gap-analysis.md`), and it tells the implementer where to start rather than where to search.

**Verification** — the exact command, not a description of one.

Naming the existing pattern to follow is worth an extra clause: `follow the pattern in
src/invoices/handler.ts`. It removes an entire class of stylistic drift and it costs eight words.

---

## The walking skeleton

For anything new, **task 1 makes the thinnest possible end-to-end path work.** One request, through
every layer, returning something — even a hardcoded value.

Why first:
- Every subsequent task has somewhere to attach and something to run against
- Integration risk surfaces immediately instead of at the end
- The verify command becomes real from task 1, so the loop's guardrail exists from the start

The skeleton may be embarrassingly thin. `GET /reports` returning `[]` with a passing test that
asserts a 200 is a legitimate task 1. Its value is not the behavior — it is that the wiring,
routing, serialization, and test harness are proven.

The alternative — building each layer completely before connecting them — is horizontal slicing at
the task level, and it fails the same way: nothing is verifiable until the end.

---

## Ordering rules within a plan

1. **Walking skeleton first** for anything new.
2. **Test infrastructure before the tests that need it.** A fixture or factory used by six tasks is
   task 0, not repeated inline six times.
3. **Schema and contract changes before consumers**, and additively. The migration that adds a column
   lands before the code that reads it.
4. **The build stays green at every task boundary.** No task may end red — the next iteration begins
   by trusting the verify command, and a knowingly-red baseline destroys that.
5. **Never leave one criterion spanning five tasks with no intermediate check.** Split the criterion
   or add a partial verification. Five tasks with no signal is five tasks of accumulating unverified
   assumptions.

---

## Sizing

A task should be one focused edit. Signals it is too large:

- It touches more than about three files, without a mechanical reason
- Its verification needs more than one command
- You cannot describe it in one line without "and"
- It contains a decision the implementer would have to make

That last one is the important one. **A task containing a design decision is not a task** — it is an
unresolved spec question wearing a checkbox. Send it back to the architect rather than letting the
implementer decide by default and defend it later.

Signals it is too small:

- Tracking it costs more than doing it
- It cannot fail independently
- It is genuinely part of the neighboring edit

Rough target: **3–8 tasks per story.** More suggests the story needed splitting (`aidd-product-manager`'s
`story-splitting.md`). Fewer suggests it is a task pretending to be a story.

---

## Tasks the spec did not mention

Gap analysis will surface prerequisite work the spec assumed existed. That is legitimate — it is not
scope creep, it is discovered dependency.

Flag it explicitly so the orchestrator can see the plan grew and why:

```markdown
### Prerequisite work discovered
| Task | Why the spec assumed it existed | Cost |
|---|---|---|
| 0. Add test factory for Workspace | Spec's criteria need multi-workspace fixtures; none exist | S |
```

The distinction that matters: **prerequisite work makes a criterion achievable; scope creep makes
something else better.** If you cannot trace a task to a criterion, it is the second kind — delete
it, or ask the architect whether a criterion is missing (Article III).

---

## Anti-patterns

- **Tasks that are not atomic.** One bad task costs the good ones it shipped with.
- **"Implement X" with no verification.** Declared done by inspection; inspection misses what matters.
- **Unordered tasks with hidden dependencies.** The implementer burns attempts on a blocked task.
- **No walking skeleton.** Integration risk deferred to the end.
- **A task containing a design decision.** The implementer decides by default and defends it later.
- **A task ending with a red build.** The next iteration's guardrail is gone.
- **One criterion across five tasks with no intermediate check.** Five tasks of unverified
  assumptions.
- **Fixtures duplicated inline across six tasks.** Should have been task 0.
- **Tasks that trace to no criterion.** Scope creep with a checkbox.
- **Planning without reading the code.** Tasks referencing files that do not exist.
