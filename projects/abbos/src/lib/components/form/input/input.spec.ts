import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AbControlShape, AbControlSize } from '../../../constants';
import { AbInput } from './input';

@Component({
    imports: [AbInput],
    template: `<input ab-input />`,
})
class TestHost {}

@Component({
    imports: [AbInput],
    template: `<input ab-input [size]="size" [shape]="shape" />`,
})
class ConfigurableTestHost {
    public size: AbControlSize = 'md';
    public shape: AbControlShape = 'round';
}

describe('AbInput', () => {
    let fixture: ComponentFixture<TestHost>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TestHost],
        }).compileComponents();

        fixture = TestBed.createComponent(TestHost);
        await fixture.whenStable();
    });

    it('renders as a plain native input with no label, wrapper, or projected content', () => {
        const host: HTMLElement = fixture.nativeElement;
        const input = host.querySelector('input[ab-input]');

        expect(input).toBeTruthy();
        expect(host.querySelectorAll('input').length).toBe(1);
        expect(host.querySelector('label')).toBeNull();
        expect(input?.children.length).toBe(0);
    });

    it('defaults size to md and shape to round', () => {
        const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
        expect(input.getAttribute('data-size')).toBe('md');
        expect(input.getAttribute('data-shape')).toBe('round');
    });
});

describe('AbInput size/shape', () => {
    let fixture: ComponentFixture<ConfigurableTestHost>;
    let component: ConfigurableTestHost;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ConfigurableTestHost],
        }).compileComponents();

        fixture = TestBed.createComponent(ConfigurableTestHost);
        component = fixture.componentInstance;
    });

    const sizes: AbControlSize[] = ['sm', 'md', 'lg'];
    for (const size of sizes) {
        it(`reflects size="${size}" as data-size`, async () => {
            component.size = size;
            fixture.detectChanges();
            await fixture.whenStable();

            const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
            expect(input.getAttribute('data-size')).toBe(size);
        });
    }

    const shapes: AbControlShape[] = ['square', 'round', 'circle'];
    for (const shape of shapes) {
        it(`reflects shape="${shape}" as data-shape`, async () => {
            component.shape = shape;
            fixture.detectChanges();
            await fixture.whenStable();

            const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
            expect(input.getAttribute('data-shape')).toBe(shape);
        });
    }
});

// Forms integration (AC-F6, AC-F7). AbInput implements no ControlValueAccessor —
// these tests exist to prove Angular's own DefaultValueAccessor already does the
// job on a plain `input[ab-input]`, per ADR-0001.
@Component({
    imports: [AbInput, ReactiveFormsModule],
    template: `<input ab-input [formControl]="control" />`,
})
class ReactiveFormTestHost {
    public control = new FormControl('');
}

@Component({
    imports: [AbInput, FormsModule],
    template: `<input ab-input [(ngModel)]="value" />`,
})
class NgModelTestHost {
    public value = '';
}

describe('AbInput forms integration', () => {
    it('writes the FormControl value to the native input (formControl)', async () => {
        const fixture = TestBed.createComponent(ReactiveFormTestHost);
        fixture.componentInstance.control.setValue('hello');
        fixture.detectChanges();
        await fixture.whenStable();

        const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
        expect(input.value).toBe('hello');
    });

    it('reads native input changes back into the FormControl (formControl)', async () => {
        const fixture = TestBed.createComponent(ReactiveFormTestHost);
        fixture.detectChanges();
        await fixture.whenStable();

        const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
        input.value = 'typed';
        input.dispatchEvent(new Event('input'));

        expect(fixture.componentInstance.control.value).toBe('typed');
    });

    it('renders the native disabled attribute when the FormControl is disabled', async () => {
        const fixture = TestBed.createComponent(ReactiveFormTestHost);
        fixture.componentInstance.control.disable();
        fixture.detectChanges();
        await fixture.whenStable();

        const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
        expect(input.disabled).toBe(true);
    });

    it('round-trips value via [(ngModel)]', async () => {
        const fixture = TestBed.createComponent(NgModelTestHost);
        fixture.componentInstance.value = 'seed';
        fixture.detectChanges();
        await fixture.whenStable();

        const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
        expect(input.value).toBe('seed');

        input.value = 'changed';
        input.dispatchEvent(new Event('input'));
        await fixture.whenStable();

        expect(fixture.componentInstance.value).toBe('changed');
    });
});
