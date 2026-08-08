# ADR-0002 — Build AbButton as a Component with content projection and class-based host reflection

Date: 2026-08-04
Status: accepted
Deciders: aidd-architect

## Context

`AbButton` is the second component in the library, after `AbInput`. `AbInput` decorates a
void element (`<input>`) and, per ADR-0001, ships as a `@Component` with an intentionally
empty template and no view of its own — it cannot render icons, a spinner, or any other
projected content, because a native `<input>` has no DOM children.

`AbButton` decorates `<button>`, which is **not** void — it can have children — and the
user's request for this run explicitly asks for left/right icons and a loading state, both
of which require the component to render its own markup (named projection outlets, a
conditional spinner) around whatever the consumer places inside `<button ab-button>…</button>`.

A prior iteration of this library (`/Users/juano/Docs/Projects/abbos.old`, same author, same
token names, superseded by this repo's from-scratch rewrite) contains a working `AbButton`
built as a `@Component` with a real template, `abStart`/`abEnd` projected icon slots, and
`data-variant`/`data-size`/`data-shape` host-attribute reflection. Its variant values and
token mappings are still valid against this repo's current tokens (confirmed by inspection).
Its host-reflection mechanism (`data-*` attributes) is not what `AbInput` actually ships in
this repo today — `AbInput` was amended 2026-08-04 to use `:host`-scoped BEM classes instead
(see ADR-0001's amendment), and that mismatch between `AbInput`'s spec and its shipped code
is still an open, unresolved item (`specs/ab-input/spec.md`, AC-F3/AC-F4).

## Decision

`AbButton` is a `@Component` (selector `button[ab-button]`) with a real template: a
conditional decorative spinner, two named `ng-content` projection outlets
(`select="[abStart]"` / `select="[abEnd]"`) for icons, and a default outlet for the button's
text label. `variant` (`primary | secondary | soft | outline | ghost | danger`, default
`primary`), `size` (`AbControlSize`, default `md`), and `shape` (`AbControlShape`, default
`round`) are reflected as `:host`-scoped BEM host classes
(`ab-button_{variant}`/`ab-button_{size}`/`ab-button_{shape}`) in the component's own
`styleUrl`, matching `AbInput`'s shipped mechanism — not the `data-*` attributes the
reference implementation and `CLAUDE.md`'s current prose describe. `loading` sets
`aria-busy`, forces `disabled`, shows the spinner, and hides (via CSS) the icon slots while
true. `disabled` reflects the native `disabled` attribute. No `ControlValueAccessor` is
implemented — a button is not a form-value control, so the question ADR-0001 answered for
`AbInput` does not apply here at all.

## Consequences

**Positive**: Icons and a loading spinner are possible at all, which they would not be as a
directive. Host-state reflection stays consistent with the one other component in the
library (`AbInput` as shipped), rather than introducing a second, different mechanism for
the same kind of state. Variant colors, the spinner treatment, and the icon-slot
collapse-when-empty behavior are grounded in a real prior implementation rather than
invented from scratch.

**Negative**: Diverges from the discovered reference implementation's `data-*`-attribute
mechanism and from `CLAUDE.md`'s current (stale, pre-dating `AbInput`'s 2026-08-04
amendment) prose describing `data-*` reflection. If `AbInput`'s own open `data-*`-vs-class
question is later resolved toward `data-*` attributes, `AbButton` will need a follow-up
pass to match — tracked in `BACKLOG.md`. `fullWidth`, present in the reference
implementation, is not implemented (out of scope for this run — see
`docs/architecture/architecture-ab-button.md`, Rejected alternatives).

**Neutral**: This is a distinct decision from ADR-0001, not an amendment to it — the two
components made different, individually-correct calls (Directive-leaning vs. real template)
for a documented, mechanical reason (void vs. non-void host element), not because either
decision was wrong. Any future control decorating a non-void native element with a need for
projected/conditional content should default to "Component with a real template", the same
way ADR-0001 established "Component, empty template" as the default for void elements.

## Alternatives

| Option | Why rejected |
|---|---|
| `@Directive`, matching `AbInput` | Directives have no template; cannot render a spinner or named projection outlets. See `architecture-ab-button.md`, Trade-offs. |
| `data-*` attribute host reflection, matching the reference implementation | Would diverge from what `AbInput` actually ships and deepen its already-open `data-*`-vs-class question rather than settling it. See `architecture-ab-button.md`, Trade-offs. |
| `iconStart`/`iconEnd` typed inputs instead of `abStart`/`abEnd` projection | Couples `AbButton` to a specific icon-rendering mechanism; `CLAUDE.md` already documents `abStart`/`abEnd` as the intended adornment vocabulary. |
| Implement a `ControlValueAccessor` | N/A — a button has no value; nothing in the request or CLAUDE.md suggests treating it as a form-value control. |

## Revisit when

`AbInput`'s open `data-*`-vs-class question (`specs/ab-input/spec.md`) is resolved — if it
resolves toward `data-*` attributes, revisit this ADR's host-reflection decision in the same
pass. Also revisit if `AbIconButton` (documented in `CLAUDE.md`, present in the reference
implementation, not built this run) is built — it should default to following this ADR's
conventions unless it has a concrete reason not to, the same way this ADR followed
ADR-0001's.
