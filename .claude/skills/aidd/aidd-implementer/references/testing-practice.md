# Testing Practice

Writing the tests that accompany an implementation — from the implementer's side.

`aidd-qa` owns strategy, coverage, and verification. You own the tests that ship with your change,
and one property matters above all: **a test that would not fail if you broke the code is not a
test.**

---

## Fail first

Run the test before implementing and watch it fail. This is not ceremony — it is the only proof the
test exercises what you think it does.

A test written after the code, that passes immediately, has demonstrated exactly one thing: it
compiles. The number of such tests in a mature codebase is large, and every one of them is a false
sense of coverage.

If you write the code first — sometimes reasonable — then **break it deliberately** and confirm the
test goes red before restoring it. Ten seconds, and it converts a decorative test into a real one.

```
1. Write the test for the behavior
2. Run it → red, for the right reason
3. Implement
4. Run it → green
5. Commit both together
```

Step 2's "for the right reason" matters. A test that fails because of a typo in the fixture is not
failing for the right reason, and it will pass later for the wrong one.

---

## Arrange, Act, Assert

One behavior per test, three visible sections.

```js
it('returns 404 when the requester does not own the order', async () => {
  // Arrange
  const owner = await createUser();
  const other = await createUser();
  const order = await createOrder({ userId: owner.id });

  // Act
  const res = await request(app).get(`/api/orders/${order.id}`).set(authFor(other));

  // Assert
  expect(res.status).toBe(404);
  expect(res.body).toEqual({});
});
```

**One behavior per test.** A test asserting six things reports one failure and hides five. When it
breaks you learn that something in a cluster is wrong, which is barely more than knowing nothing.

**Name the behavior, not the method.** `returns404WhenRequesterDoesNotOwnTheOrder` tells you what
broke from the test runner output alone. `testGetOrder` requires opening the file.

---

## Assert on outcomes, not implementation

The distinction that determines whether your tests survive a refactor.

| Implementation-coupled | Outcome-based |
|---|---|
| `expect(repo.save).toHaveBeenCalledWith(user)` | `expect(await repo.findById(id)).toMatchObject({status:'active'})` |
| `expect(service.validate).toHaveBeenCalled()` | `expect(res.status).toBe(400)` |
| `expect(wrapper.state('open')).toBe(true)` | `expect(screen.getByRole('dialog')).toBeVisible()` |
| `expect(mailer.send).toHaveBeenCalledTimes(1)` | `expect(inbox).toHaveLength(1)` |

**A test asserting that a mock was called is a test of your wiring.** It keeps passing after the
logic breaks, and it fails on every refactor that changes internal structure without changing
behavior. That is precisely backwards from what you want.

The rule: assert on returned values, stored state, emitted events, and rendered output. Those are the
contract. Internal calls are not.

**The one legitimate use of call assertions** is when the call *is* the observable effect — verifying
you did not send a duplicate email, or that a payment provider was charged once. Even then, prefer
asserting on the resulting state where one exists.

---

## Mocking

Mock at the system boundary, not inside your own code.

| Mock this | Do not mock this |
|---|---|
| Third-party HTTP APIs | Your own service classes |
| The clock, for time-dependent logic | Your own repositories, usually |
| Random number generation | Your own domain objects |
| Email, SMS, payment providers | The thing under test's collaborators |
| The filesystem, sometimes | |

**Mocking your own internals couples the test to your structure**, which is the same failure as
asserting on calls. If a service is hard to test without mocking three of its collaborators, the
design is telling you something — and that is worth escalating rather than working around
(`aidd-qa` treats untestable design as a blocking finding).

Prefer real implementations where they are fast: an in-memory database, a real object graph, a test
container. A test using the real query layer catches SQL errors that a mocked repository never will.

---

## What to test

You are not writing the whole test suite. You are covering the change you made.

**Always:**
- The behavior the criterion names, in its normal case
- Each branch you added — every `if` has two paths and the second is where the bug is
- The error path you introduced
- The edge cases the spec specified

**Usually:**
- Boundaries: zero, one, maximum, maximum+1
- Invalid input, if this code validates
- Permission denied, if this code authorizes

**Do not:**
- Test the framework
- Test a getter that returns a field
- Add a test that passes with your change reverted
- Write a test to raise a coverage number

That last one is worth stating plainly: **coverage is a floor, not a goal.** A test written to move a
percentage is a maintenance cost with no diagnostic value.

---

## Tests that will hurt later

Recognize these while writing, not after they start flaking.

| Pattern | Problem | Instead |
|---|---|---|
| `sleep(500)` | Slow and still racy | Await the condition, or inject the clock |
| Real network calls | Fails when the network does | Mock the boundary |
| Depends on test order | Passes alone, fails in suite | Isolate setup per test |
| Shared mutable fixture | Cross-contamination | Fresh fixture per test |
| Asserts on `Date.now()` | Fails at midnight, or in another timezone | Inject the clock |
| Asserts on full object equality | Breaks when an unrelated field is added | Assert the fields that matter |
| Depends on locale or timezone | Passes locally, fails in CI | Pin both explicitly |

**Any `sleep` in a test is a bug you have not hit yet.** It is either too short (flaky) or too long
(slow), and usually both across different machines.

---

## Fixtures

Follow the project's existing conventions — find them by reading the tests next to yours, not by
importing your preferences.

- **Factories over fixtures files.** A function creating a valid object with overrides beats a static
  blob that grows fields nobody needs.
- **Specify only what matters to this test.** `createOrder({ status: 'shipped' })` — everything else
  defaulted. The test then documents what it depends on.
- **Fresh state per test.** A shared database that accumulates rows produces order-dependent failures
  that are miserable to diagnose.

If your task is the first to need a factory, that is prerequisite work — the planner should have
flagged it. If not, add it as its own task rather than inline.

---

## Anti-patterns

- **A test written after the code that passes immediately.** Proves it compiles.
- **Never watching it fail.** You do not know it tests anything.
- **Asserting that mocks were called.** Passes after the logic breaks; fails on every refactor.
- **Six assertions in one test.** Reports one failure, hides five.
- **`testGetOrder` as a name.** Requires opening the file to learn what broke.
- **Mocking your own collaborators.** Couples the test to your structure.
- **`sleep` anywhere.** Too short or too long, usually both.
- **Asserting on `Date.now()`.** Fails at midnight.
- **Full-object equality assertions.** Break when an unrelated field appears.
- **Tests written to raise coverage.** Maintenance cost, no diagnostic value.
- **Working around untestable design instead of escalating it.** It is a design finding.
