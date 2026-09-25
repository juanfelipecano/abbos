import { CdkTrapFocus } from '@angular/cdk/a11y';
import {
    ConnectedPosition,
    FlexibleConnectedPositionStrategy,
    Overlay,
    OverlayRef,
} from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { DOCUMENT } from '@angular/common';
import {
    afterNextRender,
    afterRenderEffect,
    booleanAttribute,
    Component,
    computed,
    DestroyRef,
    ElementRef,
    forwardRef,
    inject,
    Injector,
    input,
    LOCALE_ID,
    model,
    signal,
    TemplateRef,
    untracked,
    viewChild,
    ViewContainerRef,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CONTROL_SHAPE } from '../../../config';
import { AbControlShape } from '../../../constants';
import { AbButton } from '../../button/button';
import { AbCalendar } from './calendar/calendar';
import { AbDateRange, AbDatePickerMode, AbDatePickerValue } from './date-picker.types';
import {
    compareDays,
    DEFAULT_DATE_FORMAT,
    formatDate,
    formatPlaceholder,
    formatRange,
    fromRange,
    isDateDisabled,
    RANGE_SEPARATOR,
    toDate,
    toRange,
} from './date-utils';

export type AbDatePickerPlacement = 'below' | 'above';

/** Distance between the trigger and the panel, in px. */
const PANEL_OFFSET_PX = 8;
const VIEWPORT_MARGIN_PX = 8;
const THEME_ATTRIBUTES = ['data-ab-theme', 'data-ab-accent'];

/**
 * Below the trigger first; above when there is no room; then the same two aligned to the trigger's
 * end edge. The overlay takes the first position that fits, so a trigger at the bottom of the
 * viewport opens the panel upwards.
 */
const POSITIONS: ConnectedPosition[] = [
    {
        originX: 'start',
        originY: 'bottom',
        overlayX: 'start',
        overlayY: 'top',
        offsetY: PANEL_OFFSET_PX,
    },
    {
        originX: 'start',
        originY: 'top',
        overlayX: 'start',
        overlayY: 'bottom',
        offsetY: -PANEL_OFFSET_PX,
    },
    {
        originX: 'end',
        originY: 'bottom',
        overlayX: 'end',
        overlayY: 'top',
        offsetY: PANEL_OFFSET_PX,
    },
    {
        originX: 'end',
        originY: 'top',
        overlayX: 'end',
        overlayY: 'bottom',
        offsetY: -PANEL_OFFSET_PX,
    },
];

const FOCUSABLE =
    'a[href], button, input, select, textarea, summary, [tabindex]:not([tabindex="-1"])';

/** The element itself when it can take focus, otherwise its first focusable descendant. */
export function focusableWithin(element: HTMLElement | null): HTMLElement | null {
    if (!element) {
        return null;
    }
    return element.matches(FOCUSABLE) ? element : element.querySelector<HTMLElement>(FOCUSABLE);
}

let nextId = 0;

/**
 * The dropdown date picker. It renders nothing in place: it owns the value, the format and the
 * calendar panel, and the panel opens from any element that carries `abDatePickerTrigger`.
 *
 * ```html
 * <button ab-button [abDatePickerTrigger]="picker">Pick a date</button>
 * <ab-date-picker #picker [(value)]="date" />
 * ```
 *
 * - `single` commits and closes on a click. `range` keeps a draft until Apply; Esc or Cancel
 *   discards it.
 * - Works with `formControl`/`ngModel`, which get a `Date` (single) or `{ start, end }` (range).
 *   Strings written in `format` are accepted as input.
 */
@Component({
    selector: 'ab-date-picker',
    imports: [AbButton, AbCalendar, CdkTrapFocus],
    templateUrl: './date-picker.html',
    styleUrl: './date-picker.scss',
    host: { class: 'ab-date-picker' },
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AbDatePicker), multi: true },
    ],
})
export class AbDatePicker implements ControlValueAccessor {
    private readonly _overlay = inject(Overlay);
    private readonly _vcr = inject(ViewContainerRef);
    private readonly _host = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly _document = inject(DOCUMENT);
    private readonly _injector = inject(Injector);
    private readonly _defaultShape = inject(CONTROL_SHAPE);
    private readonly _panel = viewChild.required<TemplateRef<unknown>>('panel');
    private readonly _calendar = viewChild(AbCalendar);
    private _overlayRef: OverlayRef | null = null;

