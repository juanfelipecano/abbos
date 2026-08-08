# Implementation Plan — ab-button

Spec: specs/ab-button/spec.md
Iteration: Iter-1
Verify (per-task, scoped): `npx prettier --check "projects/abbos/src/lib/components/button/**" && ng build abbos && ng test abbos --include "**/components/button/**/*.spec.ts" --watch=false`
Verify (final, task 9): same command (21/21 passed), plus a recorded (non-gating) run of the
repo-wide `ng test abbos --watch=false` for transparency (see spec.md AC-Q2).
Status: DONE — all tasks complete, all 22 criteria met, scoped verify green.

## Tasks

- [x] 1. Walking skeleton: `AbButton` component, selector `button[ab-button]`, full template
      (spinner + `abStart`/`abEnd` slots + default outlet built directly, not staged —
      cheaper than a two-pass skeleton for a component this size), `variant`/`size`/`shape`/
      `loading`/`disabled` inputs, host bindings, barrel export.
      → `projects/abbos/src/lib/components/button/button.ts`,
        `projects/abbos/src/lib/components/button/button.spec.ts`,
        `projects/abbos/src/lib/components/index.ts`
      → `ng build abbos` — clean. `ng test abbos --include "**/components/button/**/*.spec.ts" --watch=false`
      — initially 0/21 passed (`NG0201: No provider found for InjectionToken ControlSize` —
      see spec.md Amendment #1); fixed by adding `CONTROL_SIZE`/`CONTROL_SHAPE` TestBed
      providers → 21/21 passed
- [x] 2. `variant`/`size`/`shape` inputs with defaults, reflected as
      `ab-button_{variant}`/`ab-button_{size}`/`ab-button_{shape}` host classes; one test
      per value (6 + 3 + 3) plus a defaults test
      → `button.ts`, `button.spec.ts` (done together with task 1, see above)
      → same verify command — included in the 21/21 above
- [x] 3. Token-driven styles: base layout, per-variant color mapping (6 variants), `:hover`,
      `:active` (+ `scale(0.98)`), `:focus-visible`, `:disabled`, all nested inside
      `:host { … }`. **Discovered while writing this task** (not part of the original plan
      text): the raw `--ab-primary`/`--ab-danger` + white-text pairing fails WCAG AA text
      contrast in light theme (see spec.md AC-U6/AC-U7) — fixed with component-local
      `color-mix()` derivations, `primary`'s reverted to the raw tokens in dark theme via
      `:host-context([data-ab-theme='dark'])` since the raw pairing already passes there.
      → `button.scss`
      → `npx sass projects/abbos/src/lib/components/button/button.scss` compiles clean
      (verified standalone before wiring into the component); `ng build abbos` compiles the
      full component clean
- [x] 4. `abStart`/`abEnd` projected icon slots + CSS collapse when empty; tests asserting
      projected content renders inside the slot and an unused slot renders no element
      → `button.ts`, `button.scss`, `button.spec.ts` (done together with task 1)
      → same verify command — included in the 21/21 above
- [x] 5. `loading` input: conditional spinner, `aria-busy`, forces `disabled`, hides icon
      slots while loading; `disabled` input; spinner keyframes
      → `button.ts`, `button.scss`, `button.spec.ts` (done together with task 1)
      → same verify command — included in the 21/21 above. **Discovered here** (see spec.md
      Amendment #2): a wrapper-host + plain-field test pattern flaked on a second
      `detectChanges()` call; rewritten to construct `AbButton` directly and drive it via
      `fixture.componentRef.setInput()`
- [x] 6. `type` non-interference check (AC-F9)
      → n/a (verification only)
      → `grep -nE "'\[attr\.type\]'|type:" projects/abbos/src/lib/components/button/button.ts`
      → no matches, exit 1. AC-F9 confirmed.
- [x] 7. Security grep check (AC-S1)
      → n/a (verification only)
      → `grep -nE "innerHTML|outerHTML|bypassSecurityTrust" projects/abbos/src/lib/components/button/button.ts`
      → no matches, exit 1. AC-S1 confirmed.
- [x] 8. TSDoc accessibility note (AC-U1, written as part of task 1) + doc updates:
      `CLAUDE.md`'s `AbButton` bullet, `PROJECT-CONTEXT.md`'s "Known debt" table (added the
      `AbInput` test-suite finding from Amendment #1 as its own row), `BACKLOG.md` append
      (`fullWidth` deferral, host-reflection follow-up, contrast-accents-not-exhaustive,
      `AbIconButton` still unbuilt, the corrected `AbInput` 12/12-failure finding)
      → `button.ts`, `CLAUDE.md`, `PROJECT-CONTEXT.md`, `BACKLOG.md`
      → manual review (AC-U1); `ng build abbos` still green
- [x] 9. Playground demo: `/button` route (lazy-loaded `ButtonDemo`) covering
      variant × size × shape × icon × loading × disabled combinations. **Discovered here**
      (see spec.md Amendment #4): the first version's loading toggle deadlocked (loading
      forces disabled, so the triggering button could never be clicked again) — fixed with a
      `setTimeout` auto-reset. **Also discovered here** (Amendment #3): formatting
      `app.routes.ts` with `prettier --write` reformatted the whole pre-existing file's
      indentation as a side effect; reverted to a minimal hand-written diff.
      Full-suite regression run (scoped gate + recorded repo-wide run per AC-Q2).
      → `projects/playground/src/app/pages/button-demo/button-demo.ts`,
        `projects/playground/src/app/app.routes.ts`
      → `ng build playground` clean (button-demo lazy chunk present); `ng test playground
      --watch=false` — 1 pre-existing failure (`app.spec.ts`'s "should render title", traced
      to the `ab-input` run's `app.html` reduction to a bare `<router-outlet />`, confirmed
      via `git log`/`git diff HEAD` to predate this run — not fixed here, out of scope);
      scoped verify command 21/21 passed; recorded repo-wide `ng test abbos --watch=false` —
      12 failed / 25 passed across 4 files (all 12 failures pre-existing in `input.spec.ts`,
      see spec.md AC-Q2 and `BACKLOG.md`)

## Criteria coverage

| Criterion | Covered by task | Status |
|---|---|---|
| AC-F1 | 1 | met |
| AC-F2 | 1 | met |
| AC-F3 | 2 | met |
| AC-F4 | 2 | met |
| AC-F5 | 2 | met |
| AC-F6 | 4 | met |
| AC-F7 | 5 | met |
| AC-F8 | 5 | met |
| AC-F9 | 6 | met |
| AC-U1 | 8 | met |
| AC-U2 | 3 | met (math reused from `ab-input`; no manual keyboard pass — see Constraints) |
| AC-U3 | 3, 5 | met |
| AC-U4 | 5 | met |
| AC-U5 | 3 | met |
| AC-U6 | 3 | met |
| AC-U7 | 3 | met |
| AC-S1 | 7 | met |
| AC-Q1 | 1–5 (each task's verify is the before/after proof) | met |
| AC-Q2 | 9 | met |

All 22 criteria met. Every criterion has at least one task; every task covers at least one
criterion except task 9's demo-page portion (the mandatory "run it" check for UI changes,
not itself an AC) and tasks 6–7 (verification-only steps for AC-F9/AC-S1).

## Attempt log

No criterion required more than one attempt. Four issues were found and fixed during
implementation (see spec.md's "Amendment (2026-08-05)" for full detail) — none required a
second attempt at the same criterion, an architect spec patch, or an iteration bump:

1. Missing `CONTROL_SIZE`/`CONTROL_SHAPE` TestBed providers (test-only, task 1) — fixed same
   task, first attempt.
2. Wrapper-host signal-input test flake (test-only, task 5) — root-caused and fixed same
   task, first attempt.
3. `prettier --write` reformatting all of `app.routes.ts` (tooling side effect, task 9) —
   caught at code review, reverted to a minimal diff, first attempt.
4. Playground demo loading/disabled deadlock (demo-only, task 9) — fixed same task, first
   attempt.

## Escalations
None. No criterion failed three times; no architect spec patch was needed.

## Retrospective

**What went well**: the frozen spec held for every functional/security criterion without a
patch. The one real design gap found mid-run (WCAG AA text contrast on `primary`/`danger`
against white text) was caught *during* implementation, before any code shipped, by doing
the contrast math the constitution requires (Article IX) rather than copying the reference
implementation's colors on faith — and was fixed locally (component-scoped `color-mix()`)
without touching a global token, keeping Article III's minimum-diff bar intact even for an
accessibility fix.

**What was expensive**: the signal-input test flake (Amendment #2) cost real debugging time
— five throwaway repro files — before landing on `setInput()`. Worth codifying as a stated
convention rather than rediscovering it on the next component.

**Instruction fixes** (Article XII — the compounding part):

| Document | Change | Applied |
|---|---|---|
| `.claude/skills/aidd/aidd-implementer/references/testing-practice.md` (or equivalent) | No existing guidance says "drive a signal `input()` under test via `fixture.componentRef.setInput()`, not a wrapper host's plain-field rebinding" — this run had to rediscover that the wrapper-host pattern can silently fail to propagate on a second CD pass. A one-line rule here would save the next component the same five-file investigation. | Not applied — flagging for a human decision, since editing the shared AIDD skill files affects every future run, not just this one |
| `PROJECT-CONTEXT.md` | Now records (this run) that `input.spec.ts` fails all 12 of its tests, not 7 of 12, and why — closes the gap between what `specs/ab-input/spec.md` claimed and the actual current state, so the next run doesn't have to re-derive it | Applied — see `PROJECT-CONTEXT.md`'s "Known debt" table |
| `.prettierrc` / repo formatting debt | Confirmed again (independently of `ab-input`'s finding) that a `prettier --write` on any pre-existing file outside the touched-file scope will silently reformat it wholesale, because the repo's real effective config (via `.editorconfig`) doesn't match a lot of existing files. Same backlog item as `ab-input`'s, now with a second, concrete near-miss attached | Not applied — repeats the existing `BACKLOG.md` item, no new action needed beyond what's already tracked |

**Not a fix, a flag**: this run discovered a real, previously-undocumented accessibility
defect in the `--ab-primary`/`--ab-text-on-primary` and `--ab-danger` token pairings
(AC-U6/AC-U7) that predates this run and is not `AbButton`-specific — it will resurface for
any future component that puts white text directly on either token's raw value. Filed in
`BACKLOG.md`; worth the design-system owner's attention independent of this feature.
