# Playground docs

How the Abbos docs site (`projects/playground`) is built, and how to add pages to it.

| Read this                                                   | When you want to…                                                    |
| ----------------------------------------------------------- | -------------------------------------------------------------------- |
| [Architecture](architecture.md)                             | understand how the app is put together and where things live         |
| [Adding a component](adding-a-component.md)                 | document a new component from the library                            |
| [Adding a directive or pipe](adding-a-directive-or-pipe.md) | document a directive or pipe, or turn a sample page into a real one  |
| [Building blocks](building-blocks.md)                       | look up a shared UI piece (code block, example, playground, tables…) |
| [Conventions](conventions.md)                               | check styling, accessibility, content and testing rules              |

## Quick start

```bash
npm run dev           # watch-build the library and serve the playground
ng test playground    # playground unit tests
ng build playground   # production build (checks budgets and types)
```

The playground imports the library from `dist/abbos`, so build the library (`ng build abbos`, or
`npm run dev`) before serving it.

Before committing, run the repo's verify command:

```bash
npx prettier --check . && ng build abbos && ng test
```

## The one rule to remember

Every page is listed once, in `DOC_ENTRIES` (`src/app/core/docs/docs-registry.ts`). Routes, the
sidebar, search, category cards and prev/next links are all derived from it. If a page is missing
somewhere, check the registry first.
