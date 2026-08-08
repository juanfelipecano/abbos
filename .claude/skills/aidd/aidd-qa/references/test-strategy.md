# Test Strategy

Deciding what to test, at which level, and how much. The goal is not maximum coverage — it is the
**highest confidence per unit of maintenance cost**, and those two optimize differently.

---

## The level decision

One rule does most of the work: **put each test at the lowest level that can actually catch the
defect.**

Cost and flakiness rise sharply with level. Confidence rises much more slowly.

| Level | Catches | Speed | Flakiness | Maintenance |
|---|---|---|---|---|
| Static (types, lint) | Whole classes of error | Instant | None | Near zero |
| Unit | Logic, branches, calculations, edge cases | ms | None | Low |
| Integration | Wiring, queries, serialization, contracts | 100ms–s | Low | Medium |
| Contract | Provider/consumer drift | s | Low | Medium |
| E2E | The integration genuinely working | 10s–min | **High** | **High** |
| Manual/exploratory | What nobody specified | Human time | — | — |

**The question for each test: could a cheaper level catch this?** If a unit test can, it is a unit
test.

**The pyramid versus the trophy.** The classic pyramid (many unit, some integration, few E2E) fits
systems where the logic is the risk. For UI-heavy work the useful shape is a trophy — a modest unit
base, a heavy middle of component/integration tests, and a thin E2E cap — because most UI defects live
in composition rather than in isolated functions.

Pick the shape that matches where your defects actually come from. Look at the last twenty bugs and
ask which level would have caught each. That is your real answer, and it beats any diagram.

---

## What each level is for

### Static analysis

The cheapest tests you will ever have. Types eliminate a whole defect class before runtime; lint rules
encode team decisions so reviewers do not have to.

Underused as a *testing* tool. A lint rule that forbids importing infrastructure from the domain layer
enforces an architectural constraint on every commit, forever, at zero marginal cost. That is stronger
than any test.

### Unit

Pure logic in isolation: calculations, validation, transformations, state transitions, edge cases.

Ideal targets: anything with many input combinations. Enumerating twelve boundary cases at the unit
level costs seconds; doing it through the HTTP layer costs minutes and tests mostly framework code.

**If business logic cannot be unit tested**, that is an architectural finding, not a testing problem.
Raise it before the freeze — after implementation it requires a rewrite.

### Integration

Real components together, real database, real serialization. This is where you catch what unit tests
with mocks cannot: wrong queries, wrong column names, broken transactions, serialization mismatches,
missing indexes.

**A unit test with a mocked repository proves your code calls the repository. It proves nothing about
whether the query is correct.** That gap is where a large share of production defects live.

### Contract

For service boundaries. The provider verifies it satisfies what consumers expect; consumers verify
against the recorded contract. Catches the "we changed a field name and three services broke" class,
which integration tests within one service cannot see.

Worth the setup once you have more than two services communicating.

### E2E

**Only for paths whose failure is an incident.** Signup, login, checkout, the one flow the business
depends on.

The honest test: if this broke silently for a day, would it be an incident or a ticket? Incident → E2E.
Ticket → a cheaper level.

Every E2E test you add is a test someone will eventually mark skipped. Spend them deliberately.

### Exploratory

Structured human testing to find what nobody specified. See `exploratory.md`. This is not a
replacement for automation; it finds a different class of defect — the ones where the specification
itself was wrong.

---

## What not to test

Discipline about this matters as much as coverage, because every test is a permanent maintenance cost.

- **Framework and library behavior.** Testing that your ORM saves a row tests the ORM.
- **Trivial getters, setters, and pass-throughs.** No logic, no test.
- **Generated code**, unless the generator is yours.
- **The same logic at three levels.** Pick the lowest one that catches it. Duplicated coverage
  triples the cost of every change to that logic for no additional confidence.
- **Implementation details.** Internal state, private methods, call counts. These tests break on
  refactor and pass on regression, which is precisely backwards.
- **Configuration that a deploy would immediately reveal.**

The duplicate-coverage point is the one teams get wrong. The same rule verified in a unit test, an
integration test, and an E2E test means every change to that rule requires three edits — and the two
higher-level tests add no confidence the unit test did not already provide.

---

## Risk-based allocation

Test effort should follow risk, not code volume. A uniform coverage target across a codebase spends the
same effort on a DTO as on the payment path.

Rank by **likelihood of defect × cost of defect**:

| Area | Likelihood | Cost | Effort |
|---|---|---|---|
| Payment, billing | Medium | Catastrophic | Exhaustive: unit + integration + concurrent + E2E |
| Authorization | Medium | Severe | Exhaustive: every endpoint, cross-account |
| Data migration | High | Severe | Heavy: on production-sized data, with rollback |
| Core domain logic | High | High | Heavy unit + integration |
| Concurrency on shared state | **High** | **Severe** | Concurrent tests, mandatory |
| Search, filtering | Medium | Low | Moderate |
| Admin tooling | Medium | Low | Light |
| Presentational components | Low | Low | Light |
| Static content | Low | Trivial | None |

Two rows deserve emphasis. **Concurrency** because sequential tests cannot find those defects by
construction, so the absence of tests is total absence of coverage. **Migrations** because they are
often untested entirely and are among the least reversible things you can ship.

---

## Test data

The most common source of unreliable suites.

