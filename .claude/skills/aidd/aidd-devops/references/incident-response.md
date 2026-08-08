# Incident Response

Handling production failures, and converting each one into a permanent improvement. Article XII applied to
operations: the output of an incident is a system change, not a resolution.

---

## The first rule

**Mitigate before you diagnose.**

Understanding the bug is not more urgent than stopping it. The instinct to find the root cause first is
strong and wrong — every minute spent diagnosing is a minute of user impact you could have ended.

Mitigation options, in order of speed:

1. **Toggle the flag off** — seconds, if the change was behind one
2. **Roll back** — minutes
3. **Scale up** — minutes, if it is a capacity problem
4. **Disable the failing feature** — degrade rather than fail entirely
5. **Fix forward** — only when rollback is impossible or clearly worse

Fix-forward is tempting because it feels like progress. It is the highest-risk option: you are writing
code under pressure, on a system already misbehaving, without normal review. Choose it deliberately, not
by default.

**Diagnosis after mitigation is calmer, more accurate, and just as complete.** The evidence does not
disappear — logs, metrics, and traces are still there.

---

## Roles

Even for a small incident, name these. Ambiguity is what makes incidents worse.

| Role | Does | Does not |
|---|---|---|
| **Incident commander** | Decides, coordinates, tracks the timeline | Debug hands-on |
| **Operator** | Executes changes — rollbacks, flags, scaling | Decide unilaterally |
| **Communicator** | Updates stakeholders and status pages | Debug |
| **Scribe** | Records the timeline as it happens | Debug |

For a small incident one person may hold several roles, but **the commander must not also be debugging.**
Someone deep in a stack trace cannot track elapsed time, notice that a mitigation was never applied, or
decide to escalate.

**One commander.** Multiple people independently applying fixes is how a bad incident becomes a worse one
— two conflicting changes, and now nobody knows the system's state.

---

## The timeline

**Written as it happens, not reconstructed.** Reconstruction from memory produces fiction, and the
timestamps are exactly what the post-mortem needs.

```
14:22  Alert: error rate on /checkout 12% (threshold 1%)
14:24  Ack. Confirmed in dashboard. Started 14:19
14:26  Recent changes: deploy v2.31 at 14:15
14:27  DECISION: roll back v2.31. Rationale: correlates with onset
14:29  Rollback started
14:33  Rollback complete. Error rate 0.3% and falling
14:38  Confirmed recovered. Incident mitigated. 19 min impact
14:40  Diagnosis begins on the rolled-back build
15:20  Cause: v2.31 added a call to the tax service with no timeout;
       tax service p99 was 8s, exhausting the connection pool
```

Two things this format captures that memory loses: **decision points with their rationale** (14:27), and
**the moment mitigation completed versus when diagnosis started** (14:38). Both matter in the
post-mortem, and both are gone within a day if not written down.

---

## Severity

Define these before you need them. Arguing about severity during an incident wastes the minutes that
matter.

| Sev | Definition | Response |
|---|---|---|
| **1** | Complete outage, or data loss, or a security breach | Page immediately, all hands, exec comms |
| **2** | Major feature broken, or severe degradation | Page, dedicated responder |
| **3** | Minor feature broken, workaround exists | Business hours |
| **4** | Cosmetic or edge case | Backlog |

**Data loss and security incidents are always Sev 1**, regardless of how few users are affected. They are
irreversible and they compound with time.

**When uncertain, over-classify.** Downgrading a Sev 1 after ten minutes costs a little attention;
discovering that a Sev 3 was a breach costs much more.

---

## Communication

**Update on a cadence, even with nothing new.** Silence is read as "nobody is working on it", and it
generates a second problem: people asking, which consumes the responders.

```
[14:30] Investigating elevated errors on checkout. Some users may see failures.
        Next update 14:45.
[14:40] Mitigated by rolling back the recent deploy. Confirming recovery.
        Next update 15:00.
[15:00] Resolved. Root cause under investigation. Post-mortem to follow.
```

Say **what users experience**, not what is technically wrong. "Some users may see checkout failures" is
useful; "connection pool exhaustion in the tax service client" is not, to that audience.

**Never speculate on cause in a stakeholder update.** Early hypotheses are usually wrong, and a
retracted cause damages trust more than saying "under investigation".

---

## Post-mortem

Within a few days, while memory is fresh.

### Blameless, precisely

Blameless does not mean avoiding the fact that a human action was involved. It means asking **why the
system allowed it** rather than why the person did it.

- ❌ "Alice deployed without running the migration test."
- ✅ "The migration test is not part of the pipeline, so it depends on individual discipline. It was
  skipped here and has likely been skipped before without consequence."

The second version produces a system change. The first produces a more careful Alice and an unchanged
system, which will catch someone else.

