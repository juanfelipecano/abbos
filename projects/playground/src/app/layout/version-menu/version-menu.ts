import { Component, ElementRef, inject, signal } from '@angular/core';
import { LucideArrowUpRight, LucideCheck, LucideChevronDown } from '@lucide/angular';
import { AbButton } from 'abbos';
import { LIBRARY_VERSION, SITE_LINKS } from '../../core/docs/site';

/** Version picker. Only the current release is documented, so it links out to the rest. */
@Component({
    selector: 'app-version-menu',
    imports: [AbButton, LucideChevronDown, LucideCheck, LucideArrowUpRight],
    template: `
        <button
            ab-button
            variant="outline"
            size="sm"
            aria-haspopup="true"
            [attr.aria-expanded]="open()"
            aria-controls="version-list"
            (click)="open.set(!open())"
        >
            v{{ version }}
            <svg abEnd lucideChevronDown [size]="16" aria-hidden="true"></svg>
        </button>
        @if (open()) {
            <ul id="version-list" class="list" aria-label="Versions">
                <li class="item current">
                    <span class="name">v{{ version }}</span>
                    <span class="tag">Latest</span>
                    <svg lucideCheck [size]="16" aria-hidden="true"></svg>
                </li>
                <li class="divider" aria-hidden="true"></li>
                <li>
                    <a class="item" [href]="releases" target="_blank" rel="noopener">
                        <span class="name sans">All releases</span>
                        <svg lucideArrowUpRight [size]="16" aria-hidden="true"></svg>
                    </a>
                </li>
            </ul>
        }
    `,
    styleUrl: './version-menu.scss',
    host: {
        '(document:click)': 'onDocumentClick($event)',
        '(keydown.escape)': 'open.set(false)',
    },
})
export class VersionMenu {
    private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

    protected readonly version = LIBRARY_VERSION;
    protected readonly releases = SITE_LINKS.releases;
    protected readonly open = signal(false);

    protected onDocumentClick(event: MouseEvent): void {
        if (this.open() && !this.host.contains(event.target as Node)) {
            this.open.set(false);
        }
    }
}
