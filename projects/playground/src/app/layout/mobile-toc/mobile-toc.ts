import { Component, computed, inject, signal } from '@angular/core';
import { LucideChevronDown } from '@lucide/angular';
import { Toc } from '../../core/toc/toc';

/** Collapsible "On this page" box shown above the content on small screens. */
@Component({
    selector: 'app-mobile-toc',
    imports: [LucideChevronDown],
    template: `
        <button
            type="button"
            class="toggle"
            [attr.aria-expanded]="open()"
            aria-controls="mobile-toc-list"
            (click)="open.set(!open())"
        >
            <span class="hint">On this page</span>
            <span class="current">{{ activeLabel() }}</span>
            <svg
                lucideChevronDown
                class="chevron"
                [class.open]="open()"
                [size]="16"
                aria-hidden="true"
            ></svg>
        </button>
        @if (open()) {
            <ul id="mobile-toc-list">
                @for (section of toc.sections(); track section.id) {
                    <li>
                        <button
                            type="button"
                            [class.sub]="section.level === 3"
                            [class.active]="section.id === toc.activeId()"
                            (click)="go(section.id)"
                        >
                            {{ section.label }}
                        </button>
                    </li>
                }
            </ul>
        }
    `,
    styleUrl: './mobile-toc.scss',
})
export class MobileToc {
    protected readonly toc = inject(Toc);
    protected readonly open = signal(false);

    protected readonly activeLabel = computed(() => {
        const id = this.toc.activeId();
        return this.toc.sections().find((section) => section.id === id)?.label ?? '';
    });

    protected go(id: string): void {
        this.open.set(false);
        this.toc.scrollTo(id);
    }
}
