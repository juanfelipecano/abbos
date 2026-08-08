# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

An Angular component library (design system, in the spirit of PrimeNG) published as
`@juanbetancur/abbos` — buttons, form controls, a theming service, and design tokens as CSS
custom properties — plus a `playground` app that hosts and demos the components as they're
built. The design source of truth is the sibling `AbbosDesignSystem` React repo (not present
here); this library is its Angular port.

For fuller narrative context (stack table, quality bars, boundaries, known debt, domain
glossary) see `PROJECT-CONTEXT.md` — it is kept current per-feature and takes precedence over
anything here if the two disagree.

## Commands

```bash
npm install                # install deps

# Library must be built before playground can resolve `abbos` imports
ng build abbos              # build the library -> dist/abbos
npm run build:abbos:watch   # watch-build the library only

ng serve                    # serve playground against whatever is already in dist/abbos
npm run dev                 # watch-build abbos + republish via yalc + serve playground
                             # (use this when iterating on library code)

ng test                     # run unit tests for the default project (Vitest, both projects)
ng test abbos                # library tests only
ng test playground           # playground tests only

npx prettier --check .      # lint/format check (source of truth over .editorconfig on conflicts)
npx prettier --write .      # fix formatting

ng build                    # production build of playground (default project)
```

**Verify command** (gates a commit): `npx prettier --check . && ng build abbos && ng test`.
There's no standalone `tsc --noEmit`; `ng build abbos` (ng-packagr) is what surfaces type
errors. There is no e2e runner and no CI configured — run the verify command locally.

