# Segments

A segmented control for choosing one value from several options, optionally switching content panels. Made of `ab-segments` and `ab-segment`.

- **Selectors:** `ab-segments`, `ab-segment`, `ng-template[abSegmentContent]`
- **Classes:** `AbSegments` (implements `ControlValueAccessor`), `AbSegment`, `AbSegmentContent`

```ts
import { AbSegments, AbSegment, AbSegmentContent } from '@juanfelipecano/abbos';
```

```html
<!-- picks a value: radio semantics -->
<ab-segments [(value)]="view" ariaLabel="View">
    <ab-segment value="list">List</ab-segment>
    <ab-segment value="grid">Grid</ab-segment>
</ab-segments>

<!-- switches content: tab semantics -->
<ab-segments [(value)]="tab">
    <ab-segment value="a">
        Overview
        <ng-template abSegmentContent>Overview content</ng-template>
    </ab-segment>
    <ab-segment value="b" disabled>Details</ab-segment>
</ab-segments>
```

## `ab-segments` inputs

| Input       | Type                              | Default             | Description                       |
| ----------- | --------------------------------- | ------------------- | --------------------------------- |
| `value`     | `string \| null` (model)          | `null`              | `value` of the active segment.    |
| `size`      | `'sm' \| 'md' \| 'lg'`            | global control size | Size.                             |
| `shape`     | `'square' \| 'round' \| 'circle'` | `'circle'`          | Track and thumb shape.            |
| `fullWidth` | `boolean`                         | `false`             | Stretches to the container width. |
| `ariaLabel` | `string`                          | —                   | Accessible name of the group.     |
| `disabled`  | `boolean`                         | `false`             | Disables all segments.            |

## `ab-segment` inputs

| Input      | Type      | Default      | Description                    |
| ---------- | --------- | ------------ | ------------------------------ |
| `value`    | `string`  | **required** | Value this segment represents. |
| `disabled` | `boolean` | `false`      | Disables this segment.         |

Projected content is the label. A child `<ng-template abSegmentContent>` becomes the panel shown while the segment is active.

## Accessibility

If any segment has `abSegmentContent`, the control uses tabs semantics (`tablist` / `tab` / `tabpanel`); otherwise radio semantics. Only the active (or first enabled) segment is in the tab order. Works with Angular forms (`string | null` value).
