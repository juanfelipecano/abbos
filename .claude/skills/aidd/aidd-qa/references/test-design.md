# Test Design Techniques

Systematic ways to choose test cases. The alternative — thinking of cases as they occur to you —
produces suites that cluster around the happy path and miss whole regions of the input space.

These techniques are from formal testing practice (ISTQB and similar) and they earn their keep: each
one finds a class of defect that ad-hoc case selection reliably misses.

---

## Equivalence partitioning

Divide inputs into classes where every member should behave the same way, then test one value from
each class. Testing five values from the same class adds nothing.

**Example: a discount code field, 6–12 alphanumeric characters, case-insensitive.**

| Partition | Representative | Expected |
|---|---|---|
| Valid, lowercase | `save20` | Accepted |
| Valid, uppercase | `SAVE20` | Accepted, same result |
| Too short | `save1` (5) | Rejected |
| Too long | `save123456789` (13) | Rejected |
| Contains symbol | `save-20` | Rejected |
| Empty | `` | Rejected |
| Whitespace only | `   ` | Rejected |
| Valid format, nonexistent code | `zzzz99` | Rejected, different message |

Eight tests instead of thirty, with better coverage. The last row is the one ad-hoc testing misses: a
*format-valid but unknown* value is a different partition from a malformed one, and it usually takes a
different code path.

**The technique's value is negative as much as positive**: it tells you when to stop. Once you have one
value per partition, additional values from the same partition are waste.

---

## Boundary value analysis

Defects cluster at boundaries. For every boundary, test **just below, at, and just above**.

For a range of 6–12 characters: test 5, 6, 12, 13. Add 0 and 1 if empty is meaningful.

```
Range 1–100:  0, 1, 2, 99, 100, 101
Age ≥ 18:     17, 18, 19
Quantity > 0: -1, 0, 1
Limit ≤ 100:  99, 100, 101
Free over $50: 49.99, 50.00, 50.01
```

**Why this works so reliably:** off-by-one errors and `<` versus `<=` confusion are among the most
common coding mistakes, and they are only visible exactly at the boundary. A test at 50 and a test at
200 both pass whether the condition is `>= 50` or `> 50`.

**Also test boundaries that are not in the requirements** but exist in the implementation: integer
limits, string length limits, the page size cap, the maximum decimal precision, and array size limits.

---

## Decision tables

For logic with several conditions interacting. Enumerate combinations rather than trusting yourself to
imagine them.

**Example: is free shipping applied?**

Conditions: order ≥ $50 · customer is a member · destination is domestic · item is oversized

| # | ≥$50 | Member | Domestic | Oversized | Free shipping |
|---|---|---|---|---|---|
| 1 | Y | Y | Y | N | Yes |
| 2 | Y | N | Y | N | Yes |
| 3 | N | Y | Y | N | Yes (member benefit) |
| 4 | N | N | Y | N | No |
| 5 | Y | Y | N | N | No (international) |
| 6 | Y | Y | Y | Y | No (oversized) |
| 7 | N | Y | Y | Y | No |

Four binary conditions give 16 combinations. Seven capture the distinct behaviors; the rest are
equivalent to a listed row.

**The real value is in the questions the table forces.** Building it surfaces the cases nobody
specified — row 3 (does membership override the threshold?) and row 6 (does oversized override
membership?) are exactly the questions that otherwise get answered by whoever implements it, silently.

Take unanswered rows back to the PM as `[NEEDS CLARIFICATION]` before the freeze. That is this
technique's highest-value output.

---

## State transition testing

For anything with a lifecycle. Map the states and the permitted transitions, then test:

1. Every valid transition works
2. **Every invalid transition is rejected** — the part usually skipped
3. Each state's permitted actions

```
draft ──submit──► pending ──approve──► active ──cancel──► cancelled
                     │                    │
                   reject               expire
                     ▼                    ▼
                 rejected              expired
```

The invalid transitions are where the bugs are: can you approve a `cancelled` item? Cancel an
`expired` one? Submit twice? Approve something already `active`?

**A state machine with N states has N² possible transitions and usually far fewer valid ones.** Every
invalid one is a potential defect, and each should return a clean error rather than corrupting state.
The systematic test is a loop over every (state, action) pair asserting either the expected new state
or a rejection.

This technique also reveals a modeling problem: if you cannot draw the diagram because the entity's
state is spread across five boolean flags, that is the finding (see `aidd-backend`'s
`data-modeling.md`).

---

## Pairwise testing

