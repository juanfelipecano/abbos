# Gap Analysis

Reading the repository before writing the plan, so that tasks land on reality rather than on the
spec's description of reality.

The spec describes intent. The code describes what is actually there. Plans written from the spec
alone reference files that do not exist, duplicate helpers that do, and assume a structure the
project abandoned two refactors ago.

This is the step that makes a plan executable, and it is the step most often skipped because it
feels like preparation rather than work.

---

## What you are looking for

For each artifact the spec names, answer five questions:

| Question | Why it changes the plan |
|---|---|
| **Does it exist?** | Greenfield and brownfield need different task shapes entirely |
| **What already works that I must not break?** | Becomes a constraint, and often a regression-test task |
| **Is there a pattern to follow?** | Name the file. Removes a class of stylistic drift for free |
| **What does the spec assume exists that does not?** | Prerequisite tasks the spec never mentioned |
| **What is the current test coverage here?** | Determines whether you can refactor safely at all |

The fourth produces the tasks nobody planned for and is the main reason this step pays for itself.

---

## How to read fast

You are not reviewing the code. You are building a map. Time-box it — an hour for most features.

1. **Find the entry point** for the feature area. The route, handler, command, or component that
   receives the request. Search the spec's nouns.
2. **Follow one path all the way down.** Entry → business logic → data access → storage. One complete
   trace teaches more than skimming twelve files.
3. **Find the nearest analogue.** Something in this codebase already does something similar. That
   file is your pattern, your naming convention, and your test structure. Name it in the plan.
4. **Read that analogue's tests.** They reveal the project's real testing conventions and its
   fixture setup, which is usually undocumented.
5. **Check what depends on what you will change.** Search for callers before planning a signature
   change.

### Useful searches

```bash
# Who calls this?
grep -rn "functionName" --include='*.ts' src/

# What tests touch this area?
grep -rln "OrderService" --include='*.spec.ts' .

# Is there already a helper for this?
grep -rn "formatCurrency\|toMinorUnits" src/

# What migrations already exist for this table?
ls migrations/ | grep -i order

# Where are the boundaries PROJECT-CONTEXT.md declared read-only?
```

The third one matters more than it looks. **Duplicating an existing helper is one of the most common
outcomes of planning without reading**, and it produces two implementations that drift.

---

## Greenfield versus brownfield

The single most consequential thing you learn, and it changes the whole plan shape.

**Greenfield** — nothing exists yet.
- Task 1 is the walking skeleton
- No regression risk; no characterization tests needed
- You are choosing patterns, so name them explicitly in the plan or six files will each pick one
- Faster tasks, more of them

**Brownfield** — you are changing something that works.
- Task 1 is usually a characterization test that pins current behavior, **before** any change
- Every task carries regression risk, so the existing suite must run at every boundary
- You are following patterns, not choosing them
- Fewer, more careful tasks

**The mixed case is the dangerous one**: a new feature that touches existing code. Plan the new part
greenfield-style, and treat every touch of existing code as brownfield, with its own safety net.

State which mode each task is in when it is not obvious. It tells the implementer whether "make it
work" or "change nothing observable" is the standard.

---

## Finding prerequisite work

The spec assumes a world. The code may not provide it. Common gaps:

| Gap | Becomes |
|---|---|
| No test fixture for the entity the criteria need | Task 0: add the factory |
| The pattern the spec implies does not exist yet | Task 0: establish it, and say so |
| A shared helper the spec assumes | Task 0: extract or write it |
| A config value with nowhere to live | Task 0: add config plumbing |
| The table exists but lacks the constraint the criteria assume | A migration task the spec never mentioned |
| No seam to test against — the logic is embedded in a controller | Either a refactor task, or escalate: untestable design is a design finding |

That last row is worth escalating rather than absorbing. If the code cannot be tested without a
restructure, `aidd-qa` should have caught it pre-freeze, and the architect owns the decision. Silently
planning a large refactor into an implementation plan is how a two-day story becomes a two-week one.

---

## Distinguishing prerequisite from scope creep

The line matters, because one is legitimate and one violates Article III.

> **Prerequisite** work makes a criterion *achievable*.
> **Scope creep** makes something *better*.

| Example | Which |
|---|---|
| Adding a fixture the criteria's tests require | Prerequisite |
| Adding an index the performance criterion requires | Prerequisite |
| Renaming a confusing variable in a file you touch | Creep — backlog it |
| Upgrading a dependency you noticed is old | Creep — backlog it |
| Extracting a helper because two new tasks need it | Prerequisite |
| Extracting a helper because the existing code is ugly | Creep — backlog it |

When genuinely unsure: does a criterion fail without this? If no, it is creep.

---

## Recording what you found

The gap analysis is not a deliverable on its own, but three parts of it belong in the plan because
the implementer needs them.

```markdown
### Codebase notes
**Mode**: brownfield — `src/exports/` exists, 74% covered
**Pattern to follow**: `src/invoices/handler.ts` — same request shape, same error envelope
**Fixtures**: `test/factories/workspace.ts` exists; no factory for `Report` (task 0)
**Do not touch**: `src/billing/` — declared a boundary in PROJECT-CONTEXT.md
**Existing helpers**: `toMinorUnits()` in `src/money.ts` — do not write another

### Prerequisite work discovered
| Task | Why the spec assumed it existed |
|---|---|
| 0. Add `Report` test factory | Criteria AC-F2/F3 need multi-report fixtures |

### Assumptions made while planning
<If any of these is wrong, the sequence is wrong.>
- The vendor client in `src/vendor/` supports pagination — not verified, task 1 confirms it
```

That last section is the honest one. You will make assumptions; naming them lets the implementer
detect a wrong one in task 1 rather than task 6.

---

## Anti-patterns

- **Planning from the spec alone.** Tasks reference files that do not exist.
- **Not searching for existing helpers.** Two implementations that drift apart.
- **Missing the greenfield/brownfield distinction.** Wrong task shape throughout.
- **No characterization test before changing working code.** No way to know what you broke.
- **Skipping the analogue file.** Every convention gets re-invented per file.
- **Not reading the existing tests.** The project's real fixture conventions are undocumented.
- **Absorbing a large refactor as "prerequisite".** A two-day story silently becomes two weeks.
- **Not escalating untestable design.** It is a design finding, not a planning inconvenience.
- **Prerequisite and creep conflated.** Article III violations that look like diligence.
- **Unstated planning assumptions.** A wrong one surfaces at task 6 instead of task 1.
