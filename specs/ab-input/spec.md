# Spec: ab-input  [Iter-1]

Level: L2
Status: closed, amended 2026-08-04 — see "Amendment (2026-08-04)" below. Several criteria marked
        `[x]` reflect the 2026-08-01 implementation, not the current one; each amended criterion
        says so inline.
Owner: aidd-architect (base) + aidd-security + aidd-qa (appended) — no aidd-frontend role
       available as a separate pass in this session; a11y criteria appended by aidd-architect
       under the AC-U prefix, same rigor the frontend role would apply (Article IX).
Sources: /Users/juano/Docs/Projects/Apollo/Projects/Abbos/Architecture/AbInput Architecture.md, /Users/juano/Docs/Projects/Apollo/Projects/Abbos/Decisions/ADR-0001 AbInput as component without custom CVA.md

## Current state

`projects/abbos/src/lib/components/form/input/` contains a CLI-generated, non-functional
stub:
- `input.ts` — `@Component`, selector `input[ab-input]`, class `Input`
- `input.html` — `<p>input works!</p>` (dead code — see architecture doc)
- `input.css` — empty
- `input.spec.ts` — one trivial "should create" test

Not exported from `projects/abbos/src/public-api.ts` (only `./lib/services` is exported
today). No other component exists in the library yet. `size`/`shape` shared types
(`AbControlSize`, `AbControlShape`) and unused DI tokens (`CONTROL_SIZE`, `CONTROL_SHAPE`)
already exist in `src/lib/constants/` and `src/lib/config/` but nothing consumes them.

Root `CLAUDE.md` describes `AbInput` as "`ab-input`, ControlValueAccessor" with projected
`abStart`/`abEnd` adornments — both inaccurate/out of scope per the architecture doc.

## Target state

**Amended 2026-08-04**: `input[ab-input]` is a `@Component` (not `@Directive`, superseding this
section as originally written) with `template: ''`, exported as `AbInput`, usable as:

```html
<input ab-input type="text" placeholder="you@example.com" />
<input ab-input type="text" size="lg" formControlName="email" aria-label="Email" />
<input ab-input type="text" [invalid]="control.invalid && control.touched" aria-label="Email" />
```

It renders no label, no wrapper, no projected content — a bare native `<input>` styled with
`--ab-*` tokens via the component's own `styleUrl` (`input.scss`, `:host`-scoped), supporting
`size` (`sm`/`md`/`lg`, default `md`) and `shape` (`square`/`round`/`circle`, default `round`),
both reflected as `ab-input_{size}`/`ab-input_{shape}` host classes (not `data-*` attributes as
originally specified). An explicit `invalid` boolean input reflects `ab-input_invalid`, alongside
the automatic `.ng-invalid.ng-touched` styling Angular's forms module applies for free. Value
read/write and `disabled` still come entirely from Angular's own forms module — `AbInput` adds
no value/disabled logic, only host class reflection and CSS.

## Acceptance criteria

### Functional
- [x] AC-F1: `<input ab-input>` compiles and renders as a plain native input with no visible
      label, wrapper element, or projected content in the rendered DOM
      → verified by `ng test abbos --include "**/components/form/input/**/*.spec.ts" --watch=false`
