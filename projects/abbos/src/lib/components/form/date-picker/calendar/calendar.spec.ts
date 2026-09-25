import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CONTROL_SHAPE } from '../../../../config';
import { AB_DATE_NOW } from '../date-picker.tokens';
import { AbDatePickerMode, AbDatePickerValue } from '../date-picker.types';
import { AbCalendar } from './calendar';

// Feb 2026 starts on a Sunday. "Today" is pinned to the 10th.
const TODAY = new Date(2026, 1, 10);

@Component({
    imports: [AbCalendar],
    template: `<ab-calendar
        [(value)]="value"
        [mode]="mode()"
        [min]="min()"
        [disabledDates]="disabledDates()"
        [weekStart]="1"
    />`,
})
class TestHost {
    public readonly value = signal<AbDatePickerValue>(null);
    public readonly mode = signal<AbDatePickerMode>('single');
    public readonly min = signal<Date | null>(null);
    public readonly disabledDates = signal<((date: Date) => boolean) | null>(null);
}

function days(fixture: ComponentFixture<unknown>): HTMLButtonElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.ab-calendar-day'));
}

function day(fixture: ComponentFixture<unknown>, dayOfMonth: number): HTMLButtonElement {
    return days(fixture)[dayOfMonth - 1];
}

interface SetupProps {
    value?: AbDatePickerValue;
    mode?: AbDatePickerMode;
    min?: Date | null;
    disabledDates?: ((date: Date) => boolean) | null;
}

async function setup(props: SetupProps = {}) {
    await TestBed.configureTestingModule({
        imports: [TestHost],
        providers: [
            { provide: CONTROL_SHAPE, useValue: 'round' },
            { provide: AB_DATE_NOW, useValue: () => TODAY },
        ],
    }).compileComponents();
    const fixture = TestBed.createComponent(TestHost);
    const host = fixture.componentInstance;
    host.value.set(props.value ?? null);
    host.mode.set(props.mode ?? 'single');
    host.min.set(props.min ?? null);
    host.disabledDates.set(props.disabledDates ?? null);
    await fixture.whenStable();
    return fixture;
}

