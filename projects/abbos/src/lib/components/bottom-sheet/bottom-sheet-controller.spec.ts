import { Component, input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CONTROL_SHAPE, CONTROL_SIZE } from '../../config';
import { AbBottomSheetController, AbBottomSheetRef } from './bottom-sheet-controller';
import { inject } from '@angular/core';

const CONTROL_TOKEN_PROVIDERS = [
    { provide: CONTROL_SIZE, useValue: 'md' },
    { provide: CONTROL_SHAPE, useValue: 'round' },
];

@Component({
    template: `
        <p class="picker">{{ current() }}</p>
        <button type="button" class="pick" (click)="ref.close(next())">Pick</button>
    `,
})
class Picker {
    public readonly current = input('red');
    public readonly next = input('blue');
    protected readonly ref = inject<AbBottomSheetRef<string>>(AbBottomSheetRef);
}

@Component({
    template: `<button type="button" class="footer-done" (click)="ref.close('done')">Done</button>`,
})
class PickerFooter {
    protected readonly ref = inject<AbBottomSheetRef<string>>(AbBottomSheetRef);
}

@Component({ template: `<button id="trigger" type="button">Open</button>` })
class Host {}

describe('AbBottomSheetController', () => {
    let fixture: ComponentFixture<Host>;
    let controller: AbBottomSheetController;

    const flush = async (): Promise<void> => {
        fixture.detectChanges();
        await fixture.whenStable();
        TestBed.tick();
        await fixture.whenStable();
    };
    const settle = async (): Promise<void> => {
        await flush();
        vi.advanceTimersByTime(400);
        await flush();
    };
    const panel = (): HTMLElement | null => document.querySelector('.ab-bottom-sheet-panel');
    const openPicker = (
        config: Partial<Parameters<typeof controller.open<Picker, string>>[1]> = {},
    ) => controller.open<Picker, string>(Picker, { heading: 'Pick a colour', ...config });
    const collect = (ref: AbBottomSheetRef<string>) => {
        const values: (string | undefined)[] = [];
        let completed = false;
        ref.afterClosed().subscribe({
            next: (v) => values.push(v),
            complete: () => (completed = true),
        });
        return { values, done: () => completed };
    };

    beforeEach(async () => {
        vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
        await TestBed.configureTestingModule({
            imports: [Host],
            providers: CONTROL_TOKEN_PROVIDERS,
        }).compileComponents();
        fixture = TestBed.createComponent(Host);
        controller = TestBed.inject(AbBottomSheetController);
        await flush();
    });

    afterEach(() => {
        controller.closeAll();
        fixture.destroy();
        vi.useRealTimers();
    });

    it('renders the component with the heading and inputs', async () => {
        openPicker({ inputs: { current: 'green' } });
        await flush();
        expect(panel()!.getAttribute('role')).toBe('dialog');
        expect(document.querySelector('.ab-bottom-sheet-title')!.textContent).toContain(
            'Pick a colour',
        );
        expect(document.querySelector('.picker')!.textContent).toBe('green');
    });

    it('returns the result the component closes with, after the exit animation', async () => {
        const ref = openPicker({ inputs: { next: 'purple' } });
        const result = collect(ref);
        await flush();

        (document.querySelector('.pick') as HTMLElement).click();
        await flush();
        expect(result.values).toEqual([]);
        expect(document.querySelector('ab-bottom-sheet-outlet')).not.toBeNull();

        await settle();
        expect(result.values).toEqual(['purple']);
        expect(result.done()).toBe(true);
        expect(document.querySelector('ab-bottom-sheet-outlet')).toBeNull();
        expect(panel()).toBeNull();
    });

    it('resolves undefined when the user dismisses it', async () => {
        const ref = openPicker();
        const result = collect(ref);
        await flush();
        panel()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        await settle();
        expect(result.values).toEqual([undefined]);

        const second = collect(openPicker());
        await flush();
        (document.querySelector('.ab-bottom-sheet-scrim') as HTMLElement).click();
        await settle();
        expect(second.values).toEqual([undefined]);
    });

    it('ignores later close calls once closing', async () => {
        const ref = openPicker();
        const result = collect(ref);
        await flush();
        ref.close('first');
        ref.close('second');
        await settle();
        expect(result.values).toEqual(['first']);
    });

    it('renders a footer component that can close with a result', async () => {
        const ref = openPicker({ footer: PickerFooter });
        const result = collect(ref);
        await flush();
        (document.querySelector('.ab-bottom-sheet-footer .footer-done') as HTMLElement).click();
        await settle();
        expect(result.values).toEqual(['done']);
    });

    it('closes the current sheet when another opens', async () => {
        const first = collect(openPicker());
        await flush();
        const second = collect(openPicker());
        await settle();
        expect(first.values).toEqual([undefined]);
        expect(second.values).toEqual([]);
        expect(document.querySelectorAll('ab-bottom-sheet-outlet').length).toBe(1);
    });

    it('completes without showing anything when closed before it renders', async () => {
        const ref = openPicker();
        const result = collect(ref);
        ref.close('early');
        expect(result.values).toEqual(['early']);
        expect(document.querySelector('ab-bottom-sheet-outlet')).toBeNull();
    });

    it('cleans everything up when closeAll runs or the service is destroyed', async () => {
        const one = collect(openPicker());
        await flush();
        controller.closeAll();
        await settle();
        expect(one.values).toEqual([undefined]);

        const two = collect(openPicker());
        await flush();
        controller.ngOnDestroy();
        expect(two.values).toEqual([undefined]);
        expect(document.querySelector('ab-bottom-sheet-outlet')).toBeNull();
        expect(document.querySelector('.cdk-overlay-container .ab-bottom-sheet')).toBeNull();
    });

    it('restores focus to the trigger', async () => {
        const trigger = document.getElementById('trigger') as HTMLButtonElement;
        trigger.focus();
        const ref = openPicker();
        await flush();
        ref.close();
        await settle();
        expect(document.activeElement).toBe(trigger);
    });
});
