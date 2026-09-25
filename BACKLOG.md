# Backlog

Findings discovered during AIDD runs that are out of scope for the run that found them
(Article V — frozen scope). Not reopened without a new run.

## From `specs/ab-input/` (2026-08-01)

- **`AbInput` `variant`**: no values defined — `[NEEDS CLARIFICATION]` in
  `specs/ab-input/spec.md`. Needs the sibling `AbbosDesignSystem` React repo consulted (not
  available in this repo) before inventing values.
- **Automated a11y testing**: no `axe-core`/browser-based testing exists in the repo. AC-U
  criteria for `ab-input` were verified by hand-computed WCAG contrast ratios instead. Worth
  wiring real tooling into the Vitest suite once a second component needs the same checks.
- **Repo-wide Prettier debt**: `npx prettier --check .` (the verify command in
  `PROJECT-CONTEXT.md`) fails on ~145 pre-existing files unrelated to any single feature
  (confirmed before any `ab-input` work began). The `ab-input` run scoped its verify command
  to the paths it touched instead. A repo-wide `npx prettier --write .` pass (reviewed, in its
  own commit) would unblock using the literal `PROJECT-CONTEXT.md` verify command going
  forward.
- **`CLAUDE.md` stale content beyond the `AbInput` line** (not touched this run, out of scope):
  refers to `projects/playwright` — the actual directory is `projects/playground`. Says
  `.editorconfig: 2-space indentation everywhere` — actual is 4-space (`.editorconfig`'s
  `[*]` `indent_size = 4`, which Prettier respects by default since Prettier 2.0; confirmed by
  running `prettier --check` against known-good vs. known-stale files). Refers to
  `src/lib/styles/tokens/` — actual path is `src/lib/assets/styles/tokens/`.
- **Uncommitted staged pile**: at the start of this run, nearly the entire repo (`CLAUDE.md`,
  all of `projects/abbos/src/lib/`, `.claude/skills/`, etc.) was already `git add`-ed but never
  committed — `git log` shows only 2 commits, neither containing most of this content. Not
  something this run created or should resolve; flagged to the user directly, noted here so a
  future session doesn't mistake it for something new.

## From `specs/ab-button/` (2026-08-05)

- **`fullWidth` input**: present in the discovered reference implementation
  (`/Users/juano/Docs/Projects/abbos.old`) but not requested by the user or documented in
  `CLAUDE.md`'s shared vocabulary for `AbButton` — deliberately not implemented this run
  (Article III). Add if a real consumer needs it.
- **Host-reflection mechanism follow-up**: `AbButton` reflects `variant`/`size`/`shape` as
  `:host`-scoped BEM classes, matching `AbInput` as shipped rather than the `data-*`
  attributes the discovered reference implementation and `CLAUDE.md`'s pre-2026-08-04 prose
  used. If `AbInput`'s own open `data-*`-vs-class question (below) is ever resolved toward
  `data-*` attributes, revisit `AbButton` in the same pass — see ADR-0002.
- **Contrast fix not exhaustively verified across accents**: `AbButton`'s `primary`/`danger`
  variants were hand-computed for WCAG AA text contrast (4.5:1) only for the default
  `emerald` accent, both themes (see `specs/ab-button/spec.md` AC-U6). The four alternate
  accents (indigo/blue/amber/mono) were not hand-computed — the `primary` variant's
  dark-theme override in particular depends on the accent's `--ab-primary-contrast`
  polarity (light vs. dark ink), which `mono`'s dark-theme block deliberately flips. Worth a
  pass once real contrast-checker tooling exists (see the pre-existing a11y-tooling item
  below).
- **`AbIconButton`**: documented in `CLAUDE.md`, present in the reference implementation,
  still not built. Out of scope for the `ab-button` run, which only covered `AbButton`.
- **`AbInput`'s test suite actually fails all 12 of its tests, not 7 of 12**: confirmed
  2026-08-05 via `ng test abbos --watch=false` (12 failed / 25 passed across 4 spec files;
  all 12 failures are in `input.spec.ts`). `specs/ab-input/spec.md`'s AC-F3/AC-F4/AC-Q2
  narrative (7 of 12 failing, due to a `data-size`/`data-shape`-vs-class mismatch) is now
  stale — the actual failure for every test in that file is `NG0201: No provider found for
InjectionToken ControlSize`. Root cause: at some point after that spec's last recorded
  amendment, `input.ts` started injecting `CONTROL_SIZE`/`CONTROL_SHAPE` (see
  `AbInput.size`/`.shape` defaults) with no default value and no `optional: true`, and
  `input.spec.ts`'s `TestBed.configureTestingModule` calls were never updated to provide
  either token — every test now throws before its first assertion runs, including the ones
  that would otherwise still pass the original data-attribute-vs-class question. The
  `data-*`-vs-class mismatch itself is presumably still real underneath this (unverifiable
  until the DI error is fixed) but is no longer the actual, currently-observed failure
  mode. Fix (out of scope for the `ab-button` run that found it): add
  `{ provide: CONTROL_SIZE, useValue: 'md' }, { provide: CONTROL_SHAPE, useValue: 'round' }`
  to `input.spec.ts`'s `TestBed` configs — `button.spec.ts` already does this and its
  20-test suite is fully green.

