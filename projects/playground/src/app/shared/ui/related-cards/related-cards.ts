import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowRight, LucideBox, LucideBraces, LucideArrowRightLeft } from '@lucide/angular';
import { DOC_ENTRIES, entryPath } from '../../../core/docs/docs-registry';

/** Links to other doc pages, looked up by slug in the registry. */
@Component({
    selector: 'app-related-cards',
    imports: [RouterLink, LucideArrowRight, LucideBox, LucideBraces, LucideArrowRightLeft],
    template: `
        @for (card of cards(); track card.path) {
            <a class="card" [routerLink]="card.path">
                <span class="icon" aria-hidden="true">
                    @switch (card.kind) {
                        @case ('Directive') {
                            <svg lucideBraces [size]="16"></svg>
                        }
                        @case ('Pipe') {
                            <svg lucideArrowRightLeft [size]="16"></svg>
                        }
                        @default {
                            <svg lucideBox [size]="16"></svg>
                        }
                    }
                </span>
                <span class="text">
                    <span class="title">{{ card.title }}</span>
                    <span class="kind">{{ card.subtitle }}</span>
                </span>
                <svg class="arrow" lucideArrowRight [size]="16" aria-hidden="true"></svg>
            </a>
        }
    `,
    styleUrl: './related-cards.scss',
})
export class RelatedCards {
    public readonly slugs = input.required<readonly string[]>();

    protected readonly cards = computed(() =>
        this.slugs()
            .map((slug) => DOC_ENTRIES.find((entry) => entry.slug === slug))
            .filter((entry) => entry !== undefined)
            .map((entry) => ({
                title: entry.title,
                kind: entry.kind,
                subtitle: entry.sample ? `${entry.kind} · Coming soon` : entry.kind,
                path: entryPath(entry),
            })),
    );
}