- [x] AC-F2 (amended 2026-08-04): The control is declared `@Component` (not `@Directive`, per
      ADR-0001's amendment) with `template: ''` and a `styleUrl` — reversing what this criterion
      originally required. Confirmed by inspection of `input.ts`.
      → verified by code review at the code-reviewer gate
- [ ] AC-F3 (amended 2026-08-04, not covered by a passing test): `size` accepts
      `'sm' | 'md' | 'lg'` (default `'md'`), reflected as an `ab-input_{size}` host **class**
      (not the `data-size` attribute originally specified). `input.spec.ts` still asserts
      `data-size`, so its 3 size-reflection tests fail against this implementation — confirmed by
      `ng test abbos --include "**/components/form/input/**/*.spec.ts" --watch=false` (7 of 12
      tests failing in that file, 2026-08-04). Open item: either update `input.spec.ts` to assert
      the class, or change `AbInput` to also emit `data-size`.
      → not currently verified by a passing test
- [ ] AC-F4 (amended 2026-08-04, not covered by a passing test): `shape` accepts
      `'square' | 'round' | 'circle'` (default `'round'`), reflected as an `ab-input_{shape}`
      host **class** (not the `data-shape` attribute originally specified). Same test mismatch
      and open item as AC-F3.
      → not currently verified by a passing test
- [x] AC-F8 (new 2026-08-04, not in original freeze): `invalid` accepts a boolean (default
      `false`, `booleanAttribute`-transformed), reflected as the `ab-input_invalid` host class,
      independent of and in addition to the automatic `.ng-invalid.ng-touched` styling in AC-U5
      → not covered by an automated test; confirmed by inspection of `input.ts`
- [x] AC-F5: The exported class is named `AbInput` (not `Input`) and is re-exported from
      `projects/abbos/src/public-api.ts`
      → verified by `ng build abbos` (type check resolves the export) and
      `grep -q "export \* from './lib/components'" projects/abbos/src/public-api.ts` (or the
      exact re-export path chosen during implementation)
- [x] AC-F6: Bound via `[(ngModel)]`, `formControlName`, or `[formControl]`, the input reads
      and writes its value with no additional code in `AbInput` — proves Angular's own
      `DefaultValueAccessor` is doing the work per ADR-0001
      → verified by `ng test abbos --include "**/components/form/input/**/*.spec.ts" --watch=false` (a `ReactiveFormsModule` harness test)
- [x] AC-F7: `<input ab-input formControlName="x">` on a disabled `FormControl` renders the
      native `disabled` attribute
      → verified by `ng test abbos --include "**/components/form/input/**/*.spec.ts" --watch=false`

### UX / accessibility — appended by aidd-architect under Article IX
- [x] AC-U1: `AbInput`'s TSDoc explicitly states the directive renders no label and that
      callers must supply an accessible name (`aria-label`, `aria-labelledby`, or a `<label
      for>` pointing at the input's `id`) — this is a hard limitation of a bare
      `input[ab-input]` selector (same one the native `<input>` element itself has) and cannot
      be enforced by the directive at compile time without becoming a different, wrapper-based
      component (out of scope — see architecture doc, Rejected alternatives)
      → verified by manual review of the TSDoc comment
- [x] AC-U2: `:focus-visible` shows a visible ring using `--ab-border-focus`/`--ab-ring`
      (light) or their dark-theme equivalents, computed at ≥ 3:1 contrast against
      `--ab-surface` — computed light: `--ab-primary` #009e63 vs `--ab-surface` #ffffff =
      3.46:1; dark: `--ab-primary` #22b579 vs `--ab-surface` #171c22 = 6.49:1 (WCAG relative
      luminance formula; no axe/browser tooling available this run, see Constraints)
      → verified by the math above (recorded) + `npx sass` confirming the `:focus-visible`
      rule compiles as specified. **Not verified**: an actual manual keyboard-tab pass — no
      headless-browser tool was available this run and the live desktop browser wasn't used
      (see plan.md task 9). Recommend a real keyboard pass before/soon after this ships.
- [x] AC-U3: Placeholder/secondary text uses `--ab-text-secondary`, not `--ab-text-tertiary`
      — computed `--ab-text-tertiary` (#8a97a3) on `--ab-surface` (#ffffff) is only 2.99:1,
      failing the 4.5:1 AA minimum for text; `--ab-text-secondary` (#626f7c light / #aeb8c2
      dark) computes to 5.14:1 (light) and 8.51:1 (dark)
      → verified by the math above (recorded) + `npx sass` compiling `_input.scss` to confirm
      `::placeholder { color: var(--ab-text-secondary); }` is the actual emitted rule (jsdom
      has no CSS cascade/pseudo-element support, so no unit test asserts this directly — see
      Constraints)
- [x] AC-U4: `disabled` and `readonly` states use the native `disabled`/`readonly` attributes
      (never a visual-only fake-disabled class) and are styled distinctly from the default and
      from each other
      → verified by `ng test abbos --include "**/components/form/input/**/*.spec.ts" --watch=false`
- [x] AC-U5 (amended 2026-08-04): Invalid state (`.ng-invalid.ng-touched`, applied automatically
      by Angular forms, plus the explicit `ab-input_invalid` class from AC-F8) is styled with
      `--ab-danger`, computed at 3.91:1 against `--ab-surface` in light and 5.84:1 in dark
      (≥ 3:1 non-text contrast bar in both). Selector is now `&.ng-invalid.ng-touched` nested
      inside `:host { … }` in the component's `styleUrl` (`input.scss`) — not a Sass partial as
      originally specified, and not exempt from Angular view encapsulation: the `:host` nesting
      is required precisely because `ViewEncapsulation.Emulated` applies (see ADR-0001's
      amendment for why a bare, unnested selector silently fails to match the host).
      → verified by the recorded computation + `npx sass` compiling
      `projects/abbos/src/lib/components/form/input/input.scss` without error (confirms the
      selector/rule exists as specified) + `ng build abbos` (confirms the stylesheet compiles as
      part of the component)

### Security — appended by aidd-security under Article IX
- [x] AC-S1: `AbInput`'s implementation contains no `innerHTML`/`outerHTML` binding, no
      `bypassSecurityTrust*` call, and does not read or transform the input's `value` in TS —
      the directive is host-attribute-and-CSS only, so it introduces no new DOM sink and no
      new autofill/autocomplete behavior beyond what the native `<input>` already has
      → verified by `grep -nE "innerHTML|outerHTML|bypassSecurityTrust" projects/abbos/src/lib/components/form/input/input.ts`
      returning no matches, checked at the code-reviewer gate
- Conclusion: no further security surface. `type`, `autocomplete`, and `name` remain fully
  under the consumer's control, exactly as with a plain `<input>` — `AbInput` neither adds nor
  removes autofill/autocomplete behavior.

### Coverage / testability — appended by aidd-qa under Article IX
- [x] AC-Q1: Every AC-F and AC-U criterion above that names a test has a test that fails
      before the corresponding implementation task and passes after
      → verified by re-running `ng test abbos --include "**/components/form/input/**/*.spec.ts" --watch=false` before/after each task per the plan
- [ ] AC-Q2 (amended 2026-08-04, regressed): `ng test abbos` (full suite) no longer stays green —
      `AbThemeService`/config specs still pass, but `input.spec.ts` now fails 7 of 12 tests (the
      AC-F3/AC-F4 data-attribute assertions above). Confirmed 2026-08-04: `ng test abbos
      --watch=false` → 3 test files, 1 failed, 9 passed / 7 failed of 16 tests. `ng build abbos`
      still succeeds.
      → currently failing; see AC-F3/AC-F4 open item

## Artifacts

**Amended 2026-08-04** — this table now reflects what actually shipped, not the 2026-08-01 plan:

| Path | Change | New or modified |
|---|---|---|
| `projects/abbos/src/lib/components/form/input/input.ts` | `@Component`, class `Input` → `AbInput`, `template: ''`, add `size`/`shape`/`invalid` inputs + host class bindings (kept `@Component`, reversing the `@Directive` conversion originally planned) | Modified |
| `projects/abbos/src/lib/components/form/input/input.html` | Deleted (empty template inlined as `template: ''` on the `@Component` instead) | Deleted |
| `projects/abbos/src/lib/components/form/input/input.scss` | New Component `styleUrl` (not `input.css`, not a global partial) — token-driven styles for size/shape/state, all rules nested inside `:host { … }` (required for `ViewEncapsulation.Emulated` to match the host — see ADR-0001's amendment) | New (replaces deleted `input.css`) |
| `projects/abbos/src/lib/components/form/input/input.spec.ts` | Coverage for AC-F/AC-U — still asserts `data-size`/`data-shape` per the original AC-F3/AC-F4 wording, which the shipped class-based implementation does not satisfy (see AC-F3/AC-F4) | Modified |
| `projects/abbos/src/lib/components/index.ts` | Barrel re-exporting `AbInput` | New |
| `projects/abbos/src/public-api.ts` | Re-export `./lib/components` | Modified |
| `projects/playground/src/app/pages/input-demo/input-demo.ts` | Demo route (`/input`) rendering `<input ab-input>` across size/shape/state combinations | New |
| `projects/playground/src/app/app.routes.ts` | Registers the `/input` lazy route | Modified |

Not delivered from the original table: no global Sass partial or `components` mixin (moot —
styles ship via `styleUrl`, not forwarded through `_index.scss`); no nav link added to
`app.html`/`app.ts` (the demo is reachable only by navigating to `/input` directly); `CLAUDE.md`
and `PROJECT-CONTEXT.md` were not updated as part of this amendment — both still describe
`AbInput` as a Directive with `data-*` attribute reflection, which is now inaccurate. Flagged,
not fixed here (out of scope — this amendment only touches this spec, its plan, and ADR-0001).

## Constraints

- No `variant` input this run — `[NEEDS CLARIFICATION: what variant values apply to AbInput
  (e.g. outline vs filled)? No design source available in this repo.]` (see architecture doc).
  Does not block any criterion above.
- No automated axe-core/browser-based a11y testing introduced this run (no such tooling exists
  in the repo yet). AC-U criteria are verified by unit-test attribute/class assertions plus
  manually computed WCAG contrast ratios against the exact token hex values, recorded above.
  Backlogged: wire real axe tooling into the Vitest suite.
- Must not change `--ab-*` token names in `projects/abbos/src/lib/assets/styles/tokens/`
  (protected boundary, `PROJECT-CONTEXT.md`). Any derived color (e.g. an invalid-state focus
  ring) is computed inline in the component stylesheet with `color-mix()`, not added as a new
  global token.
- Must not implement the `abStart`/`abEnd` projected-adornment API described elsewhere in
  CLAUDE.md — out of scope, a different component (see architecture doc).
- `.aidd-active` verify command for this run only:
  `npx prettier --check "projects/abbos/src/lib/components/**" && ng build abbos && ng test abbos`
  — **not** the repo-wide `npx prettier --check .` from `PROJECT-CONTEXT.md`. That command
  currently fails on 145 pre-existing files unrelated to this change (confirmed by running it
  before any edits). Fixing repo-wide formatting is out of scope (Article III) and is
  backlogged for `aidd-devops`/a follow-up run; scoping the check to files this run touches is
  what keeps the verify command honest per Article II without silently expanding the diff.

## Dependencies

None blocking. Prerequisite work discovered during gap analysis (not scope creep — the spec
assumed these existed):
- `projects/abbos/src/lib/components/index.ts` barrel does not exist yet (only
  `services`/`config`/`constants` have one) — created as part of this run.
- `ReactiveFormsModule`/`@angular/forms` is already a project dependency (confirmed in
  `package.json`), so AC-F6/AC-F7 need no new dependency.

## Open questions
- [NEEDS CLARIFICATION: `variant` values for AbInput] — blocks: nothing in this spec. Backlog.
- [NEEDS CLARIFICATION 2026-08-04: should `AbInput` also emit `data-size`/`data-shape`
  attributes to satisfy AC-F3/AC-F4/`input.spec.ts` as originally written, or should the tests
  and spec be brought in line with the shipped `ab-input_{size}`/`ab-input_{shape}` classes?] —
  blocks: AC-F3, AC-F4, AC-Q2 staying green. Not resolved by this amendment.

---
## Freeze record
Frozen at: 2026-08-01T09:06:58Z
Criteria count at freeze: 16 (AC-F1–F7, AC-U1–U5, AC-S1, AC-Q1–Q2)
From this point, Article V applies. New findings → BACKLOG.md.

## Amendment (2026-08-04)
`AbInput` was directed to remain a `@Component` rather than become a `@Directive` as this spec
originally required, and its `styleUrl` stylesheet needed a `:host`-scoping fix (bare class
selectors under `ViewEncapsulation.Emulated` never matched the host, so no styles rendered at
all — see ADR-0001's amendment for the mechanism). This amendment updates AC-F2, AC-F3, AC-F4,
AC-U5, AC-Q2, the Target state, and the Artifacts table in place to describe what is actually in
the repo, adds AC-F8 for the `invalid` input that was added without a corresponding criterion,
and records one unresolved open question above (the `data-size`/`data-shape` vs. class mismatch
between this spec and `input.spec.ts`). AC-F1, AC-F5–F7, AC-U1–U4, AC-S1, AC-Q1 are unaffected
and still hold as originally verified.
