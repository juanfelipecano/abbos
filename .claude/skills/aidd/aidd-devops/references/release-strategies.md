# Release Strategies

Getting a change in front of users with a way back. The organizing idea: **separate deploying code from
releasing behavior.** Once those are separate, most release risk becomes a configuration change instead
of a deployment.

---

## Choosing

| Strategy | Rollback speed | Cost | Use when |
|---|---|---|---|
| **Recreate** | Redeploy (slow) | Lowest | Dev only. Involves downtime |
| **Rolling** | Redeploy (minutes) | Low | Backward-compatible changes, the default |
| **Blue/green** | Instant (traffic switch) | Double capacity | Fast complete rollback required |
| **Canary** | Instant for the cohort | Traffic splitting needed | Risky change needing real traffic to validate |
| **Feature flag** | Instant (config) | Flag hygiene debt | Decoupling deploy from release |

**Rolling plus feature flags covers most cases.** Blue/green and canary solve narrower problems and cost
real infrastructure.

**Feature flags are the highest-leverage of the five.** They convert a deployment decision into a runtime
decision, which means the risky moment is a config toggle you can reverse in seconds rather than a
deployment you must repeat.

---

## Rolling

Replace instances gradually while the old version still serves traffic.

**Requires**: both versions running simultaneously must be safe. That means:
- Backward-compatible schema (see `migrations.md`)
- Backward-compatible API contracts — an old client may hit a new instance and vice versa
- No shared in-memory state between instances
- **Health checks that mean something.** A check returning 200 unconditionally makes rolling deployment
  a way to replace all healthy instances with broken ones, one at a time, with no alarm

**Rollback** is another rolling deploy of the previous version — minutes, not seconds. If you need faster,
you need blue/green or a flag.

---

## Blue/green

Two full environments. Deploy to the idle one, verify, switch traffic.

- ✅ Rollback is a traffic switch — seconds
- ✅ Verification against the real environment before any user traffic
- ❌ Double capacity during the switch
- ❌ Stateful components (databases, caches, in-flight jobs) do not duplicate cleanly

**The database is the catch.** Both environments share it, so schema compatibility with both versions is
still mandatory. Blue/green gives you fast *code* rollback; it does nothing for schema.

**Drain connections** before decommissioning the old environment, or in-flight requests are severed. This
is routinely forgotten and shows up as a spike of client errors at each release.

---

## Canary

Route a small fraction of traffic to the new version, watch, then expand.

```
5% → watch 15 min → 25% → watch 30 min → 50% → watch 1 hr → 100%
```

**Requires**: traffic splitting, and **per-cohort metrics**. Canary without separated metrics is just a
slow rollout — you cannot tell whether the canary is worse if you only see aggregates.

**What to watch**, comparing canary against baseline: error rate, p95 and p99 latency, and the relevant
business metric. A canary with the same error rate but half the conversion rate is a failure that error
monitoring will not catch.

**Define the abort threshold before starting**, in numbers: "abort if canary error rate exceeds baseline
by 0.5% or p95 exceeds baseline by 200ms." Deciding during the rollout means deciding under pressure with
motivated reasoning.

**Cohort selection matters.** Random percentage is simplest. Internal users first is safer but
unrepresentative — they use the product differently and will not surface the defect real users hit.

---

## Feature flags

The highest-leverage technique here, and the one with the worst long-term hygiene.

### Types, and their lifespans

| Type | Lifespan | Removal |
|---|---|---|
| **Release** | Days to weeks | Remove immediately after full rollout |
| **Experiment** | Weeks | Remove when the experiment concludes |
| **Ops kill-switch** | Permanent | Keep, and document it |
| **Permission** | Permanent | Not a flag — that is authorization |

The last row is worth stating: entitlements and permissions are not feature flags. Putting them in a flag
system means your authorization logic lives outside your authorization system.

### Hygiene

**Flags decay.** A codebase with 40 stale flags has 2^40 nominal configurations and zero tested ones. In
practice, only one combination is ever exercised — and any other combination is untested code that will
eventually be reached.

Rules that hold:

- **Every flag gets an owner and a removal date at creation.** Not "we'll clean it up"
- **A backlog task for removal, created with the flag**
- **Alert on flags older than 90 days** whose type is release or experiment
- **Default to the safe value.** If the flag service is unreachable, the code must behave correctly —
  which usually means off. A flag that fails to "on" is a failing-open pattern (see OWASP A10)
- **Test both paths** while the flag exists. The untested branch is the one that will be reached
- **Never nest flags.** Combinatorial explosion, and nobody understands the resulting behavior

