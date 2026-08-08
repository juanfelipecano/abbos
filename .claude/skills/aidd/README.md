# AIDD — AI-Driven Development

A role-based method for building software with AI agents, synthesizing three approaches:

- **[BMAD](https://docs.bmad-method.org)** — named specialist roles with explicit boundaries
  and documented handoffs; a planning phase that completes before a build phase begins.
- **[SDD](https://developer.microsoft.com/blog/spec-driven-development-spec-kit/)** — intent
  written down before implementation, refined in steps, governed by a constitution.
- **[Ralph Loop](https://ralph-loops.surge.sh/)** — stateless iterations, one task at a time,
  progress persisted to files rather than context, automated checks as backpressure.

They compose because they work at different levels: SDD says what to write down, BMAD says who
writes it, Ralph says how to grind through the result without losing the thread.

---

## Why roles instead of one agent

A single agent that designs, implements, and validates its own work approves its own mistakes.
It has already decided the approach is sound — that is why it wrote it.

Splitting the lifecycle into roles with enforced boundaries buys three things:

1. **Independent adversarial reads.** Each handoff is a fresh look with a narrow mandate.
2. **Bounded context.** A role loads what it needs, not the whole project history.
3. **Findings that arrive when they are cheap.** A security or accessibility requirement
   raised as a criterion costs a line in a document; raised after implementation it costs a
   redesign.

The cost is handoff overhead, which is why the method is scale-adaptive — see levels below.

---

## Read these first

| File | What it is |
|---|---|
| [USAGE.md](USAGE.md) | **Start here.** Setup, prompts, a full worked run, and what to watch for. |
| [CONSTITUTION.md](CONSTITUTION.md) | Twelve non-negotiable articles. Every role obeys these. |
| [PIPELINE.md](PIPELINE.md) | Flow control, scale levels, anti-loop rules, artifact chain. |
| [RALPH-LOOP.md](RALPH-LOOP.md) | Execution mechanics: the loop, plan vs build mode, running it for real. |
| [PROJECT-CONTEXT.template.md](PROJECT-CONTEXT.template.md) | Copy per project. Where stack facts live, which is what keeps the roles reusable. |

The four articles that do the most work: **spec before code**, **evidence before done**,
**frozen scope**, and **bounded iteration**. Skipping any one of them is how a run stops
converging.

---

## The roles

| Role | Owns | Produces |
|---|---|---|
| [orchestrator](aidd-orchestrator/SKILL.md) | Routing and gates | Level decision, routing, gate verdicts |
| [analyst](aidd-analyst/SKILL.md) | Problem definition | Product brief, JTBD, metrics with baselines |
| [product-manager](aidd-product-manager/SKILL.md) | Requirements | PRD, epics, stories, acceptance criteria |
| [architect](aidd-architect/SKILL.md) | Technical design | Architecture, ADRs, spec, spec patches, sign-off |
| [backend](aidd-backend/SKILL.md) | Server-side contract and data | Backend spec, API/data/concurrency criteria |
| [frontend](aidd-frontend/SKILL.md) | Interface and a11y | UX spec, a11y and UX criteria, perf budgets |
| [security](aidd-security/SKILL.md) | Threat surface | Threat model, security criteria, remediations |
| [planner](aidd-planner/SKILL.md) | Sequencing | Sharded stories, `specs/<feature>/plan.md` |
| [implementer](aidd-implementer/SKILL.md) | Execution | Code, tests, atomic commits, evidence |
| [qa](aidd-qa/SKILL.md) | Verification | Testability criteria, independent QA report |
| [code-reviewer](aidd-code-reviewer/SKILL.md) | Adversarial review | Triaged findings against the spec |
| [devops](aidd-devops/SKILL.md) | Delivery | CI/CD, release, rollback, observability |
| [tech-writer](aidd-tech-writer/SKILL.md) | Documentation | README, API docs, runbooks, changelog |

Each role has a `references/` folder carrying the depth behind it — 67 files across the 13 roles,
listed in a `## Depth` table at the top of every `SKILL.md`. The SKILL.md is the operating
procedure: short, always loaded, tells the role what to do. The references are read on demand when
the work is non-trivial, and carry the detail: method, worked examples, calibration, anti-patterns.

That split is deliberate. Loading everything every time is expensive and dilutes the instruction
that matters; loading nothing means the role operates from generic knowledge. The `## Depth` table
names the trigger for each file so the role knows when to open it.

Templates for every artifact are in [templates/](templates/): `discovery.md`, `design.md`,
`spec.md`, `reports.md`.

---

## Scale levels

Applying the full method to a one-line change is the fastest way to make the method
unusable. Pick a level first; when torn, pick lower.

| Level | Trigger | Route |
|---|---|---|
| **L0** | No behavior change — typo, copy, config value | `implementer` |
| **L1** | Approach is obvious, you can name the files | `planner` → `implementer` → `qa` |
| **L2** | Multiple layers, or an ADR is warranted | `architect` → specialists → `planner` → build → validate → sign-off |
| **L3** | Problem not yet defined, or spans systems | `analyst` → `product-manager` → L2 chain |

---

## Installing

These are Claude Code skills — a directory containing `SKILL.md` with YAML frontmatter.

**Per project** (recommended — the project's `PROJECT-CONTEXT.md` sits alongside):

```bash
mkdir -p .claude/skills && cp -R /Users/juano/Docs/AIDD/aidd-* .claude/skills/
```

**For every project on this machine:**

```bash
mkdir -p ~/.claude/skills && cp -R /Users/juano/Docs/AIDD/aidd-* ~/.claude/skills/
```

Symlink instead of copy if you want edits here to propagate:

```bash
for d in /Users/juano/Docs/AIDD/aidd-*; do ln -sfn "$d" ~/.claude/skills/; done
```

The shared documents — constitution, pipeline, templates — are referenced by the skills but
not skills themselves. Either copy them into the project root, or add a line to the project's
`CLAUDE.md` pointing at this directory:

```markdown
AIDD method documents: /Users/juano/Docs/AIDD/
Read CONSTITUTION.md and PIPELINE.md before any non-trivial development work.
```

Then copy `PROJECT-CONTEXT.template.md` to the project root as `PROJECT-CONTEXT.md` and fill
it in. **Test every command you put in it** — wrong commands there mean every verify step
fails for the wrong reason, and the loop will burn its three attempts on your typo.

---

## Using it

Claude Code triggers a skill from its `description`, so ordinary phrasing works:

```
Design the notification system for this app.        → architect
Break the checkout epic into implementation tasks.  → planner
Review this diff before I merge.                    → code-reviewer
Is this endpoint secure?                            → security
```

For a full run, start with the orchestrator:

```
Run an AIDD pipeline for: users need to export their reports as CSV.
```

It picks the level, routes, and holds the gates.

To run the Ralph loop with `/loop`:

```bash
/loop Read .aidd-active for the feature slug, then specs/<slug>/plan.md. Execute the single next unchecked task per the aidd-implementer skill, verify, commit, update the plan. Stop and report if a task fails 3 times or the plan is complete.
```

See [RALPH-LOOP.md](RALPH-LOOP.md) for unsupervised operation and the guardrails it requires.

---

## Artifact layout in a project

```
PROJECT-CONTEXT.md              stack, commands, quality bars, boundaries
.aidd-active                    one line: the feature currently in flight
BACKLOG.md                      findings deferred by Article V
docs/
  product/brief.md · prd.md
  architecture/architecture.md · adr/NNN-*.md
  design/backend-spec.md · ux-spec.md
  security/threat-model.md
  qa/<feature>-report.md
specs/
  csv-export/
    spec.md                     the frozen contract
    plan.md                     the loop's state file
  scheduled-exports/            a second feature — its own directory, no collision
    spec.md
    plan.md
```

---

## What makes this work

The method's leverage is not the role list — it is four mechanisms that keep an agent pipeline
from spiraling:

**Testable criteria.** Every criterion names the command that proves it. A criterion two
engineers could disagree about is not a criterion yet.

**The scope freeze.** Once implementation starts, nobody adds criteria. Without this, each
reviewer's fresh eyes generate fresh requirements and the definition of done drifts faster
than the code converges.

**Hard iteration limits.** Three attempts per criterion, three iterations per run, then a
human decides. An agent that has failed three times is missing information, not one guess
from success.

**Progress in files.** Context gets compacted; `specs/<feature>/plan.md` on disk does not. Any
role starting a turn re-reads state rather than recalling it.

And the compounding one, Article XII: when a role produces bad output, **fix the instruction
that allowed it** — the spec, the project context, the skill file — not the artifact. Fixing
the artifact fixes one thing. Fixing the instruction fixes every future one.

---

## Sources

- [BMAD Method documentation](https://docs.bmad-method.org)
- [What is BMAD Method?](https://medium.com/@visrow/what-is-bmad-method-a-simple-guide-to-the-future-of-ai-driven-development-412274f91419)
- [Spec-driven development with Spec Kit](https://developer.microsoft.com/blog/spec-driven-development-spec-kit/) · [github/spec-kit](https://github.com/github/spec-kit)
- [IBM: Spec-driven development](https://www.ibm.com/think/topics/spec-driven-development)
- [Ralph Loops](https://ralph-loops.surge.sh/) · [Geoffrey Huntley on the Ralph Wiggum loop](https://linearb.io/blog/ralph-loop-agentic-engineering-geoffrey-huntley)
