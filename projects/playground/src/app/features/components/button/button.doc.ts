import { ComponentDoc } from '../../../core/docs/doc.model';
import { BUTTON_BEST_PRACTICES } from './button-best-practices';
import { BUTTON_EXAMPLES } from './examples/button-examples';

export const BUTTON_DOC: ComponentDoc = {
    slug: 'button',
    examples: BUTTON_EXAMPLES,
    api: [
        {
            name: 'AbButton',
            inputs: [
                {
                    name: 'variant',
                    type: "'primary' | 'secondary' | 'soft' | 'outline' | 'ghost' | 'danger'",
                    default: "'primary'",
                    description: 'Visual emphasis.',
                },
                {
                    name: 'size',
                    type: "'sm' | 'md' | 'lg'",
                    default: "'md'",
                    description:
                        'Height of 32, 40 or 48px. The default comes from provideAbbos({ controlSize }).',
                },
                {
                    name: 'shape',
                    type: "'square' | 'round' | 'circle'",
                    default: "'round'",
                    description:
                        'Corner treatment: 0, 8px or a full pill. Default from provideAbbos({ controlShape }).',
                },
                {
                    name: 'loading',
                    type: 'boolean',
                    default: 'false',
                    description:
                        'Shows a spinner, sets aria-busy and ignores clicks and Enter/Space.',
                },
                {
                    name: 'disabled',
                    type: 'boolean',
                    default: 'false',
                    description:
                        'Blocks activation through aria-disabled, so the button stays focusable. A static disabled attribute also disables the native button.',
                },
                {
                    name: 'full',
                    type: 'boolean',
                    default: 'false',
                    description: 'Stretches to fill its container.',
                },
            ],
            slots: [
                { selector: '[abStart]', description: 'Icon or element before the label.' },
                { selector: '[abEnd]', description: 'Icon or element after the label.' },
                { selector: 'default', description: 'The label.' },
            ],
            cssVars: [
                {
                    name: '--background',
                    default: 'var(--ab-primary)',
                    description: 'Resting fill. Each variant sets its own; shown for primary.',
                },
                {
                    name: '--background-hover',
                    default: 'var(--ab-primary-hover)',
                    description: 'Fill on hover.',
                },
                {
                    name: '--background-active',
                    default: 'var(--ab-primary-active)',
                    description: 'Fill while pressed.',
                },
                {
                    name: '--color',
                    default: 'var(--ab-text-on-primary)',
                    description: 'Label and icon colour.',
                },
                { name: '--border', default: 'transparent', description: 'Border colour.' },
                {
                    name: '--ab-radius-control',
                    default: '8px',
                    description: 'Radius of the round shape (global token).',
                },
            ],
        },
    ],
    keyboard: [
        { keys: ['Enter'], action: 'Activates the button. Ignored while disabled or loading.' },
        { keys: ['Space'], action: 'Activates the button. Ignored while disabled or loading.' },
        { keys: ['Tab'], action: 'Moves focus to or away from the button.' },
    ],
    aria: [
        'Attaches to a native <button>, so role, focus and keyboard support come for free.',
        'While loading, aria-busy="true" and aria-disabled="true" are set and the spinner is hidden from assistive tech.',
        'Disabled buttons stay in the tab order with aria-disabled, so people can still find them — say why nearby.',
        'Icon-only buttons need an aria-label that describes what happens.',
    ],
    bestPractices: BUTTON_BEST_PRACTICES,
    related: ['input', 'switch', 'icon'],
};
