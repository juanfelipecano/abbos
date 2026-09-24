import { ComponentDoc } from '../../../core/docs/doc.model';
import { SEGMENTED_TOGGLE_EXAMPLES } from './examples/segmented-toggle-examples';
import { SEGMENTED_TOGGLE_BEST_PRACTICES } from './segmented-toggle-best-practices';

export const SEGMENTED_TOGGLE_DOC: ComponentDoc = {
    slug: 'segmented-toggle',
    examples: SEGMENTED_TOGGLE_EXAMPLES,
    api: [
        {
            name: 'AbSegmentedToggle',
            inputs: [
                {
                    name: 'startLabel',
                    type: 'string',
                    default: 'required',
                    description: 'Text of the first option (checked = false).',
                },
                {
                    name: 'endLabel',
                    type: 'string',
                    default: 'required',
                    description: 'Text of the second option (checked = true).',
                },
                {
                    name: 'checked',
                    type: 'boolean',
                    default: 'false',
                    description: 'Which option is selected. Supports [(checked)].',
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
                    name: 'ariaLabel',
                    type: 'string',
                    default: '—',
                    description: 'Names the radio group, e.g. “Billing period”.',
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
                    name: 'checkedChange',
                    payload: 'boolean',
                    description: 'Emits when the selection changes.',
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
                {
                    name: '--thumb-radius',
                    default: 'var(--ab-radius-full)',
                    description: 'Thumb corners.',
                },
            ],
        },
    ],
    keyboard: [
        { keys: ['Tab'], action: 'Moves focus to the selected option.' },
        { keys: ['←', '↑'], action: 'Selects the start option.' },
        { keys: ['→', '↓'], action: 'Selects the end option.' },
        { keys: ['Home', 'End'], action: 'Selects the first or last option.' },
    ],
    aria: [
        'Renders role="radiogroup" with two role="radio" buttons and aria-checked on each.',
        'Only the selected option is in the tab order (roving tabindex); arrows move the selection.',
        'Name the group with ariaLabel — the option labels alone don’t say what is being chosen.',
        'Implements ControlValueAccessor for reactive and template forms.',
    ],
    bestPractices: SEGMENTED_TOGGLE_BEST_PRACTICES,
    related: ['switch', 'settings-list', 'button'],
};