## From architecture (`/Users/juano/Docs/Projects/Apollo/Projects/Abbos/Architecture/AbInput Architecture.md`)

- **`CONTROL_SIZE`/`CONTROL_SHAPE` DI tokens** (`src/lib/config/tokens.ts`) remain unused.
  They imply a parent (e.g. a future form-field wrapper) broadcasting size/shape defaults to
  children. `AbInput` takes `size`/`shape` as plain `input()`s for now. Revisit once a second
  consumer of those tokens exists.
- **Wrapper-based `<ab-input>`** with projected `abStart`/`abEnd` adornments (icons, etc.) —
  described in `CLAUDE.md` before this run, not implemented by the `input[ab-input]`
  directive. A distinct future component, not a variant of this one.

## From `specs/ab-switch/` (2026-08-05)

- **`AbSwitch`'s shared `'round'` default doesn't read as a full-pill switch shape**: reusing
  the library-wide `AbControlShape` (square/round/circle) for `AbSwitch`'s track means the
  design-system-wide default (`'round'` → `--ab-radius-control`, 8px) renders as a rounded
  rectangle, not the conventional full-pill toggle shape — only `shape="circle"` produces
  that. Recorded as an accepted trade-off in `/Users/juano/Docs/Projects/Apollo/Projects/Abbos/Architecture/AbSwitch Architecture.md`
  ("Decision — `shape` included, mapped to track border-radius") rather than solved by
  guessing at a better default. Worth a design review: either change `provideAbbos`'s
  default `controlShape` globally, or give `AbSwitch` its own component-local default-shape
  override (`input<AbControlShape>('circle')` instead of injecting `CONTROL_SHAPE`).
- **`AbControlShape`/`AbControlSize` are not part of `@juanfelipecano/abbos`'s public TS
  surface**: `public-api.ts` re-exports `./lib/components`, `./lib/services`, and
  `./lib/abbos-config-provider`, never `./lib/constants`; no component re-exports these two
  types locally either (unlike `AbButtonVariant`, which `button.ts` both defines and
  exports). Confirmed 2026-08-05 — `switch-demo.ts`'s first draft imported both from `'abbos'`
  to type a looped array of demo values, and `ng build playground` failed with `TS2459`.
  Worked around in the demo (`as const` literal arrays instead of the named types) rather
  than expanding `public-api.ts` (protected boundary) with no criterion asking for it. Also
  now recorded in `PROJECT-CONTEXT.md`'s Known debt table. Fix, if someone wants it: add
  `export * from './lib/constants';` to `public-api.ts`.
- **Signal-input test flake recurred a second time**: `ab-button`'s Amendment #2
  (`specs/ab-button/spec.md`) root-caused a TestBed pattern where a plain (non-signal) field
  mutated on a wrapper host and rebound via a template binding does not reliably propagate to
  a child component's signal `input()` on the _second_ `detectChanges()` call, while
  `fixture.componentRef.setInput()` always works. This run (`ab-switch`) independently hit
  the exact same failure mode on its size/shape/disabled tests before knowing to avoid it.
  `ab-button`'s own retrospective already recommended adding this as a stated convention in
  the AIDD implementer's shared testing guidance; still not done. Now blocked on a human
  decision to edit `.claude/skills/aidd/aidd-implementer/` (shared skill files, out of scope
  for any single component run to change unilaterally) — recommend doing it before a third
  component rediscovers this the same way.
- **Manual keyboard-tab pass still not done**: `AbSwitch`'s `:focus-visible` contrast
  (AC-U4/AC-U7) reuses `ab-input`/`ab-button`'s already-verified computation rather than a
  live browser check — same "no headless-browser tool available this run" limitation both
  prior specs recorded. Still open, not `AbSwitch`-specific.
- **`AbIconButton`**: documented in `CLAUDE.md`, present in the reference implementation
  (`abbos.old`), still not built. Out of scope for the `ab-switch` run, which only covered
  `AbSwitch`.

## From `specs/date-picker/` (2026-09-25)

- **Visual and AXE verification not done**: the date picker was verified by unit tests and builds
  only. It has not been opened in a browser, and AXE was not run (see the automated a11y item
  above). Overlay stacking, the focus trap and the flip in a real viewport need a manual pass in
  the playground, in light and dark and with each accent.
- **UI strings are English constants**: "Clear", "Cancel", "Apply", "Choose date",
  "Previous month", "today", "unavailable". Needs a labels input or provider before the library
  is localised. Month and weekday names already follow `locale`.
- **No `AbIconButton`**: the design uses an icon button for the calendar steps. The calendar uses
  its own styled buttons instead. Replace them once `AbIconButton` exists.
- **Playground initial bundle** was already over budget (644 kB against 500 kB) and grew by about
  30 kB with the date picker thumbnail. Worth checking what the thumbnail pulls into `main`.
- **Design file and `AbCalendar` disagree on `min`**: the design demos disable past dates in the
  dropdown only. The component has no default `min`, by design.
