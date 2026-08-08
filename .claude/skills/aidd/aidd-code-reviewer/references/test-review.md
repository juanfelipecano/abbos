# Reviewing Tests

Tests are part of the diff and get the same scrutiny as the code — arguably more, because a bad test
actively conceals a defect while appearing to guard against it.

The one question that matters: **would this test fail if the code were broken?** Everything else
follows.

---

## Break it and see

The only reliable check. Take one line of the new implementation, invert or remove it, and run the
tests.

```
Invert the ownership check    → does a test go red?
Remove the null guard         → does a test go red?
Change 100 to 101 in the cap  → does a test go red?
Delete the retry logic        → does a test go red?
```

If nothing goes red, that code is uncovered regardless of what the coverage report says. Thirty
seconds per check, and it finds more than reading the test file does.

Do this for at least one critical line in every review. If the diff touches money, permissions, or
data mutation, do it for each of those.

**This is the review equivalent of mutation testing** — you are checking whether the suite detects a
deliberate defect, which is the only thing a suite is for.

---

## Tests that pass with the feature removed

The most common defective test, and it is easy to spot once you look for it.

```js
// Passes whether or not authorization exists
it('gets an order', async () => {
  const res = await request(app).get('/api/orders/1').set(authFor(owner));
  expect(res.status).toBe(200);
});
```

This tests that the endpoint responds. It says nothing about the criterion, which was about
*non*-owners. The test for a restriction must exercise the restricted case.

Ask of each test: **what would have to be true for this to fail?** If the answer is "the endpoint is
entirely broken", it is a smoke test, not a test of the change.

---

## Assertions on the wrong thing

| Pattern | Why it is defective |
|---|---|
| `expect(repo.save).toHaveBeenCalled()` | Tests your wiring. Passes after the logic breaks |
| `expect(service.validate).toHaveBeenCalledWith(x)` | Couples to internal structure; breaks on refactor |
| `expect(res.status).toBe(200)` alone | Says nothing about the body |
| `expect(result).toBeDefined()` | Almost everything is defined |
| `expect(fn).not.toThrow()` | Passes when the function silently does nothing |
| `expect(list.length).toBeGreaterThan(0)` | Does not check what is in it |

The general shape: **an assertion that would still pass under the defect you care about.**

Look for assertions on returned values, stored state, emitted events, and rendered output. Those are
the contract. If a test asserts only on mock invocations, flag it — it will pass forever, including
after the code stops working.

---

## Coverage of what the criteria named

Map each criterion to its test, the same way you map criteria to code.

```markdown
| Criterion | Test | Actually exercises it |
|---|---|---|
| AC-F1 | `returnsOrdersForOwner` | ✅ |
| AC-S1 | `getsAnOrder` | ❌ — never tests a non-owner |
| AC-B1 | — | ❌ — no concurrency test |
```

**A criterion with no test is a finding**, even when the implementation is correct. The criterion
said it would be verified; unverified means it can regress silently tomorrow.

Pay particular attention to the criteria the specialists appended — AC-B (concurrency, query counts,
idempotency), AC-S (authorization), AC-U (accessibility). These are the ones most often implemented
and least often tested, because their tests need techniques the author may not reach for.

---

## Edge cases

The spec named them; check they are present.

- **Empty** — no data, empty string, empty collection
- **Boundary** — 0, 1, max, max+1, negative
- **Invalid** — malformed, wrong type, oversized
- **Denied** — right user, wrong permission
- **Concurrent** — two writers, double submit, replay
- **Failure** — dependency down, slow, malformed response

**Denied and concurrent are the two most often missing.** They are also the two whose absence is
most expensive, because they map directly to the security and data-integrity defect classes.

---

## Tests that will hurt later

Findings even when they currently pass, because they will become flakes and then get skipped.

| Pattern | Problem |
|---|---|
| `sleep(500)` | Too short (flaky) or too long (slow), usually both across machines |
| Real network calls | Fails when the network does; slow always |
| Order dependence | Passes alone, fails in the suite, or vice versa |
| Shared mutable fixture | Cross-contamination between tests |
| `Date.now()` in an assertion | Fails at midnight, or in another timezone |
| Hardcoded IDs from a seeded database | Breaks when the seed changes |
| Full-object equality | Breaks when an unrelated field is added |
| Locale or timezone dependence | Passes locally, fails in CI |

A flaky test is worse than no test: it consumes attention, and it trains the team to re-run rather
than investigate. Once that habit exists, a real failure gets re-run too.

---

## Test quality signals

- [ ] Name states the behavior — you can tell what broke from the runner output alone
- [ ] One behavior per test; a failure identifies one thing
- [ ] Arrange / Act / Assert visible
- [ ] Only the values that matter are specified; the rest defaulted
- [ ] Failure message identifies the cause without a debugger
- [ ] No test depends on another's side effects
- [ ] Fixtures shared via factories, not copy-pasted

**The failure-message check is underrated.** Run one test in a failing state and read what it prints.
`expected true to be false` costs an engineer ten minutes at a time, forever.

---

## What not to flag

- Style preferences in test code that the linter accepts
- A missing test for behavior that predates this diff — that is a backlog item, not a finding against
  this change
- Extra tests you consider unnecessary. Over-testing is a much cheaper problem than under-testing
- Test structure you would have organized differently

The exception: if a new test is actively misleading — it appears to cover a criterion and does not —
that is a finding regardless of style, because it retires risk that was not addressed.

---

## Anti-patterns

- **Approving without breaking one line to check the tests catch it.** Thirty seconds.
- **Reading test names and assuming coverage.** The name is aspirational; the assertions are real.
- **Accepting mock-call assertions.** They pass after the logic breaks.
- **Not mapping criteria to tests.** An untested criterion regresses silently.
- **Ignoring the specialists' criteria.** AC-B and AC-S are implemented more often than tested.
- **Letting a `sleep` through.** A flake you have not hit yet, then a skipped test.
- **Flagging missing tests for pre-existing behavior.** Backlog, not a finding against this diff.
- **Flagging over-testing.** Much cheaper than the alternative.
- **Passing a test that appears to cover a criterion and does not.** It retires risk that was never
  addressed.
