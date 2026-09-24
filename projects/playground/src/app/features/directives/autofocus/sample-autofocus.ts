import {
    afterNextRender,
    booleanAttribute,
    DestroyRef,
    Directive,
    ElementRef,
    inject,
    input,
    numberAttribute,
} from '@angular/core';

/**
 * Sample implementation backing the demo on this page. It is not part of the library yet;
 * when it ships, the page imports the real one instead.
 */
@Directive({ selector: '[abAutofocus]' })
export class SampleAutofocus {
    public readonly abAutofocus = input(true, { transform: booleanAttribute });
    public readonly autofocusDelay = input(0, { transform: numberAttribute });
    public readonly autofocusSelect = input(false, { transform: booleanAttribute });

    constructor() {
        const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
        let timer: ReturnType<typeof setTimeout> | undefined;

        afterNextRender(() => {
            if (!this.abAutofocus()) {
                return;
            }
            timer = setTimeout(() => {
                element.focus({ preventScroll: true });
                if (this.autofocusSelect() && element instanceof HTMLInputElement) {
                    element.select();
                }
            }, this.autofocusDelay());
        });
        inject(DestroyRef).onDestroy(() => clearTimeout(timer));
    }
}
