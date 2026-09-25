import {
    afterNextRender,
    computed,
    DestroyRef,
    Directive,
    effect,
    ElementRef,
    inject,
    input,
    Renderer2,
    untracked,
} from '@angular/core';
import { AbDatePicker, focusableWithin } from './date-picker';

/** Elements that already act as a control, so they need no `role` or `tabindex` from us. */
const NATIVE_CONTROL = 'button, a[href], input, select, textarea, summary';

/**
 * Opens an `ab-date-picker` from the element it is on. It can be any element or component: a
 * button, an input, a chip, a card, a table cell.
 *
 * - Adds `aria-haspopup="dialog"`, `aria-expanded` and `aria-controls`.
 * - A click toggles the panel and moves focus into the calendar. Arrow Down opens it from any
 *   trigger; Esc closes it and returns focus to the trigger.
 * - A host that is not a native control, has no `role` or `tabindex`, and has nothing focusable
 *   inside gets `role="button"` and `tabindex="0"`, so it works from the keyboard: Enter and
 *   Space toggle it. Your own `role` or `tabindex` is never replaced.
 * - When the host is a component, focus returns to its first focusable descendant.
 * - On a typable `<input>` the text is the value. It is shown in the picker's `format`, followed
 *   as you type, applied on Enter or blur, and flagged with `aria-invalid` when it is not a
 *   valid date. A click opens the panel but keeps focus in the input, so typing is never
 *   interrupted; Arrow Down moves focus into the calendar; Enter or Tab closes it. A read-only
 *   input acts like a button.
 * - By default the panel is positioned against this element. Set `abDatePickerAnchor` to position
 *   it against another one, for example the whole field when the trigger is only an inner input.
 * - Safe to use as a `hostDirective`, so a component can be a trigger by itself.
 */
@Directive({
    selector: '[abDatePickerTrigger]',
    exportAs: 'abDatePickerTrigger',
    host: {
        'aria-haspopup': 'dialog',
        '[attr.aria-expanded]': 'picker().open()',
        '[attr.aria-controls]': 'picker().open() ? picker().panelId : null',
        '[attr.aria-invalid]': 'isInput && picker().invalid() ? true : null',
        '[attr.aria-disabled]': 'ariaDisabled()',
        '[attr.placeholder]': 'placeholder()',
        '(click)': 'onClick()',
        '(keydown)': 'onKeydown($event)',
        '(input)': 'onInput()',
        '(change)': 'commitText()',
        '(blur)': 'onBlur()',
    },
})
export class AbDatePickerTrigger {
    private readonly _element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    private readonly _renderer = inject(Renderer2);

    public readonly picker = input.required<AbDatePicker>({ alias: 'abDatePickerTrigger' });
    public readonly anchor = input<HTMLElement | ElementRef<HTMLElement> | null>(null, {
        alias: 'abDatePickerAnchor',
    });

    protected readonly isInput = this._element instanceof HTMLInputElement;
    private readonly _isNativeControl = this._element.matches(NATIVE_CONTROL);
    private readonly _ownPlaceholder = this._element.getAttribute('placeholder');
    /** An input the user can type in. A read-only one behaves like a button. */
    private get _typable(): boolean {
        return this.isInput && !(this._element as HTMLInputElement).readOnly;
    }
    /** The user has typed something that has not been applied yet. */
    private _dirty = false;

    protected readonly placeholder = computed(() =>
        this.isInput ? (this._ownPlaceholder ?? this.picker().placeholder()) : null,
    );
    protected readonly ariaDisabled = computed(() =>
        !this._isNativeControl && this.picker().isDisabled() ? true : null,
    );

    constructor() {
        effect((onCleanup) => {
            const picker = this.picker();
            const anchor = this.anchor();
            picker.attach(
                this._element,
                anchor instanceof ElementRef ? anchor.nativeElement : (anchor ?? this._element),
            );
            onCleanup(() => picker.detach(this._element));
        });

        // Keep an input showing the value in `format` whenever the value changes from outside.
        effect(() => {
            const text = this.picker().displayText();
            untracked(() => {
                if (this.isInput && !this._dirty) {
                    (this._element as HTMLInputElement).value = text;
                }
            });
        });

        // Wait for a component host to render its own content before deciding it needs a role.
        afterNextRender(() => this.makeOperable());

        inject(DestroyRef).onDestroy(() => this.picker().detach(this._element));
    }

    protected onClick(): void {
        const picker = this.picker();
        if (picker.isDisabled()) {
            return;
        }
        if (this._typable) {
            picker.show({ focus: false });
        } else {
            picker.toggle();
        }
    }

    protected onKeydown(event: KeyboardEvent): void {
        const picker = this.picker();
        if (picker.isDisabled()) {
            return;
        }
        const own = event.target === this._element;
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            picker.show({ focus: true });
        } else if (this._typable && event.key === 'Enter') {
            if (this.commitText()) {
                picker.close();
            }
        } else if (this._typable && event.key === 'Tab') {
            picker.close();
        } else if (
            own &&
            (event.key === 'Enter' || event.key === ' ') &&
            !this._typable &&
            !this._element.matches('button, a[href], summary')
        ) {
            event.preventDefault();
            picker.toggle();
        }
    }

    protected onInput(): void {
        this._dirty = true;
        if (this._typable && this.picker().open()) {
            this.picker().previewText((this._element as HTMLInputElement).value);
        }
    }

    protected onBlur(): void {
        this.commitText();
        this.picker().markTouched();
    }

    /** Applies the typed text. `true` when there was nothing to apply or it was accepted. */
    protected commitText(): boolean {
        if (!this._typable || !this._dirty) {
            return true;
        }
        const input = this._element as HTMLInputElement;
        if (!this.picker().commitText(input.value)) {
            return false;
        }
        this._dirty = false;
        input.value = this.picker().displayText();
        return true;
    }

    private makeOperable(): void {
        if (this._isNativeControl || focusableWithin(this._element) !== null) {
            return;
        }
        if (!this._element.hasAttribute('role')) {
            this._renderer.setAttribute(this._element, 'role', 'button');
        }
        if (!this._element.hasAttribute('tabindex')) {
            this._renderer.setAttribute(this._element, 'tabindex', '0');
        }
    }
}