**Build data per test, in the test.** A shared fixture file that many tests depend on becomes
untouchable — changing it breaks unrelated tests, so it only ever grows.

**Use factories with sensible defaults and explicit overrides:**

```js
// The override is the point: it documents what this test actually cares about
const order = makeOrder({ status: 'paid', total: 1000 });
```

A test constructing a fifteen-field object obscures which field matters. A factory with one override
makes the intent obvious.

**Each test creates what it needs and does not depend on order.** A test that passes only after another
test has run is a test that will fail mysteriously in CI, in parallel, or when someone reorders the
file.

**Reset state between tests** — transaction rollback is usually fastest, truncation is more thorough.
Never rely on tests cleaning up after themselves; a failing test does not run its cleanup.

**Production-like volume for anything performance-sensitive.** A query plan on 100 rows tells you
nothing about 40 million, because the planner chooses differently.

---

## Test doubles

Use the least powerful double that works. Each step up couples the test more tightly to
implementation.

| Double | Behavior | Use when |
|---|---|---|
| **Stub** | Returns canned values | You need an input |
| **Fake** | Working lightweight implementation | Repeated realistic interaction (in-memory repository) |
| **Spy** | Records calls, real behavior | You must verify an outgoing effect you cannot otherwise observe |
| **Mock** | Pre-programmed with expectations | Rarely. Verifies interaction, not behavior |

**Fakes are the most underused and the best option in most cases.** An in-memory repository that
actually stores and retrieves lets you assert on end state rather than on calls — which means the test
survives refactoring and fails when behavior breaks.

**Mock at the network boundary, not the module boundary.** Intercepting HTTP means your real client
code runs — its URLs, headers, parsing, and error handling are all exercised. Mocking your own module
means none of that is tested.

**What to mock:** third-party network calls, time, randomness, the filesystem where relevant.
**What not to mock:** your own domain logic, the database in integration tests, or anything where the
integration is the thing at risk.

**Never assert only that a mock was called.** That restates the code and will keep passing after the
logic breaks. Assert the observable outcome.

---

## Flakiness

**Zero tolerance, and it is a policy question, not a technical one.** A flaky test is worse than no
test: it consumes attention, and it teaches the whole team that red does not mean broken. Once that
belief sets in, a real failure gets retried.

| Cause | Fix |
|---|---|
| Fixed sleeps | Wait for the condition, never the clock |
| Shared mutable state | Isolate per test |
| Test order dependency | Each test builds its own state |
| Real network | Intercept it |
| Real time / timezone | Inject a clock; freeze it |
| Unseeded randomness | Seed it |
| Parallel tests sharing a database row | Unique data per test |
| Animation or transition timing | Disable in the test environment |

**Policy:** quarantine a flaky test the day it flakes, with a named owner and a deadline. Not "we will
look at it" — an owner and a date. Deleting it is better than tolerating it.

---

## Suite performance

Speed determines whether the suite gets run, which determines whether it has any value.

- **Under 10 minutes for the full suite**, or people stop waiting and merge on hope
- **Under 10 seconds for the unit subset**, so it can run on save
- Parallelize; that requires test isolation, which you want anyway
- If it is slow, move tests **down** a level before adding a skip mechanism
- Track the slowest tests. A handful usually dominate

An hour-long suite that runs nightly catches defects a day late, by which point the author has context
switched. That is a fraction of the value of the same tests running in five minutes.

---

## Criteria for the spec

Appended before the freeze. Testability is cheapest to fix at specification time.

```markdown
### Coverage / testability — appended by aidd-qa
- [ ] AC-Q1: New-code coverage ≥ <bar from PROJECT-CONTEXT.md> → coverage report
- [ ] AC-Q2: Each AC-F has ≥1 test that fails without the change → verified by reverting
- [ ] AC-Q3: Edge cases covered: empty, boundary, invalid, denied, concurrent → review + tests
- [ ] AC-Q4: Existing suite passes; no new flakes across 3 consecutive runs → CI
- [ ] AC-Q5: <risk area> covered at the integration level, not with mocks → review
- [ ] AC-Q6: Concurrency test on <shared state> with ≥20 parallel attempts
      → `npm test -- <x>.concurrency`
```

AC-Q2 is the one that matters most and is almost never written. Coverage says a line executed; AC-Q2
says the test would have caught the bug.

---

## Anti-patterns

- **A uniform coverage target across the codebase.** Same effort on a DTO as on billing.
- **Testing the same logic at three levels.** Triples the cost of every change, adds no confidence.
- **Mocking the repository and calling it tested.** Proves you call it, not that the query is right.
- **Asserting on mock calls.** Restates the code; passes after the logic breaks.
- **E2E for everything.** Slow, flaky, eventually skipped.
- **A shared fixture file everything depends on.** Becomes untouchable and only grows.
- **Tests that depend on execution order.** Fail mysteriously in parallel.
- **Relying on test cleanup.** A failing test does not run its cleanup.
- **Fixed sleeps.** Slow when passing, flaky when loaded.
- **Tolerating one flaky test.** Teaches the team to ignore red.
- **A suite over 10 minutes with no plan.** People stop running it.
- **Performance tests on 100 rows.** The planner behaves differently at scale.
- **No concurrency tests on shared mutable state.** Total absence of coverage, not partial.
- **Testing that the framework works.**
