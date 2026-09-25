# Chip

A compact label. It can be static, removable, or a selectable toggle.

- **Selector:** `ab-chip`
- **Class:** `AbChip`

```ts
import { AbChip } from '@juanfelipecano/abbos';
```

```html
<!-- static -->
<ab-chip variant="soft">Angular</ab-chip>

<!-- removable -->
<ab-chip removable (removed)="drop(tag)">{{ tag }}</ab-chip>

<!-- selectable toggle -->
<ab-chip selectable [(selected)]="active">Favourites</ab-chip>
```

## Inputs / outputs

| Name          | Type                                                      | Default              | Description                                                                                     |
| ------------- | --------------------------------------------------------- | -------------------- | ----------------------------------------------------------------------------------------------- |
| `variant`     | `'neutral' \| 'soft' \| 'outline' \| 'dotted' \| 'solid'` | `'neutral'`          | Visual style.                                                                                   |
| `size`        | `'sm' \| 'md' \| 'lg'`                                    | global control size  | Size.                                                                                           |
| `shape`       | `'square' \| 'round' \| 'circle'`                         | global control shape | Corner radius.                                                                                  |
| `removable`   | `boolean`                                                 | `false`              | Shows a remove button; Backspace/Delete on the chip also removes it. Ignored when `selectable`. |
| `removeLabel` | `string`                                                  | `'Remove'`           | Accessible name prefix of the remove button; the chip label is appended.                        |
| `selectable`  | `boolean`                                                 | `false`              | Turns the chip into a toggle button (`aria-pressed`). Wins over `removable`.                    |
| `selected`    | `boolean` (model)                                         | `false`              | Two-way selected state. A check icon replaces the start slot when selected.                     |
| `disabled`    | `boolean`                                                 | `false`              | Blocks toggling and removing.                                                                   |
| `removed`     | `output<void>`                                            | —                    | Emitted when the remove button or Backspace/Delete is used.                                     |

## Content slots

- Default content: the label.
- `[abAvatar]`: leading avatar.
- `[abStart]`: leading icon (hidden while a selectable chip is selected).
