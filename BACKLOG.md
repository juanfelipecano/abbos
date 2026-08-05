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

## From architecture (`docs/architecture/architecture.md`)

- **`CONTROL_SIZE`/`CONTROL_SHAPE` DI tokens** (`src/lib/config/tokens.ts`) remain unused.
  They imply a parent (e.g. a future form-field wrapper) broadcasting size/shape defaults to
  children. `AbInput` takes `size`/`shape` as plain `input()`s for now. Revisit once a second
  consumer of those tokens exists.
- **Wrapper-based `<ab-input>`** with projected `abStart`/`abEnd` adornments (icons, etc.) —
  described in `CLAUDE.md` before this run, not implemented by the `input[ab-input]`
  directive. A distinct future component, not a variant of this one.