**If the same class of incident recurs, the previous post-mortem's action items were wrong** — either
they addressed a symptom or they were never completed. That is the finding.

### Structure

```markdown
# Post-mortem — <title>

**Date** · **Duration** · **Severity** · **Impact**: <users affected, what they experienced>

## Timeline
<From the incident log. Include detection, decisions, mitigation, resolution.>

## What happened
<Narrative. What the system did, mechanically.>

## Why it happened
<The chain of causes. Keep asking why until you reach something in your control
to change. Stop at "we could have prevented this by changing X".>

## Why it was not caught
<The more valuable question. Which test, review, gate, or alert should have caught
this and did not — and why not?>

## What went well
<Genuinely. Fast detection, a rollback that worked, good comms. These are the
practices to protect.>

## Action items
| # | Action | Type | Owner | Due |
|---|---|---|---|---|
| 1 | Add a default timeout to all outbound HTTP clients | Prevent | | |
| 2 | Alert on connection pool saturation | Detect | | |
| 3 | Add the migration test to the pipeline | Prevent | | |
| 4 | Document the rollback path for v2.x | Respond | | |
```

**"Why was it not caught" is the highest-value section.** The cause explains this incident; the detection
gap explains the next several. In the example above, the timeout was missing — but the deeper finding is
that nothing in the pipeline requires timeouts, so the same defect can be reintroduced tomorrow.

### Action items that work

| Type | Value | Note |
|---|---|---|
| **Prevent** | Highest | Makes the class impossible — a lint rule, a required default, a gate |
| **Detect** | High | Catches it faster next time |
| **Respond** | Medium | Makes mitigation faster — a runbook, a tested rollback |
| **Document** | Low alone | Necessary but insufficient |

**"Be more careful" is not an action item.** Neither is "add training" as the only item, nor "we will
remember this".

**Cap at three to five items and complete them.** Fifteen action items means none get done, and the next
post-mortem lists the same causes. Completion rate matters more than count — an incident review process
with a 20% completion rate is theatre.

---

## Runbooks

Written for a stressed reader at 3am. Mitigation before explanation; see `aidd-tech-writer`'s
`runbooks.md` for the full structure.

Every alert links to one. **An alert with no runbook is a research project at 3am**, performed by whoever
is on call, who may never have seen this system.

The best time to write a runbook is immediately after the incident that would have needed it — the
knowledge is fresh and the gap is obvious.

---

## Practicing

Untested recovery procedures do not work. This is reliably true and reliably surprising.

- **Execute the rollback in staging** for every release that has one
- **Game days**: deliberately break something in a controlled window and practice responding. The point
  is finding the gaps — the missing runbook, the credential nobody has, the dashboard that does not exist
- **Chaos testing** in production, once you are mature enough: kill an instance and confirm nothing user-
  visible happens
- **Restore from backup on a schedule.** A backup you have never restored is a hypothesis. Restoring it
  quarterly is the only way to know

The backup point is the one most organizations get wrong, and it is the one where being wrong is
unrecoverable.

---

## The metric that matters

**Time to restore service** (one of the four DORA metrics) measures your response maturity better than
incident count. Incidents are inevitable; a slow recovery is a choice about what you invested in.

It decomposes usefully:

```
Detection time   → observability and alerting quality
Diagnosis time   → observability depth, runbooks
Mitigation time  → rollback and flag maturity
Verification     → monitoring quality
```

Track each. The slowest phase tells you where to invest, and it is usually detection — most incidents are
reported by users before an alert fires, which is a specific, fixable gap.

---

## Anti-patterns

- **Diagnosing before mitigating.** Every minute of understanding is a minute of impact.
- **Fix-forward by default.** Writing code under pressure on a misbehaving system.
- **A commander who is also debugging.** Nobody tracks time or notices the missed step.
- **Multiple people applying fixes.** Conflicting changes; nobody knows the system state.
- **Reconstructing the timeline afterward.** Produces fiction; loses the decision rationale.
- **Silence during an incident.** Read as inaction; generates interruptions.
- **Speculating on cause in stakeholder comms.** Early hypotheses are usually wrong.
- **Arguing severity during the incident.** Define the tiers in advance.
- **Naming a person as the cause.** Produces a careful person and an unchanged system.
- **Skipping "why was it not caught".** The cause explains one incident; the gap explains the next five.
- **"Be more careful" as an action item.** Not an action.
- **Fifteen action items.** None get done; the same causes recur.
- **Not tracking action-item completion.** The process becomes theatre.
- **An alert with no runbook.** A research project at 3am.
- **A backup never restored.** A hypothesis, not a backup.
- **Never practicing recovery.** Untested procedures do not work.
