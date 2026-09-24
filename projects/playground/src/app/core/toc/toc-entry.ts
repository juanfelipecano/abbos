import { afterNextRender, DestroyRef, Directive, ElementRef, inject, input } from '@angular/core';
import { Toc } from './toc';

/**
 * Registers a heading in the page's "On this page" list and gives it its anchor id.
 * The label defaults to the heading's text.
 *
 * ```html
 * <h2 appTocEntry="sec-install">Installation</h2>
 * ```
 */
@Directive({
    selector: '[appTocEntry]',
    host: { '[id]': 'appTocEntry()' },
})
export class TocEntry {
    public readonly appTocEntry = input.required<string>();
    public readonly tocLabel = input<string>();
    public readonly tocLevel = input<2 | 3>(2);

    constructor() {
        const toc = inject(Toc);
        const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

        afterNextRender(() => {
            toc.register({
                id: this.appTocEntry(),
                label: this.tocLabel() ?? element.textContent?.trim() ?? '',
                level: this.tocLevel(),
                element,
            });
        });
        inject(DestroyRef).onDestroy(() => toc.unregister(element));
    }
}
