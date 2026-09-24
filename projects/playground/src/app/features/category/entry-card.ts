import { NgComponentOutlet } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DocEntry } from '../../core/docs/doc.model';
import { entryPath } from '../../core/docs/docs-registry';
import { StatusBadge } from '../../shared/ui/status-badge/status-badge';

/**
 * Card in a category grid: live thumbnail + summary. The title link stretches over the card,
 * and the thumbnail is inert, so there are no nested interactive elements.
 */
@Component({
    selector: 'app-entry-card',
    imports: [RouterLink, NgComponentOutlet, StatusBadge],
    template: `
        <div class="thumb pg-dotted" aria-hidden="true" inert>
            @if (entry().thumbnail; as thumbnail) {
                <ng-container *ngComponentOutlet="thumbnail" />
            }
        </div>
        <div class="body">
            <div class="title-row">
                <a class="title" [routerLink]="path()">{{ entry().title }}</a>
                <app-status-badge [label]="entry().status" />
            </div>
            <p class="card-desc">{{ entry().description }}</p>
            <code class="selector">{{ entry().selector }}</code>
        </div>
    `,
    styleUrl: './entry-card.scss',
})
export class EntryCard {
    public readonly entry = input.required<DocEntry>();

    protected readonly path = computed(() => entryPath(this.entry()));
}
