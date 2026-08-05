# ADR-0001 — Build AbInput as a Component with host-scoped styles and no custom ControlValueAccessor

Date: 2026-08-01 (amended 2026-08-04)
Status: accepted
Deciders: aidd-architect (2026-08-01 run); user direction (2026-08-04 amendment)

## Context

The scaffolded stub for `AbInput` (`projects/abbos/src/lib/components/form/input/input.ts`)
is a `@Component` with selector `input[ab-input]` and its own `templateUrl`/`styleUrl`. The
root `CLAUDE.md` separately documents `AbInput` as "`ab-input`, ControlValueAccessor."

Two problems surface once this is taken literally:

1. A native `<input>` is a void element — it cannot have DOM children, so a `@Component`'s
   template content has nowhere to render. The stub's template (`<p>input works!</p>`) is
   dead code.
2. Angular ships a `DefaultValueAccessor` (`@angular/forms`) that already binds to any native,
   non-checkbox `<input>` used with `ngModel`/`formControl`/`formControlName`. It matches on
   the native element itself, not on the `ab-input` attribute, so it is already present and
   active on every `input[ab-input]` regardless of anything `AbInput` does.

This is the first component in the library; the pattern set here is what `AbButton`,
`AbSwitch`, and future controls will be built against.

**Amendment (2026-08-04)**: the 2026-08-01 decision below made `AbInput` an `@Directive` with
styles shipped as a global Sass partial. That was not what got built — `AbInput` was directed
to remain a `@Component`, and along the way its `styleUrl` stylesheet shipped with every rule
as a bare class selector (`.ab-input`, `.ab-input_sm`, …) instead of nested under `:host`. Under
Angular's default `ViewEncapsulation.Emulated`, a bare-class rule compiles with the
content-scoping attribute (`_ngcontent-*`) appended, and that attribute is only ever stamped on
nodes rendered by the component's own template — never on the host element itself. Since
`template: ''` renders nothing, none of those rules could ever match the host `<input>`, so no
visual styling was ever applied. This section now records the corrected decision in place of the
original.

## Decision

`AbInput` is a `@Component` (selector `input[ab-input]`) with an intentionally empty template
(`template: ''` — see problem 1 above, unchanged by the decorator type) and implements no
`ControlValueAccessor`. It is presentation-only: `size`/`shape` inputs reflected as BEM-style
host classes (`ab-input_sm`/`ab-input_md`/`ab-input_lg`, `ab-input_square`/`ab-input_round`/
`ab-input_circle`), plus an explicit boolean `invalid` input (`ab-input_invalid`) alongside
`.ng-invalid.ng-touched`, which Angular's forms module already applies for free. Styles ship as
the component's own `styleUrl` (`input.scss`), with every rule nested inside `:host { … }` so
Angular's emulated view encapsulation compiles them against the host-scoping attribute
(`_nghost-*`, which the host element actually carries) instead of the content-scoping one.

## Consequences

**Positive**: Forms integration (value read/write, `disabled` via `setDisabledState`,
`ng-invalid`/`ng-touched`/`ng-dirty` classes) is correct by construction and requires zero
lines of `AbInput` code to prove — it's Angular's own, already-tested behavior. No risk of two
`NG_VALUE_ACCESSOR`s racing for the same host element. Styling stays ordinary
Component-`styleUrl` authoring — no global Sass partial or `_index.scss` wiring required.

**Negative**: `specs/ab-input/spec.md`'s AC-F2 ("declared `@Directive`, not `@Component`"),
AC-F3/AC-F4 ("reflected as `data-size`/`data-shape` … attributes"), and AC-U5 ("no Angular view
encapsulation") no longer describe the shipped implementation — see the amendment recorded in
`spec.md`. `input.spec.ts`'s size/shape reflection tests still assert `data-size`/`data-shape`
attributes and fail against the class-based implementation (7 of 12 tests in that file, confirmed
by `ng test abbos --include "**/components/form/input/**/*.spec.ts" --watch=false`) — not fixed
by this amendment, tracked as an open item in `spec.md`/`plan.md`. The explicit `invalid` input
also duplicates part of what `.ng-invalid.ng-touched` already provides automatically; kept as a
manual override for usages outside Angular's forms module.

**Neutral**: Every future control that decorates a native form element (`AbTextarea`, a native
`<select>`-backed control, etc.) should default to "Component, empty template, `:host`-scoped
`styleUrl`" unless it has a concrete reason not to.

## Alternatives

| Option | Why rejected |
|---|---|
| Keep `@Component`, give it a real template rendered elsewhere (e.g. shadow content) | Angular components don't support shadow-DOM-style content injection into void elements; there is no template Angular can attach to a live `<input>` without replacing it. |
| Implement `NG_VALUE_ACCESSOR` alongside the built-in one | Redundant at best (never called, `DefaultValueAccessor` wins), a form-binding bug at worst (two accessors registered for one control). |
| Wrap the native `<input>` in a custom element (`<ab-input>`) that owns both concerns | Different component with a different contract (supports label/adornment projection); out of scope for what the user asked for here. See `docs/architecture/architecture.md`, Rejected alternatives. |
| `@Directive` with styles shipped as a global Sass partial (the original 2026-08-01 decision above) | Superseded 2026-08-04 — `AbInput` was directed to remain a `@Component`; a Directive has no `styleUrl` to fix in place, which is what this amendment needed. |

## Revisit when

A control needs to decorate a native element that has no built-in Angular accessor, or when
the wrapper-based `<ab-input>` (with projected `abStart`/`abEnd` adornments) is actually
built — at which point it is a new ADR for a new component, not a reopening of this one. Also
revisit if `data-size`/`data-shape` attribute reflection (AC-F3/AC-F4 as originally specified)
is reintroduced — see the open item in `spec.md`.
