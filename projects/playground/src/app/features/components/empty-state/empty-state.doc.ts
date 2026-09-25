import { ComponentDoc } from '../../../core/docs/doc.model';
import { EMPTY_STATE_EXAMPLES } from './examples/empty-state-examples';

export const EMPTY_STATE_DOC: ComponentDoc = {
    slug: 'empty-state',
    examples: EMPTY_STATE_EXAMPLES,
    api: [
        {
            name: 'AbEmptyState',
            inputs: [
                {
                    name: 'title',
                    type: 'string',
                    default: 'required',
                    description: 'What is empty, or what to do first. Rendered as a heading.',
                },
                {
                    name: 'description',
                    type: 'string',
                    default: '—',
                    description: 'One line explaining why the view is empty.',
                },
                {
                    name: 'size',
                    type: "'sm' | 'md'",
                    default: "'md'",
                    description: 'sm is the compact variant for cards and panels.',
                },
                {
                    name: 'headingLevel',
                    type: '2 | 3 | 4 | 5 | 6',
                    default: '3',
                    description: 'Level of the title heading.',
                },
            ],
            slots: [
                {
                    selector: '[abMedia]',
                    description:
                        'Part 1. An ab-icon, image or illustration, centered above the body.',
                },
                {
                    selector: 'default',
                    description:
                        'Part 2. Extra body content under the description, such as a link.',
                },
                {
                    selector: '[abActions]',
                    description:
                        'Part 3. Up to two buttons, the most useful next step first. Stacked full width in containers under 420px.',
                },
            ],
        },
    ],
    keyboard: [
        {
            keys: ['Tab'],
            action: 'Nothing is focusable except the projected actions and links.',
        },
    ],
    aria: [
        'The host is role="status", a polite live region, so screen readers announce it when results clear.',
        'Render it only while the view is empty. A live region that is already on the page when it first renders is not announced.',
        'An ab-icon is aria-hidden unless it has a label. Give projected images alt text, or aria-hidden when decorative.',
        'The title is role="heading" with aria-level from headingLevel. Pick the level that fits the page.',
        'Actions are ordinary buttons or links that you project, so name them yourself.',
    ],
    bestPractices: [],
    related: ['button', 'icon'],
};
