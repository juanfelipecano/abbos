export type AbDatePickerMode = 'single' | 'range';

/** A normalised range. Both ends are `null` when nothing is selected; `end` is `null` while a range is half-picked. */
export interface AbDateRange {
    start: Date | null;
    end: Date | null;
}

/** A range as callers may pass it: dates, or strings written in the configured `format`. */
export interface AbDateRangeInput {
    start: Date | string | null;
    end?: Date | string | null;
}

/**
 * What `value` accepts. Single mode takes a `Date` or a string in `format`. Range mode takes
 * `{ start, end }`, or one string such as `01/02/2026 – 05/02/2026`. Anything emitted is normalised
 * to `Date` (single) or `AbDateRange` (range).
 */
export type AbDatePickerValue = Date | string | AbDateRangeInput | null;
