# State Management

A decision framework, not a library recommendation. Most applications carry far more state
machinery than they need, and the cost is paid on every change: state that lives in the wrong
place couples unrelated code and makes every modification global.

---

## Classify the state first

The single most useful move. Most state-management pain comes from putting different kinds of state
in the same container — particularly server data in a client store.

| Kind | Examples | Owner | Lifetime |
|---|---|---|---|
| **Server state** | Fetched entities, lists, search results | The server | Cached, can go stale |
| **URL state** | Route, filters, pagination, selected tab, search query | The URL | The user's navigation |
| **Form state** | Field values, dirty, validation, submission | The form | Until submit or leave |
| **UI state** | Open/closed, hovered, focused, expanded | The component | The component's life |
| **Session state** | Auth token, current user, permissions | The session | Login to logout |
| **App state** | Theme, locale, feature flags, layout preference | The app | Persisted |

**Server state is not client state.** It is a cache of something you do not own. It can be stale,
needs revalidation, has loading and error states, and may be shared by several components. Putting
it in a general-purpose client store means hand-writing caching, deduplication, invalidation, and
retry — that is what a server-state library does, and doing it by hand is where most of the
accidental complexity in frontend codebases comes from.

**URL state belongs in the URL.** Filters, sort, pagination, and the active tab in a client store
means the page is not shareable, not bookmarkable, and the back button does the wrong thing.
Putting them in the URL gets all three free and removes the state from your store entirely.

---

## The escalation ladder

Start at the top. Move down one rung only when you can name the specific thing that forces it.

```
1. Derive it              — can it be computed from something you already have?
2. Local component state  — does only this component need it?
3. Lift to common parent  — do a few nearby components need it?
4. URL                    — should it survive refresh and be shareable?
5. Server-state library   — is it fetched data?
6. Context               — is it genuinely global and low-frequency?
7. Global store          — is it cross-cutting client state that is none of the above?
```

Most teams jump to 7 and then discover they need 5 anyway. The result is two overlapping systems
and unclear ownership.

**Rung 1 is skipped most often and matters most.** Derived state that is stored will diverge from
its source, and the bug arrives as "the count is sometimes wrong":

```js
// Before — two sources of truth
const [items, setItems] = useState([]);
const [total, setTotal] = useState(0);      // must be kept in sync forever

// After — one source of truth
const [items, setItems] = useState([]);
const total = items.reduce((s, i) => s + i.price, 0);
```

If the computation is genuinely expensive, memoize it. Do not store it.

---

## When you need a global store

Justify it by naming the state. If you cannot name the specific cross-cutting client state that
requires it, you do not need it yet.

Legitimate cases:
- A multi-step wizard whose steps are separate routes
- Optimistic UI coordinating across distant components
- A collaborative or real-time cursor/presence layer
- A complex client-side editor with undo/redo
- Cross-component selection ("3 items selected" in a header, list, and toolbar)

Not legitimate:
- "It will scale better" — an assertion about a future you cannot see
- Fetched data — use a server-state library
- Filters and pagination — use the URL
- Form values — use a form library or local state
- One value shared by two adjacent components — lift it

**Store design rules if you do adopt one:**
- Slice by domain, not one god store
- Keep it normalized — nested duplicates diverge
- Selectors, not raw access, so consumers do not subscribe to the whole store
- Never store derived values
- Never store server data

---

## Context, and its cost

Context solves prop drilling. It does not solve state management, and it has a specific
performance characteristic people get wrong: **every consumer re-renders when any part of the
value changes.**

```jsx
// Before — a theme toggle re-renders every user-consuming component
<AppContext.Provider value={{ user, theme, locale, notifications }}>

// After — split by change frequency
<UserContext.Provider value={user}>
  <ThemeContext.Provider value={theme}>
```

Guidelines:
- One context per concern, split by how often it changes
- Memoize the provider value, or you create a new object every render and defeat the split
- Good for: theme, locale, session, feature flags — global, low-frequency, rarely-changing
- Bad for: anything changing per keystroke, per scroll, or per animation frame

