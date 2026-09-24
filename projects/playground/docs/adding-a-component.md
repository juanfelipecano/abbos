# Adding a component

This walks through documenting a new library component. `features/components/button/` is the
reference implementation. When in doubt, copy it.

## 0. Before you start

- The component must be exported from `projects/abbos/src/public-api.ts`. The playground
  imports from `abbos` (which resolves to `dist/abbos`), so rebuild the library
  (`ng build abbos` or `npm run dev`) after adding it.
- Read the component's source. Every table row, default and ARIA note on the page must come
  from the real code: `input()`, `model()`, `output()`, `host` bindings, `ng-content` slots and the
  custom properties in its `.scss`.

## 1. Create the folder

```
features/components/<slug>/
  <slug>.entry.ts             registry entry + thumbnail   (eager, keep it tiny)
  <slug>.page.ts              route component               (lazy)
  <slug>.doc.ts               ComponentDoc content          (lazy)
  <slug>-playground.ts        interactive playground        (lazy)
  <slug>-best-practices.ts    Do/Don't previews (optional)  (lazy)
  examples/
    <slug>-<example>.html     one template per example
    <slug>-examples.ts        example components + the ExampleDef list
```

Use kebab-case slugs. The slug becomes the URL: `/components/<slug>`.

## 2. The entry — `<slug>.entry.ts`

```ts
import { Component } from '@angular/core';
import { AbThing } from 'abbos';
import { DocEntry } from '../../../core/docs/doc.model';

@Component({
    selector: 'app-thing-thumbnail',
    imports: [AbThing],
    template: `<ab-thing />`,
    host: { class: 'pg-row' },
})
class ThingThumbnail {}

export const THING_ENTRY: DocEntry = {
    slug: 'thing',
    category: 'components',
    kind: 'Component',
    title: 'Thing',
    description: 'One sentence, sentence case, says what it does.',
    status: 'Beta',
    tags: ['Form'],
    selector: 'ab-thing',
    importNames: ['AbThing'],
    sourcePath: 'projects/abbos/src/lib/components/thing',
    thumbnail: ThingThumbnail,
    loadPage: () => import('./thing.page'),
};
```

- `status`: `New` for fresh, stable components and `Beta` while the API may change.
- `tags` drive the category filter chips. Reuse the existing ones (`Actions`, `Form`, `Display`)
  unless a new group really helps.
- The thumbnail renders inside an `inert`, `aria-hidden` card, so it can't be focused. Keep it
  to one or two small instances.

## 3. The page — `<slug>.page.ts`

```ts
import { Component } from '@angular/core';
import { DocPage } from '../../../shared/ui/doc-page/doc-page';
import { THING_DOC } from './thing.doc';
import { ThingPlayground } from './thing-playground';

@Component({
    selector: 'app-thing-page',
    imports: [DocPage, ThingPlayground],
    template: `
        <app-doc-page [doc]="doc">
            <app-thing-playground playground />
        </app-doc-page>
    `,
})
export default class ThingPage {
    protected readonly doc = THING_DOC;
}
```

The class must be a **default export**, because `loadPage` imports the module.

## 4. The playground — `<slug>-playground.ts`

A playground is a `PlaygroundState` (initial values + controls), a live preview, and a `code`
computed that prints markup for the current state.

```ts
protected readonly state = new PlaygroundState(
    { size: 'md', disabled: false, label: 'Save' },
    [
        { kind: 'select', key: 'size', label: 'Size', options: ['sm', 'md', 'lg'] },
        { kind: 'toggle', key: 'disabled', label: 'Disabled' },
        { kind: 'text', key: 'label', label: 'Label' },
    ],
);

protected readonly code = computed(() => {
    const s = this.state.value();
    const list = attrs(
        'ab-thing',
        s.size !== 'md' && `size="${s.size}"`, // only print non-defaults
        s.disabled && 'disabled',
    );
    return `<ab-thing ${list}>${s.label}</ab-thing>`;
});
```

- Control kinds: `select` (string with options), `toggle` (boolean), `text` (string). Keys are
  type-checked against the initial values.
- Wrap the preview in `<app-playground-frame [model]="state" [code]="code()" fileName="…">`.
  Read values with `@let s = state.value();`. String unions need `$any(s.size)` when bound to
  typed inputs.
- For two-way inputs, write back: `(checkedChange)="state.write('checked', $event)"`.
- Only print attributes that differ from the component's defaults, so the snippet shows what a
  user would actually write.
- `attrs()` joins attributes with spaces. For one-attribute-per-line output, build an array and
  `join('\n  ')`. Don't split a joined string on spaces, because values can contain them.
