import { Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CONTROL_SHAPE, CONTROL_SIZE } from '../../../config';
import { AbChip } from '../../chip/chip';
import { AbDatePicker } from './date-picker';
import { AbDatePickerTrigger } from './date-picker-trigger';
import { AB_DATE_NOW } from './date-picker.tokens';
import { AbDatePickerMode, AbDatePickerValue } from './date-picker.types';

const TODAY = new Date(2026, 1, 10);

@Component({
    imports: [AbDatePicker, AbDatePickerTrigger],
    template: `
        <button type="button" id="trigger" [abDatePickerTrigger]="picker">Pick a date</button>
        <ab-date-picker
            #picker
            [(value)]="value"
            [mode]="mode()"
            [format]="format()"
            [min]="min()"
            [weekStart]="1"
        />
    `,
})
class ButtonHost {
    public readonly picker = viewChild.required<AbDatePicker>('picker');
    public readonly value = signal<AbDatePickerValue>(null);
    public readonly mode = signal<AbDatePickerMode>('single');
    public readonly format = signal('dd/MM/yyyy');
    public readonly min = signal<Date | null>(null);
}

@Component({
    imports: [AbDatePicker, AbDatePickerTrigger],
    template: `
        <input id="field" [abDatePickerTrigger]="picker" />
        <ab-date-picker #picker [(value)]="value" [mode]="mode()" />
    `,
})
class InputHost {
    public readonly picker = viewChild.required<AbDatePicker>('picker');
    public readonly value = signal<AbDatePickerValue>(null);
    public readonly mode = signal<AbDatePickerMode>('single');
}

@Component({
    selector: 'app-date-field',
    template: `<span>Date</span> <button type="button" id="inner">Open</button>`,
    hostDirectives: [{ directive: AbDatePickerTrigger, inputs: ['abDatePickerTrigger'] }],
})
class DateField {}

@Component({
    imports: [AbDatePicker, AbDatePickerTrigger, DateField],
    template: `
        <div id="plain" [abDatePickerTrigger]="picker">Pick</div>
        <div id="own" role="link" tabindex="-1" [abDatePickerTrigger]="picker">Pick</div>
        <app-date-field id="field" [abDatePickerTrigger]="picker" />
        <span id="free">Anywhere</span>
        <ab-date-picker #picker [(value)]="value" />
    `,
})
class AnyHost {
    public readonly picker = viewChild.required<AbDatePicker>('picker');
    public readonly value = signal<AbDatePickerValue>(null);
}

@Component({
    imports: [AbChip, AbDatePicker, AbDatePickerTrigger],
    template: `
        <ab-chip id="chip" [abDatePickerTrigger]="picker">Any date</ab-chip>
        <ab-date-picker #picker />
    `,
})
class ChipHost {}

@Component({
    imports: [AbDatePicker, ReactiveFormsModule],
    template: `<ab-date-picker [formControl]="control" />`,
})
class FormHost {
    public control = new FormControl<unknown>(null);
}

const PROVIDERS = [
    { provide: CONTROL_SIZE, useValue: 'md' },
    { provide: CONTROL_SHAPE, useValue: 'round' },
    { provide: AB_DATE_NOW, useValue: () => TODAY },
];

const panel = () => document.querySelector<HTMLElement>('.ab-date-picker-panel');
const days = () => Array.from(document.querySelectorAll<HTMLButtonElement>('.ab-calendar-day'));
const buttonNamed = (name: string) =>
    Array.from(document.querySelectorAll<HTMLButtonElement>('.ab-date-picker-panel button')).find(
        (button) => button.textContent?.trim() === name,
    )!;

async function create<T>(type: new () => T): Promise<ComponentFixture<T>> {
    await TestBed.configureTestingModule({
        imports: [type as never],
        providers: PROVIDERS,
    }).compileComponents();
    const fixture = TestBed.createComponent(type);
    await fixture.whenStable();
    return fixture;
}

