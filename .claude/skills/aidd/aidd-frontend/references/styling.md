# Styling

Reviewing and specifying how a product looks — tokens, CSS architecture, theming, and the
consistency that separates a designed product from an accumulated one.

The framing that makes styling reviewable: **a styling defect is almost never "this looks wrong."**
It is "this introduced a fifth shade of gray." No single change looks wrong; the aggregate is a
product that feels unmaintained, and by then the cause is spread across 200 files.

So the review question is not *does this look right* — it is **does this add a new decision, or use
an existing one?**

---

## The token layer

Tokens are the vocabulary. Everything else in this file depends on them existing and being used.

Three tiers, and the separation is the whole point:

| Tier | Example | Holds | Changes |
|---|---|---|---|
| **Primitive** | `blue-500: #3b82f6` | Raw values, no meaning | Almost never |
| **Semantic** | `color-action-primary: {blue-500}` | Meaning, no component context | On rebrand or theme |
| **Component** | `button-bg-primary: {color-action-primary}` | Optional. One component's usage | With the component |

**Components reference semantic tokens, never primitives.** This is the rule that makes theming
work: a theme remaps semantics, not primitives. A component that uses `blue-500` directly is
invisible to the theme switch and will stay blue in dark mode, and the bug surfaces months later in
a screenshot.

The component tier is optional. Add it when a component needs a value that genuinely differs from
the semantic default; skip it otherwise. A component tier that just aliases semantics 1:1 is
indirection with no payoff.

### When is a raw value acceptable?

The question that comes up in every review. A usable rule:

| Value | Verdict |
|---|---|
| Any color, anywhere | **Token.** No exceptions — this is what breaks theming |
| A spacing value on the scale | Token |
| A spacing value *not* on the scale | Either a bug, or the scale has a gap. Raise it — do not just write the number |
| Anything that appears twice | Token. The second occurrence is the signal |
| A genuine one-off with no reuse and no semantic meaning — an optical alignment nudge, a specific transform origin | Raw value is fine, **with a comment saying why** |

That last row matters. Some numbers are genuinely arbitrary and tokenizing them adds a name nobody
will reuse. The comment is what distinguishes a deliberate one-off from a lazy magic number, and it
is the difference between a reviewer approving it and flagging it.

### Naming

Name by **role**, not appearance. `color-danger` survives a rebrand; `color-red` becomes a lie the
moment danger turns orange. The same applies to `spacing-tight` over `spacing-4px` and
`text-emphasis` over `text-bold`.

A token whose name describes what it looks like will eventually contradict what it is.

---

## CSS architecture

Methodology-agnostic, because the methodology is not what determines the outcome.

**The property that matters is uniform specificity.** Not low — *uniform*. When specificity varies
across the codebase, overriding requires out-specifying, which raises the average, which makes the
next override harder. `!important` is the terminal state of that escalation, and by the time it
appears the architecture has already failed.

Every scoping approach — CSS Modules, CSS-in-JS, utility-first, BEM, shadow DOM — exists to make
specificity uniform and predictable. **Evaluate the project's choice by whether it achieves that**,
not by which one it is. A consistently-applied approach you dislike beats a mix of two you prefer.

What to check regardless of methodology:

- **One scoping strategy, applied everywhere.** Two strategies means every developer must know which
  applies where, and the boundary is undocumented.
- **No styles that reach outside their component.** A component styling `.some-child` in a
  descendant it does not own creates coupling nobody can see from either file.
- **No global selectors outside a designated reset/base layer.** Global element selectors added
  later are how a button in an unrelated page changes.
- **Specificity does not escalate over time.** If new code needs more specificity than old code to
  override it, the trend is toward `!important`.
- **`!important` count is zero, or documented.** Each instance is either a real defect or a
  deliberate escape from a third-party style — and the second needs a comment.

### Where styles live

Co-located with the component that owns them. A styles directory mirroring the component tree is a
second structure to keep in sync, and it will drift.

The exception is the token and base layer, which belongs in one place precisely because it is global.

---

## Theming

The test is binary and worth running: **flip the theme and see what breaks.**

What breaks, in rough order of frequency:

| Cause | Symptom |
|---|---|
| Hardcoded colors bypassing tokens | Stays light in dark mode |
| Images and icons with baked-in backgrounds | A white box on a dark surface |
| Shadows tuned for light backgrounds | Invisible, or a grey halo |
| Borders relying on a light-mode assumption | Disappears |
| Third-party components | Ignore your tokens entirely |
| `currentColor` assumptions | Correct in one theme, wrong in the other |
| Contrast ratios verified in one theme only | Fails WCAG in the other |

That last one connects to `accessibility.md`: **contrast must be verified in every theme.** A
palette that passes 4.5:1 in light mode routinely fails in dark, because dark mode inverts the
relationship between text and surface luminance.

Theming is also why the primitive/semantic split is not academic. If a theme has to remap primitives,
every theme is a full palette rather than a set of overrides, and adding a third theme becomes a
project.

---

## Responsive

**Breakpoints belong to the system, not the component.** A component with a one-off
`@media (max-width: 823px)` is a finding — that number came from someone's browser window, and now
the layout shifts at a width nothing else respects.

Use the system's breakpoints. If a component genuinely needs a boundary the system lacks, that is a
system conversation, not a local decision.

