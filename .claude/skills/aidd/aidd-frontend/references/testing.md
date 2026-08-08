# Frontend Testing

What to test at which level, and — more importantly — what not to assert. The failure mode this
prevents is a suite that breaks on every refactor and passes through every real regression, which
is worse than no suite because it costs maintenance and buys false confidence.

Read alongside `aidd-qa`'s `test-strategy.md` for the general theory. This file is the frontend
specifics.

---

## The shape of the suite

The classic pyramid fits backends better than UIs. For frontend, the useful shape is a **trophy**:
a modest unit base, a heavy middle of component tests, and a thin E2E cap.

| Level | Tests | Effort | Why this weight |
|---|---|---|---|
| **Static** | Types, lint, a11y lint | Free, continuous | Catches a whole class before runtime |
| **Unit** | Pure functions, formatters, reducers, hooks | Some | Cheap, but most UI bugs are not here |
| **Component** | Rendering + interaction from the user's perspective | **Most of your effort** | Where UI defects actually live |
| **Integration** | A flow across several components, network mocked | Some | Catches wiring |
| **E2E** | Critical paths only | Few | The integration itself is the risk |
| **Visual regression** | Design-system components, key layouts | Targeted | Catches what assertions cannot |

**Component tests are the highest-value level in frontend.** They exercise real rendering and real
user interaction without the cost and flakiness of a browser driving a full stack.

**E2E is for paths whose failure is an incident** — signup, login, checkout, the one flow the
business depends on. Every E2E test you add is a test someone will eventually mark skipped, so add
them deliberately.

---

## Query by role, not by test id

The single most consequential habit in frontend testing.

```js
// Weakest — couples to markup, proves nothing about usability
container.querySelector('.btn-primary');
screen.getByTestId('save-button');

// Strongest — proves the element is a button AND has an accessible name
screen.getByRole('button', { name: 'Save changes' });
```

The role-based query does double duty: it finds the element *and* verifies it is announced correctly
to assistive technology. Your test and your accessibility criterion become the same check, which
means a11y regressions fail the build instead of waiting for an audit.

**Priority order:**

1. `getByRole` with `name` — nearly always the right choice
2. `getByLabelText` — form fields
3. `getByPlaceholderText` — only when there is genuinely no label (which is itself a finding)
4. `getByText` — non-interactive content
5. `getByTestId` — last resort, for things with no accessible representation (a chart canvas, a
   layout wrapper)

A test file full of `getByTestId` is a signal that the UI has no accessible semantics.

---

## What not to assert

Tests coupled to implementation break on refactor and pass on regression — exactly backwards.

| Do not assert | Assert instead |
|---|---|
| Internal component state | The rendered output the user sees |
| A mock was called | The observable effect of it being called |
| CSS class names | Behavior, or a visual regression snapshot |
| Instance methods | The result of the interaction that triggers them |
| Render counts | Nothing — unless the test is explicitly about performance |
| Exact DOM structure | Accessible roles and text |
| Snapshot of a whole tree | Specific assertions about what matters |

```js
// Before — passes after the logic breaks
expect(mockSave).toHaveBeenCalledWith({ name: 'x' });

// After — fails if saving stops working, for any reason
await user.click(screen.getByRole('button', { name: 'Save' }));
expect(await screen.findByText('Changes saved')).toBeInTheDocument();
```

**Large snapshot tests are the worst offender.** They fail on every intentional change, so people
regenerate them without reading the diff, at which point they detect nothing. Use them only for
small, stable output where the whole shape is the contract.

---

## Interactions

Use a user-event style library, not raw event dispatch. `fireEvent.click` dispatches one event;
a real click involves pointer events, focus changes, and — critically — will not fire on a disabled
or covered element.

```js
// Before — fires on a disabled button, so the test passes when the UI is broken
fireEvent.click(button);

// After — behaves like a user; fails if the button is not actually clickable
await user.click(button);
```

Type text rather than setting values directly, so validation, formatting, and keystroke handlers
run.

**Test the keyboard path too.** It is the same test with `user.tab()` and `user.keyboard('{Enter}')`,
and it is how you verify a criterion from `accessibility.md` automatically.

---

## Async

Almost all frontend test flakiness is async handling.

```js
// Wrong — arbitrary delay: slow when passing, flaky when the machine is loaded
await new Promise(r => setTimeout(r, 500));
expect(screen.getByText('Loaded')).toBeInTheDocument();

// Right — waits for the condition, up to a timeout
expect(await screen.findByText('Loaded')).toBeInTheDocument();
```

- `findBy*` when waiting for something to appear
- `waitFor` when waiting for an assertion to pass
- `waitForElementToBeRemoved` for loading indicators disappearing
- **Never `setTimeout`.** A fixed delay is either too short (flaky) or too long (slow), and it
  becomes both as the suite grows

**Assert the loading state too.** Jumping straight to the resolved assertion leaves the loading UI
untested, and loading states are where layout shift and missing announcements live.

---

## Mocking the network

Mock at the **network boundary**, not at the module boundary. Intercepting HTTP means your component
exercises its real data-fetching code; mocking the fetch function means it does not.

