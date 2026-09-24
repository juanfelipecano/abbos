import { Component, effect, ElementRef, inject, viewChild } from '@angular/core';
import {
    LucideArrowRightLeft,
    LucideBookOpen,
    LucideBox,
    LucideBraces,
    LucideClock,
    LucideCornerDownLeft,
    LucideSearch,
} from '@lucide/angular';
import { Viewport } from '../../core/layout/viewport';
import { Search } from '../../core/search/search';

/**
 * ⌘K search. A native modal <dialog> gives focus trapping, Esc and an inert page for free;
 * the input drives a listbox through `aria-activedescendant` (combobox pattern).
 */
@Component({
    selector: 'app-search-dialog',
    imports: [
        LucideSearch,
        LucideClock,
        LucideBox,
        LucideBraces,
        LucideArrowRightLeft,
        LucideBookOpen,
        LucideCornerDownLeft,
    ],
    templateUrl: './search-dialog.html',
    styleUrl: './search-dialog.scss',
})
export class SearchDialog {
    protected readonly search = inject(Search);
    protected readonly isMobile = inject(Viewport).isMobile;

    private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
    private readonly input = viewChild.required<ElementRef<HTMLInputElement>>('input');

    constructor() {
        effect(() => {
            const dialog = this.dialog().nativeElement;
            if (this.search.isOpen() && !dialog.open) {
                dialog.showModal();
                this.input().nativeElement.focus();
            } else if (!this.search.isOpen() && dialog.open) {
                dialog.close();
            }
        });
    }

    protected optionId(index: number): string {
        return `search-option-${index}`;
    }

    /** Position of a hit in the flat list, for ids and the keyboard cursor. */
    protected indexOf(groupIndex: number, hitIndex: number): number {
        const groups = this.search.view().groups;
        let offset = 0;
        for (let i = 0; i < groupIndex; i++) {
            offset += groups[i].hits.length;
        }
        return offset + hitIndex;
    }

    protected onInput(event: Event): void {
        this.search.setQuery((event.target as HTMLInputElement).value);
    }

    protected onKeydown(event: KeyboardEvent): void {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            this.search.move(event.key === 'ArrowDown' ? 1 : -1);
            this.scrollActiveIntoView();
        } else if (event.key === 'Enter') {
            event.preventDefault();
            this.search.openActive();
        }
    }

    /** Clicks on the backdrop land on the <dialog> element itself. */
    protected onDialogClick(event: MouseEvent): void {
        if (event.target === this.dialog().nativeElement) {
            this.search.close();
        }
    }

    private scrollActiveIntoView(): void {
        queueMicrotask(() =>
            this.dialog()
                .nativeElement.querySelector(`#${this.optionId(this.search.activeIndex())}`)
                ?.scrollIntoView({ block: 'nearest' }),
        );
    }
}
