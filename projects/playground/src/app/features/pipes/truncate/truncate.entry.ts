import { DocEntry } from '../../../core/docs/doc.model';

export const TRUNCATE_ENTRY: DocEntry = {
    slug: 'truncate',
    category: 'pipes',
    kind: 'Pipe',
    title: 'truncate',
    description: 'Shortens text to a maximum length and appends a suffix.',
    status: 'Coming soon',
    tags: [],
    selector: 'truncate',
    importNames: ['AbTruncatePipe'],
    sample: true,
    loadPage: () => import('./truncate.page'),
};