    /** A `Date` or string in `format` for single; `{ start, end }` or one string for range. */
    public readonly value = model<AbDatePickerValue>(null);
    public readonly open = model(false);
    public readonly mode = input<AbDatePickerMode>('single');
    /** Tokens: `dd d MM M MMM MMMM yy yyyy`. The same format is used to show, type and parse. */
    public readonly format = input(DEFAULT_DATE_FORMAT);
    public readonly locale = input(inject(LOCALE_ID));
    public readonly min = input<Date | string | null>(null);
    public readonly max = input<Date | string | null>(null);
    public readonly disabledDates = input<((date: Date) => boolean) | null>(null);
    /** 0 = Sunday … 6 = Saturday. Defaults to the locale's first day. */
    public readonly weekStart = input<number>();
    public readonly shape = input<AbControlShape>(this._defaultShape);
    public readonly disabled = input(false, { transform: booleanAttribute });
    /** Accessible name of the panel. */
    public readonly ariaLabel = input('Choose date');

    public readonly panelId = `ab-date-picker-panel-${nextId++}`;

    private readonly _formDisabled = signal(false);
    public readonly isDisabled = computed(() => this.disabled() || this._formDisabled());

    /** The range being picked while the panel is open in range mode. */
    private readonly _draft = signal<AbDatePickerValue>(null);
    private readonly _origin = signal<HTMLElement | null>(null);
    private readonly _anchor = signal<HTMLElement | null>(null);
    private readonly _placement = signal<AbDatePickerPlacement>('below');

    /** Whether the last typed text was rejected. Cleared by the next valid entry. */
    public readonly invalid = signal(false);
    /** Where the open panel sits relative to its trigger. */
    public readonly placement = this._placement.asReadonly();

    protected readonly isRange = computed(() => this.mode() === 'range');
    protected readonly calendarValue = computed(() =>
        this.isRange() ? this._draft() : this.value(),
    );
    protected readonly applyDisabled = computed(() => {
        const { start, end } = this.draftRange();
        return !!start && !end;
    });

    /** The current selection as dates. */
    public readonly selection = computed(() =>
        toRange(this.value(), this.mode(), this.format(), this.locale()),
    );
    private readonly draftRange = computed(() =>
        toRange(this._draft(), this.mode(), this.format(), this.locale()),
    );

    /** The selection written in `format`, ready for an input trigger. Empty when nothing is selected. */
    public readonly displayText = computed(() =>
        formatRange(this.selection(), this.format(), this.locale()),
    );
    /** The format as a hint for empty fields, for example `DD/MM/YYYY`. */
    public readonly placeholder = computed(() => {
        const hint = formatPlaceholder(this.format());
        return this.isRange() ? `${hint}${RANGE_SEPARATOR}${hint}` : hint;
    });

    /** Whether opening should move keyboard focus into the calendar. Pointer opens from an input keep it. */
    private _focusOnOpen = true;

    private _onChange: (value: Date | AbDateRange | null) => void = () => {};
    private _onTouched: () => void = () => {};

    constructor() {
        afterRenderEffect(() => {
            const show = this.open() && !!this._anchor() && !this.isDisabled();
            untracked(() => (show ? this.present() : this.dismiss()));
        });
        inject(DestroyRef).onDestroy(() => this.dispose());
    }

    /** Called by `abDatePickerTrigger`. `anchor` is the element the panel is positioned against. */
    public attach(origin: HTMLElement, anchor: HTMLElement): void {
        this._origin.set(origin);
        this._anchor.set(anchor);
    }

    public detach(origin: HTMLElement): void {
        if (this._origin() === origin) {
            this._origin.set(null);
            this._anchor.set(null);
            this.open.set(false);
        }
    }

    /** Opens the panel. Pass `focus: false` to leave keyboard focus where it is, for example in an input being typed in. */
    public show(options: { focus?: boolean } = {}): void {
        this._focusOnOpen = options.focus ?? true;
        this.open.set(true);
    }

    /** Opens the panel against any element, with no `abDatePickerTrigger` needed. */
    public openAt(element: HTMLElement): void {
        this.attach(element, element);
        this.show();
    }

    public toggle(): void {
        if (this.open()) {
            this.close();
        } else {
            this.show();
        }
    }

    public close(): void {
        this.open.set(false);
    }

    /**
     * Applies text typed in an input trigger. Returns `false` and sets `invalid` when the text is
     * not a real date in `format`, is outside `min`/`max`, is disabled, or (range) is incomplete.
     */
    public commitText(text: string): boolean {
        const trimmed = text.trim();
        if (!trimmed) {
            this.commit({ start: null, end: null });
            return true;
        }
        const range = toRange(trimmed, this.mode(), this.format(), this.locale());
        if (!this.isAllowed(range)) {
            this.invalid.set(true);
            return false;
        }
        this.commit(range);
        return true;
    }

