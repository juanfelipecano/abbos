# AIDD Pipeline

Flow control for the whole role set. Who acts, in what order, under what conditions, and
when to stop. Every role reads this file; `aidd-orchestrator` owns it.

Read `CONSTITUTION.md` first — this document assumes it.

---

## The three methodologies, and what each contributes

**SDD (Spec-Driven Development)** contributes the artifact chain. Intent is written down
before implementation, refined in steps rather than one shot, and every downstream artifact
traces back to it. The constitution comes from here too: governing principles that outlive
any single feature.

**BMAD (Breakthrough Method for Agile AI-Driven Development)** contributes the roles and
the handoffs. Named specialists with explicit boundaries, a planning phase that completes
before a build phase begins, and adversarial review as a first-class step rather than a
courtesy.

**Ralph Loop** contributes the execution discipline. Stateless iterations, one task per
iteration, progress persisted to files instead of held in context, and automated guardrails
as backpressure — the agent cannot proceed past a failing check.

They compose cleanly because they operate at different levels: SDD says what to write down,
BMAD says who writes it, Ralph says how to grind through the resulting task list without
losing the thread. See `RALPH-LOOP.md` for the execution mechanics.

---

## Scale levels

The most common way to make this method useless is to apply all of it to a one-line change.
Pick the level first. When in doubt, pick the lower one — escalating mid-run is cheap,
while ceremony spent on a trivial change teaches everyone to skip the process.

| Level | Trigger | Roles involved | Spec artifact |
|---|---|---|---|
| **L0 — Trivial** | Typo, copy, config value, version bump. No behavior change. | `implementer` | None. Constitution still applies. |
| **L1 — Direct** | Clear bug fix or small feature. Approach is obvious. Under ~1 day, few files. | `planner` → `implementer` → `qa` | Inline spec in `specs/<name>/spec.md` |
| **L2 — Feature** | New endpoint, screen, or workflow. Touches multiple layers. Design choices exist. | `architect` → `backend` + `frontend` + `security` + `qa` → `planner` → `implementer` → `qa` → `code-reviewer` → `architect` | Tech spec + criteria from each specialist |
| **L3 — Product** | New product, platform, or epic set. Cross-system. High risk or ambiguity. | Full chain from `analyst` | Brief → PRD → architecture → sharded stories |

**Level tests.** If you cannot name the files that will change, it is not L1. If a
reasonable engineer would want an ADR, it is at least L2. If you do not yet know what
problem you are solving, it is L3 and starts with the analyst.

---

## The artifact chain

Each arrow is a handoff. The producing role owns its artifact; downstream roles append to
it but never rewrite it.

```
                              ┌──────────────────────────────────────┐
   IDEA / PROBLEM             │  L3 only — Discovery & Definition    │
        │                     └──────────────────────────────────────┘
        ▼
  [analyst] ─────────────────► docs/product/brief.md
        │                        problem, users, JTBD, alternatives, success metrics
        ▼
  [product-manager] ─────────► docs/product/prd.md
        │                        epics, user stories, scope boundary, metrics
        │
        │                     ┌──────────────────────────────────────┐
        │                     │  L2+ — Solutioning                   │
        ▼                     └──────────────────────────────────────┘
  [architect] ───────────────► docs/architecture/architecture.md + adr/NNN-*.md
        │                        components, data flow, trade-offs, decisions
        ├──► [backend] ──────► docs/design/backend-spec.md     (if server-side)
        ├──► [frontend] ─────► docs/design/ux-spec.md          (if UI)
        └──► [security] ─────► docs/security/threat-model.md
        │
        │                     ┌──────────────────────────────────────┐
        ▼                     │  L1+ — Planning                      │
  [planner] ─────────────────► specs/<feature>/spec.md
        │                     └──────────────────────────────────────┘
        │                        acceptance criteria, artifacts, constraints
        │                      specs/<feature>/plan.md  (+ .aidd-active)
        │                        ordered, atomic, independently verifiable tasks
        │
        ├──► [backend]  appends API / data / concurrency criteria
        ├──► [frontend] appends UX / a11y criteria
        ├──► [security] appends security criteria
        └──► [qa]       appends coverage & testability criteria
        │
   ═════╪═══════════════ SCOPE FREEZE ═══════════════════════════════
        │                Article V is in force from here down
        ▼                     ┌──────────────────────────────────────┐
  [implementer] ─────────────►│  Implementation — Ralph loop         │
        │                     └──────────────────────────────────────┘
        │                        code + tests, one task per commit
        ▼
  [qa] ──────────────────────► docs/qa/<feature>-report.md
        │                        criteria verified with evidence
        ▼
  [code-reviewer] ───────────► adversarial review of the diff
        │
        ├──► [backend]  post-implementation validation
        ├──► [frontend] post-implementation validation
        └──► [security] post-implementation validation
        ▼
  [devops] ──────────────────► CI green, released, observable, rollback documented
        ▼
  [tech-writer] ─────────────► README / CHANGELOG / ADR status updated
        ▼
  [architect] ───────────────► sign-off → RUN COMPLETE
```

