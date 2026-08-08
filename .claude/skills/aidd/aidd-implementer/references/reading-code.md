# Reading Code

Orienting in unfamiliar code fast enough to change it safely.

Most implementation defects are comprehension defects. The change itself is usually small; what
breaks is the thing you did not know depended on it.

Reading is not preparation for the work. It is the work.

---

## Read before touching

Read the file you are about to edit — not the three lines around your change, but enough to know
what else depends on it.

The minimum before editing:

1. **The whole function or class you are changing.** Not the diff-sized region.
2. **Its callers.** `grep` for the name. A signature change with two unseen callers is a broken
   build you have not noticed yet.
3. **Its tests.** They document intended behavior more honestly than any comment, including behavior
   you are about to break.
4. **The nearest analogous code.** How does this codebase already solve this shape of problem?

Never edit from assumption. Edit from evidence in the code as it exists now.

---

## Orienting in an unfamiliar area

A repeatable sequence. Timebox it — fifteen minutes for most tasks.

**1. Find the entry point.** The route, handler, command, event subscriber, or component that
receives the request. Search for the spec's nouns and the URL path.

**2. Trace one path all the way down.** Entry → business logic → data access → storage. One complete
trace teaches more than skimming a dozen files, because it shows you the layering conventions rather
than describing them.

**3. Find the seams.** Where does this code call out — to a database, a queue, an HTTP client, the
clock? Those are the boundaries you will mock, and the places behavior can surprise you.

**4. Read the tests for that path.** They reveal the project's real fixture conventions and its
testing style, which are usually undocumented and always expected.

**5. Check what is nearby that you must not break.** What else lives in this file, and does it share
state?

### Searches that pay for themselves

```bash
# Who calls this?
grep -rn "calculateTotal" --include='*.ts' src/

# What tests cover this area?
grep -rln "OrderService" --include='*.spec.ts' .

# Does a helper already exist?
grep -rn "formatCurrency\|toMinorUnits\|parseAmount" src/

# When did this change last, and why?
git log --oneline -20 -- src/orders/handler.ts

# Who wrote this line and in what commit?
git blame -L 40,60 src/orders/handler.ts
```

**Search for the helper before writing one.** Duplicating an existing utility is among the most
common outcomes of implementing without reading, and it produces two implementations that drift.

---

## Follow the existing pattern

If the codebase handles errors a certain way, handle them that way. If it validates at the boundary,
validate at the boundary.

A locally-superior approach that is inconsistent with the surrounding forty files is a **net loss**:
every future reader now has two patterns to learn and no way to tell which is current. Consistency
is worth more than local optimality, and it is not close.

**When the existing pattern is genuinely bad**, you still follow it — and note it as a backlog item.
Fixing it here means fixing it in one of forty places, which produces inconsistency without
resolution. `aidd-architect` decides whether the pattern changes; that is a design decision
(Article XI).

The exception: if `PROJECT-CONTEXT.md`'s known-debt table names this pattern and says what to do
instead, follow the table. That is the project telling you which pattern is current.

---

## Using git as documentation

The history answers questions no comment does.

| Question | Command |
|---|---|
| Why does this odd line exist? | `git log -S "the odd line" --oneline` |
| What else changed with this? | `git show <sha> --stat` |
| Has this been fixed and reverted before? | `git log --oneline -- <path>` |
| When did this test start failing? | `git bisect` |

**`git log -S` is the most useful and least used.** It finds the commit that introduced or removed a
string, and its message usually explains the thing that looks arbitrary.

Before "cleaning up" anything that looks pointless, check whether it was added deliberately. A guard
clause that looks redundant is often a fix for a bug that will return the moment you remove it —
which is exactly why Article III forbids opportunistic cleanup.

---

## Recognizing what you must not break

Before changing anything, identify the contract you are standing on:

- **Public API surface** — anything external callers depend on. Signature, response shape, status
  codes, error codes
- **Database schema** — anything a migration already applied to production
- **Event and message shapes** — consumers you cannot see are parsing these
- **Behavior under test** — a passing test is a documented promise
- **Boundaries in `PROJECT-CONTEXT.md`** — explicitly read-only

The failure mode is subtler than deleting something. Adding a required field to a response is
additive and safe; adding one to a *request* breaks every existing caller. Narrowing a type is
breaking. Changing an error code is breaking, even when the status stays the same.

---

## Reading for a bug, not a change

Different mode. You are looking for the gap between what the code says and what it does.

- **Start from the failure, not the top.** The stack trace, the failing assertion, the log line.
- **Read the error message completely.** Including the parts you assume you understand. The type
  name and the line number are usually enough.
- **Check the assumptions at the boundary.** Most bugs live where data crosses a layer — parsed,
  serialized, defaulted, or coerced.
- **Look at what changed recently.** `git log` on the file. A bug that appeared this week has a
  commit.

`debugging.md` covers the systematic method; this is the reading half of it.

---

## Anti-patterns

- **Editing the region you were pointed at.** You do not know what depends on it.
- **Not searching for callers before a signature change.** A broken build you have not run yet.
- **Writing a helper that already exists.** Two implementations that drift.
- **Not reading the tests.** They document behavior you are about to break.
- **Introducing a better local pattern.** Two conventions, no resolution.
- **Cleaning up a guard clause that looks redundant.** It is usually a fix for a bug that returns.
- **Ignoring `git log -S` on something that looks arbitrary.** The answer is one command away.
- **Assuming additive is safe on a request shape.** A new required field breaks every caller.
- **Reading from the top when debugging.** Start at the failure.
- **Skimming the error message.** It usually names the cause.
