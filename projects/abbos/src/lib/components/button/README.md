# Button

A native `<button>` styled by the design system. Applied as an attribute component.

- **Selector:** `button[ab-button]`
- **Class:** `AbButton`

```ts
import { AbButton } from '@juanfelipecano/abbos';
```

```html
<button ab-button variant="primary" (click)="save()">Save</button>

<button ab-button variant="outline" [loading]="saving()">
    <svg abStart>…</svg>
    Upload
</button>
```

## Inputs

| Input      | Type                                                                     | Default                          | Description                                             |
| ---------- | ------------------------------------------------------------------------ | -------------------------------- | ------------------------------------------------------- |
| `variant`  | `'primary' \| 'secondary' \| 'soft' \| 'outline' \| 'ghost' \| 'danger'` | `'primary'`                      | Visual style.                                           |
| `size`     | `'sm' \| 'md' \| 'lg'`                                                   | global control size (`'md'`)     | Height and padding.                                     |
| `shape`    | `'square' \| 'round' \| 'circle'`                                        | global control shape (`'round'`) | Corner radius.                                          |
| `full`     | `boolean`                                                                | `false`                          | Stretches to the container width.                       |
| `loading`  | `boolean`                                                                | `false`                          | Shows a spinner, sets `aria-busy`, blocks clicks.       |
| `disabled` | `boolean`                                                                | `false`                          | Sets `aria-disabled` and blocks clicks and Enter/Space. |

`size` and `shape` fall back to the defaults set with `provideAbbos({ controlSize, controlShape })`.

## Content slots

- Default content: the label.
- `[abStart]`: element before the label (icon).
- `[abEnd]`: element after the label.

## Notes

- Disabled and loading buttons stay focusable (`aria-disabled`, not the native `disabled` attribute); click and keyboard activation are swallowed.
- Styles live in `button.scss` and read the `--ab-*` design tokens.
