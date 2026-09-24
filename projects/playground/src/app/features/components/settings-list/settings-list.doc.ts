import { ComponentDoc } from '../../../core/docs/doc.model';
import { SETTINGS_LIST_EXAMPLES } from './examples/settings-list-examples';

export const SETTINGS_LIST_DOC: ComponentDoc = {
    slug: 'settings-list',
    examples: SETTINGS_LIST_EXAMPLES,
    api: [
        {
            name: 'AbSettingsList',
            inputs: [
                {
                    name: 'ariaLabel',
                    type: 'string',
                    default: '—',
                    description: 'Names the list, e.g. “Preferences”.',
                },
            ],
            slots: [{ selector: 'default', description: 'ab-settings-item rows.' }],
        },
        {
            name: 'AbSettingsItem',
            inputs: [
                { name: 'label', type: 'string', default: 'required', description: 'Row title.' },
                {
                    name: 'description',
                    type: 'string',
                    default: '—',
                    description: 'Secondary line under the label; linked with aria-describedby.',
                },
                {
                    name: 'value',
                    type: 'string',
                    default: '—',
                    description: 'Current value shown at the trailing edge.',
                },
                {
                    name: 'navigable',
                    type: 'boolean',
                    default: 'false',
                    description: 'Makes the whole row a button with a chevron.',
                },
                {
                    name: 'disabled',
                    type: 'boolean',
                    default: 'false',
                    description: 'Disables a navigable row.',
                },
            ],
            outputs: [
                {
                    name: 'activated',
                    payload: 'void',
                    description: 'Emits when a navigable row is clicked or activated by keyboard.',
                },
            ],
            slots: [
                { selector: '[abIcon]', description: 'Leading icon, typically an ab-icon.' },
                { selector: '[abControl]', description: 'Trailing control such as a switch.' },
            ],
        },
    ],
    keyboard: [
        { keys: ['Tab'], action: 'Moves between navigable rows and projected controls.' },
        { keys: ['Enter'], action: 'Activates a navigable row.' },
        { keys: ['Space'], action: 'Activates a navigable row.' },
    ],
    aria: [
        'The list has role="list" and each row role="listitem".',
        'Navigable rows render a native <button>, with the description linked through aria-describedby.',
        'Projected controls sit outside that button and must carry their own accessible name (ariaLabel).',
        'The chevron is decorative.',
    ],
    bestPractices: [],
    related: ['switch', 'segmented-toggle', 'icon'],
};
