import { routes } from '../../app.routes';
import {
    DOC_ENTRIES,
    entriesIn,
    entryPath,
    HOME_LINK,
    navGroups,
    neighbours,
    pageOrder,
    shippedIn,
} from './docs-registry';

describe('docs registry', () => {
    it('has unique slugs', () => {
        const slugs = DOC_ENTRIES.map((entry) => entry.slug);
        expect(new Set(slugs).size).toBe(slugs.length);
    });

    it('starts the reading order with Getting started', () => {
        expect(pageOrder()[0]).toEqual(HOME_LINK);
        expect(pageOrder()).toHaveLength(DOC_ENTRIES.length + 1);
    });

    it('links neighbours in reading order', () => {
        const [first, second] = entriesIn('components');
        expect(neighbours(entryPath(first))).toEqual({
            prev: HOME_LINK,
            next: { title: second.title, path: entryPath(second) },
        });
        expect(neighbours('/').prev).toBeNull();
        expect(neighbours('/nowhere')).toEqual({ prev: null, next: null });
    });

    it('keeps sample pages out of the shipped list', () => {
        expect(shippedIn('directives')).toEqual([]);
        expect(entriesIn('directives').every((entry) => entry.sample)).toBe(true);
    });

    it('builds a nav group per category with an overview link', () => {
        const groups = navGroups();
        const components = groups.find((group) => group.label === 'Components');
        expect(groups[0].label).toBe('Introduction');
        expect(components?.items[0]).toEqual({
            label: 'Overview',
            path: '/components',
            exact: true,
        });
        expect(components?.count).toBe(entriesIn('components').length);
    });

    it('registers a route for every entry', () => {
        const paths = routes.map((route) => route.path);
        for (const entry of DOC_ENTRIES) {
            expect(paths).toContain(entryPath(entry).slice(1));
        }
    });
});
