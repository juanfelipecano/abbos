# CI/CD

Pipeline design. In an AIDD run this is unusually load-bearing: the verify command *is* the quality gate
that stops the Ralph loop from building on broken work. A weak pipeline means the loop commits broken
code with confidence, at speed.

---

## Stage ordering

Fast-to-slow, so failures surface in seconds rather than minutes.

```
1. Lint + format          seconds
2. Type check             seconds
3. Unit tests             < 1 min
4. Build                  minutes
5. Integration tests      minutes
6. Security scan          minutes   — dependencies, secrets, SAST
7. E2E (critical paths)   slowest
```

The ordering principle is **cost of feedback**, not logical dependency. A formatting error found after
a six-minute test run wasted six minutes; found in four seconds it costs nothing.

**Fail fast by default, but consider running independent stages in parallel** once the pipeline is
mature — a developer usually prefers knowing about all failures at once over discovering them serially
across three pushes.

---

## The properties that matter

More important than which tool you choose.

### Deterministic

Same commit, same result. Every time.

- Lockfiles committed **and honored** — a build that resolves fresh versions is not reproducible
- Tool versions pinned, including the runtime and the CI image
- Base images pinned **by digest**, not by mutable tag. `node:22` changes under you
- Actions and plugins pinned by digest
- No dependency on wall-clock time, network state, or execution order

**A pipeline that fails one run in ten trains everyone to hit retry** — and then a real failure gets
retried too, and the signal is gone.

### Fast

Past roughly ten minutes people stop waiting and start merging on hope.

- Cache dependencies, keyed on the lockfile hash
- Cache build artifacts where the tooling supports it
- Parallelize test execution (requires test isolation, which you want anyway)
- Run only affected packages in a monorepo
- **Move tests down a level before adding a skip mechanism.** A `[skip ci]` escape hatch is a
  permanent hole

Measure pipeline duration as a tracked metric. It regresses gradually and nobody notices until it is
twenty minutes.

### Zero flakes

**A flaky test is worse than no test.** It consumes attention and teaches the team that red does not
mean broken.

Policy, not aspiration: quarantine the day it flakes, with a named owner and a deadline. Track the flake
rate per test. Deleting a flaky test is better than tolerating it.

### One artifact

**Build once, promote the same artifact through every environment.**

Rebuilding per environment means staging validated something production never ran — different
dependency resolution, different build flags, a different base image layer. The bug you find in
production was not in the artifact you tested.

Configuration comes from the environment; the artifact is identical everywhere.

---

## Branch and merge strategy

| Strategy | Works when | Cost |
|---|---|---|
| Trunk-based, short-lived branches | Strong test suite, feature flags available | Requires discipline and real coverage |
| GitFlow | Scheduled releases, multiple supported versions | Merge overhead, long-lived divergence |
| Release branches | You must support old versions | Cherry-pick burden |

**Trunk-based with short-lived branches is the right default** for most teams, because long-lived
branches accumulate merge risk exponentially with age. A branch open for three weeks is a merge conflict
and an integration surprise, regardless of how carefully it was written.

Requirements to make it work: a test suite you trust, feature flags to decouple deploy from release, and
branches measured in hours or days.

**Required checks before merge:** the full pipeline green on the merge result, not just on the branch
head. A branch that passes in isolation can fail merged — that is what a merge queue solves.

---

## Security in the pipeline

The pipeline itself is a high-value target: it has credentials, it can deploy, and it usually has fewer
controls than production.

- **Least privilege per credential.** A CI token with production write access is the highest-value
  target in most organizations
- **Secret scanning** in pre-commit **and** in CI. Pre-commit alone is bypassable with `--no-verify`
- **Dependency scanning**, failing the build on High and Critical
- **No secrets in logs.** Mask them, and be aware that a build script echoing its environment defeats
  masking
- **Fork pull requests must not have secrets.** A PR from a fork that can read your CI secrets is a full
  compromise path
- **Pinned actions by digest** — a mutable tag on a third-party action is remote code execution in your
  pipeline
- **Ephemeral runners.** A persistent runner accumulates state and cross-contaminates builds

The fork-PR case is worth checking explicitly. Default configurations on some platforms expose secrets
to fork PRs, and that is a complete supply-chain compromise available to anyone with a GitHub account.

---

## Environments

