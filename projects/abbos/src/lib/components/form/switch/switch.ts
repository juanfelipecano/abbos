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
import { CONTROL_SIZE } from '../../../config';
import { AbControlShape, AbControlSize } from '../../../constants';
import { AbDragTracker } from '../../../helpers';

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

    /** Knob offset in px from its resting start position while dragging; `null` otherwise. */
    protected readonly dragOffset = signal<number | null>(null);
    private readonly _travel = signal(0);
    /** Whether the knob is (or is heading) at the on side; drives the track colour mid-drag. */
    protected readonly visuallyOn = computed(() => {
        const offset = this.dragOffset();
        return offset === null ? this.checked() : offset > this._travel() / 2;
    });
    private readonly _drag = new AbDragTracker();

    private _onChange: (checked: boolean) => void = () => {};
    protected onTouched: () => void = () => {};

    protected toggle(): void {
        if (this.isDisabled() || this._drag.clickSuppressed) {
            return;
        }
        const next = !this.checked();
        this.checked.set(next);
        this._onChange(next);
    }

    protected onPointerDown(event: PointerEvent, button: HTMLElement): void {
        if (
            this.isDisabled() ||
            !event.isPrimary ||
            (event.pointerType === 'mouse' && event.button !== 0)
        ) {
            return;
        }
        const travel = this.travel(button);
        this._travel.set(travel);
        this._drag.start(event, this.checked() ? travel : 0, travel);
    }

    protected onPointerMove(event: PointerEvent, button: HTMLElement): void {
        const wasDragging = this._drag.dragging;
        const offset = this._drag.move(event);
        if (offset === null) {
            return;
        }
        if (!wasDragging) {
            button.setPointerCapture(event.pointerId);
        }
        this.dragOffset.set(offset);
    }

    protected onPointerUp(event: PointerEvent, button: HTMLElement): void {
        const result = this._drag.end();
        if (!result) {
            return;
        }
        this.dragOffset.set(null);
        if (button.hasPointerCapture(event.pointerId)) {
            button.releasePointerCapture(event.pointerId);
        }
        if (result.towardEnd !== this.checked()) {
            this.checked.set(result.towardEnd);
            this._onChange(result.towardEnd);
        }
    }

    protected onPointerCancel(): void {
        if (this._drag.cancel()) {
            this.dragOffset.set(null);
        }
    }

    /** Distance the knob travels: track width minus the knob and its padding on both sides. */
    private travel(button: HTMLElement): number {
        const track = button.getBoundingClientRect();
        const knob = button.querySelector('.ab-switch-knob')?.getBoundingClientRect();
        if (!knob) {
            return 0;
        }
        const padding = (track.height - knob.height) / 2;
        return Math.max(track.width - knob.width - 2 * padding, 0);
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
