# Architecture

The playground is an Angular 22 standalone app (zoneless, signals, `OnPush` by default). Its
main idea: **docs are data plus a few custom parts.** Each page's content lives in a typed
object, and shared components render it. The app never keeps two lists of the same pages.

## Folder layout

```
projects/playground/src/
  styles.scss            global layer: library tokens, light "island", code palette, utilities
  typings.d.ts           lets TypeScript import .html files as text
  app/
    app.ts               root component — renders <app-shell>
    app.config.ts        router, provideAbbos(), theme persistence
    app.routes.ts        routes generated from the registry
    core/                data and state, no UI
      docs/
        doc.model.ts       all docs types (DocEntry, ComponentDoc, ApiReference, ExampleDef…)
        docs-registry.ts   DOC_ENTRIES + helpers (paths, nav groups, reading order, neighbours)
        categories.ts      Components / Directives / Pipes metadata and empty-state copy
        site.ts            package name, library version, GitHub links
      search/
        search-index.ts    pure functions: build the index, match, highlight, suggestions
        search.ts          ⌘K dialog state (open, query, cursor, recent picks)
      toc/
        toc.ts             "On this page" registry + scroll-spy
        toc-entry.ts       appTocEntry directive for headings
      theme/theme-preference.ts   remembers light/dark (localStorage, OS fallback)
      layout/viewport.ts          isMobile signal (below 960px)
    layout/              the frame around every page (rendered once)
      shell/ header/ sidebar/ page-toc/ mobile-toc/ search-dialog/ version-menu/ logo/
    shared/
      ui/                presentational building blocks — see building-blocks.md
      docs/example-files.ts   builds the HTML/TS/SCSS tabs for an example
    features/            one folder per page
      home/  category/
      components/<slug>/  directives/<slug>/  pipes/<slug>/
```

Dependency direction: `features` → `shared` → `core`. `layout` uses `core` and `shared`.
`core` never imports UI, and `shared/ui` never imports a feature. The one exception is
`docs-registry.ts`, which imports each feature's small `*.entry.ts` file; that is how the page
list is assembled.

## The registry

`DocEntry` (in `doc.model.ts`) is the lightweight description of one page:

| Field                  | Used for                                                                  |
| ---------------------- | ------------------------------------------------------------------------- |
| `slug`, `category`     | URL `/<category>/<slug>`                                                  |
| `kind`                 | Component / Directive / Pipe label and icons                              |
| `title`, `description` | sidebar, header, search, cards                                            |
| `status`               | badge: `New`, `Beta`, `Coming soon`, `Sample`                             |
| `tags`                 | filter chips on the category page (e.g. `Form`, `Actions`)                |
| `selector`             | shown on cards                                                            |
| `importNames`          | the generated `import { … } from '@juanfelipecano/abbos'` line            |
| `sourcePath`           | "View source" link                                                        |
| `sample`               | marks a page for an item that hasn't shipped (banner, kept out of counts) |
| `thumbnail`            | small live preview on the category grid                                   |
| `loadPage`             | lazy import of the page component                                         |

From `DOC_ENTRIES`, the helpers in `docs-registry.ts` derive:

- **routes**: `app.routes.ts` maps every entry to a lazy route titled `<Title> · Abbos`
- **sidebar**: `navGroups()`, one group per category with an Overview link
- **reading order**: `pageOrder()` and `neighbours()` for prev/next
- **category pages**: `entriesIn()` and `shippedIn()`
- **search**: `buildSearchIndex()`, plus an "`<Title>` API" result for each shipped component

Order in `DOC_ENTRIES` is the reading order in the sidebar and in prev/next.

## Page content

Component pages all have the same shape, so their content is data: a `ComponentDoc`
(`<slug>.doc.ts`) holds examples, API references, keyboard rows, ARIA notes, best practices and
related slugs. `DocPage` (`shared/ui/doc-page`) renders it top to bottom:

```
DocHeader → Import → Playground (projected) → Examples → API reference
→ Accessibility (Keyboard, ARIA) → Best practices → Related → Prev/next
```

The playground is the only part each page supplies itself. Directive and pipe pages have
different sections, so they compose the shared blocks directly instead of using `DocPage`.

The heavy content (docs objects, examples, playgrounds) sits behind `loadPage`, so it's lazily
loaded. Only the `*.entry.ts` files and their thumbnails are in the main bundle.

## Routing

- `''` → Home. `components`, `directives`, `pipes` → the shared Category page (the category id
  comes from route data through `withComponentInputBinding`; `wide: true` widens the column).
- `<category>/<slug>` → each entry's page.
- The old demo paths (`/button`, `/switch`, …) redirect to `/components/<slug>`.
- Anything else redirects to Home.
- `withInMemoryScrolling` handles `#fragment` links (e.g. `/#sec-install`) and scroll restoration.

## Shell and cross-cutting state

- **Theme**: `ThemePreference` runs at startup. It applies the saved theme (or the OS preference)
  through the library's `AbThemeService` and saves each change. Accents can be switched live
  from the Theming section; they are not persisted.
- **Viewport**: below 960px the shell swaps the sidebar for a drawer (native modal `<dialog>`)
  and the right-hand TOC for a collapsible box above the content.
- **"On this page"**: headings register themselves with `Toc` through the `appTocEntry`
  directive (`SectionHeading` does it for you). `Toc` keeps them in document order and tracks
  the active one on scroll. A page with no registered headings shows no TOC.
- **Search**: ⌘K / Ctrl K anywhere toggles the dialog (shell `document:keydown` listener). The
  dialog is a native modal `<dialog>` with a combobox + listbox.

## Theming the previews

The library only defines dark mode as an attribute (`[data-ab-theme='dark']`). Light tokens
live on `:root`. So that a preview can show light inside a dark page, `styles.scss` re-emits the
light layer under `[data-ab-theme='light']`. `PreviewCanvas` sets that attribute on itself when
its local theme toggle is used. The toggle starts from the site theme (`linkedSignal`).
