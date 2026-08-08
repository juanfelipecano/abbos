# Story Sharding

Packaging a story so the implementer never needs to open another document.

The test of a shard: **could someone with no context implement this from the shard alone?** If it
requires the PRD, the architecture doc, and a conversation, it is not sharded — it is a pointer.

This matters more with AI agents than with people. A person who hits a gap asks. An agent fills it,
plausibly and confidently, and the gap becomes invented behavior nobody notices until review.

---

## Restate, do not link

The counterintuitive rule, and the one that makes sharding work.

A link is an invitation to skip. A shard that says *"follow the error handling approach in the
architecture doc"* will produce a re-derived approach — different from the one that was decided, and
defended as reasonable. A shard that says *"errors return `{code, message}`; `code` is a stable enum,
`message` is never parsed by clients; see `src/invoices/handler.ts:44` for the shape"* produces the
decided approach.

Duplication is the cost. It is the right trade: the shard is short-lived, the drift it prevents is
not.

**Restate:**
- The specific architecture decisions this story depends on
- The pattern file to follow
- The error, auth, and validation conventions that apply here
- Constraints from the boundary list that this story comes near

**Link:**
- Background and rationale nobody needs to implement correctly
- The full PRD, for context if wanted

---

## Shard structure

````markdown
# Story <epic>.<n> — <name>

PRD: docs/product/prd.md#story-<n>
Architecture: docs/architecture/architecture.md#<section>
Status: ready | in progress | in review | done
Size: S | M | L   (L means shard further)

## What this delivers
<One or two sentences. The user-visible outcome. Someone reading only this should know why
this story exists.>

## Context you need
<The restated section. Decisions already made and not to be reopened. The pattern to follow,
by path. The conventions that apply. Anything that would otherwise be re-derived.>

## Acceptance criteria
- [ ] AC-F1: <functional> → verified by `<command>`
- [ ] AC-B1: <backend, appended by aidd-backend> → verified by `<command>`
- [ ] AC-U1: <UX/a11y, appended by aidd-frontend> → verified by `<command>`
- [ ] AC-S1: <security, appended by aidd-security> → verified by `<command>`
- [ ] AC-Q1: <coverage, appended by aidd-qa> → verified by `<command>`

## Artifacts
| Path | Change | New or modified |
|---|---|---|

## Tasks
- [ ] 1. <task> → <files> → `<check>`

## Verification
```bash
<the exact command proving the whole story is done>
```

## Do not change
<Files and behaviors this story must leave alone. Include relevant PROJECT-CONTEXT.md boundaries.>

## Open questions
- [NEEDS CLARIFICATION: <question>] — blocks: AC-Fn
````

---

## What goes in "context you need"

The section that determines whether the shard works. Concretely:

**The decision, not the discussion.** "We use optimistic locking with a `version` column here"
— not the paragraph weighing it against row locks. The implementer needs the conclusion; reopening
the debate is what Article XI prevents.

**The pattern, by path and line.** `src/invoices/handler.ts:44` beats "follow existing conventions".

**The vocabulary.** If this domain uses a word in a specific way — "workspace" means something exact
here — say so. Domain glossary entries relevant to this story get restated.

**The near-boundaries.** If this story works next to something declared read-only, name it here, not
only in the "do not change" section. Proximity is when it matters.

**The failure mode someone would reach for.** If there is an approach that looks correct and is
wrong here, say so explicitly. One sentence prevents a three-attempt escalation.

---

## Sizing

**3–8 tasks per story.** The bounds exist for different reasons:

Above 8, the shard becomes long enough that the implementer skims it, and the loop's re-read step
(Article VII) gets expensive on every iteration. Split it.

Below 3, the story is probably a task and should join a neighbor — unless it is genuinely
independently valuable, in which case it is fine to have a small one.

**Size is not effort.** A one-line change to a concurrency-critical path is a story with three tasks
and a lot of care. A 400-line mechanical rename is one task.

---

## Ordering shards within an epic

Same rules as `sequencing.md` — dependency, then risk, then value — but at story granularity, and
with one addition:

**The first story in an epic should prove the epic is possible.** If the epic depends on an
integration nobody has exercised, story 1 exercises it, however thinly. An epic whose first four
stories are safe and whose fifth is the risky integration is an epic that discovers its own
infeasibility a month in.

---

## Keeping shards in sync

Shards duplicate content, and duplicated content drifts. Two rules keep it manageable:

**Shards are short-lived.** Generated when the epic starts, discarded when the story closes. A shard
that outlives its story becomes a stale second source of truth. Do not archive them as
documentation.

**A spec patch updates the shard, not just the spec.** When the architect issues a patch (Rule 4),
the affected shard is regenerated. An implementer working from a stale shard will produce exactly
what the patch was meant to prevent, and will do so confidently.

If a decision changes mid-epic, regenerate the unstarted shards. Started ones get the patch applied
explicitly.

---

## Anti-patterns

- **Linking instead of restating.** The link gets skipped; the decision gets re-derived, differently.
- **A shard that needs three documents open.** Not sharded — a pointer.
- **Including the rationale instead of the decision.** Invites reopening what was settled.
- **"Follow existing conventions."** Which ones, where? Name the file and line.
- **Omitting the near-boundaries.** Proximity is exactly when they matter.
- **No stated wrong-looking-right approach.** One sentence prevents a three-attempt escalation.
- **Shards over 8 tasks.** Skimmed, and expensive to re-read every iteration.
- **Treating shards as durable documentation.** They become a stale second source of truth.
- **Not regenerating shards after a spec patch.** The implementer confidently rebuilds the problem.
- **Sizing by line count instead of care required.** A one-line concurrency fix is not a small story.