Local cross-package consumption uses [yalc](https://github.com/wclr/yalc), not `npm link`
(`abbos:yalc:publish` / `abbos:yalc:watch` scripts).

## Architecture

Angular CLI v22 workspace (`angular.json`) with two projects under `projects/`:

- **`abbos`** (`projectType: library`, prefix `ab`) — built via `@angular/build:ng-packagr`
  into `dist/abbos`. `src/public-api.ts` is the TS public surface; only what's re-exported
  there is importable by consumers.
- **`playground`** (`projectType: application`, prefix `app`) — demo app, imports the library
  from `dist/abbos` (TS) and its source Sass via `@use`. Not a Playwright test setup despite
  past naming confusion.

### Dual TS/Sass public surface

The library ships two independent entry points, both rooted at `projects/abbos/src/`:

- **TS**: `public-api.ts` → `lib/components`, `lib/services`, `lib/abbos-config-provider`.
  Note `lib/constants` (`AbControlShape`, `AbControlSize`) is *not* re-exported — a consumer
  needing those types externally must currently use an inline literal/`as const` union.
- **Sass**: `_index.scss` is the entry point, `@forward`-ing `core` (all `--ab-*` tokens +
  dark theme + accents), `base` (opt-in reset/defaults), and `fonts` from
  `lib/assets/styles/`. Exposed via the `sass` condition in `projects/abbos/package.json`'s
  `exports`, so consumers do `@use '@juanbetancur/abbos' as abbos`. `ng-package.json` copies
  every `**/*.scss` under `src/` into `dist/abbos` as an asset, including each component's
  own co-located `.scss` (referenced via `styleUrl`, not a shared partial).

Token names under `lib/assets/styles/tokens/` (`_colors`, `_spacing`, `_radius`, `_shadows`,
`_typography`) are the `--ab-*` custom property contract components key off directly — treat
as a breaking-change boundary along with `public-api.ts`/`_index.scss` themselves.

### Theming

`AbThemeService` (`lib/services/theme.ts`, a `@Service()` singleton) holds `theme` and
`accent` as signals and reflects them onto `<html data-ab-theme data-ab-accent>` via
`effect()` — that's what the `core` Sass mixin's dark/accent overrides key off. Emerald is
the default accent, so it maps to *no* `data-ab-accent` attribute. `setCustomTokens()` sets
inline `--ab-*` custom properties on `<html>` for runtime overrides.

`provideAbbos(config)` (`lib/abbos-config-provider.ts`) is the app-level entry point: sets
initial theme/accent/tokens on `AbThemeService` via an environment initializer (eagerly
instantiating the service so attributes land before first paint), and provides the
`CONTROL_SHAPE`/`CONTROL_SIZE` DI tokens (`lib/config/tokens.ts`) that components inject for
their `size`/`shape` defaults (`round`/`md` unless overridden).

### Component pattern

Each control lives under `lib/components/**` with a co-located `.ts` + `.scss` (+ `.spec.ts`).
`size`/`shape`/state are reflected as `ab-{component}_{value}` BEM-style classes in the
component's `host` object — not `data-*` attributes, despite what some older docs/ADRs say
(`docs/architecture/architecture.md`'s original design predates this and is stale on this
point; trust the component source and `PROJECT-CONTEXT.md`).

- **`AbButton`** (`button[ab-button]`) — a `@Component` with a real template: projected label
  plus `abStart`/`abEnd` icon slots and a conditional loading spinner. `variant` is
  `'primary' | 'secondary' | 'soft' | 'outline' | 'ghost' | 'danger'` (default `'primary'`),
  defined and exported by `button.ts` itself (unlike the shared `AbControlShape`/`Size`).
- **`AbInput`** (`input[ab-input]`) — a `@Component` with an *empty* template (`template: ''`)
  rather than a `@Directive`, because `@Directive` has no `styles`/`styleUrl` support in
  Angular — see ADR-0001's amendment. Renders no label and has no `ControlValueAccessor`;
  value read/write, `disabled`, and validity classes (`ng-invalid`/`ng-touched`) all come for
  free from Angular's own `DefaultValueAccessor`/`NgControl` on the native `<input>`.
  Accessible naming (`aria-label`/`aria-labelledby`/`<label for>`) is entirely the caller's
  responsibility.
- **`AbSwitch`** (`ab-switch`) — a `@Component` wrapping a `<label>` + native
  `<button type="button" role="switch">` + decorative knob (native keyboard/focus semantics,
  no hand-built keydown handling). `checked` is a `model<boolean>(false)`, the single source
  of truth for both `[(checked)]` and a real `ControlValueAccessor`
  (`formControlName`/`[formControl]`/`[(ngModel)]`). `disabled` input and forms'
  `setDisabledState` combine additively (either can disable).
- **`AbIconButton`** — referenced in specs/backlog as roadmap; does not exist in
  `src/lib/` yet. Verify against `public-api.ts` before assuming any component exists.

New form controls should follow `AbInput`'s or `AbSwitch`'s precedent depending on whether
the underlying native element already has its own `ControlValueAccessor` (`<input>`,
`<textarea>`, `<select>` do; a custom synthetic control like a toggle does not).

### Testing

Co-located `*.spec.ts`, run via Vitest through the `@angular/build:unit-test` builder (not
Karma, despite `projects/abbos/README.md`). Components that inject `CONTROL_SIZE`/
`CONTROL_SHAPE` with no default require both tokens provided in `TestBed.configureTestingModule`
(`{ provide: CONTROL_SIZE, useValue: 'md' }, { provide: CONTROL_SHAPE, useValue: 'round' }`) —
omitting either throws `NG0201` before any assertion runs; see `button.spec.ts` for the
working pattern. When rebinding a plain (non-signal) field on a test host and expecting it to
propagate into a child's signal `input()` on a second `detectChanges()`, prefer
`fixture.componentRef.setInput()` — plain rebinding has a known flake here (see
`BACKLOG.md`).

## AIDD workflow

This repo uses an AI-Driven Development method installed at `.claude/skills/aidd/`
(its own nested git repo — a submodule-like checkout, not part of this repo's history).
`CONSTITUTION.md` (non-negotiable articles: spec-before-code, evidence-before-done,
minimum-diff, frozen scope, explicit unknowns) and `PIPELINE.md` govern any non-trivial
feature work; role-specific skills live in `aidd-*/SKILL.md` subdirectories. Feature specs
and plans live in `specs/<feature>/{spec,plan}.md`; the currently active feature (if any) is
named in `.aidd-active`. Findings frozen out of a run's scope go in `BACKLOG.md` rather than
being silently fixed.

## Coding rules

Angular/TypeScript conventions (standalone components implicit, no explicit `OnPush`,
signals for state, `input()`/`output()` functions, Signal Forms preferred, host bindings via
the `host` object not `@HostBinding`/`@HostListener`, WCAG AA + AXE) are enforced via
`.claude/CLAUDE.md` — read it alongside this file.