describe('AbDatePicker with a button trigger', () => {
    let fixture: ComponentFixture<ButtonHost>;
    let trigger: HTMLButtonElement;

    beforeEach(async () => {
        fixture = await create(ButtonHost);
        trigger = fixture.nativeElement.querySelector('#trigger');
    });

    afterEach(() => fixture.destroy());

    it('is closed by default and exposes the popup on the trigger', () => {
        expect(panel()).toBeNull();
        expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
        expect(trigger.getAttribute('aria-expanded')).toBe('false');
    });

    it('opens on click, links the trigger to the dialog and closes on a second click', async () => {
        trigger.click();
        await fixture.whenStable();

        expect(panel()).toBeTruthy();
        expect(panel()?.getAttribute('role')).toBe('dialog');
        expect(trigger.getAttribute('aria-expanded')).toBe('true');
        expect(trigger.getAttribute('aria-controls')).toBe(panel()?.id);

        trigger.click();
        await fixture.whenStable();
        expect(panel()).toBeNull();
        expect(trigger.getAttribute('aria-expanded')).toBe('false');
    });

    it('opens on ArrowDown', async () => {
        trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
        await fixture.whenStable();

        expect(panel()).toBeTruthy();
    });

    it('commits a single date on click and closes', async () => {
        trigger.click();
        await fixture.whenStable();
        days()[11].click(); // 12 Feb
        await fixture.whenStable();

        expect(fixture.componentInstance.value()).toEqual(new Date(2026, 1, 12));
        expect(panel()).toBeNull();
        expect(fixture.componentInstance.picker().displayText()).toBe('12/02/2026');
    });

    it('closes on Escape and returns focus to the trigger', async () => {
        trigger.focus();
        trigger.click();
        await fixture.whenStable();
        days()[0].focus();

        document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        await fixture.whenStable();

        expect(panel()).toBeNull();
        expect(document.activeElement).toBe(trigger);
    });

    it('does not open when disabled', async () => {
        fixture.componentInstance.picker().setDisabledState(true);
        trigger.click();
        await fixture.whenStable();

        expect(panel()).toBeNull();
    });

    it('accepts a value in a custom format and shows it in that format', async () => {
        fixture.componentInstance.format.set('yyyy-MM-dd');
        fixture.componentInstance.value.set('2026-03-04');
        await fixture.whenStable();

        const picker = fixture.componentInstance.picker();
        expect(picker.selection().start).toEqual(new Date(2026, 2, 4));
        expect(picker.displayText()).toBe('2026-03-04');
        expect(picker.placeholder()).toBe('YYYY-MM-DD');
    });

    it('defaults to day / month / year', () => {
        expect(fixture.componentInstance.picker().placeholder()).toBe('DD/MM/YYYY');
    });

    describe('range', () => {
        beforeEach(async () => {
            fixture.componentInstance.mode.set('range');
            await fixture.whenStable();
            trigger.click();
            await fixture.whenStable();
        });

        it('keeps a draft until Apply, and Apply is disabled while half-picked', async () => {
            days()[11].click();
            await fixture.whenStable();

            expect(fixture.componentInstance.value()).toBeNull();
            expect(buttonNamed('Apply').getAttribute('aria-disabled')).toBe('true');

            days()[15].click();
            await fixture.whenStable();
            expect(buttonNamed('Apply').getAttribute('aria-disabled')).toBeNull();

            buttonNamed('Apply').click();
            await fixture.whenStable();

            expect(fixture.componentInstance.value()).toEqual({
                start: new Date(2026, 1, 12),
                end: new Date(2026, 1, 16),
            });
            expect(panel()).toBeNull();
            expect(fixture.componentInstance.picker().displayText()).toBe(
                '12/02/2026 – 16/02/2026',
            );
        });

        it('discards the draft on Cancel', async () => {
            days()[11].click();
            days()[15].click();
            await fixture.whenStable();
            buttonNamed('Cancel').click();
            await fixture.whenStable();

            expect(fixture.componentInstance.value()).toBeNull();
            expect(panel()).toBeNull();
        });
    });
});

