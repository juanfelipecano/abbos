# Conventions

Rules the playground follows on top of the repo-wide ones in `CLAUDE.md` and
`.claude/CLAUDE.md` (standalone components, signals, `input()`/`output()`, `host` object, no
`ngClass`/`ngStyle`, WCAG AA).

## Content

- **Document the real API.** Every snippet, table row and default comes from the library
  source. The Claude Design files used a made-up API (`<abb-button>`, `@abbos/ui`); don't copy
  from them.
- Package name and version come from `core/docs/site.ts` (`PACKAGE_NAME`, `LIBRARY_VERSION`).
  Update `LIBRARY_VERSION` when `projects/abbos/package.json` changes.
- Use sentence case everywhere and write in a friendly, plain voice. No emoji, and at most one
  exclamation mark.
- Descriptions are one sentence. Leads explain the "why" in one line.
- Say what the consumer is responsible for (labels, `ariaLabel` on projected controls…).

## Styling

- Use only the library's `--ab-*` tokens for colours, spacing, radii, type and motion. Code
  panels use the `--pg-code-*` palette defined in `styles.scss`.
- No inline `style` attributes. Styles are co-located (`styleUrl` or `styles` for small ones).
- Keep each component's styles under the 4 kB budget. Past that, split out a child component
  (e.g. `EntryCard`, `CategoryEmpty`) rather than raising the budget.
- Breakpoint: `max-width: 959px` switches to the mobile layout. Keep it in sync with
  `core/layout/viewport.ts`.
- Visuals follow the design: flat colours, hairline borders, soft shadows, and no gradients
  apart from the dotted canvas.
- Links styled as buttons are plain `<a>` with local styles, because `AbButton` only attaches
  to `<button>`. Navigation is always a link, and actions are always buttons.

## Icons

- Use `@lucide/angular` icon components (`<svg lucideSearch [size]="16" aria-hidden="true">`).
- Decorative icons get `aria-hidden="true"`. An icon-only control needs `aria-label` on the
  control.
- Note that any Lucide use in eagerly loaded code (shell, entries) puts the Lucide module in the
  initial bundle (≈125 kB raw). Keep an eye on the 500 kB initial warning.

## Accessibility

- One `<h1>` per page, and headings in order (h2 sections, h3 subsections).
- Landmarks: one `main`, one "Main" nav in the header, one "Documentation" nav in the sidebar.
  Don't add duplicate labels.
- Tabs use `role="tablist"`/`tab`/`tabpanel` with roving tabindex (`SegTabs`, `nextTabIndex`).
- Modals are native `<dialog>` with `showModal()`, which gives focus trapping, Esc and an inert
  background.
- Live previews in cards are `inert` and `aria-hidden`, and cards use a single stretched link
  instead of nesting interactive elements.
- Never move focus or scroll on page load.
- Wrap `localStorage` access in `try/catch`, since it can be unavailable.

## Testing

- Specs are co-located (`*.spec.ts`) and run with Vitest via `ng test playground`.
- Put logic in pure functions where possible (search index, category filter, tokenizer,
  registry helpers) and test those directly.
- Components that render library controls need `provideAbbos()` in `TestBed`.
- Routing is covered in `app.spec.ts` with `RouterTestingHarness`.
- Playground snippets get a spec that checks the default output and a changed state.

## Formatting

- Prettier is the source of truth (`npx prettier --write .`).
- Example `.html` files are shown to users. Keep them readable, with 2-space indentation.
- `code-block.html` has a `<!-- prettier-ignore -->` on its `<pre>`, so keep it that way;
  whitespace matters there.