When you have many parameters, testing every combination is infeasible — five parameters with four
values each is 1,024 combinations.

Most defects involve **one or two** parameters interacting, not five. Pairwise selection covers every
*pair* of values in a small number of cases, typically reducing 1,024 to around 20 with most of the
defect-finding power.

Use a generator; do not construct these by hand. Good for configuration matrices, feature flag
combinations, and browser/OS/locale grids.

**Caveat:** it finds pairwise interactions. A defect requiring three specific values together will be
missed, so keep known-risky combinations as explicit cases alongside the generated set.

---

## Error guessing, structured

Experience-based, but you can make it systematic with a checklist rather than relying on inspiration.

| Category | Try |
|---|---|
| Empty | Null, empty string, empty array, empty object, whitespace-only, zero rows |
| Boundary | 0, 1, max, max+1, negative, very large, max int |
| Type | Wrong type, string where number expected, array where scalar expected |
| Format | Malformed JSON, wrong encoding, unexpected character set, no trailing newline |
| Size | Empty payload, 1 byte, exactly at the limit, over the limit, very large |
| Text | Unicode, emoji, right-to-left, combining characters, `NULL` byte, newlines |
| Names | Apostrophes (`O'Brien`), hyphens, single character, 200 characters, non-Latin |
| Numbers | Negative, zero, fractional where integer expected, leading zeros, exponent notation |
| Dates | Feb 29, DST transitions, year boundaries, far future, far past, timezone edges |
| Auth | No credentials, expired, valid-but-wrong-user, right-user-wrong-permission |
| Concurrency | Two writers, double submit, replayed request |
| Failure | Dependency down, slow, 500, malformed response |
| State | Out of order, retry after partial failure, resume after crash |

**Three rows find defects far more often than the rest:** "valid-but-wrong-user" (authorization),
"double submit" (concurrency), and "apostrophes in names" (escaping, and the reason
`O'Brien` is the canonical test name).

---

## Combining techniques

They compose, and each covers what the others do not:

1. **Equivalence partitioning** to divide the input space
2. **Boundary values** at every partition edge
3. **Decision tables** where conditions interact
4. **State transitions** for lifecycle behavior
5. **Pairwise** for large configuration spaces
6. **Error guessing** for what the model missed

For a typical feature: partitioning and boundaries cover the field-level cases, a decision table
covers the business rules, and state transitions cover the lifecycle. Error guessing then finds what
your model of the feature did not include.

---

## From technique to test

Keep the derivation visible in the test name. A reviewer should be able to tell which case a test
covers and why it exists.

```js
describe('discount code validation', () => {
  // Equivalence partitions
  it('accepts a valid lowercase code');
  it('accepts a valid uppercase code as equivalent');
  it('rejects a format-valid code that does not exist');

  // Boundaries
  it('rejects 5 characters');
  it('accepts 6 characters');
  it('accepts 12 characters');
  it('rejects 13 characters');

  // Error guessing
  it('rejects whitespace-only input');
  it('handles a code containing a unicode character');
});
```

A test named `testValidation` tells a future reader nothing about what is covered or what is missing.
These names double as the coverage document.

---

## Applying this before the freeze

This is the pre-implementation half of the QA role, and it is the higher-leverage half.

Running these techniques against the **spec** — before code exists — surfaces underspecified behavior
while a rewrite costs one line:

- Decision tables produce the "nobody decided this" combinations
- State transition maps produce "what happens if you cancel an expired order?"
- Boundary analysis produces "what is the maximum, and what happens above it?"
- Error guessing produces "what does the error message actually say?"

Every question you raise here is a question that otherwise gets answered by whoever implements it,
invented on the spot, and defended later (Article X).

Take them back as `[NEEDS CLARIFICATION]` items and as appended AC-Q criteria.

---

## Anti-patterns

- **Ad-hoc case selection.** Clusters on the happy path; whole regions untested.
- **Five values from one equivalence partition.** Effort with no added coverage.
- **Testing at 50 and 200 for a threshold of 50.** Both pass whether it is `>=` or `>`.
- **Skipping invalid state transitions.** Where the defects are.
- **Not building the decision table.** The unspecified combinations get invented at implementation time.
- **Testing every combination.** Infeasible; use pairwise.
- **Pairwise alone for known-risky triples.** It finds pairs by construction.
- **`testValidation` as a test name.** Tells a reader nothing about coverage.
- **Running these techniques after implementation.** Same findings, redesign cost instead of one line.
- **Never testing apostrophes in names.** `O'Brien` exists and breaks things.
