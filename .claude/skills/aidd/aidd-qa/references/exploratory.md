# Exploratory Testing

Structured human testing to find what nobody specified. Automation verifies what you thought of;
exploratory testing finds what you did not — including the cases where the specification itself was
wrong.

It is not ad-hoc clicking. The difference is a **charter**, a **time box**, and **notes**. Without those
three it is unrepeatable, unreportable, and indistinguishable from using the app.

---

## Why it still matters

Every automated test encodes an expectation someone already had. That is its strength and its ceiling.

The defects automation structurally cannot find:

- **Requirements that were wrong.** The code does what the spec said; the spec was mistaken
- **Interactions nobody modeled.** Feature A plus feature B in a specific order
- **Things that work but are unusable.** Correct behavior, confusing outcome
- **Whole missing cases.** Code that was never written has no lines to cover and no criterion to verify

The last one is the most expensive defect class in software, and it is invisible to coverage.

---

## Session-based structure

Work in **60–90 minute sessions** with three artifacts.

**1. Charter** — what you will explore, and roughly how. One or two sentences, specific enough to
constrain and loose enough to allow discovery.

```
Explore the bulk order import with malformed and boundary CSV files,
to discover how partial failures are reported and what state is left behind.
```

Compare with "test the import feature", which produces a walkthrough of the happy path.

**2. Time box.** Hard stop. It forces prioritization and makes sessions comparable.

**3. Notes as you go**, not reconstructed after. Record what you did, what you observed, what surprised
you, and questions raised. Reconstruction from memory loses the reproduction steps, which is the part
that makes a finding actionable.

```markdown
## Session — bulk import, malformed input
Charter: <above>   Duration: 75 min   Build: abc123

### Notes
- 200-row file, row 150 has a bad date → 200 OK, "Import complete", 149 rows created.
  Row 150 silently dropped. **BUG-1** — success status with silent data loss
- Same file re-uploaded → 149 more rows created, all duplicated. **BUG-2** — no idempotency
  or dedup on re-upload
- Empty file → 500. **BUG-3**
- File with only a header row → 200, "0 imported". Correct
- 50k-row file → request times out at 30s. Unclear whether the import continued.
  Checked DB: 12k rows created. **BUG-4** — partial import with no record of it
- Question: is there a maximum file size? Not documented, not enforced. → to PM

### Coverage
Explored: malformed rows, empty, header-only, oversized, re-upload
Not explored: encoding (UTF-16, BOM), concurrent uploads by two users, permission scoping
```

That session found four defects in 75 minutes, and BUG-1 and BUG-4 are both silent data loss —
precisely the class automation was never told to look for.

**Always record what you did *not* explore.** It makes the coverage honest and tells the next session
where to start.

---

## Heuristics

Systematic prompts that make exploration productive rather than aimless.

### SFDIPOT — tour the product

A checklist for what to examine, from the Rapid Software Testing tradition:

| | Ask |
|---|---|
| **S**tructure | What is it built from? Files, components, dependencies |
| **F**unction | What does it do? Every feature, including the obscure ones |
| **D**ata | What does it operate on? Types, sizes, lifecycles, relationships |
| **I**nterfaces | How is it accessed? UI, API, CLI, import, webhook |
| **P**latform | What does it depend on? Browser, OS, network, third parties |
| **O**perations | How is it actually used? Real workflows, not designed ones |
| **T**ime | What changes over time? Timing, sequence, concurrency, staleness |

**Interfaces** and **Time** produce the most findings. Interfaces because a feature is usually tested
through one entry point and reachable through three. Time because sequence and concurrency defects are
rarely designed for.

### Tours

Pick a lens and follow it through the product:

| Tour | Method | Finds |
|---|---|---|
| **Money** | Follow every path where value moves | The highest-consequence defects |
| **Landmark** | Hit the main features in an unusual order | Interaction defects |
| **Back alley** | Use the least-used features | Where nobody has looked |
| **Obsessive** | Repeat one action many times | Rate limits, leaks, duplicates |
| **Saboteur** | Actively try to break it | Validation and error handling |
| **Supermodel** | Look only at the surface | Layout, copy, states |
| **Interrupt** | Close the tab, kill the network, go back mid-flow | Partial state, lost data |
| **Continuous use** | Use it for an hour as a real user would | Accumulation, session expiry, staleness |

