# Implementation Plan — ab-switch

Spec: specs/ab-switch/spec.md
Iteration: Iter-1
Verify (per-task, scoped): `npx prettier --check "projects/abbos/src/lib/components/switch/**" && ng build abbos && ng test abbos --include "**/components/switch/**/*.spec.ts" --watch=false`
Verify (final, task 7): same command (17/17 passed), plus a recorded (non-gating) run of the
repo-wide `ng test abbos --watch=false` and `ng test playground --watch=false` for
transparency (see spec.md AC-Q2).
Status: DONE — all tasks complete, all 19 criteria met, scoped verify green.

## Tasks

- [x] 1. Walking skeleton: `AbSwitch` component, selector `ab-switch`, full template (label +
      button[role=switch] + knob + default projection outlet built directly, not staged —
      cheaper than a two-pass skeleton for a component this size), `checked` model,
      `size`/`shape`/`disabled`/`ariaLabel` inputs, host class bindings, barrel export.
      → `projects/abbos/src/lib/components/switch/switch.ts`,
        `projects/abbos/src/lib/components/switch/switch.spec.ts`,
        `projects/abbos/src/lib/components/index.ts`
      → `ng build abbos` — clean. `ng test abbos --include "**/components/switch/**/*.spec.ts" --watch=false`
      — initially 12/17 passed, 5 failed (see spec.md Amendment #1: wrapper-host + plain-field
      test pattern flake on size/shape/disabled tests); fixed by constructing `AbSwitch`
      directly and driving inputs via `setInput()` → 17/17 passed
- [x] 2. `ControlValueAccessor`: `writeValue`/`registerOnChange`/`registerOnTouched`/
      `setDisabledState`, `NG_VALUE_ACCESSOR` provider; `size`/`shape` DI-token defaults
      reflected as host classes
      → `switch.ts`, `switch.spec.ts` (done together with task 1, see above)
      → same verify command — included in the 17/17 above
- [x] 3. Token-driven styles: track/knob sizing per `size`, border-radius per `shape`, checked
      vs. unchecked track color + knob position, `:focus-visible`, `:disabled`, all nested
      inside `:host { … }`
      → `switch.scss`
      → `npx sass` (via the scoped prettier+build+test command) compiles clean; `ng build
      abbos` compiles the full component clean
- [x] 4. `ariaLabel` passthrough to the inner button; TSDoc accessibility note (AC-U2)
      → `switch.ts` (done together with task 1)
      → same verify command — included in the 17/17 above
- [x] 5. Security grep check (AC-S1)
      → n/a (verification only)
      → `grep -nE "innerHTML|outerHTML|bypassSecurityTrust" projects/abbos/src/lib/components/switch/switch.ts`
      → no matches, exit 1. AC-S1 confirmed.
- [x] 6. Doc updates: `CLAUDE.md`'s `AbSwitch` bullet, `PROJECT-CONTEXT.md`'s "Known debt"
      table, `BACKLOG.md` append (default-shape trade-off, `AbControlShape`/`AbControlSize`
      not publicly exported, signal-input test flake — second occurrence)
      → `CLAUDE.md`, `PROJECT-CONTEXT.md`, `BACKLOG.md`
      → manual review (AC-U2 already covered by task 1); `ng build abbos` still green
