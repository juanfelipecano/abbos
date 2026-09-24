import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CONTROL_SHAPE, CONTROL_SIZE } from '../../config';
import { AbControlShape, AbControlSize } from '../../constants';
import { AbChip, AbChipVariant } from './chip';

const CONTROL_TOKEN_PROVIDERS = [
    { provide: CONTROL_SIZE, useValue: 'md' },
    { provide: CONTROL_SHAPE, useValue: 'round' },
];

@Component({
    imports: [AbChip],
    template: `
        <ab-chip
            [variant]="variant()"
            [size]="size()"
            [shape]="shape()"
            [removable]="removable()"
            [selectable]="selectable()"
            [disabled]="disabled()"
            [(selected)]="selected"
            (removed)="removedCount = removedCount + 1"
        >
            <svg abStart></svg>
            Design
        </ab-chip>
    `,
})
class TestHost {
    public readonly variant = signal<AbChipVariant>('neutral');
    public readonly size = signal<AbControlSize>('md');
    public readonly shape = signal<AbControlShape>('round');
    public readonly removable = signal(false);
    public readonly selectable = signal(false);
    public readonly disabled = signal(false);
    public readonly selected = signal(false);
    public removedCount = 0;
}

describe('AbChip', () => {
    let fixture: ComponentFixture<TestHost>;
    let host: TestHost;

    const chip = (): HTMLElement => fixture.debugElement.query(By.directive(AbChip)).nativeElement;
    const remove = (): HTMLButtonElement | null => chip().querySelector('.ab-chip-remove');
    const body = (): HTMLButtonElement => chip().querySelector('button.ab-chip-body')!;
    const update = async (patch: {
        [K in keyof TestHost]?: TestHost[K] extends { set(v: infer V): void } ? V : never;
    }): Promise<void> => {
        for (const [key, value] of Object.entries(patch)) {
            (host as unknown as Record<string, { set(v: unknown): void }>)[key].set(value);
        }
        fixture.detectChanges();
        await fixture.whenStable();
    };
    const press = (key: string): void => {
        chip().dispatchEvent(
            new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }),
        );
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TestHost],
            providers: CONTROL_TOKEN_PROVIDERS,
        }).compileComponents();

        fixture = TestBed.createComponent(TestHost);
        host = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('applies default variant, size and shape from inputs and DI', () => {
        expect(chip().classList).toContain('ab-chip');
        expect(chip().classList).toContain('ab-chip_neutral');
        expect(chip().classList).toContain('ab-chip_md');
        expect(chip().classList).toContain('ab-chip_round');
    });

    it('reflects variant, size and shape as classes', async () => {
        await update({ variant: 'dotted', size: 'sm', shape: 'circle' });
        expect(chip().classList).toContain('ab-chip_dotted');
        await update({ variant: 'solid' });
        expect(chip().classList).toContain('ab-chip_solid');
        expect(chip().classList).toContain('ab-chip_sm');
        expect(chip().classList).toContain('ab-chip_circle');
    });

    it('projects the label and the start slot', () => {
        expect(chip().querySelector('.ab-chip-label')?.textContent?.trim()).toBe('Design');
        expect(chip().querySelector('.ab-chip-slot svg')).not.toBeNull();
    });

    it('is not focusable or interactive by default', () => {
        expect(chip().hasAttribute('tabindex')).toBe(false);
        expect(remove()).toBeNull();
        expect(body()).toBeNull();
    });

    describe('removable', () => {
        beforeEach(async () => {
            await update({ removable: true });
        });

        it('is focusable and has a named remove button', () => {
            expect(chip().getAttribute('tabindex')).toBe('0');
            expect(remove()!.getAttribute('tabindex')).toBe('-1');
            const ids = remove()!.getAttribute('aria-labelledby')!.split(' ');
            const names = ids.map((id) => document.getElementById(id));
            expect(
                names.map((el) => el?.getAttribute('aria-label') ?? el?.textContent?.trim()),
            ).toEqual(['Remove', 'Design']);
        });

        it('emits removed when the button is clicked', () => {
            remove()!.click();
            expect(host.removedCount).toBe(1);
        });

        it.each(['Backspace', 'Delete'])('emits removed on %s', (key) => {
            press(key);
            expect(host.removedCount).toBe(1);
        });

        it('ignores other keys', () => {
            press('Enter');
            expect(host.removedCount).toBe(0);
        });

        it('does not remove while disabled', async () => {
            await update({ disabled: true });
            remove()!.click();
            press('Delete');
            expect(host.removedCount).toBe(0);
            expect(chip().hasAttribute('tabindex')).toBe(false);
        });
    });

    describe('selectable', () => {
        beforeEach(async () => {
            await update({ selectable: true });
        });

        it('renders a native toggle button', () => {
            expect(body().getAttribute('aria-pressed')).toBe('false');
        });

        it('toggles selected and shows a check when selected', async () => {
            body().click();
            await fixture.whenStable();
            expect(host.selected()).toBe(true);
            expect(body().getAttribute('aria-pressed')).toBe('true');
            expect(chip().classList).toContain('ab-chip_selected');
            expect(chip().querySelector('.ab-chip-check')).not.toBeNull();
        });

        it('does not toggle while disabled', async () => {
            await update({ disabled: true });
            body().click();
            expect(host.selected()).toBe(false);
            expect(body().getAttribute('aria-disabled')).toBe('true');
        });

        it('takes precedence over removable', async () => {
            await update({ removable: true });
            expect(remove()).toBeNull();
            press('Delete');
            expect(host.removedCount).toBe(0);
        });
    });
});
