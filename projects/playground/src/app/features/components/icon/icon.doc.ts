import { ComponentDoc } from '../../../core/docs/doc.model';
import { ICON_EXAMPLES } from './examples/icon-examples';
import { ICON_BEST_PRACTICES } from './icon-best-practices';

export const ICON_DOC: ComponentDoc = {
    slug: 'icon',
    examples: ICON_EXAMPLES,
    api: [
        {
            name: 'AbIcon',
            inputs: [
                {
                    name: 'icon',
                    type: 'LucideIconInput',
                    default: 'required',
                    description: 'Any Lucide icon from @lucide/angular, e.g. LucideMail.',
                },
                {
                    name: 'tone',
                    type: "'primary' | 'success' | 'info' | 'warning' | 'danger' | 'neutral'",
                    default: "'success'",
                    description: 'Semantic colour.',
                },
                {
                    name: 'appearance',
                    type: "'soft' | 'solid' | 'outline' | 'clear'",
                    default: "'clear'",
                    description: 'Badge treatment around the glyph.',
                },
                {
                    name: 'size',
                    type: "'sm' | 'md' | 'lg' | 'xl'",
                    default: "'sm'",
                    description: 'Glyph of 16, 22, 32 or 40px inside a matching box.',
                },
                {
                    name: 'shape',
                    type: "'square' | 'round' | 'circle'",
                    default: "'circle'",
                    description: 'Badge corners.',
                },
                {
                    name: 'strokeWidth',
                    type: 'number',
                    default: '2',
                    description: 'Lucide stroke width.',
                },
                {
                    name: 'label',
                    type: 'string | null',
                    default: 'null',
                    description:
                        'Makes the icon meaningful (role="img" + aria-label). Omit for decoration.',
                },
            ],
            cssVars: [
                {
                    name: '--tone',
                    default: 'var(--ab-success)',
                    description: 'Glyph and outline colour.',
                },
                {
                    name: '--tone-soft',
                    default: 'var(--ab-success-soft)',
                    description: 'Soft badge fill.',
                },
                {
                    name: '--tone-contrast',
                    default: '#ffffff',
                    description: 'Glyph colour on the solid badge.',
                },
                { name: '--diameter', default: 'by size', description: 'Badge box size.' },
            ],
        },
    ],
    keyboard: [{ keys: ['—'], action: 'Not focusable; icons are never interactive on their own.' }],
    aria: [
        'Decorative by default: aria-hidden="true" so screen readers skip it.',
        'With label, it becomes role="img" with that aria-label.',
        'Put icons that act as controls inside a button with its own aria-label.',
    ],
    bestPractices: ICON_BEST_PRACTICES,
    related: ['button', 'settings-list'],
};
