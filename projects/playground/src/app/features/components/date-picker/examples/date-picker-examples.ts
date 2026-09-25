import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
    AbButton,
    AbCalendar,
    AbChip,
    AbDatePicker,
    AbDatePickerTrigger,
    AbDatePickerValue,
    AbInput,
} from 'abbos';
import { ExampleDef } from '../../../../core/docs/doc.model';
import { exampleFiles } from '../../../../shared/docs/example-files';
import button from './date-picker-button.html' with { loader: 'text' };
import element from './date-picker-element.html' with { loader: 'text' };
import custom from './date-picker-custom.html' with { loader: 'text' };
import format from './date-picker-format.html' with { loader: 'text' };
import forms from './date-picker-forms.html' with { loader: 'text' };
import inline from './date-picker-inline.html' with { loader: 'text' };
import input from './date-picker-input.html' with { loader: 'text' };
import range from './date-picker-range.html' with { loader: 'text' };

const FIELD_STYLES = `
    .field {
        display: flex;
        flex-direction: column;
        gap: var(--ab-space-1);
        width: 240px;
    }
    label {
        font: var(--ab-text-label);
    }
    .hint,
    .status {
        font: var(--ab-text-caption);
        color: var(--ab-text-secondary);
    }
`;

const CARD_STYLES = `
    .card {
        display: flex;
        flex-direction: column;
        gap: var(--ab-space-1);
        min-width: 200px;
        padding: var(--ab-space-3) var(--ab-space-4);
        color: var(--ab-text);
        background: var(--ab-surface);
        border: 1px solid var(--ab-border);
        border-radius: var(--ab-radius-card);
        cursor: pointer;
    }
    .card:hover {
        border-color: var(--ab-border-strong);
    }
    .card:focus-visible {
        outline: none;
        box-shadow: var(--ab-focus-ring);
    }
    .label {
        font: var(--ab-text-caption);
        color: var(--ab-text-secondary);
    }
`;

@Component({
    selector: 'app-date-picker-inline',
    imports: [AbCalendar],
    templateUrl: './date-picker-inline.html',
    host: { class: 'pg-row' },
})
export class DatePickerInline {
    protected readonly date = signal<AbDatePickerValue>('12/03/2026');
    protected readonly range = signal<AbDatePickerValue>({
        start: '10/03/2026',
        end: '14/03/2026',
    });
}

@Component({
    selector: 'app-date-picker-button',
    imports: [AbButton, AbDatePicker, AbDatePickerTrigger],
    templateUrl: './date-picker-button.html',
    host: { class: 'pg-row' },
})
export class DatePickerButton {
    protected readonly date = signal<AbDatePickerValue>(null);
}

@Component({
    selector: 'app-date-picker-input',
    imports: [AbInput, AbDatePicker, AbDatePickerTrigger],
    templateUrl: './date-picker-input.html',
    styles: FIELD_STYLES,
    host: { class: 'pg-row' },
})
export class DatePickerInput {
    protected readonly date = signal<AbDatePickerValue>(null);
}

@Component({
    selector: 'app-date-picker-range',
    imports: [AbButton, AbDatePicker, AbDatePickerTrigger],
    templateUrl: './date-picker-range.html',
    host: { class: 'pg-row' },
})
export class DatePickerRange {
    protected readonly stay = signal<AbDatePickerValue>(null);
}

@Component({
    selector: 'app-date-picker-format',
    imports: [AbInput, AbDatePicker, AbDatePickerTrigger],
    templateUrl: './date-picker-format.html',
    styles: FIELD_STYLES,
    host: { class: 'pg-row' },
})
export class DatePickerFormat {
    protected readonly isoDate = signal<AbDatePickerValue>('2026-03-04');
    protected readonly longDate = signal<AbDatePickerValue>('4 Mar 2026');
}

@Component({
    selector: 'app-date-picker-custom',
    imports: [AbChip, AbDatePicker, AbDatePickerTrigger],
    templateUrl: './date-picker-custom.html',
    host: { class: 'pg-row' },
})
export class DatePickerCustom {
    protected readonly date = signal<AbDatePickerValue>(null);
}

@Component({
    selector: 'app-date-picker-element',
    imports: [AbDatePicker, AbDatePickerTrigger],
    templateUrl: './date-picker-element.html',
    styles: CARD_STYLES,
    host: { class: 'pg-row' },
})
export class DatePickerElement {
    protected readonly stay = signal<AbDatePickerValue>(null);
}

@Component({
    selector: 'app-date-picker-forms',
    imports: [AbButton, AbDatePicker, AbDatePickerTrigger, ReactiveFormsModule],
    templateUrl: './date-picker-forms.html',
    styles: FIELD_STYLES,
    host: { class: 'pg-stack' },
})
export class DatePickerForms {
    protected readonly birthday = new FormControl<AbDatePickerValue>(null);
}