| Environment | Purpose | Data |
|---|---|---|
| Local | Development | Synthetic |
| Preview / per-PR | Review a change in isolation | Synthetic, seeded |
| Staging | Pre-production verification | Production-*shaped*, never production data |
| Production | Real | Real |

**Never put production data in staging.** It is the most common way personal data leaks — staging has
weaker access control, broader team access, and often no audit logging. Use generated data with
production-like *shape and volume*, which is what actually matters for finding defects.

**Preview environments** are the highest-value environment investment: reviewers can use the change
instead of imagining it, which catches a class of defect no test does.

**Ephemeral, and torn down automatically.** Preview environments that persist become an unmanaged
sprawl of forgotten deployments with real credentials.

---

## The verify command

The single command that gates a commit, declared in `PROJECT-CONTEXT.md`. It is what the Ralph loop
runs on every iteration.

Requirements:

- **Non-zero exit on any failure.** The loop treats exit code as truth
- **Fast enough to run per task** — the loop runs it every iteration
- **Complete enough to trust.** If it passes and the code is broken, the loop builds on rubble
- **No interactive prompts.** It runs headless
- **Deterministic.** A flaky verify command makes the loop thrash and burn its three attempts on noise

There is often a tension between fast and complete. The usual resolution: a fast verify for the loop
(lint, types, unit, affected integration) plus the full pipeline on push. State both in
`PROJECT-CONTEXT.md` so it is explicit which is which.

**Test the verify command before committing it to `PROJECT-CONTEXT.md`.** A wrong command means every
loop iteration fails for the wrong reason, and the agent burns its three-attempt budget on your typo.

---

## Deployment automation

- **Automated, not manual.** Every manual step is a step that goes wrong at 3am
- **Idempotent.** Re-running a deploy must be safe
- **Health-checked**, with a check that means something. A check returning 200 unconditionally is
  decoration; it should verify dependencies are reachable
- **Automatic rollback** on failed health checks
- **Migrations separated from application deploys** so each can be reasoned about and reversed
  independently
- **Deployment recorded** — what version, when, by whom, from which commit. This is the first thing
  anyone asks during an incident

---

## Metrics worth tracking

The four DORA metrics predict delivery performance better than any process artifact:

| Metric | Signals |
|---|---|
| **Deployment frequency** | Batch size and pipeline confidence |
| **Lead time for changes** | Commit to production duration |
| **Change failure rate** | Test suite quality and review effectiveness |
| **Time to restore service** | Rollback and observability maturity |

**Deployment frequency is the one to move first.** It forces small batches, and small batches
independently improve the other three: fewer changes per deploy means easier diagnosis, easier rollback,
and lower failure rate.

Also track: pipeline duration, flake rate, and time spent on failed pipelines.

---

## Criteria for the spec

```markdown
### Delivery — appended by aidd-devops
- [ ] AC-D1: Pipeline green on the merge result, not just the branch head → CI config
- [ ] AC-D2: Verify command exits non-zero on any failure → tested manually
- [ ] AC-D3: Same artifact promoted to staging and production → deploy log
- [ ] AC-D4: Dependency scan fails on High/Critical → CI run
- [ ] AC-D5: Rollback executed successfully in staging → recorded output
- [ ] AC-D6: Migration applied and reverted on production-sized data, timing recorded → output
```

AC-D5 and AC-D6 are the two that get skipped and the two that matter during an incident.

---

## Anti-patterns

- **Slow stages first.** A lint error found after six minutes of tests.
- **Rebuilding per environment.** Staging validated an artifact production never ran.
- **Mutable base image tags.** `node:22` changes under you; builds stop being reproducible.
- **Unpinned third-party actions.** Remote code execution in your pipeline.
- **Fork PRs with access to secrets.** A complete compromise path.
- **A CI token with production write access.** The highest-value target you own.
- **Persistent runners.** Accumulated state, cross-contaminated builds.
- **A `[skip ci]` escape hatch.** A permanent hole in the gate.
- **Tolerating flaky tests.** Trains the team to ignore red; retries hide real failures.
- **Production data in staging.** Weaker controls, broader access, the common leak path.
- **Persistent preview environments.** Unmanaged sprawl holding real credentials.
- **Health checks that always return 200.** Decoration; rollback never triggers.
- **Manual deployment steps.** They go wrong at 3am.
- **Long-lived branches.** Merge risk grows exponentially with age.
- **An untested verify command.** The loop burns its attempts on your typo.
- **No deployment record.** The first question in an incident has no answer.
