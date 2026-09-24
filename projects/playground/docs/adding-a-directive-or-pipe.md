# Adding a directive or pipe

Directives and pipes use the same registry entry as components, but their pages don't follow
the component layout (there is nothing to put in a playground frame or a slots table). Their
pages compose the shared building blocks directly.

Two **sample pages** exist as templates, for items that haven't shipped:

- `features/directives/autofocus/`: `abAutofocus` (selector card, live demo with Replay,
  inputs table, accessibility callout)
- `features/pipes/truncate/`: `truncate` (signature strip, live "Try it" panel, parameters
  table, template and TypeScript usage)

## Adding a new one

1. Create `features/directives/<slug>/` or `features/pipes/<slug>/`.
2. Write `<slug>.entry.ts`:

    ```ts
    export const TRIM_ENTRY: DocEntry = {
        slug: 'trim',
        category: 'pipes',
        kind: 'Pipe',
        title: 'trim',
        description: 'Removes leading and trailing whitespace.',
        status: 'New',
        tags: [],
        selector: 'trim', // the pipe name, or the attribute selector for a directive
        importNames: ['AbTrimPipe'],
        sourcePath: 'projects/abbos/src/lib/pipes/trim',
        loadPage: () => import('./trim.page'),
    };
    ```

    No `thumbnail` is needed; the category page shows a grid only for shipped items.

3. Write `<slug>.page.ts` (a default export) by copying the closest sample page. The usual
   order:

    | Directive                              | Pipe                                 |
    | -------------------------------------- | ------------------------------------ |
    | `app-doc-header`                       | `app-doc-header`                     |
    | Selector (selector card + hosts)       | Signature strip                      |
    | Import (`app-code-block inline`)       | Import                               |
    | Example (live demo + `app-code-block`) | Try it (live input → output)         |
    | Inputs (`app-data-table`)              | Parameters (`app-data-table`)        |
    | Accessibility (`app-callout`)          | Usage: in a template / in TypeScript |
    | Related, `app-prev-next`               | Related, `app-prev-next`             |

    Use `app-section-heading` for every section so it appears in "On this page".

4. Add the entry to `DOC_ENTRIES`.

## Turning a sample into the real thing

When the library ships the directive or pipe:

1. Remove `sample: true` from the entry and set `status` to `New` (or `Beta`). Add
   `sourcePath`. The "Sample content" banner disappears, and the item now counts on the
   category page, which switches from the empty state to the card grid.
2. Replace the local stand-in with the real export:
    - autofocus: delete `sample-autofocus.ts` and import the library's directive in
      `autofocus-demo.ts`.
    - truncate: delete `sample-truncate.ts` and its spec, and import from `abbos` in
      `truncate-try.ts`.
3. Update the import line, selector, inputs/parameters and usage snippets to the shipped API.
   The sample names (`AbAutofocus`, `AbTruncatePipe`, a `truncate()` function) are guesses.
4. For the first shipped directive or pipe, add a `thumbnail` to its entry so the category card
   has a preview.

## Notes for pipes

- Show the pipe in templates, but in the TypeScript usage prefer an exported plain function
  over injecting the pipe class just to call `transform()`.
- Say whether the pipe is pure. It matters for performance inside lists.

## Notes for directives

- A demo that moves focus or scrolls must not do it on page load. Trigger it from a user action
  (the autofocus demo mounts its field only on Replay).
- List the host elements the directive supports.
