import {
    booleanAttribute,
    Component,
    computed,
    forwardRef,
    inject,
    input,
    model,
    signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AbControlShape, AbControlSize } from '../../../constants';
import { CONTROL_SIZE } from '../../../config';

/**
 * Abbos Switch — a boolean toggle with an optional inline label. Renders a `<label>`
 * wrapping a real `<button type="button" role="switch">` (native keyboard/focus behavior,
 * no hand-built keydown handling) plus a decorative knob.
 *
 * Two-way bindable via `[(checked)]`, and a real `ControlValueAccessor` for
 * `formControlName`/`[formControl]`/`[(ngModel)]` — `checked` is the single source of truth
 * for both.
 *
 * The projected default content becomes the switch's accessible name via native `<label>`
 * association. A switch with no projected text (icon-only, or labeled by an adjacent
 * element) must supply `ariaLabel` instead — this component cannot enforce that at compile
 * time, the same duty-of-care a plain, unlabeled `<button>` already has.
 *
 * @example
 * <ab-switch [(checked)]="notificationsOn">Email notifications</ab-switch>
 * <ab-switch formControlName="marketingOptIn">Marketing emails</ab-switch>
 * <ab-switch size="lg" shape="circle" [(checked)]="on">Large, pill-shaped</ab-switch>
 * <ab-switch ariaLabel="Toggle dark mode" [(checked)]="darkMode"></ab-switch>
 */
@Component({
    selector: 'ab-switch',
    template: `
        <label>
            <button
                type="button"
                role="switch"
                [attr.aria-checked]="checked()"
                [attr.aria-label]="ariaLabel() ?? null"
                [disabled]="isDisabled()"
                (click)="toggle()"
                (blur)="onTouched()"
            >
                <span class="ab-switch-knob"></span>
            </button>
            <span class="ab-switch-label"><ng-content /></span>
        </label>
    `,
    styleUrl: './switch.scss',
    host: {
        class: 'ab-switch',
        '[class.ab-switch_sm]': `size() === 'sm'`,
        '[class.ab-switch_md]': `size() === 'md'`,
        '[class.ab-switch_lg]': `size() === 'lg'`,
        '[class.ab-switch_square]': `shape() === 'square'`,
        '[class.ab-switch_round]': `shape() === 'round'`,
        '[class.ab-switch_circle]': `shape() === 'circle'`,
        '[class.ab-switch_disabled]': 'isDisabled()',
    },
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AbSwitch), multi: true },
    ],
})
export class AbSwitch implements ControlValueAccessor {
    private readonly _defaultSize = inject(CONTROL_SIZE);
    private readonly _defaultShape: AbControlShape = 'circle';

    /** On/off state. Supports `[(checked)]` and is written by `ControlValueAccessor`. */
    public readonly checked = model(false);

    /** Track/knob size. Defaults to the injected `CONTROL_SIZE` token. */
    public readonly size = input<AbControlSize>(this._defaultSize);

    /** Track corner treatment. Defaults to the injected `CONTROL_SHAPE` token. */
    public readonly shape = input<AbControlShape>(this._defaultShape);

    /** Disables interaction. Forms can also disable via `setDisabledState`. Defaults to `false`. */
    public readonly disabled = input(false, { transform: booleanAttribute });

    /**
     * Accessible name for the inner `button[role=switch]`. Required when the switch has no
     * projected label content — omit when projected content already provides one.
     */
    public readonly ariaLabel = input<string>();

    private readonly _formDisabled = signal(false);
    protected readonly isDisabled = computed(() => this.disabled() || this._formDisabled());

    private _onChange: (checked: boolean) => void = () => {};
    protected onTouched: () => void = () => {};

    protected toggle(): void {
        if (this.isDisabled()) {
            return;
        }
        const next = !this.checked();
        this.checked.set(next);
        this._onChange(next);
    }

    public writeValue(value: boolean | null): void {
        this.checked.set(value ?? false);
    }

    public registerOnChange(fn: (checked: boolean) => void): void {
        this._onChange = fn;
    }

    public registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    public setDisabledState(isDisabled: boolean): void {
        this._formDisabled.set(isDisabled);
    }
}
