import {
    afterNextRender,
    Component,
    computed,
    ElementRef,
    inject,
    Injector,
    input,
    linkedSignal,
    LOCALE_ID,
    model,
    signal,
} from '@angular/core';
import { LucideChevronDown, LucideChevronLeft, LucideChevronRight } from '@lucide/angular';
import { CONTROL_SHAPE } from '../../../../config';
import { AbControlShape } from '../../../../constants';
import { AbIcon } from '../../../icon/icon';
import { AB_DATE_NOW } from '../date-picker.tokens';
import { AbDatePickerMode, AbDatePickerValue } from '../date-picker.types';
import {
    addDays,
    addMonths,
    compareDays,
    DEFAULT_DATE_FORMAT,
    firstDayOfWeek,
    isDateDisabled,
    isSameDay,
    monthNames,
    startOfDay,
    toDate,
    toRange,
} from '../date-utils';

export type AbCalendarView = 'day' | 'month' | 'year';

export interface AbCalendarCell {
    date: Date;
    label: number;
    inMonth: boolean;
    /** Filled: the single date, or either end of a range. */
    edge: boolean;
    /** Part of the selection, including the span between the ends. */
    selected: boolean;
    band: 'full' | 'start' | 'end' | null;
    today: boolean;
    disabled: boolean;
    /** The end of a range that is not picked yet, following the pointer. */
    preview: boolean;
    focusable: boolean;
    ariaLabel: string;
}

interface AbCalendarOption {
    label: string;
    value: number;
    selected: boolean;
    current: boolean;
}

const WEEKS = 6;
const YEARS_PER_PAGE = 12;

function startOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * A month grid for picking one date or a range. It is a controlled surface: every click updates
 * `value` immediately. Wrap it in `ab-date-picker` when it should open from a trigger.
 *
 * Keyboard: arrows move by day or week, Home/End to the start or end of the week, PageUp/PageDown
 * by month, Shift + PageUp/PageDown by year.
 */
@Component({
    selector: 'ab-calendar',
    imports: [AbIcon],
    templateUrl: './calendar.html',
    styleUrl: './calendar.scss',
    host: {
        class: 'ab-calendar',
        '[class.ab-calendar_square]': `shape() === 'square'`,
        '[class.ab-calendar_round]': `shape() === 'round'`,
        '[class.ab-calendar_circle]': `shape() === 'circle'`,
    },
})
export class AbCalendar {
    private readonly _now = inject(AB_DATE_NOW);
    private readonly _host = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly _injector = inject(Injector);
    private readonly _defaultShape = inject(CONTROL_SHAPE);

    /** A `Date` or string in `format` for single; `{ start, end }` or one string for range. */
    public readonly value = model<AbDatePickerValue>(null);
    public readonly mode = input<AbDatePickerMode>('single');
    public readonly format = input(DEFAULT_DATE_FORMAT);
    public readonly locale = input(inject(LOCALE_ID));
    public readonly min = input<Date | string | null>(null);
    public readonly max = input<Date | string | null>(null);
    public readonly disabledDates = input<((date: Date) => boolean) | null>(null);
    /** 0 = Sunday … 6 = Saturday. Defaults to the locale's first day. */
    public readonly weekStart = input<number>();
    public readonly shape = input<AbControlShape>(this._defaultShape);

    protected readonly icons = {
        prev: LucideChevronLeft,
        next: LucideChevronRight,
        chevron: LucideChevronDown,
    };
    protected readonly view = signal<AbCalendarView>('day');
    protected readonly hover = signal<Date | null>(null);

    private readonly _today = computed(() => startOfDay(this._now()));
    private readonly _selection = computed(() =>
        toRange(this.value(), this.mode(), this.format(), this.locale()),
    );
    private readonly _min = computed(() => toDate(this.min(), this.format(), this.locale()));
    private readonly _max = computed(() => toDate(this.max(), this.format(), this.locale()));
    private readonly _firstDay = computed(() => this.weekStart() ?? firstDayOfWeek(this.locale()));

