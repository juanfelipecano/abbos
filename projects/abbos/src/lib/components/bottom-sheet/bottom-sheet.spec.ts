import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CONTROL_SHAPE, CONTROL_SIZE } from '../../config';
import { AbBottomSheet, AbBottomSheetMode, AbSheetFooter } from './bottom-sheet';

const CONTROL_TOKEN_PROVIDERS = [
    { provide: CONTROL_SIZE, useValue: 'md' },
    { provide: CONTROL_SHAPE, useValue: 'round' },
];

@Component({
    imports: [AbBottomSheet, AbSheetFooter],
    template: `
        <button id="trigger" type="button">Open</button>
        <ab-bottom-sheet
            [(open)]="open"
            [mode]="mode()"
            [dismissible]="dismissible()"
            [showHandle]="showHandle()"
            heading="Share"
            subheading="Pick an option"
        >
            <p class="content">Body</p>
            @if (footer()) {
                <button abSheetFooter type="button" class="footer-action">Done</button>
            }
        </ab-bottom-sheet>
    `,
})
class TestHost {
    public readonly open = signal(false);
    public readonly mode = signal<AbBottomSheetMode>('modal');
    public readonly dismissible = signal(true);
    public readonly showHandle = signal(true);
    public readonly footer = signal(false);
}

