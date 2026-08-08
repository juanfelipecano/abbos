# Query Performance

Indexes, plans, N+1, and caching. The discipline is short: **count the queries, read the plan, then
change one thing.**

Almost all backend performance work goes wrong in the same way — someone reasons about what should be
slow, optimizes that, and the p95 does not move. The bottleneck is rarely where it feels like it is.

---

## Diagnostic order

Follow this order. Each step is cheaper than the next and rules out more.

**1. How many queries does this request issue?** Log or count them. This single number finds more
problems than any other measurement, because N+1 is the most common backend performance defect and it
is invisible in a profiler that aggregates by query text.

**2. Read the query plan.** Not "reason about the index" — read the plan. `EXPLAIN ANALYZE` (or your
engine's equivalent) tells you what actually happened.

**3. Rows examined versus rows returned.** A query examining 400,000 rows to return 20 has a wrong or
missing index. This ratio is the most diagnostic single number in a plan.

**4. Where is the time inside the plan?** A sequential scan on a large table, a sort spilling to disk,
a nested loop over many rows.

**5. Only now consider caching.** Caching a slow query hides the problem and adds an invalidation bug.
Fix the query first; cache what is genuinely expensive and genuinely stable.

---

## N+1 queries

Fetch a list, then issue one query per item. It passes every test on ten rows and collapses on ten
thousand.

```
// The pattern — 1 + N queries
const orders = await db.orders.findMany({ where: { userId } });   // 1
for (const o of orders) {
  o.customer = await db.customers.findUnique({ where: { id: o.customerId } });   // N
}

// Fix 1 — batch fetch, 2 queries regardless of N
const orders = await db.orders.findMany({ where: { userId } });
const customers = await db.customers.findMany({
  where: { id: { in: [...new Set(orders.map(o => o.customerId))] } }
});
const byId = new Map(customers.map(c => [c.id, c]));
orders.forEach(o => { o.customer = byId.get(o.customerId); });

// Fix 2 — a join, 1 query
// Fix 3 — the ORM's eager loading (include / joinLoad / fetch join)
```

**It hides in three places** people do not look:

- **Serializers.** A field resolver or `toJSON` that lazily loads a relation runs per item, far from
  the query that fetched the list
- **Authorization checks.** `items.filter(i => canAccess(user, i))` where `canAccess` queries
- **Computed properties** on an entity that lazily fetch

**Make it a criterion, because query count is testable and "efficient" is not:**

```
- [ ] AC-B1: GET /orders issues at most 2 queries regardless of result count
      → `npm test -- orders.query-count`
```

A test that counts queries catches every future regression, including the one someone introduces in a
serializer six months from now. This is one of the highest-value tests you can write.

---

## Indexes

**Indexes follow queries.** Write the query patterns down, then index for them. An index nobody queries
costs write throughput, storage, and maintenance forever, for nothing.

### Column order

For a composite index, order is not a detail:

```sql
-- Query: WHERE tenant_id = ? AND status = ? ORDER BY created_at DESC
CREATE INDEX idx_orders_lookup ON orders (tenant_id, status, created_at DESC);
--                                        ^equality   ^equality  ^range/sort
```

**Rule: equality columns first, then the range or sort column.** Putting `created_at` first means the
engine cannot use the index to satisfy the equality predicates efficiently.

**Leftmost prefix**: an index on `(a, b, c)` serves queries filtering on `a`, on `a, b`, and on
`a, b, c` — but not on `b` alone. This is why one well-ordered composite index often replaces three
single-column ones.

### What to index

- Foreign keys — usually needed for joins and for cascade checks, and often missing
- Columns in `WHERE` on frequent queries
- Columns in `ORDER BY` where the sort is expensive
- `tenant_id` as the **leading column** in a multi-tenant system, since nearly every query filters on it

### What not to index

- Low-cardinality columns alone — a boolean index rarely helps, though it may as part of a composite
  or as a partial index
- Columns never filtered or sorted on
- Wide text columns (use a purpose-built full-text index)
- Anything on a write-heavy table you have not proven you need

### Special index types worth knowing

```sql
-- Partial: smaller and faster when queries always filter the same way
CREATE INDEX idx_active_subs ON subscriptions (user_id) WHERE status = 'active';

-- Covering: the index contains everything the query needs — no table access at all
CREATE INDEX idx_orders_summary ON orders (tenant_id, status) INCLUDE (total, created_at);

-- Expression: for queries that transform the column
CREATE INDEX idx_users_lower_email ON users (lower(email));
-- required if you query WHERE lower(email) = ? — a plain index on email will not be used
```

That last case is a common surprise: a function applied to a column in the `WHERE` clause makes a
plain index unusable.

**Verify with the plan.** An index that exists but is not chosen is not helping, and the reasons are
usually knowable — wrong column order, a type mismatch forcing a cast, low selectivity, or stale
statistics.

---

## Reading a plan

What to look for, in order of how often it matters:

| Sign | Meaning | Fix |
|---|---|---|
| Sequential scan on a large table | No usable index | Add or fix the index |
| Rows examined ≫ rows returned | Wrong index or poor selectivity | Reorder columns, add a partial index |
| Sort with external merge / disk spill | Sort exceeds memory | Index the sort order, or reduce the row set first |
| Nested loop over many outer rows | Effectively an N+1 inside the database | Hash or merge join; check statistics |
| Estimated rows far from actual | Stale statistics | Analyze the table |
| Filter applied after a join | Predicate not pushed down | Restructure the query |

**Always use the analyze variant** so you see actual times and row counts, not just estimates. And run
it against production-like data volume — a plan on 100 rows tells you nothing about behavior on 40
million, because the planner chooses differently.

---

## Pagination at scale

`OFFSET 10000` requires walking and discarding 10,000 rows. Page 500 costs 500× page 1.

Use keyset (cursor) pagination for anything that grows:

```sql
-- Offset: cost grows linearly with page number
SELECT * FROM orders WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT 50 OFFSET 10000;

-- Keyset: constant cost, and it uses the index
SELECT * FROM orders
 WHERE tenant_id = $1 AND (created_at, id) < ($2, $3)
 ORDER BY created_at DESC, id DESC LIMIT 50;
```

The tuple comparison with `id` as a tiebreaker matters — sorting by `created_at` alone breaks on
duplicate timestamps, skipping or repeating rows.

**Also:** `COUNT(*)` on a large filtered set is often slower than the page query itself. Consider
returning `hasMore` (fetch limit+1) instead of a total, or an estimate. Exact totals are usually a
requirement nobody actually needs.

---

## Query construction

- **Select the columns you need.** `SELECT *` prevents covering-index use and ships bytes nobody reads.
  It also silently widens the API response when a column is added
- **Filter in the database**, not in application code. Fetching 10,000 rows to return 20 wastes
  everything
- **Avoid functions on indexed columns** in `WHERE` unless you have a matching expression index
- **Beware implicit casts** — comparing a string column to a number can disable index use silently
- **`IN` with a huge list** degrades; batch it, or use a temporary table or a join
- **`OR` across different columns** often prevents index use; a `UNION` of two indexed queries can be
  dramatically faster
- **`NOT IN` with a nullable subquery** returns no rows, silently. Use `NOT EXISTS`

---

## Caching

**Only after the query is as fast as it reasonably gets.** Caching a slow query converts a performance
problem into a correctness problem.

**A cache with no invalidation story is a correctness bug with better latency.** Before adding one,
answer all five:

1. **What** is cached, exactly?
2. **What key**, including every input the value depends on — tenant, user, locale, filters. **A key
   missing an identity scope serves one tenant's data to another**, which is a security bug expressed
   as a caching bug
3. **What invalidates it**, and does that path definitely run?
4. **What TTL** as a backstop, for when invalidation is missed?
5. **What staleness can the product tolerate?** This is a product answer, not a technical one

| Strategy | Trade |
|---|---|
| TTL only | Simple; guaranteed staleness up to the TTL |
| Write-through invalidation | Fresh; every write path must remember to invalidate |
| Versioned key (`user:8842:v7`) | No explicit invalidation needed — bump the version. Old entries expire naturally |
| Read-through with stale-while-revalidate | Best latency; serves slightly stale data during refresh |

**Versioned keys are underused.** Instead of finding and deleting every affected entry, increment a
version held with the entity. Every derived key changes, and stale entries age out. No invalidation
logic to forget.

**Cache stampede**: when a hot key expires, every concurrent request recomputes it simultaneously.
Mitigate with a short lock on recomputation, or by serving stale while one request refreshes.

**Do not cache in the application when the database's own cache would do.** A well-indexed query
hitting a warm buffer pool is often faster than a network round trip to a cache.

---

## Connection pooling

Frequently the actual bottleneck, and rarely investigated.

- Pool size is not "bigger is better" — each connection costs memory on the database, and more
  connections than cores usually reduces throughput
- **A long transaction holds a connection.** Pool exhaustion usually traces back to transactions held
  across network calls (see `concurrency.md`)
- Set a connection acquisition timeout, or requests queue invisibly and manifest as unexplained
  latency
- Monitor pool utilization and wait time. Wait time above zero means the pool is the constraint

---

## Criteria for the spec

```markdown
### Backend / data — appended by aidd-backend
- [ ] AC-B1: GET /orders issues ≤ 2 queries for any result count
      → `npm test -- orders.query-count`
- [ ] AC-B2: GET /orders uses idx_orders_lookup; no sequential scan at 100k rows
      → plan output attached
- [ ] AC-B3: p95 of GET /orders < 150ms at 100k rows, 50 concurrent
      → `npm run loadtest -- orders`
- [ ] AC-B4: List endpoints use keyset pagination; limit capped at 100
      → `npm test -- orders.pagination`
- [ ] AC-B5: Cache keys include tenant scope; switching tenant returns no cached rows from the
      previous one → `npm test -- cache.scope`
```

AC-B5 belongs on every multi-tenant system. It is invisible until someone switches accounts.

---

## Anti-patterns

- **Optimizing before counting queries.** The N+1 is usually the whole problem.
- **Reasoning about the plan instead of reading it.**
- **Testing performance on 100 rows.** The planner chooses differently at scale.
- **N+1 in a serializer.** Far from the query; invisible in review.
- **N+1 in an authorization filter.** Same, with worse consequences.
- **Indexing by intuition.** Costs writes forever, for nothing.
- **`created_at` first in a composite index** used with equality predicates.
- **A function on an indexed column** with no matching expression index.
- **Offset pagination on a growing table.** Cost grows with page number.
- **Sorting by a non-unique column with no tiebreaker.** Skips and repeats rows.
- **`SELECT *`.** Blocks covering indexes; silently widens responses.
- **Filtering in application code.** Fetch 10,000, return 20.
- **`NOT IN` with a nullable subquery.** Returns nothing, silently.
- **Caching to hide a slow query.** Performance problem becomes a correctness problem.
- **A cache key missing the tenant.** Cross-tenant data leak.
- **A cache with no invalidation story.** "We just set a short TTL."
- **Growing the connection pool to fix latency.** Usually a held-transaction problem.
- **`COUNT(*)` on every list request.** Often slower than the page itself.