    /**
     * The month on screen. Navigating sets it; a new start date resets it to that date's month, so
     * a value written from outside (a typed date, a form control) brings the calendar along.
     * Picking a range end does not, so a range can span months without the view jumping back.
     */
    private readonly _startTime = computed(() => this._selection().start?.getTime() ?? null);
    protected readonly month = linkedSignal<number | null, Date>({
        source: this._startTime,
        computation: (start) => startOfMonth(start === null ? this._today() : new Date(start)),
    });
    private readonly _focus = signal<Date | null>(null);

    /** The day that holds the tab stop: the last one moved to, else the selection, today or the 1st. */
    private readonly _focusable = computed(() => {
        const month = this.month();
        const inMonth = (date: Date | null): date is Date =>
            !!date &&
            date.getFullYear() === month.getFullYear() &&
            date.getMonth() === month.getMonth();
        const focus = this._focus();
        const start = this._selection().start;
        const today = this._today();
        return inMonth(focus) ? focus : inMonth(start) ? start : inMonth(today) ? today : month;
    });

    private readonly _monthLong = computed(() => monthNames(this.locale(), 'long'));
    private readonly _yearBase = computed(
        () => Math.floor(this.month().getFullYear() / YEARS_PER_PAGE) * YEARS_PER_PAGE,
    );

    protected readonly title = computed(() => {
        const month = this.month();
        switch (this.view()) {
            case 'day':
                return `${this._monthLong()[month.getMonth()]} ${month.getFullYear()}`;
            case 'month':
                return String(month.getFullYear());
            default:
                return `${this._yearBase()} – ${this._yearBase() + YEARS_PER_PAGE - 1}`;
        }
    });
    protected readonly optionsLabel = computed(() =>
        this.view() === 'month' ? 'Choose month' : 'Choose year',
    );
    private readonly _unit = computed(() =>
        this.view() === 'day' ? 'month' : this.view() === 'month' ? 'year' : '12 years',
    );
    protected readonly prevLabel = computed(() => `Previous ${this._unit()}`);
    protected readonly nextLabel = computed(() => `Next ${this._unit()}`);

    protected readonly weekdays = computed(() => {
        const short = new Intl.DateTimeFormat(this.locale(), { weekday: 'short' });
        const long = new Intl.DateTimeFormat(this.locale(), { weekday: 'long' });
        // 2023-01-01 was a Sunday.
        return Array.from({ length: 7 }, (_, index) => {
            const day = new Date(2023, 0, 1 + ((this._firstDay() + index) % 7));
            return { short: short.format(day), long: long.format(day) };
        });
    });

    protected readonly weeks = computed<AbCalendarCell[][]>(() => {
        const month = this.month();
        const { start, end } = this._selection();
        const range = this.mode() === 'range';
        const hover = this.hover();
        const previewEnd =
            range && start && !end && hover && compareDays(hover, start) > 0 ? hover : null;
        const rangeEnd = end ?? previewEnd;
        const focusable = this._focusable();
        const today = this._today();
        const label = new Intl.DateTimeFormat(this.locale(), { dateStyle: 'full' });

        const offset = (month.getDay() - this._firstDay() + 7) % 7;
        const first = addDays(month, -offset);
        return Array.from({ length: WEEKS }, (_, week) =>
            Array.from({ length: 7 }, (_, dayIndex): AbCalendarCell => {
                const date = addDays(first, week * 7 + dayIndex);
                const inMonth = date.getMonth() === month.getMonth();
                const disabled = this.isDisabled(date);
                const isToday = isSameDay(date, today);
                const isStart = isSameDay(date, start);
                const isEnd = isSameDay(date, rangeEnd);
                const preview = isEnd && !end && !isStart;
                const edge = isStart || (isEnd && !preview);
                let band: AbCalendarCell['band'] = null;
                if (inMonth && range && start && rangeEnd && !isSameDay(start, rangeEnd)) {
                    band =
                        compareDays(date, start) > 0 && compareDays(date, rangeEnd) < 0
                            ? 'full'
                            : isStart
                              ? 'start'
                              : isEnd
                                ? 'end'
                                : null;
                }
                return {
                    date,
                    label: date.getDate(),
                    inMonth,
                    edge,
                    selected: edge || band === 'full',
                    band,
                    today: isToday,
                    disabled,
                    preview,
                    focusable: isSameDay(date, focusable),
                    ariaLabel:
                        label.format(date) +
                        (isToday ? ', today' : '') +
                        (disabled ? ', unavailable' : ''),
                };
            }),
        );
    });

