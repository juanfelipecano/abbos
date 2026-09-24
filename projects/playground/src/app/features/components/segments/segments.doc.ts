import { ComponentDoc } from '../../../core/docs/doc.model';
import { SEGMENTS_EXAMPLES } from './examples/segments-examples';

export const SEGMENTS_DOC: ComponentDoc = {
    slug: 'segments',
    examples: SEGMENTS_EXAMPLES,
    api: [
        {
            name: 'AbSegments',
            inputs: [
                {
                    name: 'value',
                    type: 'string | null',
                    default: 'null',
                    description: 'The value of the active segment. Supports [(value)].',
                },
                {
                    name: 'size',
                    type: "'sm' | 'md' | 'lg'",
                    default: "'md'",
                    description: 'Control height. Default from provideAbbos({ controlSize }).',
                },
                {
                    name: 'shape',
                    type: "'square' | 'round' | 'circle'",
                    default: "'circle'",
                    description: 'Track and thumb corners.',
                },
                {
                    name: 'fullWidth',
                    type: 'boolean',
                    default: 'false',
                    description:
                        'Stretches the control to its container, with equal-width segments.',
                },
                {
                    name: 'ariaLabel',
                    type: 'string',
                    default: '—',
                    description: 'Names the group, e.g. “Transaction type”.',
                },
                {
                    name: 'disabled',
                    type: 'boolean',
                    default: 'false',
                    description: 'Blocks interaction. Combines with a disabled form control.',
                },
            ],
            outputs: [
                {
                    name: 'valueChange',
                    payload: 'string | null',
                    description: 'Emits when the user selects a different segment.',
                },
            ],
            cssVars: [
                {
                    name: '--height',
                    default: 'var(--ab-control-h-md)',
                    description: 'Track height.',
                },
                { name: '--padding', default: '4px', description: 'Gap between track and thumb.' },
                {
                    name: '--radius',
                    default: 'var(--ab-radius-full)',
                    description: 'Track corners.',
                },
            ],
        },
        {
            name: 'AbSegment',
            inputs: [
                {
                    name: 'value',
                    type: 'string',
                    default: 'required',
                    description: 'Identifies the segment. Compared with AbSegments’ value.',
                },
                {
                    name: 'disabled',
                    type: 'boolean',
                    default: 'false',
                    description: 'Skips this segment for clicks and arrow keys.',
                },
            ],
            slots: [
                { selector: '(default)', description: 'The segment label.' },
                {
                    selector: 'ng-template[abSegmentContent]',
                    description: 'Optional content rendered below the control while active.',
                },
            ],
        },
    ],
    keyboard: [
        { keys: ['Tab'], action: 'Moves focus to the selected segment.' },
        { keys: ['←', '↑'], action: 'Selects the previous enabled segment.' },
        { keys: ['→', '↓'], action: 'Selects the next enabled segment.' },
        { keys: ['Home', 'End'], action: 'Selects the first or last enabled segment.' },
    ],
    aria: [
        'Renders role="radiogroup" with role="radio" buttons when segments only pick a value.',
        'Switches to role="tablist", role="tab" and a role="tabpanel" when any segment has abSegmentContent.',
        'Only the selected segment is in the tab order (roving tabindex); arrows move the selection.',
        'Name the group with ariaLabel — the labels alone don’t say what is being chosen.',
        'Implements ControlValueAccessor for reactive and template forms.',
    ],
    bestPractices: [],
    related: ['segmented-toggle', 'switch', 'button'],
};
