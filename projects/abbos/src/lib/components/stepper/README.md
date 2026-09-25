# Stepper

A progress indicator for multi-step flows, with optional per-step content. Made of `ab-stepper` and `ab-step`.

- **Selectors:** `ab-stepper`, `ab-step`, `ng-template[abStepContent]`
- **Classes:** `AbStepper`, `AbStep`, `AbStepContent`

```ts
import { AbStepper, AbStep, AbStepContent } from '@juanfelipecano/abbos';
```

```html
<ab-stepper #stepper [(value)]="current" marker="number" interactive>
    <ab-step value="account" title="Account" caption="Your details" doneCaption="Email confirmed">
        <ng-template abStepContent>…form…</ng-template>
    </ab-step>
    <ab-step value="plan" title="Plan" />
</ab-stepper>

<button ab-button (click)="stepper.back()">Back</button>
<button ab-button (click)="stepper.next()">Next</button>
```

## `ab-stepper`

| Name          | Type                           | Default      | Description                                                        |
| ------------- | ------------------------------ | ------------ | ------------------------------------------------------------------ |
| `value`       | `string \| null` (model)       | `null`       | `value` of the active step.                                        |
| `complete`    | `boolean` (model)              | `false`      | Marks every step done and none current (e.g. an "all set" screen). |
| `marker`      | `'icon' \| 'number' \| 'text'` | `'icon'`     | What the marker shows. `text` always shows title and caption.      |
| `labels`      | `boolean`                      | `true`       | Shows title and caption under each marker.                         |
| `interactive` | `boolean`                      | `false`      | Completed steps become buttons that jump back to them.             |
| `ariaLabel`   | `string`                       | `'Progress'` | Accessible name.                                                   |

Methods: `next()` moves forward, or completes the flow from the last step; `back()` moves back, or reopens the last step from the complete state.

Step states: `'done' | 'current' | 'todo'` (`AbStepState`).

## `ab-step`

| Input         | Type              | Default      | Description                                                      |
| ------------- | ----------------- | ------------ | ---------------------------------------------------------------- |
| `value`       | `string`          | **required** | Step identifier.                                                 |
| `title`       | `string`          | —            | Step title.                                                      |
| `caption`     | `string`          | —            | Secondary line under the title.                                  |
| `doneCaption` | `string`          | —            | Replaces `caption` once the step is done.                        |
| `icon`        | `LucideIconInput` | —            | Marker icon when `marker="icon"`; falls back to the step number. |

A child `<ng-template abStepContent>` is rendered as the panel of the current step.
