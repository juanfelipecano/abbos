# Project Context

---

## Identity

- **Project**: Abbos
- **What it does**: An Angular component library (design system, in the spirit of PrimeNG) — buttons, inputs, theming services, and design tokens as CSS custom properties — published as `@juanbetancur/abbos`, with a `playground` Angular app that hosts and demos the components as they're built.
- **Stage**: prototype — the theming service, config, constants, `AbInput`, `AbButton`, and
  `AbSwitch` exist so far; `AbIconButton` is not implemented yet.
- **Users**: internal — the maintainer(s) of apps that consume `@juanbetancur/abbos` via yalc/npm.

## Stack

| Layer | Technology | Version |
|---|---|---|
| Language | TypeScript | ~6.0.2 |
| Framework | Angular (standalone APIs, signals) | ^22.0.0 |
| Data store | none | — |
| Frontend | Angular CLI workspace, Sass (SCSS partials → `--ab-*` CSS custom properties) | Angular CLI ^22.0.4 |
| Auth | none | — |
| Infrastructure | none (no CI/CD configured); local package consumption via [yalc](https://github.com/wclr/yalc) | — |

## Commands

```bash
# Install dependencies
npm install

# Run the full test suite
ng test              # or: ng test abbos / ng test playground

# Run a single test / a subset
ng test abbos -- --project abbos  # Vitest under @angular/build:unit-test; filter by file/pattern as needed

# Lint and format check
npx prettier --check .

# Type check (or: N/A)
ng build abbos   # ng-packagr / tsc surfaces type errors; there is no standalone `tsc --noEmit` script

# Build for production
ng build abbos   # library, outputs to dist/abbos — build this BEFORE building/serving playground
ng build         # playground app (default project), production config

# Run locally
ng serve                 # serves playground only, against whatever is already in dist/abbos
npm run dev               # watches+rebuilds abbos, republishes via yalc, and serves playground — use this when iterating on library code
```

**Verify command** — the one command that gates a commit. Roles treat a non-zero exit as
a hard stop.

```bash
npx prettier --check . && ng build abbos && ng test
```

## Layout

```
angular.json                     # workspace config: "abbos" (library) + "playground" (application)
Makefile                         # thin wrappers: init, serve, playground, build-abbos, format, check-format
projects/
  abbos/                         # publishable library, projectType: library, prefix "ab"
    src/
      public-api.ts              # public TS surface — anything importable by consumers must be re-exported here
      _index.scss                # public Sass entry point — @forwards selected mixins/tokens
      lib/
        services/                # AbThemeService (theme/accent signals, reflects data-ab-theme/data-ab-accent on <html>)
        config/                  # DI tokens (e.g. CONTROL_SHAPE, CONTROL_SIZE)
        constants/                # shared type unions (AbControlShape, AbControlSize)
        assets/styles/           # SCSS partials: _core.scss, _base.scss, _fonts.scss, tokens/ (_colors, _spacing, _radius, _shadows, _typography)
    ng-package.json               # ng-packagr config; copies **/*.scss from src/ into dist/abbos as assets
  playground/                     # demo/showcase app, projectType: application, prefix "app"
    src/app/                      # standalone ApplicationConfig + routes; imports abbos from dist/abbos (TS) and source Sass via @use
dist/abbos/                       # build output of the library — must exist (ng build abbos) before playground can resolve `abbos` imports
```

## Conventions

Only list what is not obvious from reading the code. Things a reviewer has actually asked
for twice.

- **Naming**: library exports are prefixed `Ab`/`AB_` (e.g. `AbThemeService`, `AbControlShape`, `AB_ACCENTS`); CSS custom properties are prefixed `--ab-`; playground/app-level symbols use no prefix or the `app` selector prefix.
- **Error handling**: no established pattern yet (no components/services with fallible operations exist beyond the theme service, which has none).
- **Logging**: none in use.
- **Test structure**: co-located `*.spec.ts` next to the file under test, run via Vitest (`@angular/build:unit-test` builder — not Karma, despite `projects/abbos/README.md` saying otherwise).
- **Commit format**: short, lowercase, imperative summary (e.g. "added library and application"); no enforced convention (no commitlint/husky configured).
- **Branch strategy**: single `main` branch so far — no branch-per-feature convention established yet.
- **Indentation**: per `.editorconfig`, 4 spaces by default, 2 spaces for `*.json`/`*.yml`; single quotes in `*.ts`. Prettier (100-char print width) is the actual formatter of record for `.ts`/`.html`/`.scss` — run `npx prettier --check .` (`.editorconfig` widths are advisory, Prettier wins on conflicts).
- Follow `.claude/CLAUDE.md` and the repo-root `CLAUDE.md` for Angular/TypeScript coding rules (standalone components implicit, no explicit `OnPush`, signals for state, `input()`/`output()` functions, Signal Forms over Reactive forms for new forms, host bindings via the `host` object not decorators).

## Quality bars

| Dimension | Bar |
|---|---|
| Test coverage | no formal threshold configured; every new public component/service ships with a co-located spec |
| Accessibility | WCAG AA minimums (focus management, color contrast, ARIA) and passing AXE checks — mandated by `.claude/CLAUDE.md` |
| Performance | not yet measured; no budgets configured in `angular.json` |
| Security | no dependency scanning or ASVS target configured |
| Browser/runtime support | whatever Angular 22's default browserslist supports; not explicitly pinned |

## Boundaries

Things that must not change without human approval. Roles treat these as read-only.

- `projects/abbos/src/public-api.ts` and `_index.scss` — the published TS/Sass surface of `@juanbetancur/abbos`; anything exported here is a breaking-change risk for consumers.
- Token names under `projects/abbos/src/lib/assets/styles/tokens/` (the `--ab-*` custom property contract) — components and consumers key off these names directly.
- `AbThemeService`'s public signals/methods (`theme`, `accent`, `toggleTheme`, `setCustomTokens`) and the `data-ab-theme` / `data-ab-accent` attribute contract they reflect onto `<html>`.

## Domain glossary

| Term | Meaning |
|---|---|
| Abbos Design System | The design source of truth, authored in the sibling `AbbosDesignSystem` React repo; this library is the Angular port of it. |
| Token | A design value exposed as a `--ab-*` CSS custom property (e.g. `--ab-primary`, `--ab-space-4`, `--ab-radius-control`); components must consume tokens, never raw values. |
| Accent | One of `emerald` (default) \| `indigo` \| `blue` \| `amber` \| `mono` — swaps the `--ab-primary-*` token group via `[data-ab-accent]`. |
| Playground | `projects/playground` — the demo Angular app that showcases `abbos` components; not a Playwright test setup despite past naming. |

## Known debt

| Area | Issue | Do instead |
|---|---|---|
| `projects/abbos/README.md` | Says tests run via Karma | They run via Vitest (`@angular/build:unit-test`) — trust `CLAUDE.md`/this file, not that README |
| Components | `AbIconButton` described in `CLAUDE.md` does not exist in `src/lib/` yet — `AbInput` (`input[ab-input]`, see `specs/ab-input/`), `AbButton` (`button[ab-button]`, see `specs/ab-button/`), and `AbSwitch` (`ab-switch`, see `specs/ab-switch/`) now do | Treat `AbIconButton` as roadmap, not current API; verify against `public-api.ts` before assuming a component exists |
| Public TS surface | `AbControlShape`/`AbControlSize` (`src/lib/constants/`) are not re-exported from `public-api.ts`, and no component re-exports them locally either (unlike `AbButtonVariant`, which `button.ts` defines and exports) — confirmed 2026-08-05 while building `AbSwitch`'s playground demo (`ng build playground` failed with `TS2459` on `import { AbControlShape, AbControlSize } from 'abbos'`) | A consumer/demo that needs to type a `size`/`shape` value externally must use an inline literal union or `as const`, not import the shared type — until someone deliberately re-exports `./lib/constants` from `public-api.ts` |
| `AbInput` test suite | `input.spec.ts` currently fails all 12 of its tests (confirmed 2026-08-05, `ng test abbos --watch=false`) — not the "7 of 12, data-attribute mismatch" `specs/ab-input/spec.md` documents. Root cause: `input.ts` injects `CONTROL_SIZE`/`CONTROL_SHAPE` with no default, and `input.spec.ts`'s `TestBed.configureTestingModule` calls supply no provider for either token, so every test throws `NG0201` before its assertions run | Add `{ provide: CONTROL_SIZE, useValue: 'md' }, { provide: CONTROL_SHAPE, useValue: 'round' }` to `input.spec.ts`'s `TestBed` configs (the pattern `button.spec.ts` now uses) — out of scope for the `ab-button` run that found it, see `BACKLOG.md` |
| CI | No CI/CD pipeline configured | Run the verify command locally before every commit |

## Documentation map

| Artifact | Location |
|---|---|
| Workspace/tooling guide | `CLAUDE.md` (repo root) |
| Angular/TS coding rules | `.claude/CLAUDE.md` |
| AIDD method | `.claude/skills/aidd/CONSTITUTION.md`, `.claude/skills/aidd/PIPELINE.md` |
| Library usage (stale in places, see Known debt) | `projects/abbos/README.md` |
| Specs | `specs/<feature>/spec.md` (e.g. `specs/ab-input/spec.md`) |
| Active feature pointer | `.aidd-active` |
| Plans | `specs/<feature>/plan.md` (e.g. `specs/ab-input/plan.md`) |
| Backlog | `BACKLOG.md` |