---

## Server state

Whatever library you use, these are the behaviors you need — and the reason not to hand-roll them:

| Behavior | Why |
|---|---|
| Caching by key | Two components asking for the same data issue one request |
| Deduplication | Concurrent identical requests collapse |
| Staleness policy | When to serve cache vs refetch |
| Background revalidation | Fresh data without a loading state |
| Retry with backoff | Transient failures recover |
| Invalidation on mutation | The list updates after a create |
| Loading and error states | Per query, not hand-tracked |

Hand-writing these is the single largest source of accidental complexity in frontend codebases.
Every project that starts with "we'll just use fetch and useState" reimplements a subset of them,
incorrectly, spread across twenty files.

**Query keys are the contract.** Include everything the request depends on — endpoint, filters,
pagination, and any identity that scopes the result. A key missing the tenant or user ID will
serve one user's cached data to another, which is a security bug expressed as a caching bug.

**Optimistic updates:** apply the change locally, keep the previous value, roll back on failure,
and always reconcile with the server's response. Skipping the rollback path is how the UI ends up
showing something the server rejected.

---

## Form state

Forms are their own problem, and general-purpose state tools handle them badly.

- **Uncontrolled by default.** Controlled inputs re-render on every keystroke; for large forms
  that is a measurable INP cost. Use controlled only for fields needing live formatting or
  cross-field reactivity
- **Validate on blur, re-validate on change once the field has errored.** Validating on every
  keystroke shows an error before the user finished typing, which reads as hostile
- **One schema** for client and server validation where possible. Two definitions diverge, and the
  divergence appears as a form that submits and then fails
- **Never put form state in a global store.** It is scoped to the form's lifetime
- **Server errors map back to fields.** A field-level error rendered as a page-level banner makes
  the user hunt

---

## Diagnosing state problems

| Symptom | Likely cause |
|---|---|
| Typing in one field re-renders the page | State lifted too high |
| Two components show different values for one thing | Duplicated state; derive instead |
| Data is stale after a mutation | Missing invalidation |
| Back button does the wrong thing | URL state kept in a store |
| Refresh loses the user's place | URL state kept in a store |
| Same request fired 3× on mount | No deduplication |
| A store change re-renders everything | God store, or missing selectors |
| One user sees another's data after switching | Query key missing an identity scope |
| Theme toggle causes a visible stall | Single context holding everything |

Note that four of these are solved by moving state, not by adding tooling.

---

## Criteria for the spec

```markdown
### UX — appended by aidd-frontend
- [ ] AC-U1: Filters, sort, and pagination are reflected in the URL; a copied link
      reproduces the view → `npm test -- filters.url`
- [ ] AC-U2: Back button returns to the previous filter state → manual + test
- [ ] AC-U3: Creating an item invalidates the list; no manual refresh needed
      → `npm test -- items.invalidation`
- [ ] AC-U4: Query keys include the tenant scope; switching account shows no cached
      data from the previous one → `npm test -- query.scope`
- [ ] AC-U5: Typing in <form> does not re-render <sibling> → React DevTools profile
```

AC-U4 is worth writing on every multi-tenant application. It is a cache bug with security
consequences, and it is invisible until someone switches accounts.

---

## Anti-patterns

- **Server data in a client store.** You now hand-write caching, dedup, and invalidation.
- **Filters and pagination in a store.** Breaks sharing, bookmarking, and the back button.
- **Storing derived state.** Two truths; one becomes wrong.
- **A global store adopted before naming what needs it.** "It will scale" is not a reason.
- **One context holding everything.** Every consumer re-renders on any change.
- **An unmemoized provider value.** Defeats the split you just made.
- **Form state in a global store.** Wrong lifetime.
- **Validating on every keystroke.** Errors before the user finished typing.
- **A query key missing the tenant or user.** Serves cached data across accounts.
- **Optimistic update with no rollback.** UI shows what the server rejected.
- **State lifted to the page for one input.** The most common structural perf bug.
