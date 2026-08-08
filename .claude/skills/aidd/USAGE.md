# Using AIDD

A practical guide: setup, prompts that work, a full worked run, and the things that will bite you.

If you read one section, make it [What to watch for](#what-to-watch-for).

---

## 1. Setup — five minutes

### Install the skills

Per project (recommended — `PROJECT-CONTEXT.md` sits alongside):

```bash
mkdir -p .claude/skills && cp -R /Users/juano/Docs/AIDD/aidd-* .claude/skills/
```

Or globally, for every project on this machine:

```bash
mkdir -p ~/.claude/skills && cp -R /Users/juano/Docs/AIDD/aidd-* ~/.claude/skills/
```

Symlink instead if you want edits to propagate as you refine the method:

```bash
for d in /Users/juano/Docs/AIDD/aidd-*; do ln -sfn "$d" ~/.claude/skills/; done
```

### Point Claude at the shared documents

The constitution, pipeline, and templates are not skills — they are read *by* the skills. Add this
to the project's `CLAUDE.md`:

```markdown
## AIDD

Method documents: /Users/juano/Docs/AIDD/
Read CONSTITUTION.md and PIPELINE.md before any non-trivial development work.
Templates: /Users/juano/Docs/AIDD/templates/
```

### Fill in PROJECT-CONTEXT.md

```bash
cp /Users/juano/Docs/AIDD/PROJECT-CONTEXT.template.md ./PROJECT-CONTEXT.md
```

**Test every command you put in it.** This is the single highest-value setup step. A wrong verify
command means the loop burns its three-attempt budget on your typo instead of the work:

```bash
# Paste each one and confirm it actually runs
npm test
npm run lint
npm run build
```

The **verify command** is the one that gates a commit. Get it right:

````markdown
**Verify command**
```bash
npm test && npm run lint && npm run typecheck
```
````

### Sanity check

Ask Claude:

```
List the AIDD skills you can see, and summarize what aidd-orchestrator does.
```

If it names all 13, you are wired up.

---

## 2. How the roles get invoked

Three ways, in increasing explicitness.

**Automatic.** Claude Code reads each skill's `description` and triggers on matching intent. Ordinary
phrasing works:

```
Design the notification system for this app.        → aidd-architect
Break the checkout epic into implementation tasks.  → aidd-planner
Review this diff before I merge.                    → aidd-code-reviewer
Is this endpoint secure?                            → aidd-security
Why is this query slow?                             → aidd-backend
Write a runbook for the export queue alert.         → aidd-tech-writer
```

**By name**, when you want a specific role and the phrasing is ambiguous:

```
Use aidd-backend to review the transaction boundaries in src/orders/.
```

**Full pipeline**, starting at the orchestrator:

```
Run an AIDD pipeline for: users need to export their reports as CSV.
```

The orchestrator picks the scale level, routes, and holds the gates.

---

## 3. A full worked run

An L2 feature, start to finish. This is the shape of a real session.

### Kickoff

> **You:** Run an AIDD pipeline for: users need to export their reports as CSV.

> **Claude (orchestrator):**
> ```
> AIDD Run: csv-export | Level: L2 | Iter-1 of 3 | Phase: design
> ```
> **Level: L2.** Touches API, data access, and UI; the storage-versus-stream decision is worth an
> ADR. Not L3 — the problem is well defined and scoped to one system.
>
> Specialists: backend, frontend, security, qa. Frontend included — there is a new UI surface.
>
> **Next:** `aidd-architect` — tech spec with base criteria.

Note what it did *not* do: it did not start designing. Routing is its whole job.

### Design

> **You:** Go ahead.

The architect reads the code, ranks quality attributes, and produces
`docs/architecture/architecture.md` plus an ADR:

```markdown
## Quality attribute ranking
| # | Attribute | Requirement | Why here |
|---|---|---|---|
| 1 | Maintainability | Two engineers own this | Small team |
| 2 | Performance | p95 < 2s for exports under 10k rows | Users wait on screen |
| 3 | Cost | No new infrastructure | Budget frozen this quarter |

**Explicitly sacrificed**: horizontal scalability. Expected ceiling is 50 concurrent exports.
Revisit at 500.
```

```markdown
# ADR-0007 — Stream CSV exports rather than staging to object storage

## Decision
Exports under 100k rows stream directly in the HTTP response. Larger exports are rejected
with a documented limit.

## Consequences
Positive: no new infrastructure, no cleanup job, no signed-URL handling.
Negative: the request is held open for the duration. A 100k-row export ties up a worker.
Revisit when: any customer regularly exceeds 100k rows, or p95 exceeds 5s.
```

Then the spec, with base criteria:

```markdown
### Functional
- [ ] AC-F1: GET /api/reports/export?format=csv returns text/csv with a Content-Disposition
      filename → verified by `npm test -- export.api`
- [ ] AC-F2: The CSV contains the same rows the reports list shows for that filter
      → verified by `npm test -- export.parity`
- [ ] AC-F3: A request exceeding 100k rows returns 422 with code EXPORT_TOO_LARGE
      → verified by `npm test -- export.limits`
```

### Specialists append

Four roles, in parallel, each writing to its own prefixed section. **Nobody edits anyone else's.**

> **You:** Run the specialists.

```markdown
### Backend / data — appended by aidd-backend
- [ ] AC-B1: The export issues one query regardless of row count (no N+1)
      → verified by `npm test -- export.queries` (asserts query count == 1)
- [ ] AC-B2: Rows stream; peak memory stays under 100MB for a 100k-row export
      → verified by `npm test -- export.memory`
- [ ] AC-B3: `limit` above 100000 returns 422 before any query executes
      → verified by `npm test -- export.limits`

### UX / accessibility — appended by aidd-frontend
- [ ] AC-U1: The export button shows a busy state and is disabled while in flight
      → verified by `npm test -- Reports.export`
- [ ] AC-U2: Failure shows the specified copy, announced via a live region
      → verified by `npm test -- Reports.export.a11y`
- [ ] AC-U3: Button is keyboard reachable with a visible focus ring at 3:1 contrast
      → verified by axe + manual keyboard pass

### Security — appended by aidd-security
- [ ] AC-S1: Exporting a workspace you cannot access returns 404, not 403
      → verified by `npm test -- export.authz`
- [ ] AC-S2: The filename is sanitized; no header injection via filter values
      → verified by `npm test -- export.headers`

### Coverage / testability — appended by aidd-qa
- [ ] AC-Q1: New-code coverage ≥ 80%
- [ ] AC-Q2: Each AC-F has a test that fails without the change
- [ ] AC-Q3: Edge cases covered: empty result, exactly 100k, 100001, permission denied
```

Eleven criteria. Every one names a command. **That is the point of the whole phase** — the feature is
now specified precisely enough that "done" is not a judgment call.

Note AC-U2 says *the specified copy*. The frontend role will have pushed back if the PM never wrote
the error string, because otherwise the implementer invents it.

### Scope freeze

> **Claude (orchestrator):**
> ```
> GATE 3 — SCOPE FREEZE: HELD
> AC-U2 references "the specified copy" but no copy is specified anywhere.
> → aidd-product-manager: provide the exact failure message.
> Everything else is ready; this is the only blocker.
> ```

This is the gate doing its job. One line now, versus an invented error message you find in
production in four months.

> **You:** Use: "We couldn't finish this export. Try again, or contact support if it keeps happening."

> **Claude:**
> ```
> GATE 3 — SCOPE FREEZE: PASS
> 11 criteria, all testable and prefixed. All four specialists confirmed complete.
> specs/csv-export/plan.md covers all 11; all 9 tasks map to a criterion. .aidd-active set.
> Article V now in force. Frozen at 2026-07-30T14:22.
> ```

**From here, nothing gets added.** New findings go to `BACKLOG.md`.

### The plan

```markdown
# Implementation Plan — csv-export
Iteration: Iter-1
Verify: `npm test && npm run lint`

## Tasks
- [ ] 1. Walking skeleton: GET /api/reports/export returns empty text/csv
        → api/reports/export.ts → `npm test -- export.api`
- [ ] 2. Add Report test factory → test/factories/report.ts → `npm test -- factories`
        [prerequisite — spec assumed it existed]
- [ ] 3. Stream real rows via cursor → api/reports/export.ts, db/reports.ts
        → `npm test -- export.parity`
- [ ] 4. Row-count guard, 422 before query → api/reports/export.ts → `npm test -- export.limits`
- [ ] 5. Per-object authz, 404 for inaccessible → api/reports/export.ts → `npm test -- export.authz`
...

## Criteria coverage
| Criterion | Covered by task |
|---|---|
| AC-F1 | 1, 3 |
| AC-B1 | 3 |
| AC-S1 | 5 |
```

Task 2 is flagged **prerequisite** — the planner found the spec assumed a fixture that does not
exist. That is legitimate discovered work, not scope creep, and flagging it lets you see the plan
grew and why.

### Build

> **You:** Start the loop.

One task per iteration, verified, committed:

```
Task 1 — walking skeleton
  npm test -- export.api
  ✓ returns text/csv with Content-Disposition (14ms)
  1 passing
  commit a1b2c3d

Task 2 — Report factory
  ...
```

When a task fails three times, it stops:

```markdown
## Escalation — blocking criterion
Criterion: AC-S1  |  Task: 5  |  Iter-1 of 3  |  Attempts: 3/3

### Attempts
| # | Hypothesis | Change | Result |
|---|---|---|---|
| 1 | Missing authz check | Added check in the route handler | Fails: the CSV stream is built in db/reports.ts, which the batch export path calls directly |
| 2 | Check belongs in the service | Moved to ReportService.export | Fails: scheduled exports call the repository directly, bypassing the service |
| 3 | Check in the repository | Added to ReportRepository.stream | Fails: breaks 4 existing tests that call the repo with a system context |

### Ruled out
The check cannot live in the handler or the service — two callers bypass each.
The repository is the only common path, but it has a legitimate system-context caller.

### Decision needed
Either (a) the repository takes an explicit actor parameter and system callers pass a
system actor, or (b) scheduled exports route through the service.

### State
Committed and green: tasks 1–4. Task 5 reverted.
```

**That is a good escalation.** It converted a stuck task into a specific architect question, and the
"ruled out" section stops anyone suggesting attempt one.

### Patch and finish

The architect issues a minimum delta — not a rewritten spec:

```markdown
# Spec Patch [Iter-2] — csv-export
## Root cause
Design error, mine. I placed authorization at the handler without accounting for two
non-HTTP callers.

## Design adjustment
ReportRepository.stream takes an explicit `actor`. System callers pass SYSTEM_ACTOR.

## Criteria changes
Modified: AC-S1 — authorization is enforced in ReportRepository, not the handler
Added:   - [ ] AC-S3: A repository call with no actor throws rather than defaulting to system
              → verified by `npm test -- repo.actor`

## Unchanged
Every other criterion remains in force and keeps its current green/red state.
```

Tasks 1–4 stay green (Rule 2 — frozen criteria are not redone). The loop resumes at task 5.

Then QA verifies independently, the reviewer attacks the diff, backend/frontend/security validate,
devops handles release, tech-writer updates docs, and the architect signs off.

### Retrospective

```markdown
## Instruction fixes
| Document | Change | Applied |
|---|---|---|
| PROJECT-CONTEXT.md | Add "ReportRepository has non-HTTP callers (scheduler, batch)" to the layout notes | ☑ |
| aidd-architect skill | Note: check for non-HTTP callers before placing authorization | ☑ |
```

**This is the compounding part.** The next run's architect will not make the same mistake, because
the document that would have prevented it now says so. Article XII.

---

## 4. Prompt library

Copy-pasteable. These work because they match the skill descriptions.

### Starting work

```
Run an AIDD pipeline for: <what you want>
```
```
What AIDD level is this? <describe the change>
```
```
This is L1. Write the spec and plan for: <change>
```

### Discovery (L3)

```
Before we build anything — what problem are we actually solving here? Users keep asking
for a dashboard.
```
```
Pressure-test this concept adversarially. What would have to be true for it to work?
```
```
What's the riskiest assumption in this plan, and what's the cheapest way to test it this week?
```
```
Turn the brief into a PRD with epics and acceptance criteria.
```

### Design

```
Design the <X> for this codebase. Read the existing code first.
```
```
Write an ADR for the decision we just made about <X>.
```
```
Audit the architecture of src/<area>/. Severity-ranked findings with failure scenarios.
```
```
Give me two options for <X> with trade-offs, and a recommendation.
```

### Specialists

```
Append backend criteria to the spec — API contract, transactions, query budget.
```
```
Append accessibility and UX criteria. Target WCAG 2.2 AA.
```
```
Threat model this feature and append security criteria.
```
```
Are these criteria testable? Rewrite any that aren't.
```

### Planning and build

```
Shard this epic into implementation-ready stories.
```
```
Break this spec into an ordered task list. Read the code first.
```
```
Execute the next task in the active plan. Verify, commit, update the plan.
```
```
Task 5 has failed twice. Before attempt 3, tell me your hypothesis and what it would rule out.
```

### Validation

```
Independently verify every criterion. Re-run the checks; don't quote the implementation report.
```
```
Review this diff against the spec. Adversarial — find what's wrong.
```
```
Check the tests: break one line of the implementation and confirm something goes red.
```

### Standalone (no pipeline)

The roles are useful outside a run:

```
Why is GET /api/orders slow? Read the query plan before suggesting anything.
```
```
Is this transaction safe under concurrency?
```
```
Review this PR: <url>
```
```
Write a runbook for the "export queue backing up" alert.
```
```
Our README is stale — what did last week's changes make wrong?
```

---

## 5. Running the loop

Three modes, increasing autonomy. All obey the same rules.

**Supervised** — one task per turn. The default. Review each commit, continue.

```
Execute the next task in the active plan per the aidd-implementer skill.
```

**Self-paced** — `/loop` re-invokes until done:

```bash
/loop Read .aidd-active for the feature slug, then specs/<slug>/plan.md. Execute the single next unchecked task per the aidd-implementer skill, verify, commit, update the plan. Stop and report if a task fails 3 times or the plan is complete.
```

**Unsupervised** — headless, for well-specified mechanical work:

```bash
while :; do cat PROMPT_build.md | claude -p --dangerously-skip-permissions; done
```

Only with **all four** of: a container or disposable worktree, a throwaway branch, a hard iteration
ceiling, and a real verify command. Without them it is not autonomy — it is an unsupervised process
with commit access.

`PROMPT_build.md` stays thin because the discipline lives in the skill:

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

---

## 6. What to watch for

The section that saves you the most time.

### Pick the level honestly

The fastest way to make this method useless is running the full chain on a typo. Over-ceremony
teaches everyone the process is theater — and that belief then applies to the changes that needed it.

**When torn, go lower.** Promoting mid-run costs one handoff.

```
Fix the typo in the login header       → L0, just do it
Add a status filter to the list        → L1
Let users export reports as CSV        → L2
Users are complaining about reports    → L3 (no defined problem yet)
```

**Level is not importance.** A one-line change to a payment calculation is L1 by scope and maximum
care by consequence. For those, add one specialist rather than promoting:

```
This is L1 but it touches money — route it through aidd-backend and aidd-security too.
```

### The scope freeze will feel wrong, and that is the point

You *will* want to add "one small thing" after freezing. Every time you do, the definition of done
moves, and the run stops converging. That is the failure the freeze exists to prevent.

Say this instead:

```
Backlog that for the next run. Don't add it to the frozen spec.
```

If something genuinely must change, it is a **blocking finding** → spec patch → `Iter-N+1`. That
path exists. Use it rather than bending the freeze.

### Don't let the orchestrator do the work

It has exactly four outputs: a level, a route, a gate verdict, and a stop. If it starts writing specs
or fixing code, the pipeline has collapsed into one agent and you have lost the independent-review
property that justified the overhead.

```
You're the orchestrator — don't write the criterion yourself. Route it to aidd-qa.
```

### Progress lives in files, not in the conversation

The most common practical failure. After a compaction, Claude's memory of "what's left" is a summary
of a summary and will confidently contradict the repo.

```
Re-read .aidd-active and the plan it points at from disk before picking the next task. Don't work from memory.
```

The test: **if this session ended right now, could a fresh one resume from the repository alone?**
If not, state is in the wrong place.

### Running a second feature

Plans live at `specs/<feature>/plan.md`, never at the repo root, and `.aidd-active` names the one
in flight. A second feature is a second directory — nothing collides, nothing needs archiving.

```
.aidd-active                → csv-export
specs/
  csv-export/  spec.md  plan.md
  scheduled-exports/  spec.md  plan.md
```

When a run closes, its plan **stays where it is** with the attempt log intact. That log is what
answers "why was this built this way" a year later. Only `.aidd-active` gets cleared.

To switch features mid-flight, point the file at the other one:

```bash
echo "scheduled-exports" > .aidd-active
```

But prefer a branch if both are genuinely in progress — two features interleaving commits in one
tree breaks "the build stays green at every task boundary", and merge conflicts belong to git rather
than to you.

```bash
git switch -c feature/scheduled-exports
```

**Migrating a project that has a root `IMPLEMENTATION_PLAN.md`** from before this convention:

```bash
mkdir -p specs/<feature> && git mv IMPLEMENTATION_PLAN.md specs/<feature>/plan.md && echo "<feature>" > .aidd-active
```

### Demand evidence

"Should work now" is the single most expensive sentence in AI-assisted development.

```
Paste the actual test output, not a summary.
```
```
You verified that by reading the code. Run it.
```

Concurrency, query counts, and error paths are invisible to inspection and obvious under a test.
That is exactly where "looks right" fails.

### Watch the iteration counter

```
What iteration are we on?
```

At Iter-3, the architect must justify in writing why the run can still close. At Iter-4, stop. An
agent that has cycled three times is missing information no fourth cycle will produce.

**Stopping early is stronger than exhausting the budget.** If the blocker is a vendor limitation or a
product decision, more iterations cannot fix it.

### Cost is real

A full L2 run is many turns — design, four specialists, planning, build iterations, four validation
passes. That is the trade you are making for independent review.

Ways to spend less:
- Use the right level. Most work is L1
- Skip `frontend` when there is genuinely no UI; skip `backend` when there is genuinely no server side
- Never skip `security` or `qa` — they are the two that catch things early, when it is cheap
- Use roles standalone for one-off questions instead of starting a run

### Fix the instruction, not the output

Article XII, and the reason this compounds. When a role produces bad output twice, the fix is not to
correct it again:

```
That's the second time the implementer invented an error message. Add to PROJECT-CONTEXT.md
that all user-facing copy comes from the PM, and update the aidd-implementer skill.
```

Hand-correcting fixes one artifact. Fixing the instruction fixes every future one.

### Keep PROJECT-CONTEXT.md short and true

It is read on every iteration, so every line costs tokens forever. Under two pages. And when a
command in it is wrong, every verify step fails for the wrong reason.

---

## 7. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Skills never trigger | Not in `.claude/skills/`, or frontmatter malformed | `ls .claude/skills/` and check `name:` matches the directory |
| Wrong role activates | Descriptions overlap for your phrasing | Name the role: `Use aidd-backend to…` |
| Claude designs instead of routing | Orchestrator drifting out of role | `You're the orchestrator. Route it, don't do it.` |
| The run never converges | Criteria are not testable | Send them back to `aidd-qa` before freezing |
| Criteria keep getting added | Freeze not enforced | `Scope is frozen. Backlog it.` |
| "Should work now" with no output | Article II not enforced | `Paste the actual output.` |
| Loop redoes finished tasks | Working from memory, not the plan file | `Re-read the plan from disk.` |
| Same failure three times, no progress | Attempt cap not respected | `Stop. Write the escalation with what you ruled out.` |
| Full ceremony on a small change | Level chosen too high | `This is L1. Skip the architect.` |
| Reviewer produces only nitpicks | Findings lack failure scenarios | `Every finding needs a concrete failure scenario or it's an observation.` |
| QA passes everything the implementer claimed | Not verifying independently | `Re-run the checks yourself. Don't quote the implementation report.` |
| Sessions lose the thread | State in the conversation | Everything durable goes in `specs/<feature>/plan.md` and git |
| Second feature clobbers the first | Plan written to the wrong path | Plans live at `specs/<feature>/plan.md`, never the repo root |

---

## 8. Adapting it

The method is a default, not a law. Trim deliberately, not by drift.

**Solo on a small project?** Use `analyst`, `architect`, `implementer`, `code-reviewer`. Keep the
constitution — spec before code, evidence before done, three-strike cap. Those four articles carry
most of the value at any scale.

**Existing team with its own process?** Take the pieces that fill your gaps. The scope freeze and
the iteration cap are the two most transferable; they solve problems most processes do not address.

**Just want better one-off answers?** Use the roles standalone. `aidd-backend` on a slow query and
`aidd-code-reviewer` on a PR are useful with no pipeline at all.

**Adding your own role?** Copy an existing `SKILL.md`'s shape: frontmatter with a trigger-rich
description, a `## Depth` table, `## Not your job`, then method sections and `## Anti-patterns`. Add
it to `PIPELINE.md`'s role table and give it a criteria prefix if it appends to specs.

**Never trim:** the three-strike cap, the scope freeze, evidence before done. Those three are what
make the pipeline terminate. Everything else is negotiable.

---

## 9. Cheat sheet

```
LEVELS
  L0  no behavior change              implementer
  L1  approach obvious                planner → implementer → qa
  L2  multi-layer, ADR-worthy         architect → specialists → planner → build → validate
  L3  problem undefined               analyst → PM → L2 chain

CRITERIA PREFIXES
  AC-F  functional      (architect / PM)
  AC-B  backend/data    (aidd-backend)
  AC-U  UX / a11y       (aidd-frontend)
  AC-S  security        (aidd-security)
  AC-Q  coverage        (aidd-qa)

HARD LIMITS
  3 attempts per criterion → escalate with a diagnosis
  3 iterations per run     → stop, human decides
  2 minor corrections per criterion → promotes to blocking

FILES
  PROJECT-CONTEXT.md       stack, commands, quality bars, boundaries
  .aidd-active             one line: the feature in flight. Read first, every iteration
  specs/<feature>/spec.md  the frozen contract
  specs/<feature>/plan.md  the loop's state — re-read every iteration
  BACKLOG.md               everything deferred by the scope freeze

  Plans are never archived. A second feature = a second directory.

THE FOUR ARTICLES THAT DO THE MOST WORK
  I    spec before code
  II   evidence before done
  V    frozen scope
  VI   bounded iteration
```

---

## Where to go next

| Document | What it is |
|---|---|
| [README.md](README.md) | Overview, the role list, why roles at all |
| [CONSTITUTION.md](CONSTITUTION.md) | The twelve articles every role obeys |
| [PIPELINE.md](PIPELINE.md) | Flow control, scale levels, anti-loop rules |
| [RALPH-LOOP.md](RALPH-LOOP.md) | Execution mechanics in detail |
| [templates/](templates/) | Every artifact's shape |
| `aidd-*/references/` | The depth behind each role — 67 files, listed in each SKILL.md's `## Depth` table |
