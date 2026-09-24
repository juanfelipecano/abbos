import { ComponentDoc } from '../../../core/docs/doc.model';
import { INPUT_EXAMPLES } from './examples/input-examples';
import { INPUT_BEST_PRACTICES } from './input-best-practices';

export const INPUT_DOC: ComponentDoc = {
    slug: 'input',
    examples: INPUT_EXAMPLES,
    api: [
        {
            name: 'AbInput',
            inputs: [
                {
                    name: 'size',
                    type: "'sm' | 'md' | 'lg'",
                    default: "'md'",
                    description:
                        'Height of 32, 40 or 48px. Default from provideAbbos({ controlSize }).',
                },
                {
                    name: 'shape',
                    type: "'square' | 'round' | 'circle'",
                    default: "'round'",
                    description: 'Corner treatment. Default from provideAbbos({ controlShape }).',
                },
                {
                    name: 'invalid',
                    type: 'boolean',
                    default: 'false',
                    description:
                        'Shows the error border and ring. Reactive and template forms apply it automatically through ng-invalid.ng-touched.',
                },
            ],
            cssVars: [
                { name: '--background', default: 'var(--ab-surface)', description: 'Field fill.' },
                { name: '--color', default: 'var(--ab-text)', description: 'Text colour.' },
                {
                    name: '--placeholder-color',
                    default: 'var(--ab-text-secondary)',
                    description: 'Placeholder colour.',
                },
                {
                    name: '--ab-focus-ring',
                    default: '0 0 0 3px var(--ab-ring)',
                    description: 'Ring shown on keyboard focus (global token).',
                },
            ],
        },
    ],
    keyboard: [
        { keys: ['Tab'], action: 'Moves focus into the field.' },
        { keys: ['Shift', 'Tab'], action: 'Moves focus to the previous element.' },
    ],
    aria: [
        'AbInput styles the native <input>, so value, disabled, readonly and forms all work as usual.',
        'It renders no label: add a <label for>, aria-label or aria-labelledby yourself — never rely on the placeholder.',
        'Link helper and error text with aria-describedby, and set aria-invalid alongside invalid.',
    ],
    bestPractices: INPUT_BEST_PRACTICES,
    related: ['button', 'switch', 'segmented-toggle'],
};
