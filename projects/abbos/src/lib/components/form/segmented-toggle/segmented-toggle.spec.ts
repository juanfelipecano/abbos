import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CONTROL_SHAPE, CONTROL_SIZE } from '../../../config';
import { AbControlShape, AbControlSize } from '../../../constants';
import { AbSegmentedToggle } from './segmented-toggle';

const CONTROL_TOKEN_PROVIDERS = [
    { provide: CONTROL_SIZE, useValue: 'md' },
    { provide: CONTROL_SHAPE, useValue: 'round' },
];

@Component({
    imports: [AbSegmentedToggle],
    template: `<ab-segmented-toggle
        startLabel="0"
        endLabel="2"
        ariaLabel="Count"
        [(checked)]="on"
    />`,
})
class TestHost {
    public on = false;
}

@Component({
    imports: [AbSegmentedToggle, ReactiveFormsModule],
    template: `<ab-segmented-toggle startLabel="0" endLabel="2" [formControl]="control" />`,
})
class FormsTestHost {
    public control = new FormControl(false, { nonNullable: true });
}

function getSegments(fixture: ComponentFixture<unknown>): HTMLButtonElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('button[role="radio"]'));
}

describe('AbSegmentedToggle', () => {
    let fixture: ComponentFixture<TestHost>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TestHost],
            providers: CONTROL_TOKEN_PROVIDERS,
        }).compileComponents();
        fixture = TestBed.createComponent(TestHost);
        await fixture.whenStable();
    });

    it('renders a labelled radiogroup with the two segment labels', () => {
        const group: HTMLElement = fixture.nativeElement.querySelector('[role="radiogroup"]');
        expect(group.getAttribute('aria-label')).toBe('Count');
        expect(getSegments(fixture).map((b) => b.textContent?.trim())).toEqual(['0', '2']);
    });

    it('defaults to the start segment active with a roving tabindex', () => {
        const [start, end] = getSegments(fixture);
        expect(start.getAttribute('aria-checked')).toBe('true');
        expect(end.getAttribute('aria-checked')).toBe('false');
        expect(start.tabIndex).toBe(0);
        expect(end.tabIndex).toBe(-1);
    });

    it('selects the end segment on click and updates [(checked)]', async () => {
        getSegments(fixture)[1].click();
        await fixture.whenStable();
        expect(getSegments(fixture)[1].getAttribute('aria-checked')).toBe('true');
        expect(fixture.componentInstance.on).toBe(true);
    });

    it('moves between segments with arrow keys and Home/End', async () => {
        const [start, end] = getSegments(fixture);
        start.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
        await fixture.whenStable();
        expect(fixture.componentInstance.on).toBe(true);

        end.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
        await fixture.whenStable();
        expect(fixture.componentInstance.on).toBe(false);
    });
});

function pointer(el: HTMLElement, type: string, clientX: number, timeStamp?: number): void {
    const event = new PointerEvent(type, {
        bubbles: true,
        cancelable: true,
        isPrimary: true,
        pointerId: 1,
        pointerType: 'touch',
        clientX,
    });
    if (timeStamp !== undefined) {
        Object.defineProperty(event, 'timeStamp', { value: timeStamp });
    }
    el.dispatchEvent(event);
}

