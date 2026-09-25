import { ComponentDoc } from '../../../core/docs/doc.model';
import { DATE_PICKER_EXAMPLES } from './examples/date-picker-examples';

const SHARED_INPUTS = [
    {
        name: 'value',
        type: 'Date | string | { start, end } | null',
        default: 'null',
        description:
            'Single: a Date or a string in format. Range: { start, end } or one string such as 01/02/2026 – 05/02/2026. Supports [(value)]; emitted values are always Date or { start: Date | null, end: Date | null }.',
    },
    {
        name: 'mode',
        type: "'single' | 'range'",
        default: "'single'",
        description: 'One date or a start and end date.',
    },
    {
        name: 'format',
        type: 'string',
        default: "'dd/MM/yyyy'",
        description:
            'Used to show, type and parse dates. Tokens: dd d MM M MMM MMMM yy yyyy. Any other character is copied as is.',
    },
    {
        name: 'locale',
        type: 'string',
        default: 'LOCALE_ID',
        description: 'Month and weekday names, and the default first day of the week.',
    },
    {
        name: 'min',
        type: 'Date | string | null',
        default: 'null',
        description: 'Earliest selectable day. Strings use format.',
    },
    {
        name: 'max',
        type: 'Date | string | null',
        default: 'null',
        description: 'Latest selectable day. Strings use format.',
    },
    {
        name: 'disabledDates',
        type: '(date: Date) => boolean',
        default: 'null',
        description: 'Return true to make a day unavailable, for example weekends.',
    },
    {
        name: 'weekStart',
        type: 'number',
        default: 'from locale',
        description: 'First day of the week: 0 is Sunday, 1 is Monday.',
    },
    {
        name: 'shape',
        type: "'square' | 'round' | 'circle'",
        default: "'round'",
        description: 'Corners of days and buttons. Default from provideAbbos({ controlShape }).',
    },
];

export const DATE_PICKER_DOC: ComponentDoc = {
    slug: 'date-picker',
    examples: DATE_PICKER_EXAMPLES,
    api: [
        {
            name: 'AbCalendar',
            inputs: SHARED_INPUTS,
            outputs: [
                {
                    name: 'valueChange',
                    payload: 'Date | AbDateRange | null',
                    description:
                        'Emits on every click. In range mode the first click emits { start, end: null }.',
                },
            ],
            cssVars: [
                { name: '--cell', default: '40px', description: 'Day cell size.' },
                {
                    name: '--band',
                    default: '16% of --ab-primary',
                    description: 'Fill between the ends of a range.',
                },
            ],
        },
        {
            name: 'AbDatePicker',
            inputs: [
                ...SHARED_INPUTS,
                {
                    name: 'open',
                    type: 'boolean',
                    default: 'false',
                    description:
                        'Whether the panel is open. Supports [(open)]. Methods: show({ focus }), toggle(), close() and openAt(element), which opens against any element with no trigger directive.',
                },
                {
                    name: 'disabled',
                    type: 'boolean',
                    default: 'false',
                    description: 'The panel does not open. Combines with a disabled form control.',
                },
                {
                    name: 'ariaLabel',
                    type: 'string',
                    default: "'Choose date'",
                    description: 'Accessible name of the dialog.',
                },
            ],
            outputs: [
                {
                    name: 'valueChange',
                    payload: 'Date | AbDateRange | null',
                    description:
                        'Single: on click. Range: on Apply, or when typed text is accepted.',
                },
                {
                    name: 'openChange',
                    payload: 'boolean',
                    description: 'The panel opened or closed.',
                },
            ],
        },
        {
            name: 'AbDatePickerTrigger',
            inputs: [
                {
                    name: 'abDatePickerTrigger',
                    type: 'AbDatePicker',
                    default: 'required',
                    description:
                        'The picker this element opens. Give it a template reference: #picker. Works on any element or component, and as a hostDirective.',
                },
                {
                    name: 'abDatePickerAnchor',
                    type: 'HTMLElement | ElementRef',
                    default: 'the trigger',
                    description:
                        'Element the panel is positioned against, for example a whole field when only its icon is the trigger.',
                },
            ],
        },
    ],
    keyboard: [
        {
            keys: ['Arrow Down'],
            action: 'Opens the panel from any trigger and moves focus into it.',
        },
        {
            keys: ['Enter', 'Space'],
            action: 'Opens or closes the panel from a non-button trigger.',
        },
        {
            keys: ['Enter'],
            action: 'In an input trigger, applies the typed text and closes the panel.',
        },
        { keys: ['Tab'], action: 'In an input trigger, closes the panel.' },
        { keys: ['←', '→', '↑', '↓'], action: 'Moves focus by day or by week.' },
        { keys: ['Home', 'End'], action: 'Moves to the start or end of the week.' },
        { keys: ['Page Up', 'Page Down'], action: 'Moves by month. With Shift, by year.' },
        { keys: ['Enter', 'Space'], action: 'Picks the focused day.' },
        {
            keys: ['Esc'],
            action: 'Closes the panel, drops an unapplied range and returns focus to the trigger.',
        },
        { keys: ['Tab'], action: 'Cycles inside the open panel.' },
    ],
    aria: [
        'The panel is a role="dialog" containing a role="grid". Each day is a button with a full date label, plus "today" or "unavailable" when it applies.',
        'The trigger gets aria-haspopup="dialog", aria-expanded and aria-controls. An input trigger also gets aria-invalid when its text is not a valid date.',
        'Focus moves to the selected day, or today, when the panel opens, and returns to the trigger when it closes.',
        'Give every trigger an accessible name: a visible label, aria-label, or the text inside a button.',
        'Clicking a typable input opens the panel but keeps focus in the input, so typing is never interrupted. The calendar follows valid text as it is typed. Arrow Down moves focus into the calendar; Enter or Tab closes it. A read-only input behaves like a button.',
        'Any element or component can be the trigger. One that is not a native control and has no focusable content gets role="button" and tabindex="0"; your own role or tabindex is kept. When the trigger is a component, focus returns to its first focusable element.',
        'Put the directive on the inner input and set abDatePickerAnchor to the wrapper when a field component wraps a native input.',
        'The panel opens below its trigger and flips above when there is not enough room below. It follows the trigger on scroll.',
        'Implements ControlValueAccessor: formControl, formControlName and ngModel work on ab-date-picker.',
        'Today comes from the AB_DATE_NOW injection token, so tests and demos can pin the date.',
    ],
    bestPractices: [],
    related: ['input', 'button', 'segmented-toggle'],
};