**The interrupt tour is the most productive single tour.** Navigate away mid-submit, kill the network
during an upload, hit back after a payment, close the tab during a multi-step form. Real users do all
of these constantly, and almost nothing is designed for it.

### Question prompts

- What happens if I do this **twice**? Quickly?
- What if I do these in the **opposite order**?
- What if I **leave** and come back? An hour later? A day?
- What if I use the **back button** here?
- What if this is the **first** time, or the **thousandth**?
- What if I am a **different user** with the same link?
- What if the **network dies** right now?
- What would a **malicious** user try?
- What would a **confused** user do?
- What does the **error message** actually say — is it useful?

---

## When to run a session

| Timing | Charter focus |
|---|---|
| After a feature passes automated verification | The unspecified cases in that feature |
| Before a significant release | The money tour, plus interactions between new features |
| After a production incident | The area around it — incidents cluster |
| When a spec feels underspecified | Explore the ambiguity and bring back questions |
| On a legacy area nobody understands | Structure and function tour, to build a model |

**After an incident is the highest-value timing.** A defect in an area is evidence that the area is
under-tested, and exploring around it usually finds siblings.

---

## Turning findings into value

Three outputs, and only the first is a bug report.

**1. Defects.** With reproduction steps from your notes.

**2. Questions for the PM.** Behavior nobody specified. This is often the more valuable output, because
it fixes the specification rather than one instance:

> The import has no documented maximum file size, and none is enforced. A 50k-row file times out
> after partially importing. What should the limit be, and what should the user see?

**3. New automated tests.** Every exploratory finding that matters should become a regression test.
Otherwise you will find it again next quarter.

That third step is what makes exploratory testing compound. Without it, each session's value is
consumed once.

---

## Session report

```markdown
# Exploratory session — <area>

Charter: <what and roughly how>
Duration / Build / Tester:

## Findings
| # | Finding | Severity | Repro | Route |
|---|---|---|---|---|
| 1 | Row-level import failures silently dropped, 200 returned | Blocking | notes | implementer |
| 2 | Re-upload duplicates all rows | Blocking | notes | architect (needs design) |

## Questions raised
| Question | Owner |
|---|---|
| Maximum import file size, and behavior above it? | PM |

## Regression tests to add
| Finding | Test to write | Level |
|---|---|---|
| 1 | Import with one bad row reports partial failure | integration |
| 2 | Re-uploading the same file creates no duplicates | integration |

## Coverage
Explored: <list>
**Not explored**: <list — this is what makes the report honest>

## Model notes
<What you learned about how the system works. Useful to the next tester and to the architect.>
```

---

## Article V and exploratory findings

Findings from a session run **during** an active pipeline run go to `BACKLOG.md`, not into the frozen
spec — with two exceptions that are not new scope:

- **A criterion is genuinely unmet.** That is unfinished work, not a new finding
- **A regression** in existing behavior. That opens its own run per Rule 2

Everything else is a backlog item. The scope freeze is what lets a run converge, and exploratory testing
is exactly the activity that generates the most tempting reasons to break it.

Best practice: run the session, but schedule it so its findings land **before** the freeze on the next
run rather than during the current one.

---

## Anti-patterns

- **No charter.** Becomes a walkthrough of the happy path.
- **No time box.** Sessions expand and become incomparable.
- **Notes written afterward.** Loses the reproduction steps, which is the actionable part.
- **Not recording what was not explored.** The coverage claim becomes dishonest.
- **Findings that never become regression tests.** You will find them again next quarter.
- **Only reporting defects.** The questions for the PM are often worth more.
- **Exploring only the happy features.** The back alleys are where nobody has looked.
- **Skipping the interrupt tour.** Real users interrupt constantly; nothing is designed for it.
- **Treating it as a substitute for automation.** Different defect classes; you need both.
- **Injecting session findings into a frozen spec.** Backlog them.
- **Exploring only before release.** After an incident is the highest-value timing.
