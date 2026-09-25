# Date picker

A calendar panel for choosing a single date or a range, opened from any element. Made of `ab-date-picker`, the `abDatePickerTrigger` directive, and the standalone `ab-calendar`.

- **Selectors:** `ab-date-picker`, `[abDatePickerTrigger]`, `ab-calendar`
- **Classes:** `AbDatePicker` (implements `ControlValueAccessor`), `AbDatePickerTrigger`, `AbCalendar`

```ts
import { AbDatePicker, AbDatePickerTrigger, AbCalendar } from '@juanfelipecano/abbos';
```

```html
<!-- typable input as the trigger -->
<input ab-input [abDatePickerTrigger]="picker" placeholder="DD/MM/YYYY" />
<ab-date-picker #picker [(value)]="date" [min]="today" />

<!-- range, opened from a button -->
<button ab-button [abDatePickerTrigger]="range">Choose dates</button>
<ab-date-picker #range mode="range" [(value)]="stay" />
```

## `ab-date-picker`

| Name            | Type                              | Default              | Description                                                                                                                           |
| --------------- | --------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `value`         | `AbDatePickerValue` (model)       | `null`               | Single: `Date` or string in `format`. Range: `{ start, end }` or one string. Emitted values are normalised to `Date` / `AbDateRange`. |
| `open`          | `boolean` (model)                 | `false`              | Whether the panel is open.                                                                                                            |
| `mode`          | `'single' \| 'range'`             | `'single'`           | Selection mode.                                                                                                                       |
| `format`        | `string`                          | `'dd/MM/yyyy'`       | Tokens: `dd d MM M MMM MMMM yy yyyy`. Used to show, type, and parse.                                                                  |
| `locale`        | `string`                          | `LOCALE_ID`          | Locale for names and first weekday.                                                                                                   |
| `min` / `max`   | `Date \| string \| null`          | `null`               | Selectable bounds.                                                                                                                    |
| `disabledDates` | `(date: Date) => boolean \| null` | `null`               | Returns `true` for dates that cannot be picked.                                                                                       |
| `weekStart`     | `number`                          | locale's first day   | `0` = Sunday … `6` = Saturday.                                                                                                        |
| `shape`         | `'square' \| 'round' \| 'circle'` | global control shape | Shape of the panel controls.                                                                                                          |
| `disabled`      | `boolean`                         | `false`              | Disables the picker.                                                                                                                  |
| `ariaLabel`     | `string`                          | `'Choose date'`      | Accessible name of the panel.                                                                                                         |

Methods: `show({ focus? })`, `openAt(element)` (open against any element, no trigger needed), `toggle()`, `close()`, `commitText(text)`, `previewText(text)`, `markTouched()`. The panel is placed below the trigger, or above when there is no room.

## `abDatePickerTrigger`

Put it on any element and pass the picker: `[abDatePickerTrigger]="picker"`. Optional `anchor` input sets the element the panel is positioned against.

- Adds `aria-haspopup="dialog"`, `aria-expanded`, and `aria-controls`.
- Click toggles the panel; Arrow Down opens it; Esc closes it and returns focus.
- Non-native hosts get `role="button"` and `tabindex="0"` so Enter and Space work.
- On a typable `<input>` the text is the value: shown in `format`, followed as you type, applied on Enter or blur, and flagged with `aria-invalid` when it cannot be parsed.

## `ab-calendar`

The inline calendar used by the picker, usable on its own. Supports the same `value`, `mode`, `format`, `locale`, `min`, `max`, `disabledDates`, `weekStart`, and `shape` inputs, with day / month / year views (`AbCalendarView`). `focusDay()` moves keyboard focus onto the day holding the tab stop.

## Types and tokens

- `AbDatePickerMode`: `'single' | 'range'`
- `AbDateRange`: `{ start: Date | null; end: Date | null }`
- `AbDateRangeInput`: `{ start: Date | string | null; end?: Date | string | null }`
- `AbDatePickerValue`: `Date | string | AbDateRangeInput | null`
- `AB_DATE_NOW`: injection token for the clock ("today"). Override to pin the date in tests or demos:

```ts
{ provide: AB_DATE_NOW, useValue: () => new Date(2026, 1, 1) }
```

Helpers for parsing, formatting, and comparing days live in `date-utils.ts` (internal).
