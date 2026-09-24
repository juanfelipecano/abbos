import { DocCategoryId, DocEntry } from '../docs/doc.model';
import { DOC_ENTRIES, entryPath } from '../docs/docs-registry';

export type SearchGroup = 'Components' | 'Directives' | 'Pipes' | 'Docs';

export const SEARCH_GROUPS: readonly SearchGroup[] = ['Components', 'Directives', 'Pipes', 'Docs'];

export interface SearchItem {
    readonly title: string;
    readonly description: string;
    readonly group: SearchGroup;
    readonly path: string;
    readonly fragment?: string;
}

export interface SearchHit extends SearchItem {
    /** Title split around the first match, for highlighting. */
    readonly before: string;
    readonly match: string;
    readonly after: string;
}

export interface SearchResultGroup {
    readonly label: SearchGroup;
    readonly hits: readonly SearchHit[];
}

const GROUP_BY_CATEGORY: Record<DocCategoryId, SearchGroup> = {
    components: 'Components',
    directives: 'Directives',
    pipes: 'Pipes',
};

const GUIDES: readonly SearchItem[] = [
    {
        title: 'Getting started',
        description: 'Install Abbos and render your first component',
        group: 'Docs',
        path: '/',
    },
    {
        title: 'Installation',
        description: 'npm, pnpm or yarn',
        group: 'Docs',
        path: '/',
        fragment: 'sec-install',
    },
    {
        title: 'Theming',
        description: 'Light and dark mode, accents and token overrides',
        group: 'Docs',
        path: '/',
        fragment: 'sec-theming',
    },
];

export function buildSearchIndex(entries: readonly DocEntry[] = DOC_ENTRIES): SearchItem[] {
    const pages = entries.map((entry) => ({
        title: entry.title,
        description: entry.sample ? `${entry.description} · Coming soon` : entry.description,
        group: GROUP_BY_CATEGORY[entry.category],
        path: entryPath(entry),
    }));
    const apis = entries
        .filter((entry) => entry.category === 'components' && !entry.sample)
        .map((entry) => ({
            title: `${entry.title} API`,
            description: 'Inputs, outputs and CSS custom properties',
            group: 'Docs' as const,
            path: entryPath(entry),
            fragment: 'sec-api',
        }));
    return [...pages, ...GUIDES, ...apis];
}

/** Case-insensitive match on title + description, grouped in a fixed order. */
export function searchDocs(query: string, index: readonly SearchItem[]): SearchResultGroup[] {
    const needle = query.trim().toLowerCase();
    if (!needle) {
        return [];
    }
    const hits = index
        .filter((item) => `${item.title} ${item.description}`.toLowerCase().includes(needle))
        .map((item) => highlight(item, needle));
    return SEARCH_GROUPS.map((label) => ({
        label,
        hits: hits.filter((hit) => hit.group === label),
    })).filter((group) => group.hits.length > 0);
}

export function highlight(item: SearchItem, needle: string): SearchHit {
    const at = needle ? item.title.toLowerCase().indexOf(needle.toLowerCase()) : -1;
    if (at < 0) {
        return { ...item, before: item.title, match: '', after: '' };
    }
    return {
        ...item,
        before: item.title.slice(0, at),
        match: item.title.slice(at, at + needle.length),
        after: item.title.slice(at + needle.length),
    };
}

/** Suggestions shown before the user types: a few components, then the guide. */
export function jumpToItems(index: readonly SearchItem[], limit = 4): SearchHit[] {
    const pages = index.filter((item) => !item.fragment);
    const components = pages.filter((item) => item.group === 'Components').slice(0, limit);
    const guide = pages.filter((item) => item.group === 'Docs').slice(0, 1);
    return [...components, ...guide].map((item) => highlight(item, ''));
}
