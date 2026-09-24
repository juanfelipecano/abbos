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
import { AbDragTracker } from '../../../helpers';

@Component({
    selector: 'ab-segmented-toggle',
    templateUrl: './segmented-toggle.html',
    styleUrl: './segmented-toggle.scss',
    host: {
        class: 'ab-segmented-toggle',
        '[class.ab-segmented-toggle_sm]': `size() === 'sm'`,
        '[class.ab-segmented-toggle_md]': `size() === 'md'`,
        '[class.ab-segmented-toggle_lg]': `size() === 'lg'`,
        '[class.ab-segmented-toggle_square]': `shape() === 'square'`,
        '[class.ab-segmented-toggle_round]': `shape() === 'round'`,
        '[class.ab-segmented-toggle_circle]': `shape() === 'circle'`,
        '[class.ab-segmented-toggle_disabled]': 'isDisabled()',
    },
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => AbSegmentedToggle),
            multi: true,
        },
    ],
})
export class AbSegmentedToggle implements ControlValueAccessor {
    private readonly _defaultSize = inject(CONTROL_SIZE);

    /** `false` = first (start) segment active, `true` = second (end) segment active. */
    public readonly checked = model(false);
    public readonly startLabel = input.required<string>();
    public readonly endLabel = input.required<string>();
    public readonly size = input<AbControlSize>(this._defaultSize);
    public readonly shape = input<AbControlShape>('circle');
    public readonly ariaLabel = input<string>();
    public readonly disabled = input(false, { transform: booleanAttribute });

    private readonly _formDisabled = signal(false);
    protected readonly isDisabled = computed(() => this.disabled() || this._formDisabled());

    /** Thumb offset in px while dragging; `null` when not dragging. */
    protected readonly dragOffset = signal<number | null>(null);
    /** Which segment the thumb is (or is heading) over, for label colouring. */
    protected readonly thumbAtEnd = computed(() => {
        const offset = this.dragOffset();
        return offset === null ? this.checked() : offset > this._travel() / 2;
    });

    private _travel = signal(0);
    private readonly _drag = new AbDragTracker();
    private _onChange: (checked: boolean) => void = () => {};
    protected onTouched: () => void = () => {};

    protected select(next: boolean, group?: HTMLElement): void {
        if (this.isDisabled()) {
            return;
        }
        if (next !== this.checked()) {
            this.checked.set(next);
            this._onChange(next);
        }
        group?.querySelectorAll('button')[next ? 1 : 0].focus();
    }

    protected onSegmentClick(next: boolean): void {
        if (this._drag.clickSuppressed) {
            return;
        }
        this.select(next);
    }

    protected onPointerDown(event: PointerEvent, track: HTMLElement): void {
        if (
            this.isDisabled() ||
            !event.isPrimary ||
            (event.pointerType === 'mouse' && event.button !== 0)
        ) {
            return;
        }
        const travel = this.travel(track);
        this._travel.set(travel);
        this._drag.start(event, this.checked() ? travel : 0, travel);
    }

    protected onPointerMove(event: PointerEvent, track: HTMLElement): void {
        const wasDragging = this._drag.dragging;
        const offset = this._drag.move(event);
        if (offset === null) {
            return;
        }
        if (!wasDragging) {
            track.setPointerCapture(event.pointerId);
        }
        this.dragOffset.set(offset);
    }

    protected onPointerUp(event: PointerEvent, track: HTMLElement): void {
        const result = this._drag.end();
        if (!result) {
            return;
        }
        this.dragOffset.set(null);
        if (track.hasPointerCapture(event.pointerId)) {
            track.releasePointerCapture(event.pointerId);
        }
        this.select(result.towardEnd);
    }

    protected onPointerCancel(): void {
        if (this._drag.cancel()) {
            this.dragOffset.set(null);
        }
    }

    /** Distance the thumb travels between the two segments (its own width). */
    private travel(track: HTMLElement): number {
        return (
            track.querySelector('.ab-segmented-toggle-thumb')?.getBoundingClientRect().width ?? 0
        );
    }

    protected onKeydown(event: KeyboardEvent, group: HTMLElement): void {
        const next = {
            ArrowRight: true,
            ArrowDown: true,
            End: true,
            ArrowLeft: false,
            ArrowUp: false,
            Home: false,
        }[event.key];
        if (next === undefined) {
            return;
        }
        event.preventDefault();
        this.select(next, group);
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