describe('AbDatePicker placement', () => {
    let fixture: ComponentFixture<ButtonHost>;

    beforeEach(async () => {
        fixture = await create(ButtonHost);
    });

    afterEach(() => {
        vi.restoreAllMocks();
        fixture.destroy();
    });

    function layout(triggerTop: number) {
        const real = HTMLElement.prototype.getBoundingClientRect;
        vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
            this: HTMLElement,
        ) {
            const rect = (top: number, width: number, height: number) =>
                ({
                    top,
                    left: 100,
                    width,
                    height,
                    bottom: top + height,
                    right: 100 + width,
                    x: 100,
                    y: top,
                    toJSON() {},
                }) as DOMRect;
            if (this.classList.contains('cdk-overlay-pane')) return rect(0, 314, 390);
            if (this.id === 'trigger') return rect(triggerTop, 120, 40);
            return real.call(this);
        });
        // jsdom has no layout: give the overlay a 1024 x 768 viewport to measure against.
        vi.spyOn(document.documentElement, 'clientWidth', 'get').mockReturnValue(1024);
        vi.spyOn(document.documentElement, 'clientHeight', 'get').mockReturnValue(768);
    }

    async function openAt(triggerTop: number) {
        layout(triggerTop);
        fixture.nativeElement.querySelector('#trigger').click();
        await fixture.whenStable();
        return fixture.componentInstance.picker().placement();
    }

    it('opens below when there is room', async () => {
        expect(await openAt(100)).toBe('below');
    });

    it('opens above when the trigger is at the bottom of the viewport', async () => {
        expect(await openAt(700)).toBe('above');
    });
});

describe('AbDatePicker with an input trigger', () => {
    let fixture: ComponentFixture<InputHost>;
    let input: HTMLInputElement;

    beforeEach(async () => {
        fixture = await create(InputHost);
        input = fixture.nativeElement.querySelector('#field');
    });

    afterEach(() => fixture.destroy());

    const type = async (text: string) => {
        input.value = text;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        await fixture.whenStable();
    };

    it('shows the format as placeholder unless the input has its own', () => {
        expect(input.getAttribute('placeholder')).toBe('DD/MM/YYYY');
    });

    it('opens on click and keeps focus in the input, so typing is not interrupted', async () => {
        input.focus();
        input.click();
        await fixture.whenStable();

        expect(panel()).toBeTruthy();
        expect(document.activeElement).toBe(input);

        input.click();
        await fixture.whenStable();
        expect(panel()).toBeTruthy();
    });

    it('opens on ArrowDown and moves focus to a day', async () => {
        input.focus();
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
        await fixture.whenStable();

        expect(panel()).toBeTruthy();
        expect(document.activeElement).toBe(days().find((day) => day.tabIndex === 0));
    });

    it('moves the calendar as a valid date is typed, and flags nothing for partial text', async () => {
        input.click();
        await fixture.whenStable();

        input.value = '15/07/20';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        await fixture.whenStable();
        expect(input.getAttribute('aria-invalid')).toBeNull();
        expect(fixture.componentInstance.value()).toBeNull();

        input.value = '15/07/2027';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        await fixture.whenStable();
        expect(panel()).toBeTruthy();
        expect(fixture.componentInstance.value()).toEqual(new Date(2027, 6, 15));
        expect(document.querySelector('.ab-calendar-title')?.textContent).toContain('July 2027');
        expect(input.value).toBe('15/07/2027');
    });

    it('closes on Enter when the text is valid and stays open when it is not', async () => {
        input.click();
        await fixture.whenStable();
        input.value = '31/02/2026';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        await fixture.whenStable();
        expect(panel()).toBeTruthy();
        expect(input.getAttribute('aria-invalid')).toBe('true');

        input.value = '28/02/2026';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        await fixture.whenStable();
        expect(panel()).toBeNull();
    });

    it('closes on Tab', async () => {
        input.click();
        await fixture.whenStable();
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
        await fixture.whenStable();

        expect(panel()).toBeNull();
    });

    it('acts like a button when read-only: click toggles and moves focus into the calendar', async () => {
        input.readOnly = true;
        input.click();
        await fixture.whenStable();
        expect(panel()).toBeTruthy();
        expect(document.activeElement).not.toBe(input);

        input.click();
        await fixture.whenStable();
        expect(panel()).toBeNull();
    });

    it('parses typed text on Enter and rewrites it in the format', async () => {
        await type('1/3/2026');

        expect(fixture.componentInstance.value()).toEqual(new Date(2026, 2, 1));
        expect(input.value).toBe('01/03/2026');
        expect(input.getAttribute('aria-invalid')).toBeNull();
    });

    it('flags text that is not a date and keeps it for correction', async () => {
        await type('31/02/2026');

        expect(fixture.componentInstance.value()).toBeNull();
        expect(input.value).toBe('31/02/2026');
        expect(input.getAttribute('aria-invalid')).toBe('true');

        await type('28/02/2026');
        expect(input.getAttribute('aria-invalid')).toBeNull();
        expect(fixture.componentInstance.value()).toEqual(new Date(2026, 1, 28));
    });

    it('clears the value when the text is emptied', async () => {
        await type('01/03/2026');
        await type('');

        expect(fixture.componentInstance.value()).toBeNull();
    });

    it('updates the text when the value changes from outside', async () => {
        fixture.componentInstance.value.set(new Date(2026, 4, 9));
        await fixture.whenStable();

        expect(input.value).toBe('09/05/2026');
    });

    it('requires both dates in range mode', async () => {
        fixture.componentInstance.mode.set('range');
        await fixture.whenStable();

        await type('01/03/2026');
        expect(input.getAttribute('aria-invalid')).toBe('true');

        await type('01/03/2026 – 05/03/2026');
        expect(input.getAttribute('aria-invalid')).toBeNull();
        expect(fixture.componentInstance.value()).toEqual({
            start: new Date(2026, 2, 1),
            end: new Date(2026, 2, 5),
        });
        expect(input.getAttribute('placeholder')).toBe('DD/MM/YYYY – DD/MM/YYYY');
    });
});

