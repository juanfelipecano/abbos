# Spec: ab-switch [Iter-1]

Level: L2
Status: closed 2026-08-05. All 19 criteria met and verified; see plan.md's Criteria
        coverage table and Attempt log for evidence.
Owner: aidd-architect (base, AC-F) + aidd-frontend (AC-U) + aidd-security (AC-S) +
       aidd-qa (AC-Q) — all four passes done in this session per Article XI's rigor, no
       separate agent invocation this run (same convention `specs/ab-button/spec.md` used).
Sources: `docs/architecture/architecture-ab-switch.md`,
         `docs/architecture/adr/0003-abswitch-synthetic-control-with-cva.md`,
         reference implementation at `/Users/juano/Docs/Projects/abbos.old/projects/abbos/src/lib/old/switch/`
         (prior iteration of this library, same author — see architecture doc's Context)

## Current state

`projects/abbos/src/lib/components/` contains `button/` (`AbButton`) and `form/input/`
(`AbInput`). No `switch/` directory exists. `AbSwitch` is documented as roadmap in root
`CLAUDE.md` ("`ab-switch`, `[(checked)]` model + ControlValueAccessor, not yet implemented")
and `PROJECT-CONTEXT.md`'s "Known debt" table. `AbControlSize`/`AbControlShape` (shared
types) and `CONTROL_SIZE`/`CONTROL_SHAPE` (DI tokens, already consumed by `AbInput` and
`AbButton`) already exist and are reusable as-is.

## Target state

`ab-switch` is a `@Component`, exported as `AbSwitch`, usable as:

```html
<ab-switch [(checked)]="notificationsOn">Email notifications</ab-switch>
<ab-switch formControlName="marketingOptIn">Marketing emails</ab-switch>
<ab-switch size="lg" shape="circle" [(checked)]="on">Large, pill-shaped</ab-switch>
<ab-switch disabled [(checked)]="archived">Archived (locked)</ab-switch>
<ab-switch ariaLabel="Toggle dark mode" [(checked)]="darkMode"></ab-switch>
```

It renders a `<label>` wrapping a native `<button type="button" role="switch">` (native
keyboard/focus semantics, no hand-built keydown handling) with a decorative knob, and the
projected default-slot content as the switch's visible label text inside that `<label>`.
Supports `size` (`sm`/`md`/`lg`, default from the injected `CONTROL_SIZE` token), `shape`
(`square`/`round`/`circle`, default from the injected `CONTROL_SHAPE` token), `disabled`
(boolean, default `false`), and an optional `ariaLabel` for icon-only/label-elsewhere usage
where no visible projected text exists. `checked` is a `model<boolean>(false)` — the single
source of truth for both `[(checked)]` two-way binding and a real `ControlValueAccessor`
(`formControlName`/`[formControl]`/`[(ngModel)]`). See the architecture doc for the full
design and the rationale behind every decision below.

## Acceptance criteria

### Functional — aidd-architect (Article I)
- [x] AC-F1: `<ab-switch>` compiles and renders a `<label>` wrapping a
      `<button type="button" role="switch">` plus a decorative knob element, with the
      projected default content visible as the label text
      → verified by `ng test abbos --include "**/components/switch/**/*.spec.ts" --watch=false`
- [x] AC-F2: `checked` is a `model<boolean>(false)` — `[(checked)]="on"` two-way binding
      reflects clicks back to the bound variable with no `ControlValueAccessor`/forms
      involvement required
      → verified by the same test file
- [x] AC-F3: Clicking the inner button (when not disabled) toggles `checked` and calls the
      registered `ControlValueAccessor` `onChange` callback with the new value
      → verified by the same test file
- [x] AC-F4: `AbSwitch implements ControlValueAccessor` and registers itself via
      `NG_VALUE_ACCESSOR` (`multi: true`, `forwardRef`) — `formControlName`/`[formControl]`
      write and read the switch's value with no additional code
      → verified by the same test file (a `ReactiveFormsModule` harness test)
- [x] AC-F5: `setDisabledState(true)` (called by Reactive Forms when the bound `FormControl`
      is disabled) disables the inner button, independently of and in addition to the
      `disabled` input — neither can un-disable what the other disabled
      → verified by the same test file
