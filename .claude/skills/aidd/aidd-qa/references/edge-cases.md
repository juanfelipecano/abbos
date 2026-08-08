# Edge Case Catalog

A systematic checklist. Run it against every feature — during spec review to find unspecified behavior,
and during verification to find defects.

Its value is that it does not depend on inspiration. Ad-hoc testing finds what you happen to think of;
a checklist finds what you would have forgotten, and the same three or four categories account for most
real production defects.

---

## The high-yield seven

If you only run part of this file, run these. Ordered by how often each finds something real.

1. **Valid credentials, wrong user** — authorization. The most common serious defect class.
2. **Double submit / concurrent write** — race conditions on shared state.
3. **Empty state** — no data, first use. Almost never designed, frequently broken.
4. **Dependency returns an error** — the least-executed code in the system (OWASP A10).
5. **Apostrophe in a name** — `O'Brien`. Escaping, and it is a real name.
6. **Boundary exactly at the limit** — off-by-one and `<` vs `<=`.
7. **Permission denied but control visible** — client-side-only authorization.

---

## Empty and absent

| Case | Ask |
|---|---|
| No records at all | Is there guidance and a next action, or a blank panel? |
| Empty string | Distinguished from null? Distinguished from absent? |
| Empty array | Does the aggregate work? Sum of nothing, average of nothing |
| Null | Every nullable field, in every reader |
| Missing optional field | Does it default correctly, or become `undefined` downstream? |
| Whitespace only | Trimmed, or accepted as content? |
| Zero | Distinguished from null and from absent? |
| Deleted parent | Child records referencing something gone |

**Average of an empty list** is the classic: a division by zero, a `NaN` that renders as "NaN", or a
crash. Reliably present in any new aggregate.

---

## Boundaries

For every numeric or length constraint, test **below, at, and above**:

```
0, 1, 2                    — the low end, where the empty/single distinction lives
max-1, max, max+1          — the documented limit
-1                         — negative where only positive makes sense
very large                 — max int, and one past it
fractional                 — 0.5 where an integer is expected
```

Also the boundaries that are not in the requirements but exist in the system: integer overflow, string
column length, maximum decimal precision, page size cap, request body limit, array length limits, and
the maximum a UI can render.

**Test at the boundary, not near it.** A threshold of 50 tested with 10 and 200 passes whether the
condition is `>= 50` or `> 50`.

---

## Text and encoding

| Case | Breaks |
|---|---|
| Unicode, accented characters | Length calculations, sorting, encoding |
| Emoji | Multi-byte length limits, database column types, regex |
| Right-to-left script | Layout, string concatenation |
| Combining characters | Length, comparison, normalization |
| Apostrophe (`O'Brien`) | Escaping, SQL, template rendering |
| Quotes, angle brackets, ampersand | HTML/XML escaping |
| Newlines in a single-line field | Log injection, CSV export, display |
| Leading/trailing whitespace | Comparison, uniqueness |
| Very long string with no spaces | Layout overflow |
| Mixed case where uniqueness matters | Is `Bob@x.com` the same account as `bob@x.com`? |
| `NULL` byte | Truncation in some layers |
| Names with one character | Validation that assumes a minimum |
| Names with 200 characters | Column limits, layout |

**`O'Brien` is the canonical test name for a reason**, and email case-sensitivity is the canonical
uniqueness bug — it produces duplicate accounts that both look correct.

---

## Numbers and money

- Negative where only positive is valid — quantity, price, age
- Zero — is it valid, or a special case?
- Fractional quantity where units are discrete
- Very large — overflow on a total, precision loss in a JavaScript client
- Rounding: 0.005 at two decimal places. Which way, and is it consistent?
- Currency mismatch in an aggregate
- Percentage over 100, or negative
- Division where the denominator can be zero

**Sum of a large set of floats** is worth a specific test if money is involved anywhere: accumulated
floating-point error produces a total nobody can reconcile.

---

## Dates and time

The category with the most latent defects, because the failures are seasonal.

| Case | Breaks |
|---|---|
| Feb 29 | Date arithmetic, "same day next year" |
| DST transition — spring forward | An hour that does not exist. A 02:30 job never runs |
| DST transition — fall back | An hour that happens twice. A job runs twice |
| Year boundary | Week numbers, fiscal periods, "this year" filters |
| Month boundary | "One month from Jan 31" |
| Timezone at the date line | "Today" differs by user |
| Far future / far past | Storage limits, validation |
| Client clock skewed | Anything ordering by a client timestamp |
| Same-millisecond events | Sorting with no tiebreaker |
| Duration spanning DST | Wall-clock vs elapsed time differ |