```js
// Weaker — the component's real query code never runs
jest.mock('./api', () => ({ getUser: () => ({ name: 'x' }) }));

// Stronger — real fetching, real error handling, real cache behavior
server.use(http.get('/api/users/:id', () => HttpResponse.json({ name: 'x' })));
```

The strong version catches wrong URLs, wrong methods, wrong headers, bad response parsing, and
cache-key mistakes. The weak version catches none of them.

**Mock the failures too.** A suite that only mocks 200s leaves every error path untested, and the
error path is where the bugs are:

```js
server.use(http.get('/api/users/:id', () => new HttpResponse(null, { status: 500 })));
// assert: error message shown, retry offered, nothing lost
```

Test at minimum: success, empty, error, and slow. Those map directly to four of the six required
states.

---

## Testing the six states

Every view specifies six states (see `component-design.md`); each needs a test. This is the most
mechanical, highest-yield set of tests you can write.

```js
describe('OrderList', () => {
  it('shows guidance and a create action when there are no orders');   // empty
  it('shows a skeleton while loading, with no layout shift');           // loading
  it('renders partial results with a notice when some data failed');    // partial
  it('shows the error and a retry that refetches');                    // error
  it('renders orders and announces the result count');                 // success
  it('disables export with an explanation for read-only users');        // denied
});
```

Writing these six for each view finds more real defects than any other frontend testing activity,
because they are exactly the cases hand-testing skips.

---

## Hooks and pure logic

Extract logic that does not need the DOM and unit test it directly — cheap, fast, exhaustive.

Test hooks through a component that uses them, or with a hook-testing utility. Assert on the values
the hook returns and the effects it produces, never on its internals.

For reducers and state machines, unit tests are ideal: enumerate the transitions, including the
invalid ones that should be no-ops.

---

## Accessibility in tests

Automate the third that tooling can catch, so it never regresses:

```js
import { axe } from 'jest-axe';

it('has no accessibility violations', async () => {
  const { container } = render(<Checkout />);
  expect(await axe(container)).toHaveNoViolations();
});
```

Run it on every significant view. Then rely on role-based queries throughout the rest of the suite
to cover accessible naming, and keep the manual keyboard and screen-reader passes for the two
thirds axe cannot see.

---

## Visual regression

For what assertions cannot express: spacing, alignment, overflow, theme correctness.

Keep it **targeted** — design-system components and two or three key layouts. Screenshotting every
page produces a suite that fails on every intentional change, and a review burden that gets
rubber-stamped.

Requirements to avoid perpetual noise: deterministic rendering (freeze dates, fixed seeds, disable
animations), consistent fonts, and a stable viewport. Without these, visual tests fail randomly and
get abandoned.

---

## E2E discipline

Few, critical, and reliable — or they will be deleted.

- **Only paths whose failure is an incident.** If a component test can catch it, it is not an E2E
  test
- **Fresh state per test.** Seed via API or a fixture, never depend on another test's leftovers
- **No shared mutable accounts** across parallel runs
- **Test ids are acceptable here** — E2E selectors are the one place stability beats semantics
- **Retry once**, and treat a test that needed the retry as a bug to fix, not a pass
- **Quarantine a flake the day it flakes,** with an owner and a deadline. A tolerated flaky test
  trains the whole team to ignore red

---

## Coverage

A floor, not evidence. Component coverage above 80% with weak assertions catches less than 60% with
real ones.

The check that matters: **break a line of implementation and confirm something goes red.** If
nothing does, that code is untested regardless of what the report says.

Do not chase coverage on trivial presentational components. Chase it on logic, state transitions,
and error paths.

---

## Criteria for the spec

```markdown
### UX / testing — appended by aidd-frontend
- [ ] AC-U1: All six states tested for <view> → `npm test -- OrderList`
- [ ] AC-U2: Interactive elements queried by role and accessible name → review
- [ ] AC-U3: axe reports zero violations on <views> → `npm test -- a11y`
- [ ] AC-U4: Keyboard path covered for <primary flow> → `npm test -- keyboard`
- [ ] AC-U5: Network error and empty responses mocked and asserted → `npm test`
- [ ] AC-U6: No new E2E tests unless the path's failure is an incident → review
```

---

## Anti-patterns

- **`getByTestId` everywhere.** Signals the UI has no accessible semantics.
- **Asserting a mock was called.** Passes after the logic breaks.
- **Asserting CSS class names.** Breaks on refactor, catches nothing.
- **Large snapshot tests.** Regenerated without reading; detect nothing.
- **`fireEvent` instead of user-event.** Fires on disabled elements.
- **`setTimeout` to wait.** Slow when passing, flaky when loaded.
- **Only mocking 200 responses.** Every error path untested.
- **Mocking the fetch module.** The component's real data code never runs.
- **Skipping the loading-state assertion.** Where layout shift lives.
- **E2E for everything.** Slow, flaky, eventually skipped.
- **Tolerating one flaky test.** Teaches the team to ignore red.
- **Screenshotting every page.** Noise, then rubber-stamping.
