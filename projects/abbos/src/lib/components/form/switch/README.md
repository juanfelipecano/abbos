# Switch

An on/off toggle (`role="switch"`) that can be clicked, focused with the keyboard, or dragged. Works as a form control.

- **Selector:** `ab-switch`
- **Class:** `AbSwitch` (implements `ControlValueAccessor`)

```ts
import { AbSwitch } from '@juanfelipecano/abbos';
```

```html
<ab-switch [(checked)]="notifications">Notifications</ab-switch>

<ab-switch formControlName="darkMode" ariaLabel="Dark mode" />
```

## Inputs

| Input       | Type                              | Default             | Description                                       |
| ----------- | --------------------------------- | ------------------- | ------------------------------------------------- |
| `checked`   | `boolean` (model)                 | `false`             | Two-way on/off state.                             |
| `size`      | `'sm' \| 'md' \| 'lg'`            | global control size | Size.                                             |
| `shape`     | `'square' \| 'round' \| 'circle'` | `'circle'`          | Track and knob shape.                             |
| `ariaLabel` | `string`                          | —                   | Accessible name when there is no projected label. |
| `disabled`  | `boolean`                         | `false`             | Disables the control (also set by the form API).  |

Default content is the visible label.

## Forms

Implements `ControlValueAccessor` with a `boolean` value (`null` is treated as `false`); use it with `ngModel`, `formControl`, or `formControlName`. It marks the control as touched on blur.