---

## Anti-loop rules

These exist because a pipeline of agents that can each raise findings will, left alone,
raise findings forever. This section is the termination proof.

### Rule 1 — Pipeline iteration limit

Every run carries an iteration counter: `Iter-1`, `Iter-2`, `Iter-3`.

- **Iter-1** — normal execution.
- **Iter-2** — allowed when the escalation came from the implementer with a concrete
  diagnosis.
- **Iter-3** — allowed only if the architect justifies in writing why the run cannot close.
- **Iter-4** — **STOP.** Escalate to a human. The pipeline cannot resolve this alone.

Whichever role detects the limit says, verbatim:

> The pipeline has reached 3 iterations without closing. This needs a human decision:
> [specific blocking problem, and the two or three options you see].

### Rule 2 — Frozen criteria

A criterion marked ✅ in an iteration cannot be reopened in that same iteration.

If post-implementation validation finds that a previously-green criterion now fails, that
is a **regression** — it opens a new, separate run. It does not reopen the criterion in the
current run. This prevents the ping-pong where fixing criterion 7 breaks criterion 3, whose
fix breaks criterion 7.

### Rule 3 — Triage before acting

Any role validating the implementer's output classifies each finding before routing it:

| Class | Definition | Route |
|---|---|---|
| **Minor** | The approach is right, one detail is incomplete — a missing attribute, wrong copy, a test covering 90% of the branch. | Straight back to `implementer` as one added criterion. No new spec, no architect. |
| **Blocking** | The implementation approach is wrong, or the spec had a design error. | Back to `architect` as `Iter-N+1`. Architect issues a **spec patch**, not a new spec. |

**Cap:** two minor corrections per criterion. The third promotes to blocking — three
"small" corrections on one criterion means the criterion was underspecified, which is a
design problem, not an execution problem.

### Rule 4 — Spec patch, never a new spec

An escalation does not restart the pipeline. The architect emits the minimum delta:

```markdown
## Spec Patch [Iter-N] — <original spec name>

### Failed criterion
<exact criterion + the implementer's diagnosis>

### Design adjustment
<only what changes from the original spec>

### Additional criteria (if any)
- [ ] <specific new criterion>

### Unchanged
Every other criterion in the original spec remains in force.
```

The patch goes directly to the implementer. It does not re-enter `security` or `frontend`
unless the patch explicitly touches security surface or UI.

### Rule 5 — Scope freeze

Once the implementer starts, no role adds criteria to the active spec.

Findings discovered during execution go to `BACKLOG.md` for the next run. This is not
bureaucracy — it is the mechanism that lets a run converge. A finding worth acting on now
is by definition a blocking finding, which Rule 3 already routes.

### Rule 6 — One owner per artifact

