import { AbDateRange, AbDatePickerMode, AbDatePickerValue } from './date-picker.types';

export const DEFAULT_DATE_FORMAT = 'dd/MM/yyyy';
export const RANGE_SEPARATOR = ' – ';

/** Longest first, so `MMMM` is never read as two `MM`s. */
const TOKEN = /(yyyy|yy|MMMM|MMM|MM|M|dd|d)/;
const RANGE_SPLIT = /\s+[–—-]\s+|\s*[–—]\s*/;

export function isValidDate(value: unknown): value is Date {
    return value instanceof Date && !Number.isNaN(value.getTime());
}

export function startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, amount: number): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

/** Moves by whole months and clamps the day (31 Jan + 1 month = 28/29 Feb). */
export function addMonths(date: Date, amount: number): Date {
    const target = new Date(date.getFullYear(), date.getMonth() + amount, 1);
    const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
    return new Date(target.getFullYear(), target.getMonth(), Math.min(date.getDate(), lastDay));
}

export function isSameDay(a: Date | null, b: Date | null): boolean {
    return !!a && !!b && a.getTime() === b.getTime();
}

/** Compares calendar days, ignoring the time of day. */
export function compareDays(a: Date, b: Date): number {
    return startOfDay(a).getTime() - startOfDay(b).getTime();
}

/** Whether `date` falls outside `min`/`max` or is rejected by `predicate`. */
export function isDateDisabled(
    date: Date,
    min: Date | null,
    max: Date | null,
    predicate: ((date: Date) => boolean) | null,
): boolean {
    return (
        (!!min && compareDays(date, min) < 0) ||
        (!!max && compareDays(date, max) > 0) ||
        !!predicate?.(date)
    );
}

/** First day of the week for a locale, 0 = Sunday … 6 = Saturday. Falls back to Sunday. */
export function firstDayOfWeek(locale: string): number {
    try {
        const intl = new Intl.Locale(locale) as unknown as {
            getWeekInfo?: () => { firstDay: number };
            weekInfo?: { firstDay: number };
        };
        const firstDay = (intl.getWeekInfo?.() ?? intl.weekInfo)?.firstDay;
        return firstDay === undefined ? 0 : firstDay % 7;
    } catch {
        return 0;
    }
}

export function monthNames(locale: string, style: 'long' | 'short'): string[] {
    const formatter = new Intl.DateTimeFormat(locale, { month: style });
    return Array.from({ length: 12 }, (_, month) => formatter.format(new Date(2000, month, 1)));
}

/** The format as a hint for empty fields: `dd/MM/yyyy` becomes `DD/MM/YYYY`. */
export function formatPlaceholder(format: string): string {
    return format.toUpperCase();
}

/**
 * Formats with `dd d MM M MMM MMMM yy yyyy`. Any other character is copied as is.
 */
export function formatDate(date: Date, format: string, locale: string): string {
    const month = date.getMonth();
    const pad = (n: number) => String(n).padStart(2, '0');
    const values: Record<string, () => string> = {
        yyyy: () => String(date.getFullYear()),
        yy: () => pad(date.getFullYear() % 100),
        MMMM: () => monthNames(locale, 'long')[month],
        MMM: () => monthNames(locale, 'short')[month],
        MM: () => pad(month + 1),
        M: () => String(month + 1),
        dd: () => pad(date.getDate()),
        d: () => String(date.getDate()),
    };
    return format
        .split(TOKEN)
        .map((part) => values[part]?.() ?? part)
        .join('');
}

/**
 * Reads text written in `format`. Returns `null` for anything that is not a real calendar day, so
 * `31/02/2026` fails instead of rolling over into March.
 */
export function parseDate(text: string, format: string, locale: string): Date | null {
    const order: string[] = [];
    const pattern = format
        .split(TOKEN)
        .map((part) => {
            if (!TOKEN.test(part)) {
                return part.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
            }
            order.push(part);
            if (part === 'yyyy') return '(\\d{4})';
            if (part === 'yy') return '(\\d{2})';
            if (part === 'MMM' || part === 'MMMM') return '(\\p{L}+\\.?)';
            return '(\\d{1,2})';
        })
        .join('');
    const match = new RegExp(`^${pattern}$`, 'u').exec(text.trim());
    if (!match) {
        return null;
    }

    let year = NaN;
    let month = NaN;
    let day = NaN;
    order.forEach((token, index) => {
        const raw = match[index + 1];
        if (token === 'yyyy') year = Number(raw);
        else if (token === 'yy') year = 2000 + Number(raw);
        else if (token === 'MMM' || token === 'MMMM') month = monthIndex(raw, locale);
        else if (token === 'MM' || token === 'M') month = Number(raw) - 1;
        else day = Number(raw);
    });
    if ([year, month, day].some(Number.isNaN) || year < 1 || month < 0 || month > 11 || day < 1) {
        return null;
    }
    const date = new Date(year, month, day);
    date.setFullYear(year);
    return date.getMonth() === month && date.getDate() === day ? date : null;
}

function monthIndex(name: string, locale: string): number {
    const wanted = name.replace(/\.$/, '').toLocaleLowerCase(locale);
    const matches = (names: string[]) =>
        names.findIndex((n) => n.replace(/\.$/, '').toLocaleLowerCase(locale) === wanted);
    const long = matches(monthNames(locale, 'long'));
    return long >= 0 ? long : matches(monthNames(locale, 'short'));
}

export function splitRange(text: string): string[] {
    return text.trim().split(RANGE_SPLIT);
}

export function formatRange(range: AbDateRange, format: string, locale: string): string {
    if (!range.start) {
        return '';
    }
    const start = formatDate(range.start, format, locale);
    return range.end ? `${start}${RANGE_SEPARATOR}${formatDate(range.end, format, locale)}` : start;
}

/** A single day from a `Date` or a string in `format`; `null` when it is neither or not a real day. */
export function toDate(
    value: Date | string | null | undefined,
    format: string,
    locale: string,
): Date | null {
    if (typeof value === 'string') {
        return parseDate(value, format, locale);
    }
    return isValidDate(value) ? startOfDay(value) : null;
}

/** Turns any accepted `value` into a range; single mode only ever uses `start`. */
export function toRange(
    value: AbDatePickerValue | undefined,
    mode: AbDatePickerMode,
    format: string,
    locale: string,
): AbDateRange {
    if (value === null || value === undefined) {
        return { start: null, end: null };
    }
    if (typeof value === 'string' && mode === 'range') {
        const [start, end] = splitRange(value);
        return { start: toDate(start, format, locale), end: toDate(end, format, locale) };
    }
    if (typeof value === 'string' || value instanceof Date) {
        return { start: toDate(value, format, locale), end: null };
    }
    return {
        start: toDate(value.start, format, locale),
        end: mode === 'range' ? toDate(value.end, format, locale) : null,
    };
}

/** The value in the shape the component emits: a `Date` for single, an `AbDateRange` for range. */
export function fromRange(range: AbDateRange, mode: AbDatePickerMode): Date | AbDateRange | null {
    if (mode === 'range') {
        return range;
    }
    return range.start;
}
