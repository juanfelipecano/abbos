import { computed, inject, Service, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
    buildSearchIndex,
    highlight,
    jumpToItems,
    SearchHit,
    SearchResultGroup,
    searchDocs,
} from './search-index';

const MAX_RECENT = 3;

export interface SearchView {
    readonly groups: readonly { readonly label: string; readonly hits: readonly SearchHit[] }[];
    /** Every hit in display order; `activeIndex` points into this list. */
    readonly flat: readonly SearchHit[];
}

/** State of the ⌘K search dialog: query, results, keyboard cursor and recent picks. */
@Service()
export class Search {
    private readonly router = inject(Router);
    private readonly index = buildSearchIndex();
    private readonly recent = signal<SearchHit[]>([]);

    public readonly isOpen = signal(false);
    public readonly query = signal('');
    private readonly cursor = signal(0);

    public readonly view = computed<SearchView>(() => {
        const query = this.query().trim();
        const groups: SearchResultGroup[] | SearchView['groups'] = query
            ? searchDocs(query, this.index)
            : [
                  { label: 'Recent', hits: this.recent() },
                  { label: 'Jump to', hits: jumpToItems(this.index) },
              ].filter((group) => group.hits.length > 0);
        return { groups, flat: groups.flatMap((group) => group.hits) };
    });

    /** Cursor clamped to the current results. */
    public readonly activeIndex = computed(() =>
        Math.min(this.cursor(), Math.max(0, this.view().flat.length - 1)),
    );

    public open(): void {
        this.query.set('');
        this.cursor.set(0);
        this.isOpen.set(true);
    }

    public close(): void {
        this.isOpen.set(false);
    }

    public toggle(): void {
        if (this.isOpen()) {
            this.close();
        } else {
            this.open();
        }
    }

    public setQuery(query: string): void {
        this.query.set(query);
        this.cursor.set(0);
    }

    public setActive(index: number): void {
        this.cursor.set(index);
    }

    /** Moves the cursor by `step`, wrapping around both ends. */
    public move(step: 1 | -1): void {
        const count = this.view().flat.length;
        if (count) {
            this.cursor.set((this.activeIndex() + step + count) % count);
        }
    }

    public openActive(): void {
        const hit = this.view().flat[this.activeIndex()];
        if (hit) {
            this.go(hit);
        }
    }

    public go(hit: SearchHit): void {
        this.recent.update((list) =>
            [highlight(hit, ''), ...list.filter((item) => item.title !== hit.title)].slice(
                0,
                MAX_RECENT,
            ),
        );
        this.close();
        void this.router.navigate([hit.path], { fragment: hit.fragment });
    }
}