**A recurring event at a local time is not an instant.** Storing only the UTC instant breaks it across
a DST transition — the classic calendar bug, and it only manifests twice a year.

---

## Authorization

The highest-yield category. Two accounts, and run every case against every endpoint.

| Case | Expected |
|---|---|
| No credentials | 401 |
| Expired credentials | 401 |
| **Valid credentials, another user's resource** | **404** (not 403 — do not confirm existence) |
| Correct user, insufficient permission | 403, or the control not offered |
| Permission revoked mid-session | Denied on the next request, not at next login |
| Permission checked on the client only | Server must still deny |
| ID swapped in the body rather than the URL | Denied |
| ID swapped in a JWT claim | Denied — claims are not authorization |
| Nested resource where the outer ID is checked | Inner must be checked too |
| Batch operation with one unauthorized item | All-or-nothing, or per-item — but decided |
| Admin route called directly by a normal user | 403 or 404 |
| Internal service path bypassing the controller check | Still denied |

The last row is what code review misses: a check in the controller that a background job does not go
through.

---

## Concurrency

Sequential tests cannot find these. The test itself must be concurrent.

| Case | Finds |
|---|---|
| Double submit (fast double-click) | Duplicate records |
| Two users editing one record | Lost update |
| Concurrent decrement of a shared counter | Read-modify-write hazard |
| Same request replayed | Missing idempotency |
| Read while another writes | Isolation assumptions |
| Job runs twice on one input | Non-idempotent handler |
| Two workers claiming one queue item | Visibility timeout too short |
| Delete while another request is reading | Null dereference downstream |

**Use ~20 parallel attempts, not 2.** Two rarely interleave; twenty reliably do. And assert the **end
state**, not just the absence of an error — the defect is silent.

---

## Failure of dependencies

The least-executed code in the system, and its own OWASP category (A10). Inject the failure; do not
reason about it.

| Inject | Check |
|---|---|
| Dependency returns 500 | Handled, or does it fail open? |
| Dependency times out | Is there a timeout at all? What state is left? |
| Dependency is slow (but succeeds) | Thread/connection exhaustion |
| Dependency returns malformed data | Parsed defensively, or crash? |
| Dependency returns an unexpected field type | `undefined` flowing into a check |
| Network partition mid-request | Retry safe? Duplicate effect? |
| Database connection lost mid-transaction | Rolled back cleanly? |
| Disk or quota full | Handled, or silent data loss? |
| A security check cannot complete | **Must deny.** Failing open is the highest-severity case here |

**"A security check cannot complete" is the one to always test.** Kill the auth service and confirm the
request is denied, not allowed.

---

## State and sequence

- Operations out of order — cancel before create, ship before pay
- Retry after partial failure — what is already done?
- Resume after a crash mid-operation
- Every invalid state transition (see `test-design.md`)
- Idempotent replay of a completed operation
- Very old data, created under a previous schema or a previous business rule

**Data created under a previous rule** is systematically missed and appears as "why does this old record
behave differently?" — worth an explicit case whenever a rule changes.

---

## Scale

- One record, and 10,000 records — layout, pagination, query plan
- Query count on a list endpoint (N+1 is invisible at ten rows)
- Very large single record — a 5MB text field
- Pagination past the last page
- Concurrent load at expected peak
- A single tenant far larger than average

**The largest tenant** is worth its own case. A design that works for the average often fails for the
outlier, and the outlier is usually the most important customer.

---

## Using this before the freeze

Higher leverage than using it during verification. Run the checklist against the **spec** and ask, for
each relevant case, "what does the spec say happens?"

Every case the spec does not answer is a case that gets invented at implementation time (Article X).
Bring them back as `[NEEDS CLARIFICATION]` items or as appended AC-Q criteria.

For a typical feature, this pass produces five to ten genuine questions in twenty minutes. The most
common: what the error message says, what the empty state shows, whether a denied control is hidden or
disabled, and what happens on a double submit.

---

## Anti-patterns

- **Testing only the happy path.** The other six states get invented.
- **Skipping "valid credentials, wrong user".** The highest-yield case, omitted.
- **403 instead of 404** for resources the caller cannot know about. Free enumeration.
- **Testing near a boundary instead of at it.** Passes for `>=` and `>` alike.
- **Two parallel requests in a concurrency test.** Rarely interleave.
- **Asserting only that no error was thrown.** These defects are silent.
- **Reasoning about the error path instead of injecting the failure.**
- **Never testing that a failed security check denies.** Failing open ships.
- **Assuming a client timestamp is ordered.** Clocks are wrong.
- **Storing a recurring local time as a UTC instant.** Breaks twice a year.
- **Testing with ten rows.** N+1 and plan changes are invisible.
- **Ignoring data created under an older rule.**
