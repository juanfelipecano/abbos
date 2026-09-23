import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CONTROL_SHAPE, CONTROL_SIZE } from '../../config';
import { AbControlShape, AbControlSize } from '../../constants';
import { AbButton, AbButtonVariant } from './button';

const CONTROL_TOKEN_PROVIDERS = [
    { provide: CONTROL_SIZE, useValue: 'md' },
    { provide: CONTROL_SHAPE, useValue: 'round' },
];

@Component({
    imports: [AbButton],
    template: `<button ab-button>Save</button>`,
})
class TestHost {}

@Component({
    imports: [AbButton],
    template: `<button ab-button [variant]="variant" [size]="size" [shape]="shape">Save</button>`,
})
class ConfigurableTestHost {
    public variant: AbButtonVariant = 'primary';
    public size: AbControlSize = 'md';
    public shape: AbControlShape = 'round';
}

@Component({
    imports: [AbButton],
    template: `
        <button ab-button>
            <svg abStart></svg>
            Export
            <svg abEnd></svg>
        </button>
    `,
})
class IconsTestHost {}

describe('AbButton', () => {
    let fixture: ComponentFixture<TestHost>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TestHost],
            providers: CONTROL_TOKEN_PROVIDERS,
        }).compileComponents();

        fixture = TestBed.createComponent(TestHost);
        await fixture.whenStable();
    });

    it('renders as a real native button with the projected label visible', () => {
        const host: HTMLElement = fixture.nativeElement;
        const button = host.querySelector('button[ab-button]');

        expect(button).toBeTruthy();
        expect(button?.textContent).toContain('Save');
    });

    it('defaults variant to primary, size to md, and shape to round', () => {
        const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
        expect(button.classList.contains('ab-button_primary')).toBe(true);
        expect(button.classList.contains('ab-button_md')).toBe(true);
        expect(button.classList.contains('ab-button_round')).toBe(true);
    });

    it('is not disabled and not busy by default', () => {
        const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
        expect(button.getAttribute('aria-disabled')).toBeNull();
        expect(button.getAttribute('aria-busy')).toBeNull();
    });
});

describe('AbButton variant/size/shape', () => {
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

    const variants: AbButtonVariant[] = [
        'primary',
        'secondary',
        'soft',
        'outline',
        'ghost',
        'danger',
    ];
    for (const variant of variants) {
        it(`reflects variant="${variant}" as ab-button_${variant}`, async () => {
            component.variant = variant;
            fixture.detectChanges();
            await fixture.whenStable();

            const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
            expect(button.classList.contains(`ab-button_${variant}`)).toBe(true);
        });
    }

    const sizes: AbControlSize[] = ['sm', 'md', 'lg'];
    for (const size of sizes) {
        it(`reflects size="${size}" as ab-button_${size}`, async () => {
            component.size = size;
            fixture.detectChanges();
            await fixture.whenStable();

            const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
            expect(button.classList.contains(`ab-button_${size}`)).toBe(true);
        });
    }

    const shapes: AbControlShape[] = ['square', 'round', 'circle'];
    for (const shape of shapes) {
        it(`reflects shape="${shape}" as ab-button_${shape}`, async () => {
            component.shape = shape;
            fixture.detectChanges();
            await fixture.whenStable();

            const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
            expect(button.classList.contains(`ab-button_${shape}`)).toBe(true);
        });
    }
});

describe('AbButton icon slots', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [IconsTestHost, TestHost],
            providers: CONTROL_TOKEN_PROVIDERS,
        }).compileComponents();
    });

    it('renders abStart/abEnd projected content inside dedicated slots', async () => {
        const fixture = TestBed.createComponent(IconsTestHost);
        fixture.detectChanges();
        await fixture.whenStable();

        const host: HTMLElement = fixture.nativeElement;
        const slots = host.querySelectorAll('.ab-button-slot');
        expect(slots.length).toBe(2);
        expect(slots[0].querySelector('svg')).toBeTruthy();
        expect(slots[1].querySelector('svg')).toBeTruthy();
    });

    it('renders empty (childless) slots when no icon content is projected', async () => {
        const fixture = TestBed.createComponent(TestHost);
        fixture.detectChanges();
        await fixture.whenStable();

        const slots = fixture.nativeElement.querySelectorAll('.ab-button-slot');
        expect(slots.length).toBe(2);
        for (const slot of Array.from(slots)) {
            expect((slot as HTMLElement).children.length).toBe(0);
        }
    });
});

