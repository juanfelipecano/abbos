import { DocEntry } from '../docs/doc.model';
import { buildSearchIndex, highlight, jumpToItems, searchDocs } from './search-index';

const entry = (overrides: Partial<DocEntry>): DocEntry => ({
    slug: 'button',
    category: 'components',
    kind: 'Component',
    title: 'Button',
    description: 'Triggers an action.',
    status: 'New',
    tags: [],
    selector: 'button[ab-button]',
    importNames: ['AbButton'],
    loadPage: () => Promise.resolve(class {}),
    ...overrides,
});

const index = buildSearchIndex([
    entry({}),
    entry({ slug: 'switch', title: 'Switch', description: 'Turns a setting on or off.' }),
    entry({
        slug: 'autofocus',
        category: 'directives',
        kind: 'Directive',
        title: 'abAutofocus',
        description: 'Focuses an element.',
        sample: true,
    }),
]);

describe('search index', () => {
    it('adds guides and an API anchor for shipped components only', () => {
        const titles = index.map((item) => item.title);
        expect(titles).toContain('Getting started');
        expect(titles).toContain('Button API');
        expect(titles).not.toContain('abAutofocus API');
    });

    it('marks sample pages as coming soon', () => {
        expect(index.find((item) => item.title === 'abAutofocus')?.description).toContain(
            'Coming soon',
        );
    });

    it('groups hits in a fixed order and drops empty groups', () => {
        const groups = searchDocs('button', index);
        expect(groups.map((group) => group.label)).toEqual(['Components', 'Docs']);
    });

    it('matches descriptions too', () => {
        expect(searchDocs('setting', index)[0].hits[0].title).toBe('Switch');
    });

    it('returns nothing for a blank query', () => {
        expect(searchDocs('   ', index)).toEqual([]);
    });

    it('splits the title around the first case-insensitive match', () => {
        expect(highlight(index[0], 'utt')).toMatchObject({
            before: 'B',
            match: 'utt',
            after: 'on',
        });
    });

    it('suggests components first, then the guide', () => {
        const titles = jumpToItems(index).map((hit) => hit.title);
        expect(titles).toEqual(['Button', 'Switch', 'Getting started']);
    });
});
