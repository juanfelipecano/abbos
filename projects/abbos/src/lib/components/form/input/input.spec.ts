import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CONTROL_SHAPE, CONTROL_SIZE } from '../../../config';
import { AbControlShape, AbControlSize } from '../../../constants';
import { AbInput } from './input';

const CONTROL_TOKEN_PROVIDERS = [
    { provide: CONTROL_SIZE, useValue: 'md' },
    { provide: CONTROL_SHAPE, useValue: 'round' },
];

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
            providers: CONTROL_TOKEN_PROVIDERS,
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

    it('defaults size to md and shape to round (from the injected CONTROL_SIZE/CONTROL_SHAPE tokens)', () => {
        const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
        expect(input.classList.contains('ab-input_md')).toBe(true);
        expect(input.classList.contains('ab-input_round')).toBe(true);
    });
});

describe('AbInput size/shape', () => {
    let fixture: ComponentFixture<ConfigurableTestHost>;
    let component: ConfigurableTestHost;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ConfigurableTestHost],
            providers: CONTROL_TOKEN_PROVIDERS,
        }).compileComponents();

        fixture = TestBed.createComponent(ConfigurableTestHost);
        component = fixture.componentInstance;
    });

    const sizes: AbControlSize[] = ['sm', 'md', 'lg'];
    for (const size of sizes) {
        it(`reflects size="${size}" as ab-input_${size}`, async () => {
            component.size = size;
            fixture.detectChanges();
            await fixture.whenStable();

            const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
            expect(input.classList.contains(`ab-input_${size}`)).toBe(true);
        });
    }

    const shapes: AbControlShape[] = ['square', 'round', 'circle'];
    for (const shape of shapes) {
        it(`reflects shape="${shape}" as ab-input_${shape}`, async () => {
            component.shape = shape;
            fixture.detectChanges();
            await fixture.whenStable();

            const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
            expect(input.classList.contains(`ab-input_${shape}`)).toBe(true);
        });
    }
});

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
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ReactiveFormTestHost, NgModelTestHost],
            providers: CONTROL_TOKEN_PROVIDERS,
        }).compileComponents();
    });

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
