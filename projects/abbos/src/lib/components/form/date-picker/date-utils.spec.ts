import {
    addMonths,
    firstDayOfWeek,
    formatDate,
    formatPlaceholder,
    formatRange,
    fromRange,
    parseDate,
    splitRange,
    toRange,
} from './date-utils';

const EN = 'en-US';
const feb1 = new Date(2026, 1, 1);

describe('date-utils', () => {
    describe('formatDate', () => {
        it.each([
            ['dd/MM/yyyy', '01/02/2026'],
            ['MM/dd/yyyy', '02/01/2026'],
            ['yyyy-MM-dd', '2026-02-01'],
            ['d/M/yy', '1/2/26'],
            ['d MMM yyyy', '1 Feb 2026'],
            ['d MMMM yyyy', '1 February 2026'],
        ])('formats %s', (format, expected) => {
            expect(formatDate(feb1, format, EN)).toBe(expected);
        });

        it('pads day and month with zeros by default', () => {
            expect(formatDate(new Date(2026, 9, 10), 'dd/MM/yyyy', EN)).toBe('10/10/2026');
            expect(formatDate(new Date(2026, 0, 2), 'dd/MM/yyyy', EN)).toBe('02/01/2026');
        });
    });

    describe('parseDate', () => {
        it.each(['dd/MM/yyyy', 'MM/dd/yyyy', 'yyyy-MM-dd', 'd MMM yyyy', 'd MMMM yyyy', 'd/M/yy'])(
            'round-trips %s',
            (format) => {
                const parsed = parseDate(formatDate(feb1, format, EN), format, EN);
                expect(parsed).toEqual(feb1);
            },
        );

        it('accepts single-digit day and month', () => {
            expect(parseDate('1/2/2026', 'dd/MM/yyyy', EN)).toEqual(feb1);
        });

        it.each(['31/02/2026', '32/01/2026', '00/01/2026', '01/13/2026', 'abc', '', '01/02'])(
            'rejects %j',
            (text) => {
                expect(parseDate(text, 'dd/MM/yyyy', EN)).toBeNull();
            },
        );

        it('rejects text in another format', () => {
            expect(parseDate('2026-02-01', 'dd/MM/yyyy', EN)).toBeNull();
        });

        it('accepts a leap day only in a leap year', () => {
            expect(parseDate('29/02/2028', 'dd/MM/yyyy', EN)).toEqual(new Date(2028, 1, 29));
            expect(parseDate('29/02/2027', 'dd/MM/yyyy', EN)).toBeNull();
        });
    });

    describe('toRange / fromRange', () => {
        it('reads a Date, a string in format and null for single', () => {
            expect(toRange(feb1, 'single', 'dd/MM/yyyy', EN).start).toEqual(feb1);
            expect(toRange('01/02/2026', 'single', 'dd/MM/yyyy', EN).start).toEqual(feb1);
            expect(toRange(null, 'single', 'dd/MM/yyyy', EN)).toEqual({ start: null, end: null });
            expect(toRange('nope', 'single', 'dd/MM/yyyy', EN).start).toBeNull();
        });

        it('reads a range object and a range string', () => {
            const expected = { start: feb1, end: new Date(2026, 1, 5) };
            expect(toRange({ start: feb1, end: '05/02/2026' }, 'range', 'dd/MM/yyyy', EN)).toEqual(
                expected,
            );
            expect(toRange('01/02/2026 – 05/02/2026', 'range', 'dd/MM/yyyy', EN)).toEqual(expected);
        });

        it('ignores time of day and any end in single mode', () => {
            const range = toRange(
                { start: new Date(2026, 1, 1, 15, 30), end: feb1 },
                'single',
                'dd/MM/yyyy',
                EN,
            );
            expect(range).toEqual({ start: feb1, end: null });
        });

        it('emits a Date for single and the range for range', () => {
            const range = { start: feb1, end: null };
            expect(fromRange(range, 'single')).toBe(feb1);
            expect(fromRange(range, 'range')).toBe(range);
        });
    });

    it('splits ranges on an en dash and on a spaced hyphen, keeping ISO dates whole', () => {
        expect(splitRange('01/02/2026 – 05/02/2026')).toEqual(['01/02/2026', '05/02/2026']);
        expect(splitRange('2026-02-01 - 2026-02-05')).toEqual(['2026-02-01', '2026-02-05']);
        expect(splitRange('2026-02-01')).toEqual(['2026-02-01']);
    });

    it('formats a range and a half-picked range', () => {
        expect(formatRange({ start: feb1, end: new Date(2026, 1, 5) }, 'dd/MM/yyyy', EN)).toBe(
            '01/02/2026 – 05/02/2026',
        );
        expect(formatRange({ start: feb1, end: null }, 'dd/MM/yyyy', EN)).toBe('01/02/2026');
        expect(formatRange({ start: null, end: null }, 'dd/MM/yyyy', EN)).toBe('');
    });

    it('turns a format into a placeholder', () => {
        expect(formatPlaceholder('dd/MM/yyyy')).toBe('DD/MM/YYYY');
    });

    it('clamps the day when adding months', () => {
        expect(addMonths(new Date(2026, 0, 31), 1)).toEqual(new Date(2026, 1, 28));
        expect(addMonths(new Date(2026, 2, 31), -1)).toEqual(new Date(2026, 1, 28));
    });

    it('reads the first day of the week from the locale', () => {
        expect(firstDayOfWeek('en-US')).toBe(0);
        expect(firstDayOfWeek('en-GB')).toBe(1);
    });
});
