# Date picker

Source of truth for the design: `projects/abbos/abbos-design-components/Date Picker.dc.html`.

## Scope

A plain calendar (`ab-calendar`) and a dropdown (`ab-date-picker`) that opens from any element
carrying `abDatePickerTrigger`. Single date or range. Configurable format, default `dd/MM/yyyy`.

## Decisions

- **No date library.** `Date` and `Intl` cover names, locale and week start. A small
  `date-utils.ts` formats and parses the tokens `dd d MM M MMM MMMM yy yyyy`. Time zones,
  recurrence and time of day are out of scope.
- **A directive is needed** (`AbDatePickerTrigger`): opening from a button, an input or any
  clickable is behaviour, not a template. It sets the popup ARIA, handles the keys and, on an
  `<input>`, syncs text with the value.
- **Flip above or below** uses the CDK `FlexibleConnectedPositionStrategy` with positions
  below-start, above-start, below-end, above-end and push. The first that fits wins.
- **Any trigger.** The directive works on any element or component (also as a `hostDirective`),
  and `openAt(element)` opens the panel with no directive at all.
- **Input triggers open on click** but keep focus in the input; Arrow Down moves focus into the
  calendar. A read-only input behaves like a button.
- **Dropdown flow.** Single commits and closes on click. Range keeps a draft until Apply.
- **"Today"** comes from the `AB_DATE_NOW` token, never `new Date()` inline.

## Acceptance criteria

| ID    | Criterion                                                                                                                                                       | Verified by                                    |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| AC-1  | The default format is `dd/MM/yyyy` with leading zeros; `format` changes display, typing, parsing                                                                | `date-utils.spec.ts`, `date-picker.spec.ts`    |
| AC-2  | `value` accepts a `Date` or a string in `format`; range accepts `{ start, end }` or one string                                                                  | `date-utils.spec.ts`, `calendar.spec.ts`       |
| AC-3  | Emitted values are `Date` (single) or `{ start, end }` of `Date` (range)                                                                                        | `date-picker.spec.ts`                          |
| AC-4  | Impossible dates (`31/02/2026`) are rejected, never rolled over                                                                                                 | `date-utils.spec.ts`                           |
| AC-5  | Range takes two clicks; a click before the start restarts; Apply is disabled while half-picked                                                                  | `calendar.spec.ts`, `date-picker.spec.ts`      |
| AC-6  | `min`, `max` and `disabledDates` make days unavailable and unselectable                                                                                         | `calendar.spec.ts`                             |
| AC-7  | The panel opens from a button, an input (click or Arrow Down) and any clickable                                                                                 | `date-picker.spec.ts`                          |
| AC-8  | The panel opens below, and above when there is no room below                                                                                                    | `date-picker.spec.ts` (mocked layout)          |
| AC-9  | Trigger has `aria-haspopup`, `aria-expanded`, `aria-controls`; Esc closes and returns focus                                                                     | `date-picker.spec.ts`                          |
| AC-10 | Keyboard: arrows, Home/End, PageUp/PageDown, Shift + PageUp/PageDown                                                                                            | `calendar.spec.ts`                             |
| AC-11 | Works as a `ControlValueAccessor`, including disabled                                                                                                           | `date-picker.spec.ts`                          |
| AC-12 | Passes AXE and WCAG AA in light and dark, with every accent                                                                                                     | **Not verified** (no axe tooling; see BACKLOG) |
| AC-13 | Any element or component can be the trigger; a non-native host gets `role`/`tabindex` unless it has its own; focus returns to it (or its first focusable child) | `date-picker.spec.ts`                          |
| AC-14 | Clicking a typable input opens the panel with focus kept in the input; valid text moves the calendar as typed; Enter or Tab closes                              | `date-picker.spec.ts`                          |

## Non-goals

Time selection, week numbers, multiple non-contiguous dates, translated UI strings, a mobile
full-screen modal (Material 3's modal variant).
