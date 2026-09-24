# Building blocks

Shared, presentational components in `src/app/shared/ui/`. They are input-driven and have no
app state, unless noted. Prefer these over one-off markup so pages stay consistent.

## Page structure

| Component        | Selector              | Use                                                                                                         |
| ---------------- | --------------------- | ----------------------------------------------------------------------------------------------------------- |
| `DocPage`        | `app-doc-page`        | Full component page from a `ComponentDoc`; project `[playground]`.                                          |
| `DocHeader`      | `app-doc-header`      | Breadcrumb, title, description, kind/status badges, source & issue links, sample banner. Input: `entry`.    |
| `SectionHeading` | `app-section-heading` | h2/h3 + optional lead, registered in "On this page". Inputs: `anchor`, `heading`, `lead`, `level` (2 or 3). |
| `PrevNext`       | `app-prev-next`       | Previous/next links from the registry. Reads the current route; no inputs.                                  |
| `RelatedCards`   | `app-related-cards`   | Links to other pages. Input: `slugs`.                                                                       |

## Code and previews

| Component         | Selector               | Use                                                                                                                                                                                                      |
| ----------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CodeBlock`       | `app-code-block`       | Dark code panel with a copy button. Either `files` (tabs) or `code` + `lang` + `fileName`. `inline` gives a one-line command strip. `lineNumbers` appear automatically when there are more than 2 lines. |
| `Example`         | `app-example`          | One `ExampleDef`: title, description, Preview/Code tabs.                                                                                                                                                 |
| `PreviewCanvas`   | `app-preview-canvas`   | Surface for live previews. `dotted`, `surface`, `label`, and `themeToggle` (local light/dark).                                                                                                           |
| `PlaygroundFrame` | `app-playground-frame` | Canvas + controls panel + generated code. Inputs: `model` (`PlaygroundState`), `code`, `fileName`.                                                                                                       |
| `PlaygroundState` | class                  | Typed playground values + controls + `reset()`. See [Adding a component](adding-a-component.md#4-the-playground--slug-playgroundts).                                                                     |

Languages supported by the tokenizer (`code-block/highlight.ts`): `ts`, `html`, `scss`, `bash`.
It is intentionally approximate. For bash, lines starting with `$ ` get a dimmed prompt that
the copy button strips.

## Reference content

| Component     | Selector           | Use                                                                                                                                                                                                           |
| ------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DataTable`   | `app-data-table`   | Accessible `<table>` that scrolls sideways when narrow. `columns` (`header`, `kind`, `width`), `rows`, `caption` (required, visually hidden), `minWidth`. Cell kinds: `name`, `code`, `mono`, `text`, `keys`. |
| `CheckList`   | `app-check-list`   | Bulleted list with check marks (ARIA notes). Input: `items`.                                                                                                                                                  |
| `DoDont`      | `app-do-dont`      | Do/Don't cards with live previews. Input: `items` (`BestPractice[]`).                                                                                                                                         |
| `Callout`     | `app-callout`      | Note with icon. `tone`: `tip`, `info`, `warning`; optional `heading`; body is projected.                                                                                                                      |
| `StatusBadge` | `app-status-badge` | Pill with a dot. `label`; `tone` is derived for New/Beta/Coming soon/Sample, or set it explicitly.                                                                                                            |

## Controls

| Component    | Selector                                        | Use                                                                                                                                            |
| ------------ | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `SegTabs`    | `app-seg-tabs`                                  | Segmented `role="tablist"` with arrow keys. `options`, `[(value)]`, `label`, `panelId`; call `tabId(value)` for the panel's `aria-labelledby`. |
| `IconButton` | `button[app-icon-button]`, `a[app-icon-button]` | Round ghost icon button for chrome. Always set `aria-label`.                                                                                   |
| `GithubMark` | `app-github-mark`                               | Decorative GitHub logo (Lucide has no brand icons).                                                                                            |

`tabs/tab-keys.ts` exports `nextTabIndex()` if you build another tablist.

## Helpers

- `shared/docs/example-files.ts`: `exampleFiles()` and `exampleTs()` build an example's Code tabs.
- `core/toc/toc-entry.ts`: the `appTocEntry` directive, for a raw heading that should appear in
  "On this page": `<h3 appTocEntry="ex-basic" [tocLevel]="3">Basic</h3>`.

## Global utility classes (`styles.scss`)

| Class                | Use                                               |
| -------------------- | ------------------------------------------------- |
| `pg-row`             | wrapping horizontal layout (examples, thumbnails) |
| `pg-stack`           | vertical layout, max 320px (form examples)        |
| `pg-field`           | label + control + helper text column              |
| `pg-dotted`          | dotted canvas background                          |
| `pg-note`            | small secondary text                              |
| `pg-visually-hidden` | hidden visually, still read by screen readers     |
