import { ComponentDoc } from '../../../core/docs/doc.model';
import { CHIP_EXAMPLES } from './examples/chip-examples';

export const CHIP_DOC: ComponentDoc = {
    slug: 'chip',
    examples: CHIP_EXAMPLES,
    api: [
        {
            name: 'AbChip',
            inputs: [
                {
                    name: 'variant',
                    type: "'neutral' | 'soft' | 'outline' | 'dotted' | 'solid'",
                    default: "'neutral'",
                    description: 'Visual weight. Soft and solid follow the accent colour.',
                },
                {
                    name: 'size',
                    type: "'sm' | 'md' | 'lg'",
                    default: "'md'",
                    description:
                        'Height of 24, 32 or 40px. The default comes from provideAbbos({ controlSize }).',
                },
                {
                    name: 'shape',
                    type: "'square' | 'round' | 'circle'",
                    default: "'round'",
                    description:
                        'Corner treatment: 0, 8px or a full pill. Default from provideAbbos({ controlShape }).',
                },
                {
                    name: 'removable',
                    type: 'boolean',
                    default: 'false',
                    description:
                        'Shows a remove button and lets Backspace or Delete dismiss the focused chip. Ignored when selectable.',
                },
                {
                    name: 'removeLabel',
                    type: 'string',
                    default: "'Remove'",
                    description:
                        'Accessible name of the remove button. The chip label is appended, e.g. "Remove Design".',
                },
                {
                    name: 'selectable',
                    type: 'boolean',
                    default: 'false',
                    description:
                        'Renders the chip as a toggle button with aria-pressed. Wins over removable.',
                },
                {
                    name: 'selected',
                    type: 'boolean',
                    default: 'false',
                    description:
                        'Two-way bindable with [(selected)]. A selected chip turns solid and shows a check.',
                },
                {
                    name: 'disabled',
                    type: 'boolean',
                    default: 'false',
                    description:
                        'Blocks toggling and removal, and takes the chip out of the tab order.',
                },
            ],
            outputs: [
                {
                    name: 'removed',
                    payload: 'void',
                    description:
                        'The remove button was clicked, or Backspace/Delete was pressed on the chip. Remove the item yourself.',
                },
            ],
            slots: [
                {
                    selector: '[abStart]',
                    description: 'Icon before the label. Size it to about 16px.',
                },
                {
                    selector: '[abAvatar]',
                    description:
                        'Initials or an image, clipped to the avatar circle. Replaces abStart.',
                },
                { selector: 'default', description: 'The label.' },
            ],
            cssVars: [
                {
                    name: '--background',
                    default: 'neutral tint of --ab-text',
                    description: 'Resting fill. Each variant sets its own.',
                },
                {
                    name: '--color',
                    default: 'var(--ab-text)',
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
        { keys: ['Tab'], action: 'Moves focus to a removable or selectable chip.' },
        { keys: ['Space'], action: 'Toggles a selectable chip.' },
        { keys: ['Enter'], action: 'Toggles a selectable chip.' },
        { keys: ['Backspace'], action: 'Removes the focused removable chip.' },
        { keys: ['Delete'], action: 'Removes the focused removable chip.' },
    ],
    aria: [
        'Static chips are plain text and are not focusable.',
        'Selectable chips are native <button> elements with aria-pressed, so Space and Enter work for free.',
        'A removable chip is one tab stop. Its remove button is out of the tab order but has an accessible name such as "Remove Design", and the chip advertises Backspace and Delete through aria-keyshortcuts.',
        'The chip never removes itself. After you drop the item, move focus somewhere sensible, such as the next chip or the group, or it is lost.',
        'Wrap related selectable chips in an element with role="group" and an aria-label.',
    ],
    bestPractices: [],
    related: ['button', 'icon', 'segmented-toggle'],
};