**Removing a flag is a code change, not a config change.** Deleting the flag from the flag service while
leaving the branch in code leaves a permanently dead path that reads as live.

---

## Pre-flight

- [ ] CI green on the exact release commit
- [ ] Migrations applied, reversible, timing verified (see `migrations.md`)
- [ ] Application version N-1 works against the current schema
- [ ] Config and secrets present in the target environment
- [ ] Flags set to their intended launch state
- [ ] **Rollback executed in staging**, not merely written down
- [ ] Watch window and abort threshold agreed, in numbers
- [ ] Someone available who can execute the rollback
- [ ] Not immediately before a weekend or holiday, unless there is a reason

The last item is not superstition. Deploy on a Friday afternoon and you have either a weekend incident or
an unmonitored change; both are choices worth making deliberately.

---

## Rollback

Written down before deploying. The distinction between a written rollback and a *tested* one is
discovered during the incident.

```bash
# Application
<the exact commands>

# Flags
<which flags to which values>

# Migration — if reversible
<the exact commands>
```

**And the part people omit: what a rollback cannot undo.**

- Rows already written in the new shape
- Emails and notifications already sent
- Webhooks already delivered to partners
- Third-party state already changed — charges, refunds, external records
- Caches already populated with new-format data
- Events already published to consumers

A rollback plan covering only code is half a plan. For each item above, either state that it is
acceptable or provide a compensating action.

---

## The watch window

After every release, an explicit period of attention with a defined abort condition.

| Element | Example |
|---|---|
| Duration | 60 minutes, or one full business cycle for a batch feature |
| Watch | Error rate, p95, the feature's business metric, queue depth |
| Abort if | Error rate > 1%, or p95 > 2× baseline, or conversion drops > 5% |
| Who | The named person watching |

**Abort thresholds must be numbers set in advance.** "We'll see how it looks" under pressure produces
rationalization — every metric has a plausible innocent explanation in the moment.

**Errors are often delayed.** A batch job failing shows up hours later; a cache filling with bad data
shows up when it is warm; a memory leak shows up the next day. Match the window to the feature's actual
feedback latency rather than defaulting to an hour.

---

## Progressive delivery, combined

The strategies compose, and the composition is what mature delivery looks like:

```
1. Deploy code behind a flag, off        — rolling deploy, zero user impact
2. Enable for internal users             — smoke test with real infrastructure
3. Enable for 5% of users                — canary, watch per-cohort metrics
4. Expand to 25%, 50%, 100%              — with a watch window at each step
5. Remove the flag                       — a code change, in its own release
6. Delete the old code path              — a later release
```

Steps 1 and 5 are deployments. Steps 2–4 are configuration changes, each individually reversible in
seconds. The risky moments have been converted from deployments into toggles, which is the entire point.

---

## Criteria for the spec

```markdown
### Delivery — appended by aidd-devops
- [ ] AC-D1: Feature deployed behind flag <name>, default off → config review
- [ ] AC-D2: Both flag paths tested → `npm test -- feature.flag`
- [ ] AC-D3: Flag fails to the safe value when the flag service is unreachable
      → `npm test -- flag.fallback`
- [ ] AC-D4: Rollback executed in staging → recorded output
- [ ] AC-D5: Flag removal task created with an owner and date → backlog link
- [ ] AC-D6: Abort threshold defined numerically in the release record → review
```

AC-D3 is the one people skip. A flag that fails to "on" during a flag-service outage releases an
unfinished feature to everyone.

---

## Anti-patterns

- **A rollback plan never executed.** Discovered during the incident.
- **Documenting only code rollback.** Sent emails and delivered webhooks do not roll back.
- **Health checks that always return 200.** Rolling deploy replaces every healthy instance with a broken
  one, quietly.
- **Blue/green treated as solving schema rollback.** Both environments share the database.
- **Not draining connections** on cutover. A spike of client errors every release.
- **Canary with only aggregate metrics.** A slow rollout with no signal.
- **Deciding the abort threshold during the rollout.** Motivated reasoning under pressure.
- **Canarying to internal users only.** Unrepresentative usage; real defects not surfaced.
- **Flags with no owner or removal date.** Permanent untested branching.
- **A flag that fails to "on".** Releases an unfinished feature during a flag outage.
- **Nested flags.** Combinatorial behavior nobody understands.
- **Deleting a flag from the service but leaving the branch.** Dead code that reads as live.
- **Permissions implemented as feature flags.** Authorization outside the authorization system.
- **Testing only the enabled path.** The other branch will be reached.
- **A one-hour watch window for a nightly batch feature.** Wrong feedback latency.
