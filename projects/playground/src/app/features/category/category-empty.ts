import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
    LucideArrowRightLeft,
    LucideArrowUpRight,
    LucideBox,
    LucideBraces,
    LucideClock,
} from '@lucide/angular';
import { CATEGORIES } from '../../core/docs/categories';
import { DocCategoryId, DocEntry } from '../../core/docs/doc.model';
import { entryPath } from '../../core/docs/docs-registry';
import { SITE_LINKS } from '../../core/docs/site';

/** "Coming soon" state for a category with nothing shipped yet. */
@Component({
    selector: 'app-category-empty',
    imports: [
        RouterLink,
        LucideBox,
        LucideBraces,
        LucideArrowRightLeft,
        LucideClock,
        LucideArrowUpRight,
    ],
    template: `
        <div class="art" aria-hidden="true">
            <span class="tile left"></span>
            <span class="tile right"></span>
            <span class="tile front">
                @switch (category()) {
                    @case ('directives') {
                        <svg lucideBraces [size]="32" [strokeWidth]="1.75"></svg>
                    }
                    @case ('pipes') {
                        <svg lucideArrowRightLeft [size]="32" [strokeWidth]="1.75"></svg>
                    }
                    @default {
                        <svg lucideBox [size]="32" [strokeWidth]="1.75"></svg>
                    }
                }
            </span>
            <span class="soon"><svg lucideClock [size]="12"></svg>Soon</span>
        </div>
        <h2>{{ info().emptyTitle }}</h2>
        <p>{{ info().emptyText }}</p>
        <div class="actions">
            @if (samplePath(); as path) {
                <a class="action soft" [routerLink]="path">Preview the template</a>
            }
            <a class="action" [href]="releases" target="_blank" rel="noopener">
                Read the changelog<svg lucideArrowUpRight [size]="16" aria-hidden="true"></svg>
            </a>
        </div>
    `,
    styleUrl: './category-empty.scss',
})
export class CategoryEmpty {
    public readonly category = input.required<DocCategoryId>();
    /** A sample page to preview, if the category has one. */
    public readonly sample = input<DocEntry>();

    protected readonly releases = SITE_LINKS.releases;
    protected readonly info = computed(() => CATEGORIES[this.category()]);
    protected readonly samplePath = computed(() => {
        const sample = this.sample();
        return sample ? entryPath(sample) : null;
    });
}
