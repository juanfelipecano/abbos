# Icon

Renders a [Lucide](https://lucide.dev) icon with optional tone, background appearance, and shape.

- **Selector:** `ab-icon`
- **Class:** `AbIcon`

```ts
import { AbIcon } from '@juanfelipecano/abbos';
import { LucideCheck } from '@lucide/angular';
```

```html
<ab-icon [icon]="check" tone="success" appearance="soft" size="lg" label="Saved" />
```

## Inputs

| Input         | Type                                                                     | Default      | Description                                                                                |
| ------------- | ------------------------------------------------------------------------ | ------------ | ------------------------------------------------------------------------------------------ |
| `icon`        | `LucideIconInput`                                                        | **required** | The Lucide icon to draw.                                                                   |
| `tone`        | `'primary' \| 'success' \| 'info' \| 'warning' \| 'danger' \| 'neutral'` | `'success'`  | Colour family.                                                                             |
| `appearance`  | `'soft' \| 'solid' \| 'outline' \| 'clear'`                              | `'clear'`    | Background treatment; `clear` is the bare glyph.                                           |
| `size`        | `'sm' \| 'md' \| 'lg' \| 'xl'`                                           | `'sm'`       | Glyph size: 16 / 22 / 32 / 40 px.                                                          |
| `shape`       | `'square' \| 'round' \| 'circle'`                                        | `'circle'`   | Shape of the background (when not `clear`).                                                |
| `strokeWidth` | `number`                                                                 | `2`          | Lucide stroke width.                                                                       |
| `label`       | `string \| null`                                                         | `null`       | Accessible name. With a label the host gets `role="img"`; without one it is `aria-hidden`. |
