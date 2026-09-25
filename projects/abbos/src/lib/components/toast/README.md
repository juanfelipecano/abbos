# Toast

Short, non-blocking messages. Show them with `AbToastController`; `ab-toast` is the visual component the controller renders.

- **Selector:** `ab-toast`
- **Classes:** `AbToast`, `AbToastController`, `AbToastRef`

```ts
import { AbToastController } from '@juanfelipecano/abbos';
```

```ts
const toasts = inject(AbToastController);

toasts.success('Saved');
toasts
    .error('Upload failed', { actionLabel: 'Retry' })
    .onAction()
    .subscribe(() => retry());
toasts.show({ message: 'Archived', position: 'top-right', mode: 'stacked' });
```

## `AbToastController`

| Method                      | Description                                                             |
| --------------------------- | ----------------------------------------------------------------------- |
| `show(config \| message)`   | Shows a toast; returns an `AbToastRef`.                                 |
| `success(message, config?)` | Shortcut with `severity: 'success'`.                                    |
| `info(message, config?)`    | Shortcut with `severity: 'info'`.                                       |
| `error(message, config?)`   | Shortcut with `severity: 'error'`. Announced through an `alert` region. |
| `dismiss()`                 | Dismisses the newest toast on screen; the next waiting one appears.     |
| `dismissAll()`              | Dismisses every toast and drops everything waiting.                     |

### `AbToastConfig`

| Field         | Type                                                                                                          | Default                        | Description                                                                                                                                                           |
| ------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `message`     | `string`                                                                                                      | required                       | Text.                                                                                                                                                                 |
| `actionLabel` | `string`                                                                                                      | —                              | Label of the single text action. Do not use "Dismiss"; that is the close button.                                                                                      |
| `severity`    | `'neutral' \| 'success' \| 'info' \| 'error'`                                                                 | `'neutral'`                    | Style and announcement level.                                                                                                                                         |
| `position`    | `'top-left' \| 'top-center' \| 'top-right' \| 'bottom-left' \| 'bottom-center' \| 'bottom-right' \| 'center'` | `'bottom-center'`              | Where it appears.                                                                                                                                                     |
| `mode`        | `'queue' \| 'stacked' \| 'expanded'`                                                                          | `'queue'`                      | `queue`: one at a time, others wait. `stacked`: a pile that fans out on hover/focus. `expanded`: always a full list. The latest toast in a position decides its mode. |
| `maxVisible`  | `number`                                                                                                      | `3`                            | `stacked`/`expanded` only: how many show at once.                                                                                                                     |
| `duration`    | `number` (ms)                                                                                                 | `4000` (`8000` with an action) | `0` keeps it until the user closes it or takes the action.                                                                                                            |
| `dismissible` | `boolean`                                                                                                     | `false`                        | Shows a close button. Always on for a persistent toast without an action.                                                                                             |
| `closeLabel`  | `string`                                                                                                      | `'Dismiss'`                    | Accessible label of the close button.                                                                                                                                 |

### `AbToastRef`

- `dismiss()`: dismisses the toast or removes it from the queue (first call wins).
- `afterDismissed()`: `Observable<'timeout' | 'action' | 'dismiss'>`, emits once after the exit transition.
- `onAction()`: `Observable<void>`, emits when the user takes the action, right before it dismisses.

## `ab-toast` inputs

`message` (required), `actionLabel`, `severity`, `dismissible`, `closeLabel`, `leaving` (plays the exit transition; set by the controller); outputs `action` and `dismissed`.
