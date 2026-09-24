import { ComponentDoc } from '../../../core/docs/doc.model';
import { SWITCH_EXAMPLES } from './examples/switch-examples';
import { SWITCH_BEST_PRACTICES } from './switch-best-practices';

export const SWITCH_DOC: ComponentDoc = {
    slug: 'switch',
    examples: SWITCH_EXAMPLES,
    api: [
        {
            name: 'AbSwitch',
            inputs: [
                {
                    name: 'checked',
                    type: 'boolean',
                    default: 'false',
                    description: 'Current state. Supports [(checked)].',
                },
                {
                    name: 'size',
                    type: "'sm' | 'md' | 'lg'",
                    default: "'md'",
                    description: 'Track and knob size. Default from provideAbbos({ controlSize }).',
                },
                {
                    name: 'shape',
                    type: "'square' | 'round' | 'circle'",
                    default: "'circle'",
                    description: 'Track and knob corners.',
                },
                {
                    name: 'ariaLabel',
                    type: 'string',
                    default: '—',
                    description: 'Accessible name when there is no projected label.',
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
                    description: 'Emits the next value when toggled by click, key or drag.',
                },
            ],
            slots: [{ selector: 'default', description: 'Inline label after the track.' }],
            cssVars: [
                { name: '--width', default: '40px', description: 'Track width (md).' },
                { name: '--height', default: '22px', description: 'Track height (md).' },
                { name: '--knob', default: '18px', description: 'Knob diameter (md).' },
                {
                    name: '--ab-primary',
                    default: 'accent colour',
                    description: 'Track colour when on (global token).',
                },
            ],
        },
    ],
    keyboard: [
        { keys: ['Space'], action: 'Toggles the switch.' },
        { keys: ['Enter'], action: 'Toggles the switch.' },
        { keys: ['Tab'], action: 'Moves focus to or away from the switch.' },
    ],
    aria: [
        'Renders a native <button role="switch"> with aria-checked kept in sync.',
        'Projected text sits inside the same <label>, so it names the switch and toggles it on click.',
        'With no visible text, pass ariaLabel.',
        'Implements ControlValueAccessor — works with formControl, formControlName and ngModel.',
        'The knob can also be dragged; click and keyboard remain the primary way to toggle.',
    ],
    bestPractices: SWITCH_BEST_PRACTICES,
    related: ['segmented-toggle', 'settings-list', 'input'],
};