describe('AbBottomSheet', () => {
    let fixture: ComponentFixture<TestHost>;
    let host: TestHost;

    const flush = async (): Promise<void> => {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    };
    const root = (): HTMLElement | null => document.querySelector('.ab-bottom-sheet');
    const panel = (): HTMLElement | null => document.querySelector('.ab-bottom-sheet-panel');
    const action = (): HTMLButtonElement => document.querySelector('.ab-bottom-sheet-action')!;
    const head = (): HTMLElement => document.querySelector('.ab-bottom-sheet-head')!;
    const pointer = (target: Element, type: string, y: number, time: number): void => {
        const event = new MouseEvent(type, { bubbles: true, clientY: y });
        Object.defineProperty(event, 'timeStamp', { value: time });
        Object.defineProperty(event, 'pointerId', { value: 1 });
        target.dispatchEvent(event);
    };
    const drag = async (from: number, to: number, ms: number): Promise<void> => {
        pointer(head(), 'pointerdown', from, 0);
        pointer(head(), 'pointermove', to, ms);
        pointer(head(), 'pointerup', to, ms);
        await flush();
    };

    beforeEach(async () => {
        vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
        await TestBed.configureTestingModule({
            imports: [TestHost],
            providers: CONTROL_TOKEN_PROVIDERS,
        }).compileComponents();
        fixture = TestBed.createComponent(TestHost);
        host = fixture.componentInstance;
        await flush();
    });

    afterEach(() => {
        fixture.destroy();
        vi.useRealTimers();
    });

    describe('modal', () => {
        beforeEach(async () => {
            host.open.set(true);
            await flush();
        });

        it('renders an accessible dialog in the overlay when open', () => {
            expect(panel()!.getAttribute('role')).toBe('dialog');
            expect(panel()!.getAttribute('aria-modal')).toBe('true');
            const title = document.getElementById(panel()!.getAttribute('aria-labelledby')!);
            expect(title?.textContent).toContain('Share');
            expect(root()!.classList).toContain('ab-bottom-sheet_open');
        });

        it('is not rendered while closed and removes itself after closing', async () => {
            host.open.set(false);
            await flush();
            expect(root()!.classList).not.toContain('ab-bottom-sheet_open');
            vi.advanceTimersByTime(400);
            await flush();
            expect(root()).toBeNull();
        });

        it('closes from the close button', async () => {
            action().click();
            await flush();
            expect(host.open()).toBe(false);
            expect(action().getAttribute('aria-label')).toBe('Close');
        });

        it('closes on Escape and on scrim click', async () => {
            panel()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
            await flush();
            expect(host.open()).toBe(false);

            host.open.set(true);
            await flush();
            (document.querySelector('.ab-bottom-sheet-scrim') as HTMLElement).click();
            await flush();
            expect(host.open()).toBe(false);
        });

        it('ignores Escape, scrim and the close button when not dismissible', async () => {
            host.dismissible.set(false);
            await flush();
            panel()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
            (document.querySelector('.ab-bottom-sheet-scrim') as HTMLElement).click();
            await flush();
            expect(host.open()).toBe(true);
            expect(document.querySelector('.ab-bottom-sheet-action')).toBeNull();
        });

        it('dismisses after dragging down past the threshold', async () => {
            await drag(0, 120, 300);
            expect(host.open()).toBe(false);
        });

        it('dismisses after a quick flick', async () => {
            await drag(0, 40, 20);
            expect(host.open()).toBe(false);
        });

        it('springs back after a short slow drag', async () => {
            await drag(0, 40, 400);
            expect(host.open()).toBe(true);
        });

        it('does not dismiss when dragged upward', async () => {
            await drag(200, 0, 100);
            expect(host.open()).toBe(true);
        });
    });

    describe('standard', () => {
        beforeEach(async () => {
            host.mode.set('standard');
            await flush();
        });

        it('stays in the page as a collapsed region with an inert body', () => {
            expect(panel()!.getAttribute('role')).toBe('region');
            expect(panel()!.getAttribute('aria-modal')).toBeNull();
            expect(document.querySelector('.ab-bottom-sheet-scrim')).toBeNull();
            expect(root()!.classList).not.toContain('ab-bottom-sheet_open');
            expect(document.querySelector('.ab-bottom-sheet-body')!.hasAttribute('inert')).toBe(
                true,
            );
            expect(action().getAttribute('aria-expanded')).toBe('false');
            expect(action().getAttribute('aria-label')).toBe('Expand');
        });

        it('expands and collapses from the action button', async () => {
            action().click();
            await flush();
            expect(host.open()).toBe(true);
            expect(action().getAttribute('aria-expanded')).toBe('true');
            expect(action().getAttribute('aria-label')).toBe('Collapse');
            expect(document.querySelector('.ab-bottom-sheet-body')!.hasAttribute('inert')).toBe(
                false,
            );

            action().click();
            await flush();
            expect(host.open()).toBe(false);
        });

        it('toggles when the handle is tapped', async () => {
            pointer(head(), 'pointerdown', 10, 0);
            pointer(head(), 'pointerup', 10, 50);
            await flush();
            expect(host.open()).toBe(true);
        });

        it('expands when dragged up past the threshold and collapses when dragged down', async () => {
            await drag(200, 100, 400);
            expect(host.open()).toBe(true);
            await drag(0, 150, 400);
            expect(host.open()).toBe(false);
        });

        it('keeps a short drag collapsed', async () => {
            await drag(200, 180, 400);
            expect(host.open()).toBe(false);
        });
    });

    it('shows the footer only when projected', async () => {
        host.mode.set('standard');
        await flush();
        expect(document.querySelector('.ab-bottom-sheet-footer')).toBeNull();
        host.footer.set(true);
        await flush();
        expect(document.querySelector('.ab-bottom-sheet-footer .footer-action')).not.toBeNull();
    });

    it('renders a spacer instead of the pill when the handle is hidden', async () => {
        host.mode.set('standard');
        await flush();
        expect(document.querySelector('.ab-bottom-sheet-pill')).not.toBeNull();
        host.showHandle.set(false);
        await flush();
        expect(document.querySelector('.ab-bottom-sheet-pill')).toBeNull();
    });

    it('restores focus to the trigger after closing a modal', async () => {
        const trigger = document.getElementById('trigger') as HTMLButtonElement;
        trigger.focus();
        host.open.set(true);
        await flush();
        host.open.set(false);
        await flush();
        vi.advanceTimersByTime(400);
        await flush();
        expect(document.activeElement).toBe(trigger);
    });
});
