import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AbToast } from './toast';

describe('AbToast', () => {
    let fixture: ComponentFixture<AbToast>;
    const el = (): HTMLElement => fixture.nativeElement;

    beforeEach(async () => {
        await TestBed.configureTestingModule({ imports: [AbToast] }).compileComponents();
        fixture = TestBed.createComponent(AbToast);
        fixture.componentRef.setInput('message', 'Saved');
        fixture.detectChanges();
    });

    it('renders the message with no buttons by default', () => {
        expect(el().textContent).toContain('Saved');
        expect(el().querySelector('button')).toBeNull();
    });

    it('emits action from the action button', () => {
        fixture.componentRef.setInput('actionLabel', 'Undo');
        fixture.detectChanges();
        const spy = vi.fn();
        fixture.componentInstance.action.subscribe(spy);
        el().querySelector<HTMLButtonElement>('.ab-toast-action')!.click();
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('shows a labelled close button only when dismissible', () => {
        fixture.componentRef.setInput('dismissible', true);
        fixture.componentRef.setInput('closeLabel', 'Close');
        fixture.detectChanges();
        const spy = vi.fn();
        fixture.componentInstance.dismissed.subscribe(spy);
        const close = el().querySelector<HTMLButtonElement>('.ab-toast-close')!;
        expect(close.getAttribute('aria-label')).toBe('Close');
        close.click();
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('dismisses on Escape', () => {
        const spy = vi.fn();
        fixture.componentInstance.dismissed.subscribe(spy);
        el().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('shows a severity icon except for neutral', () => {
        expect(el().querySelector('.ab-toast-icon')).toBeNull();
        fixture.componentRef.setInput('severity', 'error');
        fixture.detectChanges();
        expect(el().querySelector('.ab-toast-icon')).not.toBeNull();
        expect(el().classList).toContain('ab-toast_error');
    });
});