- Add a spec for `code` (see `button-playground.spec.ts`).

## 5. Examples — `examples/`

Each example is a tiny component whose template lives in its own `.html` file. The same file is
imported as text for the Code tab, so the code shown is the code that runs.

```ts
import sizes from './thing-sizes.html' with { loader: 'text' };

@Component({
    selector: 'app-thing-sizes',
    imports: [AbThing],
    templateUrl: './thing-sizes.html',
    host: { class: 'pg-row' }, // or 'pg-stack' for vertical layouts
})
export class ThingSizes {}

export const THING_EXAMPLES: readonly ExampleDef[] = [
    {
        id: 'sizes',
        title: 'Sizes',
        description: '32, 40 and 48px tall.',
        component: ThingSizes,
        files: exampleFiles({ name: 'thing-sizes', html: sizes, imports: ['AbThing'] }),
    },
];
```

`exampleFiles()` builds the HTML, TS and SCSS tabs. Its options:

| Option         | Meaning                                                                 |
| -------------- | ----------------------------------------------------------------------- |
| `name`         | kebab name → selector `app-<name>`, class `PascalName`, file names      |
| `html`         | the imported template text                                              |
| `imports`      | library symbols (`from '@juanfelipecano/abbos'`)                        |
| `core`         | extra `@angular/core` symbols, e.g. `['signal']`                        |
| `extraImports` | other import lines, verbatim                                            |
| `extraDeps`    | extra entries for the component's `imports` array                       |
| `providers`    | contents of a `providers` array, verbatim                               |
| `body`         | class body, verbatim and indented (keep it in sync with the real class) |
| `layout`       | `'row'` (default) or `'stack'` — must match the host class you used     |

Guidelines:

- Write example templates in 2-space indentation. They are shown to users as-is.
- Keep class bodies short. `body` is the one part that is not checked automatically, so it must
  match the real class by hand.
- Set `showCode: true` on the example that is most useful as code (e.g. icon slots).
- Give every control an accessible name in examples too (`<label for>`, `aria-label`, `ariaLabel`).
- If an example starts a timer, clear it on destroy (`DestroyRef`).
- Order: basic usage → variants/sizes/shapes → composition → forms → states.

## 6. The content — `<slug>.doc.ts`

```ts
export const THING_DOC: ComponentDoc = {
    slug: 'thing', // must match the entry
    examples: THING_EXAMPLES,
    api: [
        {
            name: 'AbThing',
            inputs: [
                { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: '…' },
            ],
            outputs: [{ name: 'changed', payload: 'boolean', description: '…' }],
            slots: [{ selector: '[abStart]', description: '…' }],
            cssVars: [{ name: '--background', default: 'var(--ab-surface)', description: '…' }],
        },
    ],
    keyboard: [{ keys: ['Space'], action: 'Toggles the thing.' }],
    aria: ['Renders a native <button>…'],
    bestPractices: THING_BEST_PRACTICES, // or []
    related: ['button', 'switch'], // slugs
};
```

- `outputs`, `slots` and `cssVars` are optional, and empty tables are hidden.
- One component with several public classes (like list + item) gets one `ApiReference` each.
  The page then shows a sub-heading per class.
- `keyboard` and `aria` are always rendered. Describe what the component really does, including
  what the consumer is responsible for (e.g. AbInput renders no label).
- Best practices are pairs of small components (see `button-best-practices.ts`). Use
  `tabindex="-1"` on buttons inside them so illustrations don't clutter the tab order.
- An empty `bestPractices` or `related` hides that section.

## 7. Register it

Add the entry to `DOC_ENTRIES` in `core/docs/docs-registry.ts`, where you want it in the
reading order:

```ts
import { THING_ENTRY } from '../../features/components/thing/thing.entry';

export const DOC_ENTRIES: readonly DocEntry[] = [
    BUTTON_ENTRY,
    // …
    THING_ENTRY,
];
```

That's the only place it is listed. Route, sidebar, search, category card and prev/next all
appear on their own.

## 8. Check it

- [ ] `ng build playground` passes without budget warnings (component styles < 4 kB, so split
      a component if its `.scss` grows past that).
- [ ] `ng test playground` passes, and `docs-registry.spec.ts` confirms the route exists.
- [ ] Open `/components/<slug>` in both themes, and flip the playground's local theme.
- [ ] Every Code tab matches its Preview, and the playground snippet updates with each control.
- [ ] Keyboard-only pass: Tab through the page, and use arrows on tabs.
- [ ] Narrow the window below 960px: drawer, mobile TOC and stacked playground.
- [ ] ⌘K finds the new page and its "`<Title>` API" result.
- [ ] `npx prettier --check .`