describe('AbButton loading/disabled state', () => {
    let fixture: ComponentFixture<AbButton>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AbButton],
            providers: CONTROL_TOKEN_PROVIDERS,
        }).compileComponents();

        fixture = TestBed.createComponent(AbButton);
        fixture.detectChanges();
        await fixture.whenStable();
    });

    it('shows a decorative spinner, sets aria-busy, and marks the button aria-disabled while loading', async () => {
        fixture.componentRef.setInput('loading', true);
        fixture.detectChanges();
        await fixture.whenStable();

        const button: HTMLButtonElement = fixture.nativeElement;
        const spinner = button.querySelector('.ab-button-spinner');

        expect(button.getAttribute('aria-disabled')).toBe('true');
        expect(button.getAttribute('aria-busy')).toBe('true');
        expect(spinner).toBeTruthy();
        expect(spinner?.getAttribute('aria-hidden')).toBe('true');
        expect(button.classList.contains('ab-button_loading')).toBe(true);
    });

    it('renders no spinner and no aria-busy when not loading', () => {
        const button: HTMLButtonElement = fixture.nativeElement;
        expect(button.querySelector('.ab-button-spinner')).toBeNull();
        expect(button.getAttribute('aria-busy')).toBeNull();
    });

    it('reflects aria-disabled (not the native disabled attribute) from the disabled input, staying focusable', async () => {
        fixture.componentRef.setInput('disabled', true);
        fixture.detectChanges();
        await fixture.whenStable();

        const button: HTMLButtonElement = fixture.nativeElement;
        expect(button.getAttribute('aria-disabled')).toBe('true');
        expect(button.hasAttribute('disabled')).toBe(false);
    });

    it('stays aria-disabled while loading even if disabled is explicitly false', async () => {
        fixture.componentRef.setInput('disabled', false);
        fixture.componentRef.setInput('loading', true);
        fixture.detectChanges();
        await fixture.whenStable();

        const button: HTMLButtonElement = fixture.nativeElement;
        expect(button.getAttribute('aria-disabled')).toBe('true');
    });

    it('preventDefaults its own click handling while disabled', async () => {
        fixture.componentRef.setInput('disabled', true);
        fixture.detectChanges();
        await fixture.whenStable();

        const button: HTMLButtonElement = fixture.nativeElement;
        const event = new MouseEvent('click', { bubbles: true, cancelable: true });
        button.dispatchEvent(event);

        expect(event.defaultPrevented).toBe(true);
    });

    it('preventDefaults its own click handling while loading', async () => {
        fixture.componentRef.setInput('loading', true);
        fixture.detectChanges();
        await fixture.whenStable();

        const button: HTMLButtonElement = fixture.nativeElement;
        const event = new MouseEvent('click', { bubbles: true, cancelable: true });
        button.dispatchEvent(event);

        expect(event.defaultPrevented).toBe(true);
    });

    it('does not preventDefault a click when neither disabled nor loading', async () => {
        const button: HTMLButtonElement = fixture.nativeElement;
        const event = new MouseEvent('click', { bubbles: true, cancelable: true });
        button.dispatchEvent(event);

        expect(event.defaultPrevented).toBe(false);
    });

    it('blocks the default action for a Space/Enter keydown while disabled, preventing a click from ever being synthesized', () => {
        fixture.componentRef.setInput('disabled', true);
        fixture.detectChanges();

        const button: HTMLButtonElement = fixture.nativeElement;
        for (const key of ['Enter', ' ']) {
            const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
            button.dispatchEvent(event);
            expect(event.defaultPrevented).toBe(true);
        }
    });

    it('blocks the default action for a Space/Enter keydown while loading', () => {
        fixture.componentRef.setInput('loading', true);
        fixture.detectChanges();

        const button: HTMLButtonElement = fixture.nativeElement;
        for (const key of ['Enter', ' ']) {
            const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
            button.dispatchEvent(event);
            expect(event.defaultPrevented).toBe(true);
        }
    });

    it('leaves other keys and the enabled state untouched', () => {
        const button: HTMLButtonElement = fixture.nativeElement;
        const event = new KeyboardEvent('keydown', {
            key: 'Enter',
            bubbles: true,
            cancelable: true,
        });
        button.dispatchEvent(event);
        expect(event.defaultPrevented).toBe(false);
    });
});

describe('AbButton loading/disabled state and a sibling consumer click handler', () => {
    @Component({
        imports: [AbButton],
        template: `<button ab-button [disabled]="disabled" [loading]="loading" (click)="onClick()">
            Save
        </button>`,
    })
    class ClickHostTest {
        public disabled = false;
        public loading = false;
        public clicks = 0;
        protected onClick(): void {
            this.clicks++;
        }
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ClickHostTest],
            providers: CONTROL_TOKEN_PROVIDERS,
        }).compileComponents();
    });

    it('still invokes the consumer click handler once enabled and not loading', () => {
        const fixture = TestBed.createComponent(ClickHostTest);
        fixture.detectChanges();

        const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
        button.click();

        expect(fixture.componentInstance.clicks).toBe(1);
    });
});