describe('AbSegmentedToggle drag', () => {
    const TRAVEL = 100;
    let fixture: ComponentFixture<TestHost>;
    let track: HTMLElement;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TestHost],
            providers: CONTROL_TOKEN_PROVIDERS,
        }).compileComponents();
        fixture = TestBed.createComponent(TestHost);
        await fixture.whenStable();

        track = fixture.nativeElement.querySelector('.ab-segmented-toggle-track');
        // jsdom has no layout or pointer capture.
        const thumb: HTMLElement = track.querySelector('.ab-segmented-toggle-thumb')!;
        thumb.getBoundingClientRect = () => ({ width: TRAVEL }) as DOMRect;
        track.setPointerCapture = () => {};
        track.releasePointerCapture = () => {};
        track.hasPointerCapture = () => true;
    });

    async function drag(from: number, to: number): Promise<void> {
        pointer(track, 'pointerdown', from, 0);
        pointer(track, 'pointermove', (from + to) / 2, 400);
        pointer(track, 'pointermove', to, 800);
        pointer(track, 'pointerup', to, 800);
        await fixture.whenStable();
    }

    it('drags past the midpoint to select the end segment', async () => {
        await drag(0, 70);
        expect(fixture.componentInstance.on).toBe(true);
    });

    it('snaps back when released before the midpoint', async () => {
        await drag(0, 30);
        expect(fixture.componentInstance.on).toBe(false);
    });

    it('drags back from the end segment to select the start segment', async () => {
        getSegments(fixture)[1].click();
        await fixture.whenStable();

        await drag(100, 20);
        expect(fixture.componentInstance.on).toBe(false);
    });

    it('a fast flick commits its direction even before the midpoint', async () => {
        pointer(track, 'pointerdown', 0, 0);
        pointer(track, 'pointermove', 20, 10);
        pointer(track, 'pointerup', 20, 10);
        await fixture.whenStable();
        expect(fixture.componentInstance.on).toBe(true);
    });

    it('moves the thumb with the finger while dragging', async () => {
        pointer(track, 'pointerdown', 0, 0);
        pointer(track, 'pointermove', 40, 400);
        await fixture.whenStable();

        expect(track.classList.contains('ab-segmented-toggle-track_dragging')).toBe(true);
        expect(track.style.getPropertyValue('--drag')).toBe('40px');
    });

    it('treats a press below the drag threshold as a tap handled by click', async () => {
        pointer(track, 'pointerdown', 50, 0);
        pointer(track, 'pointermove', 52, 50);
        pointer(track, 'pointerup', 52, 50);
        getSegments(fixture)[1].click();
        await fixture.whenStable();

        expect(fixture.componentInstance.on).toBe(true);
    });

    it('ignores the trailing click after a drag', async () => {
        await drag(0, 70);
        getSegments(fixture)[0].click();
        await fixture.whenStable();

        expect(fixture.componentInstance.on).toBe(true);
    });

    it('does not commit on pointercancel', async () => {
        pointer(track, 'pointerdown', 0, 0);
        pointer(track, 'pointermove', 90, 800);
        pointer(track, 'pointercancel', 90, 800);
        await fixture.whenStable();

        expect(fixture.componentInstance.on).toBe(false);
        expect(track.classList.contains('ab-segmented-toggle-track_dragging')).toBe(false);
    });

    it('does not drag while disabled', async () => {
        const disabled = TestBed.createComponent(AbSegmentedToggle);
        disabled.componentRef.setInput('startLabel', '0');
        disabled.componentRef.setInput('endLabel', '2');
        disabled.componentRef.setInput('disabled', true);
        disabled.detectChanges();
        const disabledTrack: HTMLElement = disabled.nativeElement.querySelector(
            '.ab-segmented-toggle-track',
        );
        disabledTrack.setPointerCapture = () => {};
        pointer(disabledTrack, 'pointerdown', 0, 0);
        pointer(disabledTrack, 'pointermove', 90, 800);
        pointer(disabledTrack, 'pointerup', 90, 800);
        await disabled.whenStable();

        expect(disabled.componentInstance.checked()).toBe(false);
    });
});

describe('AbSegmentedToggle size/shape/disabled (direct construction)', () => {
    let fixture: ComponentFixture<AbSegmentedToggle>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AbSegmentedToggle],
            providers: CONTROL_TOKEN_PROVIDERS,
        }).compileComponents();
        fixture = TestBed.createComponent(AbSegmentedToggle);
        fixture.componentRef.setInput('startLabel', '0');
        fixture.componentRef.setInput('endLabel', '2');
        fixture.detectChanges();
        await fixture.whenStable();
    });

    it('defaults size to md and shape to circle', () => {
        const el: HTMLElement = fixture.nativeElement;
        expect(el.classList.contains('ab-segmented-toggle_md')).toBe(true);
        expect(el.classList.contains('ab-segmented-toggle_circle')).toBe(true);
    });

    const sizes: AbControlSize[] = ['sm', 'md', 'lg'];
    for (const size of sizes) {
        it(`reflects size="${size}"`, async () => {
            fixture.componentRef.setInput('size', size);
            fixture.detectChanges();
            await fixture.whenStable();
            expect(fixture.nativeElement.classList.contains(`ab-segmented-toggle_${size}`)).toBe(
                true,
            );
        });
    }

    const shapes: AbControlShape[] = ['square', 'round', 'circle'];
    for (const shape of shapes) {
        it(`reflects shape="${shape}"`, async () => {
            fixture.componentRef.setInput('shape', shape);
            fixture.detectChanges();
            await fixture.whenStable();
            expect(fixture.nativeElement.classList.contains(`ab-segmented-toggle_${shape}`)).toBe(
                true,
            );
        });
    }

    it('ignores clicks and reflects aria-disabled while disabled', async () => {
        fixture.componentRef.setInput('disabled', true);
        fixture.detectChanges();
        await fixture.whenStable();

        const end = getSegments(fixture)[1];
        expect(end.getAttribute('aria-disabled')).toBe('true');
        end.click();
        await fixture.whenStable();
        expect(fixture.componentInstance.checked()).toBe(false);
    });
});

describe('AbSegmentedToggle ControlValueAccessor', () => {
    let fixture: ComponentFixture<FormsTestHost>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FormsTestHost],
            providers: CONTROL_TOKEN_PROVIDERS,
        }).compileComponents();
        fixture = TestBed.createComponent(FormsTestHost);
        fixture.detectChanges();
        await fixture.whenStable();
    });

    it('propagates a click to the FormControl', async () => {
        getSegments(fixture)[1].click();
        await fixture.whenStable();
        expect(fixture.componentInstance.control.value).toBe(true);
    });

    it('reflects external FormControl changes', async () => {
        fixture.componentInstance.control.setValue(true);
        fixture.detectChanges();
        await fixture.whenStable();
        expect(getSegments(fixture)[1].getAttribute('aria-checked')).toBe('true');
    });

    it('disables when the FormControl is disabled', async () => {
        fixture.componentInstance.control.disable();
        fixture.detectChanges();
        await fixture.whenStable();
        expect(getSegments(fixture)[0].getAttribute('aria-disabled')).toBe('true');
    });
});
