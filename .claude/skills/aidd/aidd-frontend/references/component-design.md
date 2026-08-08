# Component Design

How to decompose an interface so it stays changeable. The failure this prevents is not ugly code —
it is a codebase where every change touches six files and nobody can tell which component owns a
behavior.

---

## The decomposition question

Do not decompose by visual appearance. Decompose by **reasons to change**.

A component should have one reason to change. When a component fetches data, formats it, decides
layout, and handles interaction, it changes when the API changes, when the design changes, when
the copy changes, and when the interaction changes — four unrelated pressures on one file, and
every change risks the other three.

**The test:** describe what the component does in one sentence. If you need "and", you have found
the split.

| Description | Verdict |
|---|---|
| "Renders a user's avatar with a fallback" | One reason |
| "Fetches the user and renders their avatar" | Two — split the fetch out |
| "Renders the order table and handles sorting and pagination and export" | Four |

---

## The layering that works

Most component problems dissolve with a clear separation between three kinds of component. Names
vary by ecosystem; the distinction is what matters.

| Kind | Knows about | Never knows about | Testing |
|---|---|---|---|
| **Presentational** | Props, local UI state | Where data comes from, routes, global stores | Trivial — pass props, assert output |
| **Container / connected** | Data sources, stores, routing | How things look | Integration |
| **Layout** | Composition and spacing | Content, data | Visual |

The value is that presentational components are the bulk of your UI and become trivially testable
and reusable. The moment one reaches into a global store, it is coupled to the application and
cannot be reused or tested in isolation.

**Practical rule:** data access lives at the route or feature boundary. Components below it
receive props. When a leaf component needs data three levels down, that is a signal — either lift
the fetch or use a colocated query with a shared cache, but do not scatter fetches through the
tree.

---

## Composition over configuration

The single most useful principle here. A component with many boolean props is several components
wearing one name.

```jsx
// Before — 11 props, exponential combinations, none tested
<Modal
  title="Confirm" showCloseButton hasFooter footerAlign="right"
  primaryLabel="Delete" primaryVariant="danger" secondaryLabel="Cancel"
  size="md" dismissible showIcon iconType="warning"
/>

// After — composition. The consumer arranges; the component provides behavior.
<Modal onClose={close}>
  <Modal.Header icon={<WarningIcon/>}>Confirm</Modal.Header>
  <Modal.Body>This cannot be undone.</Modal.Body>
  <Modal.Footer align="right">
    <Button onClick={close}>Cancel</Button>
    <Button variant="danger" onClick={del}>Delete</Button>
  </Modal.Footer>
</Modal>
```

The second version has fewer props, no invalid combinations, and accommodates a layout nobody
anticipated without a new prop.

**The signal to switch:** you are adding a prop to support one caller. Three of those and the
component is a configuration language.

**When configuration is right:** a genuinely closed set of variants that the design system
defines — `variant="primary|secondary|danger"`, `size="sm|md|lg"`. Enumerated, small, and design
owns the list.

---

## Prop design

**Model the states that exist, not booleans that can contradict.**

```jsx
// Before — 8 combinations, 5 of them nonsense
{ isLoading: boolean, isError: boolean, isEmpty: boolean }

// After — 4 states, all valid, exhaustively handled
{ state: 'loading' | 'error' | 'empty' | 'ready' }
```

The union makes the impossible unrepresentable and forces the consumer to handle every case. The
boolean version is how a component ends up rendering a spinner and an error simultaneously.

**Other rules:**
- Name by meaning, not implementation: `isDisabled`, not `greyedOut`
- Booleans default to `false`, and the name says what `true` means. `hideLabel` defaulting to
  `true` is a trap
- Prefer `children` over a `content` prop — it composes
- Pass data, not rendered output, unless the point is a render slot
- No prop that only exists to be forwarded three levels down — that is a signal to compose or to
  colocate the data

---

## Reuse before creation

**Search the codebase before writing a component.** A new component that duplicates an existing
one is debt created at design time, and the duplicate will drift.

When you find something close but not right:

| Situation | Move |
|---|---|
| Needs one more variant in a closed set | Extend it |
| Needs a different internal layout | Add a composition slot |
| Fundamentally different behavior, same look | New component, shared primitives |
| Same behavior, different look | Extract the behavior; two presentations |

If you do create a near-duplicate deliberately, say so in the UX spec with the reason. Silent
duplication is what produces four button components.

---

## Design system layering

