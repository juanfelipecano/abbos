# Runbooks

Documentation written for someone stressed, tired, and under time pressure.

Every structural choice here follows from one fact: **the reader is mid-incident.** They are not
learning, not evaluating, not browsing. They need the fix, and every sentence between them and it
has a cost measured in downtime.

---

## Mitigation before diagnosis

The inversion that defines the format. Normal technical writing explains, then acts. A runbook acts,
then explains.

```markdown
# Runbook — Export queue backing up

## Impact
Exports are delayed. Users see "queued" indefinitely. No data loss.
Severity: degraded, not down.

## Immediate mitigation
1. Scale workers: `kubectl scale deploy/export-worker --replicas=8`
2. Confirm depth is dropping: `redis-cli llen exports:pending` (check twice, 60s apart)
3. If depth is still rising after 5 minutes, go to "Poison message" below.

## Verify it worked
Queue depth falling, and oldest message age under 5 minutes:
`redis-cli lindex exports:pending -1 | jq .enqueued_at`

## Diagnose
<Now the explanation: causes, where to look, what the signals mean.>

## Escalate to
#platform-oncall. Escalate if depth is still rising 15 minutes after scaling.
```

**Impact comes first** because it determines whether the reader should be doing this at all, or
waking someone up. Two lines: who is affected, and how badly.

**Mitigation is numbered commands**, not prose. At 3am, a paragraph containing a command is a
paragraph someone will misread.

**Verification is separate and specific.** "Check it worked" is not actionable; a command with an
expected result is.

---

## Write for the worst case

Assume the reader:

- Has never seen this system
- Is not the person who built it
- Cannot ask anyone
- Is under time pressure
- Will skim

That last one drives the formatting. Short lines, numbered steps, commands on their own lines, no
paragraph longer than three lines in the mitigation section.

**Never assume context.** Spell out the cluster, the namespace, the environment. `kubectl scale
deploy/export-worker` is ambiguous if there are three clusters; `kubectl --context=prod-us-east -n
exports scale deploy/export-worker` is not.

---

## Commands must be complete and copy-pasteable

```bash
# Bad — requires knowledge the reader may not have
Scale up the workers and check the queue.

# Bad — placeholders that stop the reader
kubectl scale deploy/export-worker --replicas=<more>

# Good
kubectl --context=prod-us-east -n exports scale deploy/export-worker --replicas=8
```

If a value must be filled in, say **where to get it** on the same line:

```bash
# WORKSPACE_ID from the alert payload, field `workspace`
redis-cli --scan --pattern "exports:${WORKSPACE_ID}:*"
```

**Test every command.** A runbook command that fails at 3am is worse than no runbook — the reader
now distrusts the whole document and starts improvising, which is exactly what the runbook existed
to prevent.

---

## What every runbook needs

- [ ] **Trigger** — the alert or symptom, matching the alert text exactly so it is findable
- [ ] **Impact** — who is affected, how badly, and whether it is degradation or outage
- [ ] **Mitigation** — numbered, complete commands, first
- [ ] **Verification** — a specific check with an expected result
- [ ] **Rollback of the mitigation** — if scaling up or flipping a flag needs undoing later
- [ ] **Diagnosis** — after mitigation. Causes, dashboards, log queries
- [ ] **Escalation** — who, and the condition that triggers it
- [ ] **Last verified** — a date. An unverified runbook is a guess

**Escalation needs a condition, not just a name.** "Escalate to #platform-oncall" leaves the reader
deciding when. "Escalate if depth is still rising 15 minutes after scaling" removes the judgment call
from someone who is not in a position to make it well.

---

## Match the alert exactly

The runbook is found by someone reading an alert. If the alert says `ExportQueueDepthHigh`, the
runbook title should contain that string, and the alert itself should link to it.

An alert without a runbook link is a design defect worth raising with `aidd-devops`. The moment of
need is when the alert fires; a runbook the reader has to search for costs minutes at the worst
possible time.

---

## Keeping them true

Runbooks rot silently, because they are only read during incidents — and during an incident nobody
files a documentation bug.

**Verify after every incident that used one.** The person who just ran it knows exactly which step
was wrong. Capture it while they remember; this is the only reliable moment.

**Verify after any change to the system it covers.** A renamed deployment invalidates every command.
This is the question to ask on every release: *what did this just make wrong?*

**Date them.** `Last verified: 2026-07-30`. A runbook with no date is a runbook nobody trusts, and an
untrusted runbook gets ignored in favor of improvisation.

**Delete runbooks for systems that no longer exist.** A stale runbook is worse than a missing one —
someone will follow it.

---

## What does not belong

Keep runbooks short. Every extra paragraph is scrolling during an incident.

- Architecture explanation → link to `explanation/`
- Why the system is designed this way → link to the ADR
- Prevention work and long-term fixes → backlog item, not the runbook
- Historical incident narrative → post-mortem document

The link is fine. The content is not. A reader who needs the architecture during an incident can
follow a link; a reader who has to scroll past it to reach step 2 has been actively harmed.

---

## Anti-patterns

- **Diagnosis before mitigation.** Gets closed at 3am in favor of guessing.
- **Prose containing commands.** Misread under pressure.
- **Placeholders with no source.** `<more>` stops the reader cold.
- **Ambiguous context.** Which cluster? Which namespace?
- **Untested commands.** The reader distrusts the whole document and improvises.
- **"Check that it worked."** Not actionable. Give the command and the expected result.
- **Escalation with no condition.** Leaves a judgment call to someone poorly placed to make it.
- **A title that does not match the alert.** Not findable at the moment of need.
- **No "last verified" date.** Untrusted, therefore ignored.
- **Architecture explanation inline.** Scrolling during an incident.
- **Keeping runbooks for deleted systems.** Someone will follow them.
