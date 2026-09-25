# Bottom sheet

A surface anchored to the bottom edge. Use it declaratively (`ab-bottom-sheet`) or open a component in it programmatically with `AbBottomSheetController`.

- **Selector:** `ab-bottom-sheet`, plus the `[abSheetFooter]` directive
- **Classes:** `AbBottomSheet`, `AbSheetFooter`, `AbBottomSheetController`, `AbBottomSheetRef`

```ts
import { AbBottomSheet, AbSheetFooter, AbBottomSheetController } from '@juanfelipecano/abbos';
```

## Modes

- `modal` (default): rendered in a CDK overlay above a scrim with a focus trap. Esc, a scrim tap, dragging down, and the close button dismiss it.
- `standard`: stays in the page (positioned by `--ab-bottom-sheet-position`, `fixed` by default) and collapses to a peek instead of closing. `open` means expanded.

Dragging is a shortcut, never the only way: the header button always offers the same action.

## Declarative use

```html
<ab-bottom-sheet [(open)]="showFilters" heading="Filters" subheading="Refine results">
    <p>Body content</p>
    <div abSheetFooter>
        <button ab-button (click)="showFilters.set(false)">Apply</button>
    </div>
</ab-bottom-sheet>
```

| Name            | Type                    | Default      | Description                                                                   |
| --------------- | ----------------------- | ------------ | ----------------------------------------------------------------------------- |
| `open`          | `boolean` (model)       | `false`      | Modal: shown. Standard: expanded.                                             |
| `mode`          | `'modal' \| 'standard'` | `'modal'`    | Behaviour, see above.                                                         |
| `heading`       | `string`                | **required** | Title; also the accessible name.                                              |
| `subheading`    | `string`                | —            | Secondary line in the header.                                                 |
| `showHandle`    | `boolean`               | `true`       | Shows the drag handle.                                                        |
| `peekHeight`    | `number`                | `92`         | Visible height (px) of a collapsed standard sheet.                            |
| `dismissible`   | `boolean`               | `true`       | Modal only: when `false`, Esc, scrim, drag and the close button are disabled. |
| `compact`       | `boolean`               | `false`      | Tighter horizontal body padding, for lists of full-width rows.                |
| `closeLabel`    | `string`                | `'Close'`    | Accessible label of the close button.                                         |
| `expandLabel`   | `string`                | `'Expand'`   | Accessible label of the expand button (standard).                             |
| `collapseLabel` | `string`                | `'Collapse'` | Accessible label of the collapse button (standard).                           |
| `afterClosed`   | `output<void>`          | —            | Modal only: after the exit animation finished and the overlay is gone.        |

Default content is the scrolling body; content marked `abSheetFooter` is pinned below it.

## Programmatic use

`AbBottomSheetController.open(component, config)` renders `component` inside a modal sheet and returns an `AbBottomSheetRef`. Opening a sheet closes any other open one.

```ts
const sheets = inject(AbBottomSheetController);

const ref = sheets.open<ColorPicker, string>(ColorPicker, {
    heading: 'Pick a colour',
    inputs: { selected: 'red' }, // typed to the component's input()/model() members
    footer: ColorPickerFooter,
});

ref.afterClosed().subscribe((color) => console.log(color)); // undefined when dismissed
```

Inside the opened component (or its footer) inject the ref to close with a result:

```ts
inject(AbBottomSheetRef<string>).close('red');
```

### `AbBottomSheetConfig`

`heading` (required), `subheading`, `showHandle`, `dismissible`, `compact`, `closeLabel`, `inputs`, `footer` (component for the pinned footer), `injector` (parent injector; defaults to the root injector).

### API

| Member                            | Description                                           |
| --------------------------------- | ----------------------------------------------------- |
| `controller.open(component, cfg)` | Opens a sheet; returns `AbBottomSheetRef<R>`.         |
| `controller.closeAll()`           | Closes every open sheet; each resolves `undefined`.   |
| `ref.close(result?)`              | Closes the sheet. Only the first call counts.         |
| `ref.afterClosed()`               | `Observable<R \| undefined>`, emits once when closed. |

The overlay lives on `body`, so a theme or accent scoped to an ancestor (`data-ab-theme`, `data-ab-accent`) is re-applied to it.
