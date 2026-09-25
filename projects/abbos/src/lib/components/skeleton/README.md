# Skeleton

A loading placeholder. Compose several to mimic the layout of the real content and give them its final dimensions so nothing jumps when data arrives.

- **Selector:** `ab-skeleton`
- **Class:** `AbSkeleton`

```ts
import { AbSkeleton } from '@juanfelipecano/abbos';
```

```html
<div aria-busy="true">
    <ab-skeleton variant="circle" width="48px" />
    <ab-skeleton variant="text" [lines]="3" />
    <ab-skeleton variant="rect" height="120px" animation="shimmer" />
</div>
```

## Inputs

| Input       | Type                             | Default   | Description                                                         |
| ----------- | -------------------------------- | --------- | ------------------------------------------------------------------- |
| `variant`   | `'text' \| 'rect' \| 'circle'`   | `'rect'`  | Shape.                                                              |
| `width`     | `string` (CSS length)            | —         | Text defaults to full width, a rectangle to 100%, a circle to 40px. |
| `height`    | `string` (CSS length)            | —         | Text bars are always one line tall; a circle defaults to its width. |
| `lines`     | `number`                         | `1`       | Number of text bars; the last is shorter. `text` variant only.      |
| `animation` | `'pulse' \| 'shimmer' \| 'none'` | `'pulse'` | Loading animation.                                                  |

## Accessibility

The skeleton is decorative (`aria-hidden`). Mark the loading region `aria-busy="true"` and announce the state yourself, for example with a visually hidden `role="status"` message.

It fades in after a short delay (`--delay`, 150ms) so fast loads never flash a placeholder. Use it for content areas; use the button's `loading` state for short actions.
