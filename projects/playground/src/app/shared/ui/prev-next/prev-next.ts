import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LucideArrowLeft, LucideArrowRight } from '@lucide/angular';
import { neighbours } from '../../../core/docs/docs-registry';

/** Previous/next page links, following the registry's reading order. */
@Component({
    selector: 'app-prev-next',
    imports: [RouterLink, LucideArrowLeft, LucideArrowRight],
    template: `
        <nav aria-label="Pagination">
            @if (links.prev; as prev) {
                <a class="link" [routerLink]="prev.path">
                    <span class="hint">
                        <svg lucideArrowLeft [size]="16" aria-hidden="true"></svg>Previous
                    </span>
                    <span class="title">{{ prev.title }}</span>
                </a>
            } @else {
                <span></span>
            }
            @if (links.next; as next) {
                <a class="link next" [routerLink]="next.path">
                    <span class="hint">
                        Next<svg lucideArrowRight [size]="16" aria-hidden="true"></svg>
                    </span>
                    <span class="title">{{ next.title }}</span>
                </a>
            }
        </nav>
    `,
    styleUrl: './prev-next.scss',
})
export class PrevNext {
    private readonly route = inject(ActivatedRoute);

    protected readonly links = neighbours(
        '/' + this.route.snapshot.url.map((segment) => segment.path).join('/'),
    );
}
