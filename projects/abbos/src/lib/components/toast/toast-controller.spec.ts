import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AbToastController, AbToastDismissReason } from './toast-controller';

@Component({ template: `<button id="trigger" type="button">Trigger</button>` })
class Host {}

describe('AbToastController', () => {
    let fixture: ComponentFixture<Host>;
    let controller: AbToastController;

    const flush = async (): Promise<void> => {
        fixture.detectChanges();
        await fixture.whenStable();
        TestBed.tick();
        await fixture.whenStable();
    };
    const advance = async (ms: number): Promise<void> => {
        await flush();
        vi.advanceTimersByTime(ms);
        await flush();
    };
    const toasts = (): HTMLElement[] => [...document.querySelectorAll<HTMLElement>('ab-toast')];
    const text = (): string | undefined => toasts()[0]?.textContent ?? undefined;

    beforeEach(async () => {
        vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
        await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
        fixture = TestBed.createComponent(Host);
        controller = TestBed.inject(AbToastController);
    });

    afterEach(() => {
        TestBed.resetTestingModule();
        document.querySelectorAll('ab-toast-outlet').forEach((n) => n.remove());
        vi.useRealTimers();
    });

    it('shows a message from a plain string', async () => {
        controller.show('Saved');
        await flush();
        expect(text()).toContain('Saved');
    });

    it('announces through a polite status region, and errors through an alert region', async () => {
        controller.show('Saved');
        await flush();
        expect(toasts()[0].closest('[role="status"]')).not.toBeNull();
        controller.dismissAll();
        await advance(400);
        controller.error('Failed');
        await flush();
        expect(toasts()[0].closest('[role="alert"]')).not.toBeNull();
    });

    it('does not move focus', async () => {
        const trigger = document.getElementById('trigger') as HTMLButtonElement;
        document.body.appendChild(trigger);
        trigger.focus();
        controller.show({ message: 'Saved', actionLabel: 'Undo' });
        await flush();
        expect(document.activeElement).toBe(trigger);
    });

    it('dismisses after 4s, then removes the toast and reports "timeout"', async () => {
        const ref = controller.show('Saved');
        const reason = vi.fn();
        ref.afterDismissed().subscribe(reason);
        await advance(3900);
        expect(toasts().length).toBe(1);
        await advance(100);
        await advance(300);
        expect(toasts().length).toBe(0);
        expect(reason).toHaveBeenCalledWith('timeout' satisfies AbToastDismissReason);
    });

    it('waits 8s when there is an action', async () => {
        controller.show({ message: 'Deleted', actionLabel: 'Undo' });
        await advance(7900);
        expect(toasts().length).toBe(1);
        await advance(500);
        expect(toasts().length).toBe(0);
    });

    it('stays until dismissed when duration is 0, with a close button', async () => {
        controller.show({ message: 'Offline', duration: 0 });
        await advance(60_000);
        expect(toasts().length).toBe(1);
        expect(toasts()[0].querySelector('.ab-toast-close')).not.toBeNull();
    });

    it('pauses while hovered and resumes with the remaining time', async () => {
        controller.show('Saved');
        await advance(3000);
        const hold = document.querySelector('.ab-toast-column') as HTMLElement;
        hold.dispatchEvent(new MouseEvent('mouseenter'));
        await advance(10_000);
        expect(toasts().length).toBe(1);
        hold.dispatchEvent(new MouseEvent('mouseleave'));
        await advance(1100);
        await advance(300);
        expect(toasts().length).toBe(0);
    });

    it('pauses while focus is inside', async () => {
        controller.show({ message: 'Deleted', actionLabel: 'Undo' });
        await flush();
        const action = document.querySelector('.ab-toast-action') as HTMLButtonElement;
        action.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
        await advance(20_000);
        expect(toasts().length).toBe(1);
    });

    it('emits onAction and dismisses with "action"', async () => {
        const ref = controller.show({ message: 'Deleted', actionLabel: 'Undo' });
        const acted = vi.fn();
        const reason = vi.fn();
        ref.onAction().subscribe(acted);
        ref.afterDismissed().subscribe(reason);
        await flush();
        (document.querySelector('.ab-toast-action') as HTMLButtonElement).click();
        await advance(300);
        expect(acted).toHaveBeenCalledTimes(1);
        expect(reason).toHaveBeenCalledWith('action');
        expect(toasts().length).toBe(0);
    });

    it('shows one at a time, in order', async () => {
        controller.show('First');
        controller.show('Second');
        await flush();
        expect(toasts().length).toBe(1);
        expect(text()).toContain('First');
        await advance(4000);
        await advance(300);
        expect(toasts().length).toBe(1);
        expect(text()).toContain('Second');
    });

    it('dismissing a queued toast removes it without showing it', async () => {
        controller.show('First');
        const second = controller.show('Second');
        const reason = vi.fn();
        second.afterDismissed().subscribe(reason);
        second.dismiss();
        expect(reason).toHaveBeenCalledWith('dismiss');
        await advance(4500);
        expect(toasts().length).toBe(0);
    });

    it('dismissAll clears the visible toast and the queue', async () => {
        controller.show('First');
        controller.show('Second');
        await flush();
        controller.dismissAll();
        await advance(500);
        expect(toasts().length).toBe(0);
    });

    it('only the first dismissal counts', async () => {
        const ref = controller.show('Saved');
        const reason = vi.fn();
        ref.afterDismissed().subscribe(reason);
        await flush();
        ref.dismiss();
        ref.dismiss();
        await advance(300);
        expect(reason).toHaveBeenCalledTimes(1);
    });

    describe('position', () => {
        const positions = [
            'top-left',
            'top-center',
            'top-right',
            'bottom-left',
            'bottom-center',
            'bottom-right',
            'center',
        ] as const;

        it.each(positions)('places a toast at %s', async (position) => {
            controller.show({ message: 'Hi', position });
            await flush();
            const container = toasts()[0].closest('.ab-toast-container');
            expect(container?.getAttribute('data-position')).toBe(position);
        });

        it('defaults to bottom-center', async () => {
            controller.show('Hi');
            await flush();
            expect(toasts()[0].closest('.ab-toast-container')?.getAttribute('data-position')).toBe(
                'bottom-center',
            );
        });

        it('shows one toast per position at the same time', async () => {
            controller.show({ message: 'A', position: 'top-left' });
            controller.show({ message: 'B', position: 'bottom-right' });
            controller.show({ message: 'C', position: 'bottom-right' });
            await flush();
            expect(toasts().map((t) => t.textContent?.trim())).toEqual(['A', 'B']);
        });

        it('renders the live regions before the first message', async () => {
            controller.show('Hi');
            const outlet = document.querySelector('ab-toast-outlet');
            fixture.detectChanges();
            TestBed.tick();
            expect(outlet?.querySelector('[role="status"]')).not.toBeNull();
            await flush();
            expect(text()).toContain('Hi');
        });
    });

    describe('expanded mode', () => {
        const show = (n: number, extra: object = {}): void => {
            for (let i = 1; i <= n; i++) {
                controller.show({ message: `T${i}`, mode: 'expanded', ...extra });
            }
        };

        it('shows up to maxVisible at once and queues the rest', async () => {
            show(5, { maxVisible: 2 });
            await flush();
            expect(toasts().length).toBe(2);
            await advance(4000);
            await advance(300);
            expect(toasts().map((t) => t.textContent?.trim())).toEqual(['T3', 'T4']);
        });

        it('defaults maxVisible to 3', async () => {
            show(5);
            await flush();
            expect(toasts().length).toBe(3);
        });

        it('keeps the newest nearest the anchored edge', async () => {
            show(3, { position: 'bottom-left' });
            await flush();
            expect(toasts().map((t) => t.textContent?.trim())).toEqual(['T1', 'T2', 'T3']);
            controller.dismissAll();
            await advance(500);
            show(3, { position: 'top-left' });
            await flush();
            expect(toasts().map((t) => t.textContent?.trim())).toEqual(['T3', 'T2', 'T1']);
        });

        it('times each toast out on its own', async () => {
            controller.show({ message: 'Short', mode: 'expanded', duration: 1000 });
            controller.show({ message: 'Long', mode: 'expanded', duration: 6000 });
            await flush();
            await advance(1000);
            await advance(300);
            expect(toasts().map((t) => t.textContent?.trim())).toEqual(['Long']);
        });

        it('routes errors to the alert region', async () => {
            controller.show({ message: 'Fine', mode: 'expanded' });
            controller.error('Broke', { mode: 'expanded' });
            await flush();
            const alert = document.querySelector('[role="alert"]') as HTMLElement;
            const status = document.querySelector('[role="status"]') as HTMLElement;
            expect(alert.textContent).toContain('Broke');
            expect(status.textContent).toContain('Fine');
        });

        it('dismiss() takes the newest and dismissAll() everything', async () => {
            show(3);
            await flush();
            controller.dismiss();
            await advance(300);
            expect(toasts().map((t) => t.textContent?.trim())).toEqual(['T1', 'T2']);
            controller.dismissAll();
            await advance(300);
            expect(toasts().length).toBe(0);
        });
    });

    describe('stacked mode', () => {
        const items = (): HTMLElement[] => [
            ...document.querySelectorAll<HTMLElement>('.ab-toast-item'),
        ];

        beforeEach(async () => {
            for (const m of ['A', 'B', 'C']) {
                controller.show({ message: m, mode: 'stacked' });
            }
            await flush();
        });

        it('depths the pile newest first and folds the ones behind', () => {
            const depth = (el: HTMLElement) => el.style.getPropertyValue('--ab-toast-depth');
            expect(items().map(depth)).toEqual(['2', '1', '0']);
            expect(items().map((el) => el.hasAttribute('inert'))).toEqual([true, true, false]);
            expect(items()[0].getAttribute('aria-hidden')).toBe('true');
        });

        it('fans out on hover and folds back after', async () => {
            const column = document.querySelector('.ab-toast-column') as HTMLElement;
            column.dispatchEvent(new MouseEvent('mouseenter'));
            await flush();
            expect(items().some((el) => el.hasAttribute('inert'))).toBe(false);
            expect(document.querySelector('.ab-toast-container_expanded')).not.toBeNull();
            column.dispatchEvent(new MouseEvent('mouseleave'));
            await flush();
            expect(items()[0].hasAttribute('inert')).toBe(true);
        });

        it('pauses every timer while hovered', async () => {
            const column = document.querySelector('.ab-toast-column') as HTMLElement;
            column.dispatchEvent(new MouseEvent('mouseenter'));
            await advance(30_000);
            expect(toasts().length).toBe(3);
            column.dispatchEvent(new MouseEvent('mouseleave'));
            await advance(4100);
            await advance(300);
            expect(toasts().length).toBe(0);
        });
    });
});
