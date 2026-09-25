import { ComponentDoc } from '../../../core/docs/doc.model';
import { STEPPER_EXAMPLES } from './examples/stepper-examples';

export const STEPPER_DOC: ComponentDoc = {
    slug: 'stepper',
    examples: STEPPER_EXAMPLES,
    api: [
        {
            name: 'AbStepper',
            inputs: [
                {
                    name: 'value',
                    type: 'string | null',
                    default: 'null',
                    description: 'The value of the active step. Supports [(value)].',
                },
                {
                    name: 'complete',
                    type: 'boolean',
                    default: 'false',
                    description:
                        'Marks every step as done and none as current. Supports [(complete)].',
                },
                {
                    name: 'marker',
                    type: "'icon' | 'number' | 'text'",
                    default: "'icon'",
                    description:
                        'Icon or number inside a 40px circle, or a small dot with a text label.',
                },
                {
                    name: 'labels',
                    type: 'boolean',
                    default: 'true',
                    description: 'Shows title and caption under each marker. Always on for text.',
                },
                {
                    name: 'interactive',
                    type: 'boolean',
                    default: 'false',
                    description: 'Turns completed steps into buttons that jump back to them.',
                },
                {
                    name: 'ariaLabel',
                    type: 'string',
                    default: "'Progress'",
                    description: 'Names the step list.',
                },
            ],
            outputs: [
                {
                    name: 'valueChange',
                    payload: 'string | null',
                    description: 'Emits when the active step changes.',
                },
                {
                    name: 'completeChange',
                    payload: 'boolean',
                    description: 'Emits when the flow is completed or reopened.',
                },
            ],
            cssVars: [
                { name: '--marker-size', default: '40px', description: 'Marker diameter.' },
                { name: '--line-height', default: '4px', description: 'Connector thickness.' },
            ],
        },
        {
            name: 'AbStep',
            inputs: [
                {
                    name: 'value',
                    type: 'string',
                    default: 'required',
                    description: 'Identifies the step. Compared with AbStepper’s value.',
                },
                { name: 'title', type: 'string', default: '—', description: 'Step name.' },
                {
                    name: 'caption',
                    type: 'string',
                    default: '—',
                    description: 'Secondary line under the title.',
                },
                {
                    name: 'doneCaption',
                    type: 'string',
                    default: '—',
                    description: 'Replaces caption once the step is done.',
                },
                {
                    name: 'icon',
                    type: 'LucideIconInput',
                    default: '—',
                    description: 'Marker icon for marker="icon". Falls back to the step number.',
                },
            ],
            slots: [
                {
                    selector: 'ng-template[abStepContent]',
                    description: 'Optional content rendered below the stepper while active.',
                },
            ],
        },
    ],
    keyboard: [
        { keys: ['Tab'], action: 'In an interactive stepper, moves between completed steps.' },
        { keys: ['Enter', 'Space'], action: 'Jumps back to the focused completed step.' },
    ],
    aria: [
        'Renders an ordered list with aria-current="step" on the active item.',
        'State is never colour only: each step has visually hidden “completed”, “current step” or “not started” text.',
        'A polite live region announces “Step 2 of 4: Profile” when the step changes.',
        'Step content is wrapped in role="group" named by the step title. Move focus to its heading after Continue.',
        'It is a progress indicator, not a tablist. Only completed steps are focusable, and only when interactive.',
    ],
    bestPractices: [],
    related: ['segments', 'button'],
};
