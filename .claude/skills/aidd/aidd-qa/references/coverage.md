# Coverage

What coverage measures, what it does not, and what to use instead when you want to know whether the
tests actually work.

The central fact: **coverage measures execution, not verification.** A line executed during setup
counts as covered. A test with no assertions at all can produce 100% coverage. This is not a corner
case — it is the normal way high-coverage-low-value suites come to exist.

---

## The types, and what each misses

| Type | Measures | Blind to |
|---|---|---|
| **Line** | Lines executed | Which branch was taken |
| **Branch** | Each branch taken both ways | Individual conditions in a compound expression |
| **Condition** | Each boolean sub-expression both ways | Combinations of conditions |
| **Path** | Distinct execution paths | Impractical — grows exponentially |
| **Mutation** | Whether tests **detect** injected faults | Little. This is the real measure |

**Use branch coverage, not line coverage.** Line coverage is systematically optimistic:

```js
function price(base, isMember) {
  let p = base;
  if (isMember) p = p * 0.9;      // one test with isMember=true → 100% line coverage
  return p;                        // the isMember=false path is never verified
}
```

One test gives 100% line coverage and 50% branch coverage. The uncovered branch is where the bug is,
and line coverage reports success.

**The uncovered branch is almost always the error path**, because tests are written for the happy path
first and the error path second, if at all. That is also where defects concentrate.

---

## Mutation testing: the actual measure

Mutation testing modifies your code — flips a comparison, removes a statement, changes a constant — and
runs the tests. If the tests still pass, they did not detect the fault.

**A surviving mutant means that code is not meaningfully tested**, whatever coverage says.

```js
// Original
if (age >= 18) allow();

// Mutants: age > 18 · age <= 18 · age >= 19 · true · false
// A test suite with only age=25 and age=10 kills some of these but not `age > 18`.
// Only a test at exactly 18 kills that one — which is boundary value analysis, confirmed empirically.
```

Mutation testing is expensive (it runs the suite once per mutant), so use it selectively:

- On the highest-risk modules — payment, authorization, core domain rules
- Once, as a diagnostic, when you suspect a suite is weak
- Not on every commit across the whole codebase

**The cheap manual version, which you should do routinely:** break one line of the implementation and
confirm something goes red. If nothing does, that code is untested regardless of the report. This takes
thirty seconds and is the single most informative coverage check available.

---

## Setting a bar

**A percentage is a floor against regression, not evidence of quality.** Treat it that way.

| Bar | Effect |
|---|---|
| No target | Coverage decays; nobody notices until it is 30% |
| 60–70% overall | Reasonable floor; keeps the trend honest |
| 80% on new code | Good. Focuses effort where change is happening |
| 90%+ overall | Diminishing returns; drives tests for trivial code |
| 100% | Actively harmful — produces assertion-free tests to satisfy the gate |

**Prefer a bar on new and changed code** over a global one. It focuses effort where risk is, it does
not demand a retroactive campaign, and it prevents the ratchet from ever going backwards.

**Exclude the right things** from the measurement: generated code, framework configuration, DTOs with
no logic, and third-party wrappers. Including them makes the number meaningless in both directions —
it can look bad while risky code is covered, or look fine because trivial code inflates it.

**Never let the bar drive test writing.** "We need 3% more coverage" produces tests for getters, and
those tests are pure maintenance cost.

---

## Reading a coverage report usefully

The percentage is the least informative part. What to actually look at:

**1. What is uncovered, and does it matter?** 60% on payment logic is a finding. 60% on presentational
components is fine. Report by risk, not by number.

**2. Uncovered branches specifically.** Sort by them and read. These are your error paths.

**3. Covered but unasserted.** Coverage tools cannot show this, so look manually: code executed during
setup, or inside a function whose return value nothing checks.

**4. Coverage trend, not level.** Direction over time tells you more than a snapshot. A suite going from
55% to 70% is healthy; one going from 80% to 72% is decaying and worth asking about.