describe('AbDatePicker with any element or component as the trigger', () => {
    let fixture: ComponentFixture<AnyHost>;
    const el = (id: string) => fixture.nativeElement.querySelector(`#${id}`) as HTMLElement;

    beforeEach(async () => {
        fixture = await create(AnyHost);
    });

    afterEach(() => fixture.destroy());

    it('makes a plain element operable, without replacing its own role or tabindex', () => {
        expect(el('plain').getAttribute('role')).toBe('button');
        expect(el('plain').getAttribute('tabindex')).toBe('0');
        expect(el('own').getAttribute('role')).toBe('link');
        expect(el('own').getAttribute('tabindex')).toBe('-1');
    });

    it('opens a plain element on click, Enter and Space, but not twice', async () => {
        el('plain').click();
        await fixture.whenStable();
        expect(panel()).toBeTruthy();
        expect(el('plain').getAttribute('aria-expanded')).toBe('true');

        el('plain').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        await fixture.whenStable();
        expect(panel()).toBeNull();

        el('plain').dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
        await fixture.whenStable();
        expect(panel()).toBeTruthy();
    });

    it('marks a plain trigger aria-disabled when the picker is disabled', async () => {
        fixture.componentInstance.picker().setDisabledState(true);
        await fixture.whenStable();

        expect(el('plain').getAttribute('aria-disabled')).toBe('true');
        el('plain').click();
        await fixture.whenStable();
        expect(panel()).toBeNull();
    });

    it('works on a component host and returns focus to its inner button', async () => {
        expect(el('field').hasAttribute('tabindex')).toBe(false);

        el('field').click();
        await fixture.whenStable();
        expect(panel()).toBeTruthy();

        days()[0].focus();
        document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        await fixture.whenStable();

        expect(panel()).toBeNull();
        expect(document.activeElement).toBe(el('inner'));
    });

    it('toggles once when the inner button of a component host is activated', async () => {
        el('inner').click();
        await fixture.whenStable();
        expect(panel()).toBeTruthy();

        el('inner').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        await fixture.whenStable();
        expect(panel()).toBeTruthy();
    });

    it('opens against any element with openAt, with no trigger directive', async () => {
        fixture.componentInstance.picker().openAt(el('free'));
        await fixture.whenStable();

        expect(panel()).toBeTruthy();
    });
});

describe('AbDatePicker with a library component as the trigger', () => {
    it('makes an ab-chip operable and opens from it', async () => {
        const fixture = await create(ChipHost);
        const chip: HTMLElement = fixture.nativeElement.querySelector('#chip');

        expect(chip.getAttribute('role')).toBe('button');
        expect(chip.getAttribute('tabindex')).toBe('0');
        chip.click();
        await fixture.whenStable();
        expect(panel()).toBeTruthy();
        fixture.destroy();
    });
});

describe('AbDatePicker as a form control', () => {
    it('writes a value in and reports typed changes out', async () => {
        const fixture = await create(FormHost);
        const picker = fixture.debugElement.children[0].componentInstance as AbDatePicker;

        fixture.componentInstance.control.setValue('05/03/2026');
        await fixture.whenStable();
        expect(picker.selection().start).toEqual(new Date(2026, 2, 5));

        picker.commitText('06/03/2026');
        expect(fixture.componentInstance.control.value).toEqual(new Date(2026, 2, 6));

        fixture.componentInstance.control.disable();
        expect(picker.isDisabled()).toBe(true);
    });
});
