import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CONTROL_SHAPE, CONTROL_SIZE } from '../../../config';
import { AbControlShape, AbControlSize } from '../../../constants';
import { AbSwitch } from './switch';

// AbSwitch injects CONTROL_SIZE/CONTROL_SHAPE with no default provider of its own — every
// TestBed module that constructs it must supply one, the same way `provideAbbos()` does at
// application bootstrap (same pattern `button.spec.ts` uses).
const CONTROL_TOKEN_PROVIDERS = [
    { provide: CONTROL_SIZE, useValue: 'md' },
    { provide: CONTROL_SHAPE, useValue: 'round' },
];

@Component({
    imports: [AbSwitch],
    template: `<ab-switch [(checked)]="on" [disabled]="disabled">Email notifications</ab-switch>`,
})
class TestHost {
    public on = false;
    public disabled = false;
}

@Component({
    imports: [AbSwitch],
    template: `<ab-switch ariaLabel="Toggle dark mode"></ab-switch>`,
})
class AriaLabelTestHost {}

@Component({
    imports: [AbSwitch, ReactiveFormsModule],
    template: `<ab-switch [formControl]="control">Marketing emails</ab-switch>`,
})
class ReactiveFormsTestHost {
    public control = new FormControl(false, { nonNullable: true });
}

function getButton(fixture: ComponentFixture<unknown>): HTMLButtonElement {
    return fixture.nativeElement.querySelector('button[role="switch"]');
}

describe('AbSwitch', () => {
    let fixture: ComponentFixture<TestHost>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TestHost],
            providers: CONTROL_TOKEN_PROVIDERS,
        }).compileComponents();

        fixture = TestBed.createComponent(TestHost);
        await fixture.whenStable();
    });

    it('renders a label wrapping a button[role=switch] with a knob, label text visible', () => {
        const host: HTMLElement = fixture.nativeElement;
        const label = host.querySelector('label');
        const button = getButton(fixture);

        expect(label).toBeTruthy();
        expect(button).toBeTruthy();
        expect(button.getAttribute('type')).toBe('button');
        expect(button.querySelector('.ab-switch-knob')).toBeTruthy();
        expect(host.textContent).toContain('Email notifications');
    });

    // AC-F1, AC-U1
    it('defaults to unchecked, reflected via aria-checked', () => {
        const button = getButton(fixture);
        expect(button.getAttribute('aria-checked')).toBe('false');
    });

    // AC-F2, AC-F3, AC-U1
    it('toggles checked on click and updates the two-way [(checked)] binding', async () => {
        const button = getButton(fixture);

        button.click();
        await fixture.whenStable();

        expect(button.getAttribute('aria-checked')).toBe('true');
        expect(fixture.componentInstance.on).toBe(true);
    });
});

