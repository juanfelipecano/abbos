# Segmented toggle

A two-option toggle with a sliding thumb (`role="radiogroup"`). Choose it for a binary choice with named sides, such as "Monthly / Yearly". For more than two options use [Segments](../../segments/README.md).

- **Selector:** `ab-segmented-toggle`
- **Class:** `AbSegmentedToggle` (implements `ControlValueAccessor`)

```ts
import { AbSegmentedToggle } from '@juanfelipecano/abbos';
```

```html
<ab-segmented-toggle
    startLabel="Monthly"
    endLabel="Yearly"
    [(checked)]="yearly"
    ariaLabel="Billing period"
/>
```

## Inputs

| Input        | Type                              | Default             | Description                                           |
| ------------ | --------------------------------- | ------------------- | ----------------------------------------------------- |
| `checked`    | `boolean` (model)                 | `false`             | `false` = start segment active, `true` = end segment. |
| `startLabel` | `string`                          | **required**        | Label of the first segment.                           |
| `endLabel`   | `string`                          | **required**        | Label of the second segment.                          |
| `size`       | `'sm' \| 'md' \| 'lg'`            | global control size | Size.                                                 |
| `shape`      | `'square' \| 'round' \| 'circle'` | `'circle'`          | Track and thumb shape.                                |
| `ariaLabel`  | `string`                          | —                   | Accessible name of the group.                         |
| `disabled`   | `boolean`                         | `false`             | Disables the control.                                 |

## Interaction

Click a segment, drag the thumb, or use the arrow keys (Left/Up/Home select the start, Right/Down/End the end). Works with Angular forms via `ControlValueAccessor` (value is a `boolean`).