    protected readonly months = computed<AbCalendarOption[]>(() => {
        const month = this.month();
        const today = this._today();
        return this._monthNames().map((label, value) => ({
            label,
            value,
            selected: value === month.getMonth(),
            current: value === today.getMonth() && month.getFullYear() === today.getFullYear(),
        }));
    });
    private readonly _monthNames = computed(() => monthNames(this.locale(), 'short'));

    protected readonly years = computed<AbCalendarOption[]>(() => {
        const year = this.month().getFullYear();
        return Array.from({ length: YEARS_PER_PAGE }, (_, index) => {
            const value = this._yearBase() + index;
            return {
                label: String(value),
                value,
                selected: value === year,
                current: value === this._today().getFullYear(),
            };
        });
    });

    protected toggleView(): void {
        this.view.update((view) => (view === 'day' ? 'month' : view === 'month' ? 'year' : 'day'));
    }

    protected step(direction: 1 | -1): void {
        const month = this.month();
        const view = this.view();
        if (view === 'day') {
            this.month.set(new Date(month.getFullYear(), month.getMonth() + direction, 1));
        } else {
            const years = view === 'year' ? YEARS_PER_PAGE : 1;
            this.month.set(new Date(month.getFullYear() + direction * years, month.getMonth(), 1));
        }
    }

    protected pickMonth(monthIndex: number): void {
        this.month.set(new Date(this.month().getFullYear(), monthIndex, 1));
        this.view.set('day');
    }

    protected pickYear(year: number): void {
        this.month.set(new Date(year, this.month().getMonth(), 1));
        this.view.set('month');
    }

    protected pick(date: Date): void {
        if (this.isDisabled(date)) {
            return;
        }
        this._focus.set(date);
        this.hover.set(null);
        if (this.mode() === 'single') {
            this.value.set(date);
            return;
        }
        const { start, end } = this._selection();
        if (!start || end || compareDays(date, start) < 0) {
            this.value.set({ start: date, end: null });
        } else {
            this.value.set({ start, end: date });
        }
    }

    protected onDayEnter(date: Date): void {
        const { start, end } = this._selection();
        if (this.mode() === 'range' && start && !end) {
            this.hover.set(date);
        }
    }

    protected onGridKeydown(event: KeyboardEvent): void {
        const current = this._focusable();
        const dayOfWeek = (current.getDay() - this._firstDay() + 7) % 7;
        const jumps: Record<string, Date> = {
            ArrowLeft: addDays(current, -1),
            ArrowRight: addDays(current, 1),
            ArrowUp: addDays(current, -7),
            ArrowDown: addDays(current, 7),
            Home: addDays(current, -dayOfWeek),
            End: addDays(current, 6 - dayOfWeek),
            PageUp: addMonths(current, event.shiftKey ? -12 : -1),
            PageDown: addMonths(current, event.shiftKey ? 12 : 1),
        };
        const next = jumps[event.key];
        if (!next) {
            return;
        }
        event.preventDefault();
        this._focus.set(next);
        this.month.set(startOfMonth(next));
        afterNextRender(
            () =>
                this._host.nativeElement
                    .querySelector<HTMLElement>('.ab-calendar-day[tabindex="0"]')
                    ?.focus(),
            { injector: this._injector },
        );
    }

    /** Moves keyboard focus onto the day that holds the tab stop. Used by the dropdown when it opens. */
    public focusDay(): void {
        this._host.nativeElement
            .querySelector<HTMLElement>('.ab-calendar-day[tabindex="0"]')
            ?.focus();
    }

    private isDisabled(date: Date): boolean {
        return isDateDisabled(date, this._min(), this._max(), this.disabledDates());
    }
}
