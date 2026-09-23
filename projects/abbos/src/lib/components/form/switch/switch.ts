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
import { CONTROL_SHAPE, CONTROL_SIZE } from '../../../config';

@Component({
    selector: 'ab-switch',
    templateUrl: './switch.html',
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

    public readonly checked = model(false);
    public readonly size = input<AbControlSize>(this._defaultSize);
    public readonly shape = input<AbControlShape>('circle');
    public readonly ariaLabel = input<string>();
    public readonly disabled = input(false, { transform: booleanAttribute });

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
