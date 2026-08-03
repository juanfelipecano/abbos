# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Workspace structure

This is an Angular CLI workspace (v22) with two projects under `projects/`:

- **`projects/abbos`** — a publishable Angular library (`projectType: library`, prefix `ab`), published as `@juanbetancur/abbos`. Built with `@angular/build:ng-packagr` into `dist/abbos`. Public API is re-exported from `projects/abbos/src/public-api.ts` — any symbol meant to be consumed externally must be exported there.
- **`projects/playwright`** — an Angular application (`projectType: application`, prefix `app`) that consumes/exercises the `abbos` library as a component showcase. Despite the name, it is a standard Angular app shell (routing via `app.routes.ts`, standalone `ApplicationConfig` in `app.config.ts`), not a Playwright test setup. It imports library TS from `abbos` (tsconfig path → `dist/abbos`, so `ng build abbos` must run first) and library Sass from source via `@use '../../abbos/src'`.

The library implements the **Abbos Design System** (design source of truth: the sibling `AbbosDesignSystem` repo, authored with Claude Design in React; this is the Angular port):

- **Tokens**: SCSS partials under `projects/abbos/src/lib/styles/tokens/` emit CSS custom properties, all prefixed `--ab-` (e.g. `--ab-primary`, `--ab-space-4`, `--ab-radius-control`). Components consume only semantic tokens (`var(--ab-*)`), never raw values.
- **Theming**: dark mode keys off `[data-ab-theme='dark']`, alternate accents (indigo/blue/amber/mono; emerald is the default) off `[data-ab-accent='…']` — both on `<html>`, managed by `AbThemeService` (signal-based; also supports runtime token overrides via `setCustomTokens`). The Sass API (`_index.scss`) exposes the `core` (all tokens), `base`, `fonts`, and `custom-theme($map)` mixins.
- **Components**: `AbButton` (`button[ab-button]`), `AbIconButton` (`button[ab-icon-button]`, requires `label`), `AbInput` (`ab-input`, ControlValueAccessor), `AbSwitch` (`ab-switch`, `[(checked)]` model + ControlValueAccessor). Shared vocabulary: `variant`, `size` (sm/md/lg), `shape` (square/round/circle). Variant/size/shape are reflected as `data-*` attributes on the host and styled via `:host([data-…])`; icons/adornments are projected content marked `abStart`/`abEnd`.

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
