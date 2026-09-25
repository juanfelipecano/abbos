# Input

Styles a native text `<input>`. It adds no wrapper, so it works with any form approach (template-driven, reactive, plain).

- **Selector:** `input[ab-input]`
- **Class:** `AbInput`

```ts
import { AbInput } from '@juanfelipecano/abbos';
```

```html
<input
    ab-input
    placeholder="Email"
    formControlName="email"
    [invalid]="form.controls.email.invalid"
/>
```

## Inputs

| Input     | Type                              | Default              | Description                              |
| --------- | --------------------------------- | -------------------- | ---------------------------------------- |
| `size`    | `'sm' \| 'md' \| 'lg'`            | global control size  | Height and padding.                      |
| `shape`   | `'square' \| 'round' \| 'circle'` | global control shape | Corner radius.                           |
| `invalid` | `boolean`                         | `false`              | Error styling and `aria-invalid="true"`. |

All native input attributes (`type`, `placeholder`, `disabled`, …) work as usual.