The role that writes an artifact owns it. Others append to designated sections. Two roles
editing the same document is how contradictory requirements enter a spec undetected.

---

## Flow with exit conditions

```
START — orchestrator picks the scale level
  │
  ├─ L0 ──────────────────────────────────► implementer ─► verify ─► DONE
  │
  ├─ L1 ──► planner ─► spec
  │            │
  ├─ L3 ──► analyst ─► product-manager ─┐
  │                                     │
  ├─ L2 ──────────────────────────────► architect ─► spec / tech spec
  │                                          │
  │                                          ▼
  │                        backend + frontend + security + qa append criteria
  │                                          │
  │                                          ▼
  │                            planner shards → specs/<feature>/plan.md
  │                                          │
  ═══════════════════════════════════ SCOPE FREEZE ══════════════════════
  │                                          ▼
  │                                  implementer — Ralph loop
  │                                     ├─ criterion fails < 3 → iterate
  │                                     └─ criterion fails = 3 → ESCALATE
  │                                            └─ architect spec patch → Iter-N+1
  │                                                  └─ if N ≥ 3 → STOP, human
  │                                          ▼
  │                                        qa validation
  │                                     ├─ minor    → implementer (max 2/criterion)
  │                                     └─ blocking → architect patch → Iter-N+1
  │                                          ▼
  │                                     code-reviewer
  │                                     ├─ minor    → implementer
  │                                     └─ blocking → architect patch → Iter-N+1
  │                                          ▼
  │                      backend + frontend + security post-implementation
  │                                     ├─ minor    → implementer
  │                                     └─ blocking → architect patch → Iter-N+1
  │                                          ▼
  │                                          devops
  │                                          ▼
  │                                       tech-writer
  │                                          ▼
  └──────────────────────────► architect sign-off ─► RUN COMPLETE ✅
                                               │
                                               ▼
                                     retrospective (Article XII):
                                     which document, had it been
                                     clearer, would have prevented
                                     each escalation in this run?
```

---

## Role summary

| Role | BMAD equivalent | Consumes | Produces |
|---|---|---|---|
| `aidd-orchestrator` | Scrum Master / conductor | User intent | Level decision, routing, gate enforcement |
| `aidd-analyst` | Analyst | Problem statement | Product brief, research, JTBD |
| `aidd-product-manager` | PM | Brief | PRD, epics, user stories, metrics |
| `aidd-architect` | Architect | PRD or problem | Architecture, ADRs, tech spec, sign-off |
| `aidd-backend` | Backend Engineer | Architecture | Backend spec, API/data/concurrency criteria |
| `aidd-frontend` | UX/UI + FE Architect | Architecture | UX spec, a11y & UX criteria |
| `aidd-security` | Security | Architecture | Threat model, security criteria |
| `aidd-planner` | SM / story sharding | Spec + architecture | Sharded stories, `specs/<feature>/plan.md` |
| `aidd-implementer` | Dev | Frozen spec + plan | Code, tests, atomic commits, evidence |
| `aidd-qa` | QA / Test Architect | Spec + code | Testability criteria, QA report |
| `aidd-code-reviewer` | Adversarial review | Diff + spec | Review findings, triaged |
| `aidd-devops` | Platform / SRE | Merged code | CI/CD, release, observability, rollback |
| `aidd-tech-writer` | Doc owner | Everything | README, CHANGELOG, ADR upkeep |

---

## Global rules

1. **One source of truth per artifact.** The author owns it; others append.
2. **No implementation without a spec** (L1+). The implementer asks rather than guesses.
3. **No completion without evidence.** Verifiable output or it did not happen.
4. **Three pipeline iterations maximum.** The fourth is a human decision.
5. **Green criteria are frozen.** A regression is a new run.
6. **Triage before routing.** Classify every post-implementation finding.
7. **Nobody adds scope after the freeze.** Backlog it.
8. **Patches, not restarts.** Escalations produce minimum deltas.
9. **Every run ends with a retrospective** that names a document to improve.