**5. Files with high churn and low coverage.** The intersection is where your next defect comes from.
Cross-reference the coverage report with the git churn list:

```bash
git log --format=format: --name-only --since=6.months | sort | uniq -c | sort -rn | head -20
```

A file changed forty times in six months with 40% coverage is the highest-priority gap in the
codebase, regardless of what the overall number says.

---

## Signals that coverage is lying

High coverage with these present means the number is decorative:

- **Tests with no assertions.** Common in "smoke tests" that only check nothing threw
- **Assertions only on mock calls.** Restates the code; passes after the logic breaks
- **Large snapshot tests.** Regenerated without reading, so they detect nothing
- **A shared setup that executes most of the code** before any test-specific work
- **Tests that never fail.** Check the CI history: a test file that has never gone red in a year of
  changes to its subject is probably not testing it
- **`expect(true).toBe(true)`** or equivalents left after debugging

The CI-history check is underrated. If the code changed repeatedly and the test never once failed, ask
what it verifies.

---

## What coverage cannot tell you

Real gaps that a 100% report is compatible with:

| Gap | Why coverage misses it |
|---|---|
| **Concurrency defects** | Sequential tests execute the lines. The bug is in the interleaving |
| **Missing requirements** | Code that was never written has no lines to cover |
| **Wrong behavior** | The line ran and returned the wrong answer; nothing asserted it |
| **Integration mismatches** | Each side covered independently; the contract between them is not |
| **Performance** | Executed is not the same as fast |
| **Data-dependent bugs** | Covered with test data; broken with production data shapes |
| **Configuration and deployment** | Not code |

**The first two matter most.** A missing requirement is the most expensive defect class and coverage is
structurally incapable of detecting it — which is why criteria traceability (below) matters more than
any percentage.

---

## Criteria traceability

More useful than coverage, and cheap to maintain. Map acceptance criteria to the tests that verify
them:

| Criterion | Test | Verified |
|---|---|---|
| AC-F1 | `orders.spec.ts: creates an order with valid input` | ✅ |
| AC-F2 | — | ❌ **gap** |
| AC-S1 | `orders.authz.spec.ts: non-owner receives 404` | ✅ |
| AC-B1 | `orders.concurrency.spec.ts: exactly one redemption` | ✅ |

**A criterion with no test is a real gap.** A test mapping to no criterion is either out of scope or
reveals a missing criterion — both worth knowing.

This table answers the question coverage cannot: *did we test what we agreed to build?*

---

## Criteria for the spec

```markdown
### Coverage / testability — appended by aidd-qa
- [ ] AC-Q1: Branch coverage on new code ≥ 80% → coverage report
- [ ] AC-Q2: Overall coverage does not decrease → coverage diff in CI
- [ ] AC-Q3: Every AC has ≥1 mapped test → traceability table in the QA report
- [ ] AC-Q4: Each AC-F test fails when the implementation is reverted → manual verification
- [ ] AC-Q5: Mutation score on <critical module> ≥ 70% → `npm run mutation -- <module>`
```

AC-Q4 is the one that separates a real suite from a decorative one, and it costs a few minutes.

---

## Anti-patterns

- **Line coverage as the metric.** Systematically optimistic; hides the untaken branch.
- **A single global percentage as the verdict.** Says nothing about where the risk is.
- **100% as a target.** Produces assertion-free tests to satisfy the gate.
- **Writing tests to raise the number.** Tests for getters; pure maintenance cost.
- **Including generated code and DTOs.** Makes the number meaningless in both directions.
- **Reporting the percentage without saying what is uncovered.**
- **Ignoring the churn × coverage intersection.** Where the next defect comes from.
- **Trusting coverage on concurrency.** The lines execute; the bug is in the interleaving.
- **Believing coverage measures quality.** It measures execution.
- **Never breaking a line to check the tests notice.** Thirty seconds; most informative check available.
- **No criteria traceability.** Coverage cannot detect a requirement nobody implemented.