- [x] AC-F6: `size` accepts `'sm' | 'md' | 'lg'`, defaulting to the injected `CONTROL_SIZE`
      token, reflected as an `ab-switch_{size}` host class
      → verified by the same test file
- [x] AC-F7: `shape` accepts `'square' | 'round' | 'circle'`, defaulting to the injected
      `CONTROL_SHAPE` token, reflected as an `ab-switch_{shape}` host class
      → verified by the same test file
- [x] AC-F8: `disabled` accepts a boolean (default `false`, `booleanAttribute`-transformed);
      the inner button renders the native `disabled` attribute when true (via either
      `disabled` or `setDisabledState`) and a click on a disabled switch does not toggle
      `checked` or call `onChange`
      → verified by the same test file
- [x] AC-F9: The exported class is named `AbSwitch` and is re-exported from
      `projects/abbos/src/public-api.ts` (via `./lib/components`)
      → verified by `ng build abbos` (type check resolves the export) and
      `grep -q "export \* from './switch/switch'" projects/abbos/src/lib/components/index.ts`

### UX / accessibility — appended by aidd-frontend (Article IX)
- [x] AC-U1: The inner control carries `role="switch"` and `[attr.aria-checked]` reflecting
      `checked()` as the string `"true"`/`"false"` — assistive tech gets the current state
      with no reliance on visual-only cues
      → verified by the same test file
- [x] AC-U2: `AbSwitch`'s TSDoc states that projected content becomes the switch's accessible
      name via native `<label>` association, and that a switch with no projected text (e.g.
      icon-only or labeled by an adjacent element) must supply `ariaLabel` — this component
      cannot enforce that at compile time, the same duty-of-care `AbButton`'s TSDoc states for
      icon-only buttons
      → verified by manual review of the TSDoc comment