// AC-F6, AC-F7, AC-F8, AC-U5
//
// Constructs AbSwitch directly (TestBed.createComponent(AbSwitch), no host wrapper) and
// drives its inputs via fixture.componentRef.setInput() rather than rebinding a plain field
// on a wrapper host template. A wrapper-host + plain-field-mutation version of these tests
// was tried first and reproduced the exact flake `button.spec.ts` documents: a plain
// (non-signal) host field mutated and re-bound via `[disabled]="disabled"`/`[size]="size"`
// after the fixture's first `detectChanges()` did not reach AbSwitch's signal inputs on the
// *second* `detectChanges()` call, while `setInput()` worked every time — same root cause
// (Angular OnPush-host + signal-input interaction in this TestBed setup), not a defect in
// AbSwitch. See `button.spec.ts`'s identical comment and `BACKLOG.md`.
describe('AbSwitch size/shape/disabled (direct construction)', () => {
    let fixture: ComponentFixture<AbSwitch>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AbSwitch],
            providers: CONTROL_TOKEN_PROVIDERS,
        }).compileComponents();

        fixture = TestBed.createComponent(AbSwitch);
        fixture.detectChanges();
        await fixture.whenStable();
    });

    it('defaults size to md and shape to round (from the injected CONTROL_SIZE/CONTROL_SHAPE tokens)', () => {
        const el: HTMLElement = fixture.nativeElement;
        expect(el.classList.contains('ab-switch_md')).toBe(true);
        expect(el.classList.contains('ab-switch_round')).toBe(true);
    });

    const sizes: AbControlSize[] = ['sm', 'md', 'lg'];
    for (const size of sizes) {
        it(`reflects size="${size}" as ab-switch_${size}`, async () => {
            fixture.componentRef.setInput('size', size);
            fixture.detectChanges();
            await fixture.whenStable();

            expect(fixture.nativeElement.classList.contains(`ab-switch_${size}`)).toBe(true);
        });
    }

    const shapes: AbControlShape[] = ['square', 'round', 'circle'];
    for (const shape of shapes) {
        it(`reflects shape="${shape}" as ab-switch_${shape}`, async () => {
            fixture.componentRef.setInput('shape', shape);
            fixture.detectChanges();
            await fixture.whenStable();

            expect(fixture.nativeElement.classList.contains(`ab-switch_${shape}`)).toBe(true);
        });
    }

    it('ignores clicks and reflects the disabled attribute while disabled', async () => {
        fixture.componentRef.setInput('disabled', true);
        fixture.detectChanges();
        await fixture.whenStable();

        const button = getButton(fixture);
        expect(button.disabled).toBe(true);
        expect(fixture.nativeElement.classList.contains('ab-switch_disabled')).toBe(true);

        button.click();
        await fixture.whenStable();
        expect(fixture.componentInstance.checked()).toBe(false);
        expect(button.getAttribute('aria-checked')).toBe('false');
    });
});

// AC-U3
describe('AbSwitch ariaLabel', () => {
    it('applies ariaLabel to the inner button, not the host', async () => {
        await TestBed.configureTestingModule({
            imports: [AriaLabelTestHost],
            providers: CONTROL_TOKEN_PROVIDERS,
        }).compileComponents();

        const fixture = TestBed.createComponent(AriaLabelTestHost);
        fixture.detectChanges();
        await fixture.whenStable();

        const button = getButton(fixture);
        const hostEl: HTMLElement = fixture.nativeElement.querySelector('ab-switch');

        expect(button.getAttribute('aria-label')).toBe('Toggle dark mode');
        expect(hostEl.getAttribute('aria-label')).toBeNull();
    });

    it('renders no aria-label attribute when not set', async () => {
        await TestBed.configureTestingModule({
            imports: [TestHost],
            providers: CONTROL_TOKEN_PROVIDERS,
        }).compileComponents();

        const fixture = TestBed.createComponent(TestHost);
        fixture.detectChanges();
        await fixture.whenStable();

        expect(getButton(fixture).getAttribute('aria-label')).toBeNull();
    });
});

// AC-F4, AC-F5
describe('AbSwitch ControlValueAccessor / Reactive Forms', () => {
    let fixture: ComponentFixture<ReactiveFormsTestHost>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ReactiveFormsTestHost],
            providers: CONTROL_TOKEN_PROVIDERS,
        }).compileComponents();

        fixture = TestBed.createComponent(ReactiveFormsTestHost);
        fixture.detectChanges();
        await fixture.whenStable();
    });

    it('writes the FormControl value to the switch on init', () => {
        expect(getButton(fixture).getAttribute('aria-checked')).toBe('false');
    });

    it('propagates a click to the bound FormControl value', async () => {
        getButton(fixture).click();
        await fixture.whenStable();

        expect(fixture.componentInstance.control.value).toBe(true);
    });

    it('reflects an external FormControl value change onto the switch (writeValue)', async () => {
        fixture.componentInstance.control.setValue(true);
        fixture.detectChanges();
        await fixture.whenStable();

        expect(getButton(fixture).getAttribute('aria-checked')).toBe('true');
    });

    it('disables the switch when the FormControl is disabled (setDisabledState)', async () => {
        fixture.componentInstance.control.disable();
        fixture.detectChanges();
        await fixture.whenStable();

        expect(getButton(fixture).disabled).toBe(true);
    });
});