export const DATE_PICKER_EXAMPLES: readonly ExampleDef[] = [
    {
        id: 'inline',
        title: 'Inline calendar',
        description:
            'ab-calendar is the plain component: always visible, no trigger. Bind [(value)] with a Date, or a string in the format.',
        component: DatePickerInline,
        files: exampleFiles({
            name: 'date-picker-inline',
            html: inline,
            imports: ['AbCalendar', 'AbDatePickerValue'],
            core: ['signal'],
            body: "  date = signal<AbDatePickerValue>('12/03/2026');\n  range = signal<AbDatePickerValue>({ start: '10/03/2026', end: '14/03/2026' });",
        }),
    },
    {
        id: 'button',
        title: 'Dropdown from a button',
        description:
            'Put abDatePickerTrigger on the element that opens it and point it at the picker. A single date closes the panel on click.',
        component: DatePickerButton,
        files: exampleFiles({
            name: 'date-picker-button',
            html: button,
            imports: ['AbButton', 'AbDatePicker', 'AbDatePickerTrigger', 'AbDatePickerValue'],
            core: ['signal'],
            body: '  date = signal<AbDatePickerValue>(null);',
        }),
    },
    {
        id: 'input',
        title: 'Dropdown from an input',
        description:
            'On an input the text is the value: it is shown, typed and parsed in the format. A click opens the panel and keeps focus in the input, so typing is never interrupted. Arrow Down moves focus into the calendar; Enter or Tab closes it.',
        component: DatePickerInput,
        files: exampleFiles({
            name: 'date-picker-input',
            html: input,
            imports: ['AbInput', 'AbDatePicker', 'AbDatePickerTrigger', 'AbDatePickerValue'],
            core: ['signal'],
            body: '  date = signal<AbDatePickerValue>(null);',
        }),
    },
    {
        id: 'range',
        title: 'Date range',
        description:
            'A range keeps a draft until Apply. Esc or Cancel discards it, and Apply stays disabled until both ends are picked.',
        component: DatePickerRange,
        files: exampleFiles({
            name: 'date-picker-range',
            html: range,
            imports: ['AbButton', 'AbDatePicker', 'AbDatePickerTrigger', 'AbDatePickerValue'],
            core: ['signal'],
            body: '  stay = signal<AbDatePickerValue>(null);',
        }),
    },
    {
        id: 'format',
        title: 'Custom format',
        description:
            "The default is dd/MM/yyyy. Set format and pass values written in it; they're parsed with the same format.",
        component: DatePickerFormat,
        files: exampleFiles({
            name: 'date-picker-format',
            html: format,
            imports: ['AbInput', 'AbDatePicker', 'AbDatePickerTrigger', 'AbDatePickerValue'],
            core: ['signal'],
            body: "  isoDate = signal<AbDatePickerValue>('2026-03-04');\n  longDate = signal<AbDatePickerValue>('4 Mar 2026');",
        }),
    },
    {
        id: 'custom',
        title: 'A component as the trigger',
        description:
            'Any component works. A host with nothing focusable inside, like a plain ab-chip, gets role="button" and tabindex="0". Focus returns to it when the panel closes.',
        component: DatePickerCustom,
        files: exampleFiles({
            name: 'date-picker-custom',
            html: custom,
            imports: ['AbChip', 'AbDatePicker', 'AbDatePickerTrigger', 'AbDatePickerValue'],
            core: ['signal'],
            body: '  date = signal<AbDatePickerValue>(null);',
        }),
    },
    {
        id: 'element',
        title: 'Any element',
        description:
            'A plain div becomes a trigger too: it is given role="button" and tabindex="0", and Enter and Space open it. Set your own role or tabindex and they are kept.',
        component: DatePickerElement,
        files: exampleFiles({
            name: 'date-picker-element',
            html: element,
            imports: ['AbDatePicker', 'AbDatePickerTrigger', 'AbDatePickerValue'],
            core: ['signal'],
            body: '  stay = signal<AbDatePickerValue>(null);',
        }),
    },
    {
        id: 'forms',
        title: 'In a form',
        description:
            'Implements ControlValueAccessor. The control holds a Date, or { start, end } in range mode.',
        component: DatePickerForms,
        files: exampleFiles({
            name: 'date-picker-forms',
            html: forms,
            imports: ['AbButton', 'AbDatePicker', 'AbDatePickerTrigger', 'AbDatePickerValue'],
            extraImports: ["import { FormControl, ReactiveFormsModule } from '@angular/forms';"],
            extraDeps: ['ReactiveFormsModule'],
            body: '  birthday = new FormControl<AbDatePickerValue>(null);',
            layout: 'stack',
        }),
    },
];