- [x] AC-U3: `ariaLabel`, when set, is bound to `[attr.aria-label]` on the inner
      `button[role=switch]` — not the host element, which has no ARIA role of its own and is
      transparent to assistive tech (see architecture doc's Trade-offs)
      → verified by the same test file
- [x] AC-U4: `:focus-visible` on the inner button shows a visible ring using the same
      `--ab-focus-ring` token `AbInput`/`AbButton` use, computed at ≥ 3:1 contrast against the
      surrounding surface — reusing `specs/ab-input/spec.md` AC-U2's already-verified
      computation (light `--ab-primary` #009e63 vs `--ab-surface` #ffffff = 3.46:1; dark
      `--ab-primary` #22b579 vs `--ab-surface` #171c22 = 6.49:1), since the ring color and
      surrounding-surface assumption are identical
      → verified by the math reused above + `npx sass` confirming the `:focus-visible` rule
      compiles as specified. **Not verified**: an actual manual keyboard-tab pass — no
      headless-browser tool available this run, same limitation `ab-input`/`ab-button`
      recorded
- [x] AC-U5: `disabled` uses the native `disabled` attribute on the inner button (never a
      visual-only fake-disabled class) and is styled distinctly (reduced opacity, `cursor:
      not-allowed`) from the default/hover/checked states. WCAG 1.4.3 (contrast) does not
      apply to disabled UI components per the spec's own exception, so no contrast minimum is
      claimed for the disabled state itself
      → verified by the same test file
- [x] AC-U6: The on/off state is distinguishable by more than color alone — the knob's
      *position* (left vs. right) changes together with the track's background color,
      satisfying WCAG 1.4.1 (Use of Color) without relying on a colorblind-safe color pair
      → verified by `npx sass` compiling `switch.scss` without error, confirming the
      knob-position rule exists as specified; not independently re-derived beyond inspection
- [x] AC-U7: `--ab-primary` (the checked-state track background) against `--ab-surface` (the
      page background a switch is typically placed on) meets the ≥ 3:1 WCAG AA non-text
      contrast minimum for a UI component boundary, in both themes — computed light: `#009e63`
      vs `#ffffff` = 3.46:1; dark: `#22b579` vs `#171c22` = 6.49:1 (same token pair and
      computation `specs/ab-input/spec.md` AC-U2 already verified for the focus ring; reused
      here for the track fill since it's the identical pairing)
      → verified by the math above (recorded); no new computation needed since the pairing is
      identical to one already verified elsewhere in this library

### Security — appended by aidd-security (Article IX)
- [x] AC-S1: `AbSwitch`'s implementation contains no `innerHTML`/`outerHTML` binding, no
      `bypassSecurityTrust*` call, and performs no dynamic HTML construction from
      user-controlled input — the component is host-class/attribute-and-projection only, so
      it introduces no new DOM sink
      → verified by `grep -nE "innerHTML|outerHTML|bypassSecurityTrust" projects/abbos/src/lib/components/switch/switch.ts`
      returning no matches, checked at the code-reviewer gate
- Conclusion: no further security surface. `AbSwitch` reads no external data and performs no
  navigation; `onChange`/`onTouched` callbacks are supplied entirely by Angular's forms
  module, never user-controlled strings.

### Coverage / testability — appended by aidd-qa (Article IX)
- [x] AC-Q1: Every AC-F and AC-U criterion above that names a test has a test that fails
      before the corresponding implementation task and passes after
      → verified by re-running `ng test abbos --include "**/components/switch/**/*.spec.ts" --watch=false`
      before/after each task per the plan
- [x] AC-Q2: The verify command for this run,
      `npx prettier --check "projects/abbos/src/lib/components/switch/**" && ng build abbos
      && ng test abbos --include "**/components/switch/**/*.spec.ts" --watch=false`, passes
      (17/17 tests, confirmed 2026-08-05). **Not** the repo-wide `ng test abbos --watch=false`
      — `PROJECT-CONTEXT.md`'s Known debt table already records that `input.spec.ts` fails all
      12 of its tests for a reason unrelated to this change (missing
      `CONTROL_SIZE`/`CONTROL_SHAPE` TestBed providers). Scoping this run's gate to the files
      it touches keeps Article II honest without silently absorbing a pre-existing,
      out-of-scope failure into this run's pass/fail bar
      → verified by running the scoped command above (17/17 passed) and recording full
      output; the repo-wide `ng test abbos --watch=false` result (12 failed / 42 passed
      across 5 files — all 42 passes are this run's 17 switch tests + `ab-button`'s 21 +
      4 pre-existing theme/config tests, all 12 failures pre-existing in `input.spec.ts`) is
      also recorded for transparency but is not this run's gate. `ng test playground
      --watch=false` also recorded: 1 pre-existing failure (`app.spec.ts`'s "should render
      title", predates this run — see `BACKLOG.md`'s `ab-button` entry, same finding), 1
      passed; not gating either.

## Artifacts

| Path | Change | New or modified |
|---|---|---|
| `projects/abbos/src/lib/components/switch/switch.ts` | New `AbSwitch` component: `checked` model, `size`/`shape`/`disabled`/`ariaLabel` inputs, `ControlValueAccessor`, host class bindings, template (label + button[role=switch] + knob) | New |
| `projects/abbos/src/lib/components/switch/switch.scss` | Component `styleUrl`, `:host`-scoped — token-driven styles for size/shape/checked/disabled/focus states, knob transition | New |
| `projects/abbos/src/lib/components/switch/switch.spec.ts` | Coverage for AC-F/AC-U | New |
| `projects/abbos/src/lib/components/index.ts` | Barrel: add `AbSwitch` re-export | Modified |
| `projects/playground/src/app/pages/switch-demo/switch-demo.ts` | Demo route (`/switch`) rendering `AbSwitch` across size/shape/checked/disabled/forms combinations | New |
| `projects/playground/src/app/app.routes.ts` | Registers the `/switch` lazy route | Modified |
| `docs/architecture/architecture-ab-switch.md` | Architecture doc for this run | New |
| `docs/architecture/adr/0003-abswitch-synthetic-control-with-cva.md` | ADR | New |
| `CLAUDE.md` | `AbSwitch` bullet updated: implemented, concrete API | Modified |
| `PROJECT-CONTEXT.md` | "Known debt" Components row updated (`AbSwitch` now exists) | Modified |
| `BACKLOG.md` | Append: default-shape trade-off, any findings from implementation | Modified |

## Constraints

- Must not change `--ab-*` token names in `projects/abbos/src/lib/assets/styles/tokens/`
  (protected boundary, `PROJECT-CONTEXT.md`). All colors are existing tokens referenced by
  name; no new global token added.
- Must not give `AbSwitch` a bespoke shape enum distinct from `AbControlShape` — see
  architecture doc's Trade-offs ("shape included, mapped to track border-radius"). The
  resulting default-shape (`'round'`) visual trade-off is accepted and documented there, not
  solved by forking the type.
- `.aidd-active` verify command for this run only (same rationale as `ab-button`'s AC-Q2):
  `npx prettier --check "projects/abbos/src/lib/components/switch/**" && ng build abbos &&
  ng test abbos --include "**/components/switch/**/*.spec.ts" --watch=false`

## Dependencies

None blocking. `AbControlSize`/`AbControlShape` (`src/lib/constants/`) and
`CONTROL_SIZE`/`CONTROL_SHAPE` (`src/lib/config/`) already exist and are reused as-is, already
consumed by `AbInput`/`AbButton` for the same purpose.
`projects/abbos/src/lib/components/index.ts` barrel already exists.

## Open questions
- [NEEDS CLARIFICATION: none blocking]. The user's request named "sizes, shapes, disabled
  states, and others that can be necessary" — this run interprets "others" narrowly as the
  `ariaLabel` escape hatch (a documented accessibility gap the reference implementation left
  open, see architecture doc), not as license to add unrequested props. Anything else a
  reviewer wants added is a `BACKLOG.md` item for the next run (Article V).

## Amendment (2026-08-05) — issues found and fixed during implementation, none blocking

Both minor per Rule 3 (approach unchanged, one detail corrected each); neither reopened a
criterion or required an architect spec patch.

1. **Signal-input test flake, same root cause `button.spec.ts` already documented**: the
   first version of the size/shape/disabled tests drove `AbSwitch` through wrapper host
   components (`ConfigurableTestHost`, a mutated `disabled` field on `TestHost`) with plain
   fields rebound via `[size]="size"`/`[shape]="shape"`/`[disabled]="disabled"`. On the
   *second* `fixture.detectChanges()` call following an earlier one, the mutated value did
   not reach `AbSwitch`'s signal inputs (5 of 17 tests failed this way on first run) — the
   exact same Angular OnPush-host + signal-input interaction `specs/ab-button/spec.md`
   Amendment #2 already root-caused and is not a defect in `AbSwitch` itself. Fixed the same
   way: `switch.spec.ts`'s size/shape/disabled tests now construct `AbSwitch` directly
   (`TestBed.createComponent(AbSwitch)`, no host wrapper) and drive inputs via
   `fixture.componentRef.setInput()`. Confirms this is a real, reproducible pattern worth
   the instruction fix `ab-button`'s retrospective already flagged (still not applied to a
   shared AIDD reference doc — see that spec's Retrospective).
2. **`AbControlShape`/`AbControlSize` are not part of the library's public TS surface**:
   the first version of `switch-demo.ts` imported both from `'abbos'` (matching
   `button-demo.ts`'s `AbButtonVariant` import) to type a `@for`-looped array of demo
   sizes/shapes. `ng build playground` failed — `projects/abbos/src/public-api.ts` only
   re-exports `./lib/components`, `./lib/services`, `./lib/abbos-config-provider`, never
   `./lib/constants` (where `AbControlShape`/`AbControlSize` are defined), and neither
   `AbInput` nor `AbButton` re-exports them from their own component files either (unlike
   `AbButtonVariant`, which `button.ts` defines and exports locally). Fixed by not depending
   on the named types in the demo (`['sm', 'md', 'lg'] as const` instead) rather than
   expanding `public-api.ts`'s protected boundary (`PROJECT-CONTEXT.md`) with no criterion
   asking for it. Filed in `BACKLOG.md` as a real gap for whoever next needs to type a
   `size`/`shape` value outside the library.

Neither needed an architect spec patch or reopened a frozen criterion — both were
test/demo-only.

---
## Freeze record
Frozen at: 2026-08-05 (see plan.md for wall-clock evidence timestamps)
Criteria count at freeze: 19 (AC-F1–F9, AC-U1–U7, AC-S1, AC-Q1–Q2)
From this point, Article V applies. New findings → `BACKLOG.md`.
