import { DocEntry } from '../../core/docs/doc.model';
import { filterChips, filterEntries } from './category-filter';

const entry = (title: string, tags: string[], status: DocEntry['status']): DocEntry => ({
    slug: title.toLowerCase(),
    category: 'components',
    kind: 'Component',
    title,
    description: `${title} description`,
    status,
    tags,
    selector: '',
    importNames: [],
    loadPage: () => Promise.resolve(class {}),
});

const entries = [
    entry('Button', ['Actions'], 'New'),
    entry('Input', ['Form'], 'New'),
    entry('Switch', ['Form'], 'Beta'),
];

describe('category filter', () => {
    it('builds chips with counts from tags and statuses', () => {
        expect(filterChips(entries)).toEqual([
            { label: 'All', count: 3 },
            { label: 'Actions', count: 1 },
            { label: 'Form', count: 2 },
            { label: 'New', count: 2 },
            { label: 'Beta', count: 1 },
        ]);
    });

    it('filters by chip and query together', () => {
        expect(filterEntries(entries, 'Form', '').map((e) => e.title)).toEqual(['Input', 'Switch']);
        expect(filterEntries(entries, 'Form', 'swi').map((e) => e.title)).toEqual(['Switch']);
        expect(filterEntries(entries, 'All', 'nothing')).toEqual([]);
    });
});