describe('AbCalendar', () => {
    it('shows the month of today and marks today', async () => {
        const fixture = await setup();
        const host: HTMLElement = fixture.nativeElement;

        expect(host.querySelector('.ab-calendar-title')?.textContent).toContain('February 2026');
        expect(days(fixture)).toHaveLength(28);
        expect(day(fixture, 10).getAttribute('aria-current')).toBe('date');
        expect(day(fixture, 10).getAttribute('aria-label')).toContain('today');
    });

    it('starts the week on the given day', async () => {
        const fixture = await setup();
        const headers = fixture.nativeElement.querySelectorAll('[role=columnheader]');

        expect(headers[0].textContent.trim()).toBe('Mon');
        expect(headers[6].textContent.trim()).toBe('Sun');
    });

    it('shows the month of the value and accepts a string in the default format', async () => {
        const fixture = await setup({ value: '15/07/2027' });

        expect(fixture.nativeElement.querySelector('.ab-calendar-title').textContent).toContain(
            'July 2027',
        );
        expect(day(fixture, 15).classList).toContain('ab-calendar-day_edge');
    });

    it('selects a single date and writes a Date back', async () => {
        const fixture = await setup();
        day(fixture, 12).click();
        await fixture.whenStable();

        expect(fixture.componentInstance.value()).toEqual(new Date(2026, 1, 12));
        expect(day(fixture, 12).classList).toContain('ab-calendar-day_edge');
    });

    it('picks a range in two clicks and restarts on a third', async () => {
        const fixture = await setup({ mode: 'range' });
        day(fixture, 12).click();
        await fixture.whenStable();
        expect(fixture.componentInstance.value()).toEqual({
            start: new Date(2026, 1, 12),
            end: null,
        });

        day(fixture, 16).click();
        await fixture.whenStable();
        expect(fixture.componentInstance.value()).toEqual({
            start: new Date(2026, 1, 12),
            end: new Date(2026, 1, 16),
        });
        expect(day(fixture, 14).closest('[role=gridcell]')?.classList).toContain(
            'ab-calendar-cell_band-full',
        );
        expect(
            day(fixture, 16).getAttribute('aria-selected') ??
                day(fixture, 16).closest('[role=gridcell]')?.getAttribute('aria-selected'),
        ).toBe('true');

        day(fixture, 20).click();
        await fixture.whenStable();
        expect(fixture.componentInstance.value()).toEqual({
            start: new Date(2026, 1, 20),
            end: null,
        });
    });

    it('starts a new range when the second click is before the start', async () => {
        const fixture = await setup({ mode: 'range', value: { start: '12/02/2026' } });
        day(fixture, 5).click();
        await fixture.whenStable();

        expect(fixture.componentInstance.value()).toEqual({
            start: new Date(2026, 1, 5),
            end: null,
        });
    });

    it('does not select days before min or rejected by disabledDates', async () => {
        const fixture = await setup({
            min: new Date(2026, 1, 5),
            disabledDates: (date) => date.getDay() === 0,
        });

        expect(day(fixture, 3).getAttribute('aria-disabled')).toBe('true');
        expect(day(fixture, 3).getAttribute('aria-label')).toContain('unavailable');
        day(fixture, 3).click();
        day(fixture, 8).click(); // a Sunday
        await fixture.whenStable();
        expect(fixture.componentInstance.value()).toBeNull();

        day(fixture, 9).click();
        await fixture.whenStable();
        expect(fixture.componentInstance.value()).toEqual(new Date(2026, 1, 9));
    });

    it('has a single tab stop, on today when nothing is selected', async () => {
        const fixture = await setup();
        const stops = days(fixture).filter((button) => button.tabIndex === 0);

        expect(stops).toHaveLength(1);
        expect(stops[0]).toBe(day(fixture, 10));
    });

    it('moves focus with arrows, Home/End and PageUp/PageDown', async () => {
        const fixture = await setup();
        const grid: HTMLElement = fixture.nativeElement.querySelector('[role=grid]');
        const press = async (key: string, shiftKey = false) => {
            grid.dispatchEvent(new KeyboardEvent('keydown', { key, shiftKey, bubbles: true }));
            await fixture.whenStable();
        };
        const stop = () =>
            days(fixture)
                .find((button) => button.tabIndex === 0)
                ?.textContent?.trim();

        await press('ArrowRight');
        expect(stop()).toBe('11');
        await press('ArrowDown');
        expect(stop()).toBe('18');
        await press('Home'); // Monday
        expect(stop()).toBe('16');
        await press('End'); // Sunday
        expect(stop()).toBe('22');
        await press('PageDown');
        expect(fixture.nativeElement.querySelector('.ab-calendar-title').textContent).toContain(
            'March 2026',
        );
        expect(stop()).toBe('22');
        await press('PageUp', true);
        expect(fixture.nativeElement.querySelector('.ab-calendar-title').textContent).toContain(
            'March 2025',
        );
    });

    it('follows a value written from outside, even after the user has navigated', async () => {
        const fixture = await setup();
        const title = () => fixture.nativeElement.querySelector('.ab-calendar-title').textContent;
        (fixture.nativeElement.querySelectorAll('.ab-calendar-step')[1] as HTMLElement).click();
        await fixture.whenStable();
        expect(title()).toContain('March 2026');

        fixture.componentInstance.value.set('15/07/2027');
        await fixture.whenStable();
        expect(title()).toContain('July 2027');
    });

    it('keeps the month when the end of a range is picked in a later month', async () => {
        const fixture = await setup({ mode: 'range' });
        const title = () => fixture.nativeElement.querySelector('.ab-calendar-title').textContent;
        day(fixture, 20).click();
        await fixture.whenStable();
        (fixture.nativeElement.querySelectorAll('.ab-calendar-step')[1] as HTMLElement).click();
        await fixture.whenStable();
        day(fixture, 5).click();
        await fixture.whenStable();

        expect(fixture.componentInstance.value()).toEqual({
            start: new Date(2026, 1, 20),
            end: new Date(2026, 2, 5),
        });
        expect(title()).toContain('March 2026');
    });

    it('steps by month and jumps by month and year through the title', async () => {
        const fixture = await setup();
        const host: HTMLElement = fixture.nativeElement;
        const title = () => host.querySelector('.ab-calendar-title')!.textContent;
        const click = async (selector: string, index = 0) => {
            (host.querySelectorAll(selector)[index] as HTMLElement).click();
            await fixture.whenStable();
        };

        await click('.ab-calendar-step', 1);
        expect(title()).toContain('March 2026');
        await click('.ab-calendar-step', 0);
        await click('.ab-calendar-step', 0);
        expect(title()).toContain('January 2026');

        await click('.ab-calendar-title'); // months
        expect(host.querySelectorAll('.ab-calendar-option')).toHaveLength(12);
        await click('.ab-calendar-title'); // years
        expect(host.querySelectorAll('.ab-calendar-option')).toHaveLength(12);
        expect(title()).toContain('2016 – 2027');

        const year2020 = Array.from(host.querySelectorAll<HTMLElement>('.ab-calendar-option')).find(
            (option) => option.textContent?.trim() === '2020',
        )!;
        year2020.click();
        await fixture.whenStable();
        const june = Array.from(host.querySelectorAll<HTMLElement>('.ab-calendar-option')).find(
            (option) => option.textContent?.trim() === 'Jun',
        )!;
        june.click();
        await fixture.whenStable();
        expect(title()).toContain('June 2020');
        expect(host.querySelector('[role=grid]')).toBeTruthy();
    });
});
