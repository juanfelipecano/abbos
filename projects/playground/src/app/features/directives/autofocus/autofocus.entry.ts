import { DocEntry } from '../../../core/docs/doc.model';

export const AUTOFOCUS_ENTRY: DocEntry = {
    slug: 'autofocus',
    category: 'directives',
    kind: 'Directive',
    title: 'abAutofocus',
    description:
        'Moves focus to an element as soon as it renders — ideal for dialogs and first form fields.',
    status: 'Coming soon',
    tags: [],
    selector: '[abAutofocus]',
    importNames: ['AbAutofocus'],
    sample: true,
    loadPage: () => import('./autofocus.page'),
};