| Layer | Contains | Changes |
|---|---|---|
| **Tokens** | Color, spacing, type scale, radii, shadows, motion | Rarely; a change is global |
| **Primitives** | Button, Input, Text, Box, Icon | Rarely |
| **Patterns** | Field (label+input+error), Card, Modal, Table | Occasionally |
| **Features** | OrderTable, CheckoutForm | Constantly |

**Never hardcode a value a token exists for.** One `#3B82F6` in a feature component is the reason
a rebrand takes a month. Enforce with a lint rule — reviewers will not catch every one.

**The token layer is where theming lives.** Light and dark, density, and brand variants should all
be token swaps. If a feature component branches on theme, the token layer is incomplete.

**Dependencies point one direction.** Features use patterns use primitives use tokens. A primitive
importing a feature is a cycle and it will bite during a refactor.

---

## The six states, every time

Specify and implement all of them. Missing states are the most common UI defect class and the
cheapest to prevent.

| State | Requirement |
|---|---|
| **Empty** | First-use content and the next action — never a blank panel |
| **Loading** | Skeleton or spinner; layout must not shift when content arrives |
| **Partial** | Some data arrived — show it, or block, but decide |
| **Error** | The specific message, a retry, and what the user does not lose |
| **Success** | The confirmation, and where focus goes |
| **Denied** | Hidden, or visible-disabled with a text reason |

A component that renders only the ready state will have the other five invented by whoever
implements it, differently each time.

---

## Where state lives

Full decision framework in `state-management.md`. The component-level rule:

**State lives at the lowest common ancestor of everything that needs it.** Lifting it higher
makes unrelated subtrees re-render and couples them.

The most common structural performance bug is state lifted too high: a form's input value held in
a page-level store, so every keystroke re-renders the page. Colocate it.

**Derive, do not duplicate.** If `total` can be computed from `items`, compute it. Two sources of
truth for one value will diverge, and the bug will be reported as "the total is sometimes wrong".

---

## Component-level performance

Only after measuring (see `performance.md`).

- **Memoize the expensive, not the trivial.** Memoization has a cost; wrapping every component
  makes things slower and the code worse
- **Stable references** for props that feed memoized children — a new object or arrow function
  each render defeats the memo
- **Keys must be stable and identity-based.** Array index keys cause wrong-state bugs on reorder,
  not just slowness
- **Virtualize long lists.** Above roughly 100 rows, rendering everything is a guaranteed INP
  failure
- **Split context.** A single context holding many values re-renders every consumer when any
  value changes

---

## Accessibility is structural

Decisions made here determine whether the component *can* be accessible. See
`accessibility.md` for the criteria; the design-time obligations:

- **Native element as the base.** A `<button>` gives keyboard, focus, and role free; a
  `<div role="button">` means you owe all three and will miss one
- **Every interactive component accepts a label** — `aria-label` or a labelled slot. An icon
  button with no way to name it is a broken API
- **Focus is part of the component's contract.** A modal that does not manage focus is incomplete
- **Do not build a combobox, tree, or menu from scratch.** Use a native element or a vetted
  headless library. The key-handling table in `accessibility.md` is the reason

---

## Review checklist

- [ ] One reason to change; the description needs no "and"
- [ ] Presentational components take props only — no store or router access
- [ ] No boolean prop that can contradict another; states are a union
- [ ] Composition slots rather than a growing prop list
- [ ] Searched for an existing component first
- [ ] No hardcoded values where tokens exist
- [ ] Dependencies point features → patterns → primitives → tokens
- [ ] All six states implemented
- [ ] State at the lowest common ancestor
- [ ] Derived values computed, not stored twice
- [ ] Keys are stable identities, not indices
- [ ] Native element as the base; label-able; focus managed

---

## Anti-patterns

- **Decomposing by appearance** instead of by reason to change.
- **Eleven boolean props.** Several components in a trench coat.
- **Contradictory booleans** where a union belongs.
- **A leaf component reaching into a global store.** Untestable and unreusable.
- **State lifted to the page for a single input.** Re-renders everything on keystroke.
- **Storing what can be derived.** Two truths, one bug.
- **A near-duplicate created silently.** Four button components start here.
- **Hardcoded hex values.** Makes a rebrand a migration.
- **A primitive importing a feature.** Cycle.
- **Memoizing everything.** Slower, and worse to read.
- **Array index as key.** Wrong-state bugs on reorder.
- **Hand-rolling a combobox.** A week of work a `<select>` gives free.
