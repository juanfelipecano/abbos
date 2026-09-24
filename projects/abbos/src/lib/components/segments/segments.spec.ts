import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CONTROL_SHAPE, CONTROL_SIZE } from '../../config';
import { AbSegment, AbSegmentContent } from './segment';
import { AbSegments } from './segments';

const CONTROL_TOKEN_PROVIDERS = [
    { provide: CONTROL_SIZE, useValue: 'md' },
    { provide: CONTROL_SHAPE, useValue: 'round' },
];

@Component({
    imports: [AbSegments, AbSegment],
    template: `
        <ab-segments [(value)]="value" ariaLabel="Type">
            <ab-segment value="expense">Expense</ab-segment>
            <ab-segment value="income" [disabled]="true">Income</ab-segment>
            <ab-segment value="transfer">Transfer</ab-segment>
        </ab-segments>
    `,
})
class RadioHost {
    public readonly value = signal<string | null>('expense');
}

@Component({
    imports: [AbSegments, AbSegment, AbSegmentContent],
    template: `
        <ab-segments [(value)]="value">
            <ab-segment value="a">
                A
                <ng-template abSegmentContent><p class="panel-a">Panel A</p></ng-template>
            </ab-segment>
            <ab-segment value="b">
                B
                <ng-template abSegmentContent><p class="panel-b">Panel B</p></ng-template>
            </ab-segment>
        </ab-segments>
    `,
})
class ContentHost {
    public readonly value = signal<string | null>('a');
}

@Component({
    imports: [AbSegments, AbSegment, ReactiveFormsModule],
    template: `
        <ab-segments [formControl]="control">
            <ab-segment value="x">X</ab-segment>
            <ab-segment value="y">Y</ab-segment>
        </ab-segments>
    `,
})
class FormHost {
    public readonly control = new FormControl<string | null>('x');
}

function buttons(fixture: ComponentFixture<unknown>): HTMLButtonElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('button'));
}

describe('AbSegments', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({ providers: CONTROL_TOKEN_PROVIDERS });
    });

    it('renders one radio per segment and marks the active one', async () => {
        const fixture = TestBed.createComponent(RadioHost);
        await fixture.whenStable();
        const items = buttons(fixture);
        expect(items.map((b) => b.textContent?.trim())).toEqual(['Expense', 'Income', 'Transfer']);
        expect(items.map((b) => b.getAttribute('aria-checked'))).toEqual([
            'true',
            'false',
            'false',
        ]);
        expect(fixture.nativeElement.querySelector('[role="radiogroup"]')).not.toBeNull();
    });

    it('updates value on click and ignores disabled segments', async () => {
        const fixture = TestBed.createComponent(RadioHost);
        await fixture.whenStable();
        const items = buttons(fixture);
        items[1].click();
        await fixture.whenStable();
        expect(fixture.componentInstance.value()).toBe('expense');
        items[2].click();
        await fixture.whenStable();
        expect(fixture.componentInstance.value()).toBe('transfer');
    });

    it('moves with arrow keys, skipping disabled segments', async () => {
        const fixture = TestBed.createComponent(RadioHost);
        await fixture.whenStable();
        const track: HTMLElement = fixture.nativeElement.querySelector('.ab-segments-track');
        track.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
        await fixture.whenStable();
        expect(fixture.componentInstance.value()).toBe('transfer');
        track.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
        await fixture.whenStable();
        expect(fixture.componentInstance.value()).toBe('expense');
    });

    it('renders only the active segment content, with tab semantics', async () => {
        const fixture = TestBed.createComponent(ContentHost);
        await fixture.whenStable();
        const el: HTMLElement = fixture.nativeElement;
        expect(el.querySelector('[role="tablist"]')).not.toBeNull();
        expect(el.querySelector('.panel-a')).not.toBeNull();
        expect(el.querySelector('.panel-b')).toBeNull();
        buttons(fixture)[1].click();
        await fixture.whenStable();
        expect(el.querySelector('.panel-a')).toBeNull();
        expect(el.querySelector('.panel-b')).not.toBeNull();
    });

    it('works as a form control', async () => {
        const fixture = TestBed.createComponent(FormHost);
        await fixture.whenStable();
        expect(buttons(fixture)[0].getAttribute('aria-checked')).toBe('true');
        buttons(fixture)[1].click();
        await fixture.whenStable();
        expect(fixture.componentInstance.control.value).toBe('y');
        fixture.componentInstance.control.setValue('x');
        await fixture.whenStable();
        expect(buttons(fixture)[0].getAttribute('aria-checked')).toBe('true');
        fixture.componentInstance.control.disable();
        await fixture.whenStable();
        expect(fixture.nativeElement.querySelector('.ab-segments_disabled')).not.toBeNull();
    });
});