**Prefer container queries where available.** A component that responds to *its container* rather
than the viewport is genuinely reusable — the same card works in a sidebar and a full-width grid
without knowing where it is. Viewport-based responsiveness bakes layout assumptions into components,
which is why they break when moved.

**Fluid over stepped, where it works.** Fluid type and spacing scales eliminate the awkward widths
just below a breakpoint. They are harder to reason about, so use them for type and spacing and keep
layout changes at explicit breakpoints.

Minimums worth enforcing regardless: usable at **320px** wide and at **200% zoom** with no horizontal
scroll. Both are a11y requirements, not preferences.

---

## The style review checklist

**Tokens**
- [ ] No raw colors anywhere — every color is a token
- [ ] Spacing values are on the scale; off-scale values are flagged, not silently written
- [ ] Components reference semantic tokens, not primitives
- [ ] Any repeated value is a token
- [ ] One-off raw values carry a comment explaining why
- [ ] Token names describe role, not appearance

**Architecture**
- [ ] One scoping strategy, consistently applied
- [ ] No styles reaching into descendants the component does not own
- [ ] No new global selectors outside the base layer
- [ ] No `!important` (or: documented, with the third-party cause named)
- [ ] Specificity is flat — this change does not need more than existing code to override

**Consistency**
- [ ] No new shadow, radius, or transition value that a token already covers
- [ ] Interactive states — hover, focus, active, disabled — match existing components
- [ ] Breakpoints come from the system
- [ ] Existing components reused rather than restyled into lookalikes

**Theme and a11y**
- [ ] Renders correctly in every theme
- [ ] Contrast verified **in each theme**, not just the default
- [ ] Focus indicator visible in every theme, ≥ 3:1 against adjacent colors
- [ ] Nothing relies on color alone
- [ ] `prefers-reduced-motion` respected
- [ ] Usable at 320px and 200% zoom

**States**
- [ ] All six states styled: empty, loading, partial, error, success, disabled — see the UX spec

---

## Severity

Styling findings inflate easily, because everyone has opinions about appearance. Calibrate against
the same standard as everything else: **can you name a concrete consequence?**

| Finding | Class |
|---|---|
| Hardcoded hex instead of a token | Minor — one-line fix |
| Off-scale spacing value | Minor |
| A new shadow duplicating an existing token | Minor |
| Component reads primitive tokens directly | Minor, unless it is widespread |
| `!important` added to win a specificity fight | **Blocking** — the architecture is escalating |
| Component styles a descendant it does not own | **Blocking** — invisible coupling |
| Hardcoded colors that break dark mode across a feature | **Blocking** — theming is structurally bypassed |
| Contrast fails in one theme | **Blocking** — an a11y criterion, not a style preference |
| A second scoping strategy introduced | **Blocking** — architectural |
| "I'd have used a different border radius" | Not a finding. Observation, or nothing |

The line matches `severity.md`: minor findings need someone to *write* something; blocking findings
need someone to *decide* something.

---

## Writing testable styling criteria

The hard part, because "looks consistent" resists a command. But most of it is mechanizable, and a
criterion that cannot be checked will not be checked.

| Not a criterion | Criterion |
|---|---|
| Follows the design system | No raw hex values in the diff → `npx stylelint` with a color-no-hex rule |
| Consistent spacing | All spacing values resolve to scale tokens → lint rule |
| Works in dark mode | Visual regression snapshots pass in both themes → `npm run test:visual` |
| Accessible colors | Contrast ≥ 4.5:1 in both themes → axe run per theme |
| Responsive | No horizontal scroll at 320px → viewport test |
| Clean CSS | Zero `!important` in changed files → lint rule |

**Lint is the main lever.** Most token discipline — no raw colors, no off-scale spacing, no
`!important` — is enforceable mechanically, which converts a style debate into a build failure. If
the project has no such rules, adding them is a high-value backlog item worth raising.

**Visual regression covers the rest** (`testing.md`): spacing, alignment, overflow, and theme
correctness are exactly what assertions cannot express and snapshots can. Snapshot in every theme,
or the theme you skipped is the one that breaks.

Everything genuinely subjective — whether a spacing rhythm feels right — is a design decision, not
an acceptance criterion. Get it decided before the freeze and record it in the UX spec, rather than
discovering it in review.

---

## Anti-patterns

- **Reviewing appearance instead of decisions added.** "Looks fine" misses the fifth shade of gray.
- **Raw colors anywhere.** The single most common cause of broken theming.
- **Components reading primitive tokens.** Invisible to the theme switch.
- **Tokens named for appearance.** `color-red` becomes a lie on rebrand.
- **An off-scale value written silently.** Either a bug or a scale gap; both need raising.
- **A one-off magic number with no comment.** Indistinguishable from laziness.
- **`!important`.** The terminal state of specificity escalation, not a fix.
- **Two scoping strategies.** Every developer must know which applies where, and nothing says.
- **Styling a descendant you do not own.** Coupling invisible from both files.
- **A component-local breakpoint.** Came from someone's browser window.
- **Viewport queries where container queries fit.** Bakes location into the component.
- **Contrast checked in one theme.** Dark mode inverts the luminance relationship.
- **"Consistent styling" as an acceptance criterion.** Unverifiable, therefore unverified.
- **Restyling an existing component into a lookalike** instead of reusing it. Two components, one
  purpose, guaranteed divergence.
