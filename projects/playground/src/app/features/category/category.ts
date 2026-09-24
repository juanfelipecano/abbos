import { Component, computed, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideChevronRight, LucideSearch } from '@lucide/angular';
import { AbButton, AbInput } from 'abbos';
import { CATEGORIES } from '../../core/docs/categories';
import { DocCategoryId } from '../../core/docs/doc.model';
import { entriesIn } from '../../core/docs/docs-registry';
import { CategoryEmpty } from './category-empty';
import { filterChips, filterEntries } from './category-filter';
import { EntryCard } from './entry-card';

/** Overview of one category: a filterable card grid, or an empty state until items ship. */
@Component({
    selector: 'app-category',
    imports: [
        RouterLink,
        AbInput,
        AbButton,
        EntryCard,
        CategoryEmpty,
        LucideChevronRight,
        LucideSearch,
    ],
    templateUrl: './category.html',
    styleUrl: './category.scss',
})
export default class Category {
    /** Bound from route data. */
    public readonly category = input.required<DocCategoryId>();

    protected readonly info = computed(() => CATEGORIES[this.category()]);
    private readonly all = computed(() => entriesIn(this.category()));
    protected readonly shipped = computed(() => this.all().filter((entry) => !entry.sample));
    /** First sample page, offered from the empty state as a template preview. */
    protected readonly sample = computed(() => this.all().find((entry) => entry.sample));

    protected readonly filter = signal('All');
    protected readonly query = signal('');

    protected readonly chips = computed(() => filterChips(this.shipped()));
    protected readonly visible = computed(() =>
        filterEntries(this.shipped(), this.filter(), this.query()),
    );

    protected onQuery(event: Event): void {
        this.query.set((event.target as HTMLInputElement).value);
    }

    protected clear(): void {
        this.filter.set('All');
        this.query.set('');
    }
}
