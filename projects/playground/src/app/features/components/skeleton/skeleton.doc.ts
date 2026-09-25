import { ComponentDoc } from '../../../core/docs/doc.model';
import { SKELETON_EXAMPLES } from './examples/skeleton-examples';

export const SKELETON_DOC: ComponentDoc = {
    slug: 'skeleton',
    examples: SKELETON_EXAMPLES,
    api: [
        {
            name: 'AbSkeleton',
            inputs: [
                {
                    name: 'variant',
                    type: "'rect' | 'text' | 'circle'",
                    default: "'rect'",
                    description: 'Shape of the placeholder: a block, text bars or an avatar.',
                },
                {
                    name: 'width',
                    type: 'string',
                    default: '—',
                    description:
                        'Any CSS length. Defaults to 100%, or 40px for a circle. Match the real content.',
                },
                {
                    name: 'height',
                    type: 'string',
                    default: '—',
                    description:
                        'Any CSS length. Defaults to 48px for a rect, 14px per text bar and the width for a circle.',
                },
                {
                    name: 'lines',
                    type: 'number',
                    default: '1',
                    description:
                        'Number of text bars, the last one shorter. Only applies to the text variant.',
                },
                {
                    name: 'animation',
                    type: "'pulse' | 'shimmer' | 'none'",
                    default: "'pulse'",
                    description: 'Both animations stop when the user prefers reduced motion.',
                },
            ],
            cssVars: [
                {
                    name: '--delay',
                    default: '150ms',
                    description:
                        'How long to wait before showing the placeholder, so fast loads never flash it.',
                },
                {
                    name: '--skeleton-fill',
                    default: 'var(--ab-surface-hover)',
                    description: 'Background of the bars.',
                },
            ],
        },
    ],
    keyboard: [{ keys: ['Tab'], action: 'Not focusable and skipped by the tab order.' }],
    aria: [
        'The host is aria-hidden, so screen readers ignore the placeholder.',
        'Set aria-busy="true" on the loading region and render a visually hidden role="status" message such as “Loading projects…”. Remove both when the content arrives.',
        'Use it for content areas. For a short action, use the loading state of ab-button instead.',
        'Render it only while loading, and replace it with the content or an empty state, never leave it on screen after an error.',
    ],
    bestPractices: [],
    related: ['empty-state', 'button'],
};
