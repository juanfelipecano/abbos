import { NgTemplateOutlet } from '@angular/common';
import {
    booleanAttribute,
    Component,
    computed,
    contentChildren,
    forwardRef,
    inject,
    input,
    model,
    signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AbControlShape, AbControlSize } from '../../constants';
import { CONTROL_SIZE } from '../../config';
import { AbSegment } from './segment';

let nextId = 0;

/**
 * A pill-shaped control with any number of segments and a sliding active thumb. Optionally
 * switches between the content each `<ab-segment>` declares with `abSegmentContent`.
 * The component is router-agnostic: bind `[(value)]` to a route param yourself if needed.
 */
@Component({
    selector: 'ab-segments',
    imports: [NgTemplateOutlet],
    templateUrl: './segments.html',
    styleUrl: './segments.scss',
    host: {
        class: 'ab-segments',
        '[class.ab-segments_sm]': `size() === 'sm'`,
        '[class.ab-segments_md]': `size() === 'md'`,
        '[class.ab-segments_lg]': `size() === 'lg'`,
        '[class.ab-segments_square]': `shape() === 'square'`,
        '[class.ab-segments_round]': `shape() === 'round'`,
        '[class.ab-segments_circle]': `shape() === 'circle'`,
        '[class.ab-segments_full]': 'fullWidth()',
        '[class.ab-segments_disabled]': 'isDisabled()',
    },
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => AbSegments),
            multi: true,
        },
    ],
})
export class AbSegments implements ControlValueAccessor {
    private readonly _defaultSize = inject(CONTROL_SIZE);
    protected readonly uid = `ab-segments-${nextId++}`;

    /** The `value` of the active segment, or `null` for none. */
    public readonly value = model<string | null>(null);
    public readonly size = input<AbControlSize>(this._defaultSize);
    public readonly shape = input<AbControlShape>('circle');
    public readonly fullWidth = input(false, { transform: booleanAttribute });
    public readonly ariaLabel = input<string>();
    public readonly disabled = input(false, { transform: booleanAttribute });

    protected readonly segments = contentChildren(AbSegment);

    private readonly _formDisabled = signal(false);
    protected readonly isDisabled = computed(() => this.disabled() || this._formDisabled());

    protected readonly activeIndex = computed(() => {
        const value = this.value();
        return this.segments().findIndex((segment) => segment.value() === value);
    });
    protected readonly activeContent = computed(
        () => this.segments()[this.activeIndex()]?.content()?.template ?? null,
    );
    /** Tabs semantics when segments switch content, radio semantics when they only pick a value. */
    protected readonly hasContent = computed(() => this.segments().some((s) => s.content()));

    /** The one segment reachable with Tab: the active one, else the first enabled one. */
    protected readonly focusIndex = computed(() => {
        const active = this.activeIndex();
        return active >= 0 ? active : this.segments().findIndex((s) => !s.disabled());
    });

    private _onChange: (value: string | null) => void = () => {};
    protected onTouched: () => void = () => {};

    protected select(index: number, group?: HTMLElement): void {
        const segment = this.segments()[index];
        if (!segment || this.isDisabled() || segment.disabled()) {
            return;
        }
        const next = segment.value();
        if (next !== this.value()) {
            this.value.set(next);
            this._onChange(next);
        }
        group?.querySelectorAll('button')[index]?.focus();
    }

    protected onKeydown(event: KeyboardEvent, group: HTMLElement): void {
        const segments = this.segments();
        const enabled = segments.flatMap((s, i) => (s.disabled() ? [] : [i]));
        if (!enabled.length) {
            return;
        }
        const current = enabled.indexOf(this.focusIndex());
        const target = {
            ArrowRight: enabled[(current + 1) % enabled.length],
            ArrowDown: enabled[(current + 1) % enabled.length],
            ArrowLeft: enabled[(current - 1 + enabled.length) % enabled.length],
            ArrowUp: enabled[(current - 1 + enabled.length) % enabled.length],
            Home: enabled[0],
            End: enabled[enabled.length - 1],
        }[event.key];
        if (target === undefined) {
            return;
        }
        event.preventDefault();
        this.select(target, group);
    }

    public writeValue(value: string | null): void {
        this.value.set(value ?? null);
    }

    public registerOnChange(fn: (value: string | null) => void): void {
        this._onChange = fn;
    }

    public registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    public setDisabledState(isDisabled: boolean): void {
        this._formDisabled.set(isDisabled);
    }
}
