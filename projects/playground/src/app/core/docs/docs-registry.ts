import { BUTTON_ENTRY } from '../../features/components/button/button.entry';
import { TOAST_ENTRY } from '../../features/components/toast/toast.entry';
import { SKELETON_ENTRY } from '../../features/components/skeleton/skeleton.entry';
import { BOTTOM_SHEET_ENTRY } from '../../features/components/bottom-sheet/bottom-sheet.entry';
import { EMPTY_STATE_ENTRY } from '../../features/components/empty-state/empty-state.entry';
import { CHIP_ENTRY } from '../../features/components/chip/chip.entry';
import { ICON_ENTRY } from '../../features/components/icon/icon.entry';
import { INPUT_ENTRY } from '../../features/components/input/input.entry';
import { SEGMENTS_ENTRY } from '../../features/components/segments/segments.entry';
import { SEGMENTED_TOGGLE_ENTRY } from '../../features/components/segmented-toggle/segmented-toggle.entry';
import { SETTINGS_LIST_ENTRY } from '../../features/components/settings-list/settings-list.entry';
import { STEPPER_ENTRY } from '../../features/components/stepper/stepper.entry';
import { SWITCH_ENTRY } from '../../features/components/switch/switch.entry';
import { AUTOFOCUS_ENTRY } from '../../features/directives/autofocus/autofocus.entry';
import { TRUNCATE_ENTRY } from '../../features/pipes/truncate/truncate.entry';
import { CATEGORIES, CATEGORY_ORDER } from './categories';
import { DocCategoryId, DocEntry } from './doc.model';

/**
 * Every documented item, in reading order (sidebar, prev/next).
 * To document something new: create its feature folder and add its entry here.
 */
export const DOC_ENTRIES: readonly DocEntry[] = [
    BUTTON_ENTRY,
    INPUT_ENTRY,
    SWITCH_ENTRY,
    SEGMENTED_TOGGLE_ENTRY,
    SEGMENTS_ENTRY,
    STEPPER_ENTRY,
    CHIP_ENTRY,
    EMPTY_STATE_ENTRY,
    BOTTOM_SHEET_ENTRY,
    TOAST_ENTRY,
    SKELETON_ENTRY,
    ICON_ENTRY,
    SETTINGS_LIST_ENTRY,
    AUTOFOCUS_ENTRY,
    TRUNCATE_ENTRY,
];

export interface PageLink {
    readonly title: string;
    readonly path: string;
}

export const HOME_LINK: PageLink = { title: 'Getting started', path: '/' };

export function entryPath(entry: DocEntry): string {
    return `/${entry.category}/${entry.slug}`;
}

export function categoryPath(id: DocCategoryId): string {
    return `/${id}`;
}

export function findEntry(slug: string, entries = DOC_ENTRIES): DocEntry | undefined {
    return entries.find((entry) => entry.slug === slug);
}

export function entriesIn(category: DocCategoryId, entries = DOC_ENTRIES): DocEntry[] {
    return entries.filter((entry) => entry.category === category);
}

/** Entries that document something that actually ships (not sample pages). */
export function shippedIn(category: DocCategoryId, entries = DOC_ENTRIES): DocEntry[] {
    return entriesIn(category, entries).filter((entry) => !entry.sample);
}

/** Linear reading order: Getting started, then every entry grouped by category. */
export function pageOrder(entries = DOC_ENTRIES): PageLink[] {
    const docs = CATEGORY_ORDER.flatMap((id) => entriesIn(id, entries)).map((entry) => ({
        title: entry.title,
        path: entryPath(entry),
    }));
    return [HOME_LINK, ...docs];
}

export function neighbours(
    path: string,
    entries = DOC_ENTRIES,
): { prev: PageLink | null; next: PageLink | null } {
    const order = pageOrder(entries);
    const index = order.findIndex((page) => page.path === path);
    if (index < 0) {
        return { prev: null, next: null };
    }
    return { prev: order[index - 1] ?? null, next: order[index + 1] ?? null };
}

export interface NavItem {
    readonly label: string;
    readonly path: string;
    readonly fragment?: string;
    readonly status?: DocEntry['status'];
    /** Exact-match the router link (overview pages share a prefix with their entries). */
    readonly exact?: boolean;
}

export interface NavGroup {
    readonly label: string;
    readonly collapsible: boolean;
    readonly items: readonly NavItem[];
    /** Number of documented items, shown as a pill. */
    readonly count?: number;
}

export function navGroups(entries = DOC_ENTRIES): NavGroup[] {
    const intro: NavGroup = {
        label: 'Introduction',
        collapsible: false,
        items: [
            { label: 'Getting started', path: '/', exact: true },
            { label: 'Installation', path: '/', fragment: 'sec-install' },
            { label: 'Theming', path: '/', fragment: 'sec-theming' },
        ],
    };
    const groups = CATEGORY_ORDER.map((id) => {
        const items = entriesIn(id, entries);
        return {
            label: CATEGORIES[id].title,
            collapsible: true,
            count: items.length,
            items: [
                { label: 'Overview', path: categoryPath(id), exact: true },
                ...items.map((entry) => ({
                    label: entry.title,
                    path: entryPath(entry),
                    status: entry.status,
                })),
            ],
        };
    });
    return [intro, ...groups];
}