- [x] 7. Playground demo: `/switch` route (lazy-loaded `SwitchDemo`) covering size × shape ×
      `[(checked)]` × Reactive Forms × disabled × `ariaLabel` combinations. **Discovered
      here** (see spec.md Amendment #2): the first version imported `AbControlShape`/
      `AbControlSize` from `'abbos'` to type the demo's looped arrays — neither is part of
      the library's public TS surface (`public-api.ts` never re-exports `./lib/constants`),
      so `ng build playground` failed with `TS2459`. Fixed by typing the demo's arrays with
      `as const` instead of the named types, no public-API change. Full-suite regression run
      (scoped gate + recorded repo-wide run per AC-Q2).
      → `projects/playground/src/app/pages/switch-demo/switch-demo.ts`,
        `projects/playground/src/app/app.routes.ts`
      → `ng build playground` clean (switch-demo lazy chunk present, 2.42 kB); `ng test
      playground --watch=false` — 1 pre-existing failure (`app.spec.ts`'s "should render
      title", already recorded in `specs/ab-button/plan.md` task 9 as predating this run —
      not fixed here, out of scope); scoped verify command 17/17 passed; recorded repo-wide
      `ng test abbos --watch=false` — 12 failed / 42 passed across 5 files (all 12 failures
      pre-existing in `input.spec.ts`, see spec.md AC-Q2 and `BACKLOG.md`)

## Criteria coverage

| Criterion | Covered by task | Status |
|---|---|---|
| AC-F1 | 1 | met |
| AC-F2 | 1 | met |
| AC-F3 | 1, 2 | met |
| AC-F4 | 2 | met |
| AC-F5 | 2 | met |
| AC-F6 | 1, 2 | met |
| AC-F7 | 1, 2 | met |
| AC-F8 | 1, 2 | met |
| AC-F9 | 1 | met |
| AC-U1 | 1 | met |
| AC-U2 | 4 | met |
| AC-U3 | 4 | met |
| AC-U4 | 3 | met (math reused from `ab-input`; no manual keyboard pass — see Constraints) |
| AC-U5 | 2, 3 | met |
| AC-U6 | 3 | met |
| AC-U7 | 3 | met |
| AC-S1 | 5 | met |
| AC-Q1 | 1–4 (each task's verify is the before/after proof) | met |
| AC-Q2 | 7 | met |

All 19 criteria met. Every criterion has at least one task; every task covers at least one
criterion except task 6 (doc updates, not itself an AC) and task 7's demo-page portion (the
mandatory "run it" check for UI changes, not itself an AC).

## Attempt log

No criterion required more than one attempt. Two issues were found and fixed during
implementation (see spec.md's "Amendment (2026-08-05)" for full detail) — neither required a
second attempt at the same criterion, an architect spec patch, or an iteration bump:

1. Wrapper-host signal-input test flake on size/shape/disabled tests (test-only, task 1) —
   root-caused (same known cause as `ab-button`'s Amendment #2) and fixed same task, first
   attempt.
2. `AbControlShape`/`AbControlSize` not publicly exported, breaking the demo's first draft
   (demo-only, task 7) — fixed same task, first attempt, no public-API change made.

## Escalations
None. No criterion failed three times; no architect spec patch was needed.

## Retrospective

**What went well**: the frozen spec held for every functional/security/accessibility
criterion without a patch. Reusing `ab-input`'s already-verified `--ab-primary`/`--ab-surface`
contrast computation for both the focus ring (AC-U4) and the checked-state track fill
(AC-U7) avoided redoing math that was already correct and already recorded — a real instance
of the compounding benefit Article XII describes, this time paying off across three specs
instead of just two.

**What was expensive**: the wrapper-host signal-input test flake (Amendment #1) is now the
*second* time this exact pattern has cost real debugging time in this library
(`ab-button`'s Amendment #2 was the first). `ab-button`'s own retrospective already flagged
that no shared AIDD reference doc states "drive a signal `input()` under test via
`fixture.componentRef.setInput()`, not a wrapper host's plain-field rebinding" — that
instruction fix still was not applied before this run rediscovered the same thing. Recorded
again here, more strongly, since it has now recurred.

**Instruction fixes** (Article XII — the compounding part):

| Document | Change | Applied |
|---|---|---|
| `.claude/skills/aidd/aidd-implementer/` (testing guidance) | Still no shared rule stating the `setInput()`-over-wrapper-host convention for signal inputs under test, despite this being the *second* run that independently rediscovered it (`ab-button`, now `ab-switch`). Recommend a human add this before a third component pays the same cost. | Not applied — same reason `ab-button`'s retrospective gave: editing shared AIDD skill files affects every future run, and is a human call, not this run's to make unilaterally |
| `CLAUDE.md` | `AbSwitch` bullet updated from "not yet implemented" to the shipped API (selector, model, CVA, size/shape/disabled/ariaLabel) | Applied |
| `PROJECT-CONTEXT.md` | "Known debt" Components row updated — `AbSwitch` now exists; `AbControlShape`/`AbControlSize` not being part of the public TS surface noted as a new, real gap (not previously documented anywhere) | Applied |
| `BACKLOG.md` | Appended: default-shape visual trade-off, `AbControlShape`/`AbControlSize` public-export gap, second occurrence of the signal-input test flake | Applied |

**Not a fix, a flag**: the default-shape trade-off (`AbSwitch`'s shared `'round'` default not
reading as a conventional full-pill switch) is a genuine design question outside this run's
authority to resolve unilaterally — recorded in the architecture doc and `BACKLOG.md` for a
design review, not silently "fixed" by guessing at a better default.
