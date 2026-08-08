# ADR-0003 — Build AbSwitch as a Component wrapping a synthetic `button[role=switch]`, with a real ControlValueAccessor

Date: 2026-08-05
Status: accepted
Deciders: aidd-architect

## Context

`AbSwitch` is the third component in the library, after `AbInput` (ADR-0001) and `AbButton`
(ADR-0002). Unlike both, there is no native HTML element for a boolean toggle switch —
`AbInput` could delegate to `<input>` + Angular's `DefaultValueAccessor`; `AbButton` could
wrap a real `<button>` with no value semantics at all. `AbSwitch` needs both a real
interactive element *and* a form value, and nothing native provides either directly.

Root `CLAUDE.md` already commits this library to `ab-switch` as the selector, `[(checked)]`
as the two-way binding, and a `ControlValueAccessor` for forms interop — that contract is not
this ADR's decision. What this ADR decides is the internal shape that satisfies it, and the
host-state reflection mechanism, matching the precedent `AbButton`'s ADR-0002 set (a new
decision for a new mechanical situation, not a reversal of either prior ADR).

A prior iteration of this library (`/Users/juano/Docs/Projects/abbos.old`, same author, same
token names, superseded by this repo's from-scratch rewrite) contains a working `AbSwitch`
built exactly this way — `<label>` wrapping `<button type="button" role="switch">`, a knob,
`model(false)` for `checked`, and a real `ControlValueAccessor` — confirmed against this
repo's current token names. Its host-reflection mechanism (`[attr.data-size]`) is not what
`AbInput`/`AbButton` actually ship in this repo today (both use `:host`-scoped BEM classes).

## Decision

`AbSwitch` is a `@Component` (selector `ab-switch`) with a real template: a `<label>`
wrapping a `<button type="button" role="switch">` (native button semantics, not a
hand-rolled `<div role="switch">` with manual keydown handling) plus a decorative knob
`<span>`, and a default `ng-content` outlet for the projected label text inside the
`<label>`. `checked` is a `model<boolean>(false)`, the single source of truth for both
`[(checked)]` two-way binding and `ControlValueAccessor` (`writeValue` calls
`checked.set(...)`; user toggles call both `checked.set(...)` and the registered
`onChange`). `AbSwitch implements ControlValueAccessor` and registers itself via
`{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AbSwitch), multi: true }`.
`disabled` (plain input) and Reactive Forms' `setDisabledState` are ORed together into one
internal `isDisabled` computed signal — neither can un-disable what the other disabled.
`size` (`AbControlSize`, default from `CONTROL_SIZE`) and `shape` (`AbControlShape`, default
from `CONTROL_SHAPE`) are reflected as `:host`-scoped BEM host classes
(`ab-switch_{size}`/`ab-switch_{shape}`), matching `AbInput`/`AbButton`'s shipped mechanism —
not the reference implementation's `data-*` attributes. An explicit optional `ariaLabel`
input is bound to `[attr.aria-label]` on the inner `button[role=switch]` (not the host,
which is transparent to assistive tech) — the projected-content labeling mechanism, inherited
from the reference implementation, does not cover icon-only or label-elsewhere usage, and
closing that gap is treated as an accessibility criterion (Article IX), not an afterthought.

## Consequences

**Positive**: native `<button>` keyboard/focus behavior is inherited for free — no
`(keydown.enter)`/`(keydown.space)` handling to write or get wrong. Host-state reflection
stays consistent with both other components in the library rather than introducing a third
mechanism. `checked` as the single-source-of-truth `model()` means `[(checked)]` and
`formControlName` usage cannot drift out of sync with each other. Icon-only/label-elsewhere
switches have a correct, documented path to an accessible name that the reference
implementation did not provide.

**Negative**: diverges from the discovered reference implementation's `data-*`-attribute
mechanism (not its structure, values, or behavior). Reusing the library-wide
`AbControlShape` (rather than a bespoke, switch-specific shape enum) means the shared
`'round'` default does not render as the conventional full-pill switch shape — only
`'circle'` does; recorded as an accepted trade-off in
`docs/architecture/architecture-ab-switch.md` rather than solved by guessing at a better
default.

**Neutral**: this is a distinct decision from ADR-0001 and ADR-0002, not an amendment to
either — three components, three different mechanical situations (void native element;
non-void native element; no native element at all), each getting its own documented call
under the same underlying philosophy (delegate to native/synthetic-native behavior wherever
possible, reflect state as host classes, keep the API to what's asked for).

## Alternatives

| Option | Why rejected |
|---|---|
| `@Directive` on a native element, matching `AbInput` | No native element represents a switch; nothing to delegate a value accessor to. See `architecture-ab-switch.md`, Trade-offs. |
| Hand-built `<div role="switch">` with manual keyboard handlers | A real `<button>` gets identical, spec-correct keyboard behavior for free. See `architecture-ab-switch.md`, Trade-offs. |
| `data-*` attribute host reflection, matching the reference implementation | Would reintroduce a second host-reflection mechanism into a library that has already settled on `:host`-scoped BEM classes across `AbInput` and `AbButton`. |
| No `ariaLabel` escape hatch (match the reference implementation exactly) | Leaves icon-only/label-elsewhere switches with no correct way to get an accessible name — a silent a11y gap the project's WCAG AA/axe bar doesn't allow shipping unaddressed. |

## Revisit when

`AbInput`'s still-open `data-*`-vs-class question (`specs/ab-input/spec.md`) is resolved
library-wide — if it resolves toward `data-*` attributes, `AbSwitch` needs a follow-up pass
in the same sweep as `AbButton` (see ADR-0002's own "Revisit when"). Also revisit the
default-shape trade-off (`'round'` not reading as a full pill) if a consumer or design review
flags it — see `architecture-ab-switch.md`'s "Decision — `shape` included" section for the
two concrete fix options recorded there.
