# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Workspace structure

This is an Angular CLI workspace (v22) with two projects under `projects/`:

- **`projects/abbos`** — a publishable Angular library (`projectType: library`, prefix `ab`), published as `@juanbetancur/abbos`. Built with `@angular/build:ng-packagr` into `dist/abbos`. Public API is re-exported from `projects/abbos/src/public-api.ts` — any symbol meant to be consumed externally must be exported there.
- **`projects/playwright`** — an Angular application (`projectType: application`, prefix `app`) that consumes/exercises the `abbos` library as a component showcase. Despite the name, it is a standard Angular app shell (routing via `app.routes.ts`, standalone `ApplicationConfig` in `app.config.ts`), not a Playwright test setup. It imports library TS from `abbos` (tsconfig path → `dist/abbos`, so `ng build abbos` must run first) and library Sass from source via `@use '../../abbos/src'`.

The library implements the **Abbos Design System** (design source of truth: the sibling `AbbosDesignSystem` repo, authored with Claude Design in React; this is the Angular port):

- **Tokens**: SCSS partials under `projects/abbos/src/lib/styles/tokens/` emit CSS custom properties, all prefixed `--ab-` (e.g. `--ab-primary`, `--ab-space-4`, `--ab-radius-control`). Components consume only semantic tokens (`var(--ab-*)`), never raw values.
- **Theming**: dark mode keys off `[data-ab-theme='dark']`, alternate accents (indigo/blue/amber/mono; emerald is the default) off `[data-ab-accent='…']` — both on `<html>`, managed by `AbThemeService` (signal-based; also supports runtime token overrides via `setCustomTokens`). The Sass API (`_index.scss`) exposes the `core` (all tokens), `base`, `fonts`, and `custom-theme($map)` mixins.
- **Components**: `AbButton` (`button[ab-button]`, implemented — a `@Component` with a real
  template: projected label content plus `abStart`/`abEnd` icon slots and a conditional
  loading spinner; variant `'primary' | 'secondary' | 'soft' | 'outline' | 'ghost' | 'danger'`
  (default `'primary'`), `size`/`shape` default from the injected `CONTROL_SIZE`/
  `CONTROL_SHAPE` tokens, all three reflected as `ab-button_{value}` host classes nested
  under `:host` in `button.scss` — not `data-*` attributes; see
  `docs/architecture/adr/0002-abbutton-component-with-content-projection.md`), `AbIconButton`
  (`button[ab-icon-button]`, requires `label`, not yet implemented), `AbInput`
  (`input[ab-input]` — a `@Component` with an intentionally empty template (not a
  `Directive`), since a native `<input>` can't have its own view; renders no label and takes
  no `ControlValueAccessor`, relying entirely on Angular's own `DefaultValueAccessor`, see
  ADR-0001's 2026-08-04 amendment), `AbSwitch` (`ab-switch`, implemented — a `@Component`
  wrapping a `<label>` + native `<button type="button" role="switch">` + decorative knob
  (native keyboard/focus semantics, no hand-built keydown handling); `checked` is a
  `model<boolean>(false)`, the single source of truth for both `[(checked)]` two-way binding
  and a real `ControlValueAccessor` (`formControlName`/`[formControl]`/`[(ngModel)]`);
  `size`/`shape` default from the injected `CONTROL_SIZE`/`CONTROL_SHAPE` tokens, both
  reflected as `ab-switch_{value}` host classes nested under `:host` in `switch.scss`;
  `disabled` input and forms' `setDisabledState` combine (either can disable); optional
  `ariaLabel` passes through to the inner button for icon-only/label-elsewhere usage — see
  `docs/architecture/adr/0003-abswitch-synthetic-control-with-cva.md`). Shared vocabulary:
  `variant` (defined for `AbButton`; still not defined for `AbInput` — see
  `specs/ab-input/spec.md` Open questions), `size` (sm/md/lg), `shape` (square/round/circle,
  though `AbSwitch`'s shared `'round'` default does not read as a full-pill switch shape —
  only `'circle'` does, see `architecture-ab-switch.md`'s Trade-offs). Variant/size/shape are
  reflected as `ab-{component}_{value}` BEM-style host classes nested under `:host` in each
  component's own `styleUrl`, not `data-*` attributes nor a global Sass partial. Icons/
  adornments via projected `abStart`/`abEnd` are implemented by `AbButton`; `AbInput` still
  renders no adornments (a native `<input>` can't host projected content at all).

The root `tsconfig.json` is a solution-style config with no direct compiler files; each project has its own `tsconfig.lib.json` / `tsconfig.lib.prod.json` / `tsconfig.spec.json` (library) or `tsconfig.app.json` / `tsconfig.spec.json` (app) extending it.

### `abbos` library — dual TS/Sass public surface

The library ships two independent public surfaces, both rooted at `projects/abbos/src/`:

- **TypeScript**: `public-api.ts` → `projects/abbos/src/lib/`, as usual.
- **Sass**: `_index.scss` is the Sass entry point, `@forward`-ing selected mixins from `src/lib/styles/` (`_core.scss`, `_base.scss`, `_fonts.scss`; token partials live in `src/lib/styles/tokens/`). It's exposed to consumers via the `sass` condition in `projects/abbos/package.json`'s `exports` field (`"." : { "sass": "./_index.scss" }`), so consumers do `@use '@juanbetancur/abbos'`. `ng-package.json` copies all `**/*.scss` from `src/` into `dist/abbos` as assets so the Sass source ships alongside the compiled JS. When adding library styles, add partials under `src/lib/styles/` and `@forward` only what's meant to be public from `_index.scss`.

## Commands

Run from the repo root (npm workspace, single `package.json` + `angular.json` at top level):

- `npm start` / `ng serve` — serve the `playwright` app in dev mode.
- `npm run build` / `ng build` — production build of the default project.
- `ng build abbos` — build the `abbos` library specifically (outputs to `dist/abbos`).
- `npm run watch` — build `playwright` in watch mode with the `development` configuration.
- `npm test` / `ng test` — run unit tests for the default project via Vitest (`@angular/build:unit-test` builder, not Karma, despite what `projects/abbos/README.md` says).
  - Target a single project: `ng test abbos` or `ng test playwright`.
- There is no configured e2e test runner.
- `.gitignore` excludes `.yalc/` and `yalc.lock` — local consumption of the built `abbos` package (e.g. from the `playwright` app or an external project) is done via [yalc](https://github.com/wclr/yalc) rather than `npm link`.

## Conventions

- Formatting is enforced via Prettier (`.prettierrc`): single quotes, 100-char print width, Angular parser for `*.html`.
- `.editorconfig`: 2-space indentation everywhere; single quotes in `*.ts`.
- TypeScript compiler options are strict-leaning: `noImplicitOverride`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `noPropertyAccessFromIndexSignature`, `isolatedModules` are all on at the root `tsconfig.json` and inherited by every project.
- Angular compiler options enable `strictInjectionParameters` and `strictInputAccessModifiers`.
- New library code should be added under `projects/abbos/src/lib/` and re-exported from `public-api.ts` to be part of the published surface; internal-only code should not be exported there.

## AIDD

Method documents: .claude/skills/aidd/
Read CONSTITUTION.md and PIPELINE.md before any non-trivial development work.
Templates: .claude/skills/aidd/templates/