    /** A complete range (single: one date) with every day inside `min`/`max` and not disabled. */
    private isAllowed({ start, end }: AbDateRange): boolean {
        const [min, max] = [this.toBound(this.min()), this.toBound(this.max())];
        const disabled = (date: Date) => isDateDisabled(date, min, max, this.disabledDates());
        return this.isRange()
            ? !!start && !!end && compareDays(end, start) >= 0 && !disabled(start) && !disabled(end)
            : !!start && !disabled(start);
    }

    /**
     * Follows text as it is typed: once it is a complete, allowed date the value updates, so the
     * calendar moves with it. Incomplete text changes nothing and is never flagged.
     */
    public previewText(text: string): void {
        const range = toRange(text.trim(), this.mode(), this.format(), this.locale());
        if (this.isAllowed(range)) {
            this.commit(range);
        }
    }

    public markTouched(): void {
        this._onTouched();
    }

    protected onCalendarChange(value: AbDatePickerValue): void {
        if (this.isRange()) {
            this._draft.set(value);
            return;
        }
        this.commit(toRange(value, 'single', this.format(), this.locale()));
        this.close();
    }

    protected clear(): void {
        if (this.isRange()) {
            this._draft.set(null);
        } else {
            this.commit({ start: null, end: null });
        }
    }

    protected apply(): void {
        this.commit(this.draftRange());
        this.close();
    }

    private commit(range: AbDateRange): void {
        const next = fromRange(range, this.mode());
        this.value.set(next);
        this._draft.set(next);
        this._onChange(next);
        this.invalid.set(false);
    }

    private toBound(value: Date | string | null): Date | null {
        return toDate(value, this.format(), this.locale());
    }

    private present(): void {
        if (this._overlayRef) {
            return;
        }
        this._draft.set(this.value());
        const strategy = this._overlay
            .position()
            .flexibleConnectedTo(this._anchor()!)
            .withPositions(POSITIONS)
            .withFlexibleDimensions(false)
            .withPush(true)
            .withViewportMargin(VIEWPORT_MARGIN_PX);
        const ref = this._overlay.create({
            positionStrategy: strategy,
            scrollStrategy: this._overlay.scrollStrategies.reposition(),
            panelClass: 'ab-date-picker-pane',
            disposeOnNavigation: true,
        });
        this.trackPlacement(strategy);
        this.copyThemeTo(ref.overlayElement);
        ref.keydownEvents().subscribe((event) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                this.close();
            }
        });
        ref.outsidePointerEvents().subscribe((event) => {
            const target = event.target as Node;
            if (!this._origin()?.contains(target) && !this._anchor()?.contains(target)) {
                this.close();
            }
        });
        ref.attach(new TemplatePortal(this._panel(), this._vcr));
        this._overlayRef = ref;
        if (this._focusOnOpen) {
            afterNextRender(() => this._calendar()?.focusDay(), { injector: this._injector });
        }
    }

    private dismiss(): void {
        if (!this._overlayRef) {
            return;
        }
        const active = this._document.activeElement;
        const hadFocus =
            !active ||
            active === this._document.body ||
            this._overlayRef.overlayElement.contains(active);
        this.dispose();
        this._focusOnOpen = true;
        if (hadFocus) {
            focusableWithin(this._origin())?.focus();
        }
        this._onTouched();
    }

    private dispose(): void {
        this._overlayRef?.dispose();
        this._overlayRef = null;
    }

    private trackPlacement(strategy: FlexibleConnectedPositionStrategy): void {
        strategy.positionChanges.subscribe((change) =>
            this._placement.set(change.connectionPair.overlayY === 'bottom' ? 'above' : 'below'),
        );
    }

    /** The overlay lives on `body`, so re-apply any theme/accent scoped to an ancestor. */
    private copyThemeTo(target: HTMLElement): void {
        for (const attribute of THEME_ATTRIBUTES) {
            const value = this._host.nativeElement
                .closest(`[${attribute}]`)
                ?.getAttribute(attribute);
            if (value != null) {
                target.setAttribute(attribute, value);
            }
        }
    }

    public writeValue(value: AbDatePickerValue): void {
        this.value.set(value);
    }

    public registerOnChange(fn: (value: Date | AbDateRange | null) => void): void {
        this._onChange = fn;
    }

    public registerOnTouched(fn: () => void): void {
        this._onTouched = fn;
    }

    public setDisabledState(isDisabled: boolean): void {
        this._formDisabled.set(isDisabled);
    }
}
