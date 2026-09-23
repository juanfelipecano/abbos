import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LucideIconInput, LucideMail } from '@lucide/angular';
import { AbControlShape } from '../../constants';
import { AbLogo, AbLogoAppearance, AbLogoSize, AbLogoTone } from './logo';

@Component({
    imports: [AbLogo],
    template: `
        <ab-logo
            [icon]="icon()"
            [tone]="tone()"
            [appearance]="appearance()"
            [size]="size()"
            [shape]="shape()"
            [label]="label()"
        />
    `,
})
class TestHost {
    public icon = signal<LucideIconInput>(LucideMail.icon);
    public tone = signal<AbLogoTone>('success');
    public appearance = signal<AbLogoAppearance>('clear');
    public size = signal<AbLogoSize>('lg');
    public shape = signal<AbControlShape>('circle');
    public label = signal<string | null>(null);
}

describe('AbLogo', () => {
    let fixture: ComponentFixture<TestHost>;
    let host: TestHost;

    const el = (): HTMLElement => fixture.nativeElement.querySelector('ab-logo');

    beforeEach(() => {
        fixture = TestBed.createComponent(TestHost);
        host = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('defaults to success / clear / lg / circle', () => {
        const classes = el().classList;
        expect(classes).toContain('ab-logo');
        expect(classes).toContain('ab-logo_success');
        expect(classes).toContain('ab-logo_clear');
        expect(classes).toContain('ab-logo_lg');
        expect(classes).toContain('ab-logo_circle');
    });

    it('renders the lucide icon as an svg', () => {
        expect(el().querySelector('svg')).not.toBeNull();
        expect(el().querySelectorAll('svg *').length).toBeGreaterThan(0);
    });

    it.each(['primary', 'success', 'info', 'warning', 'danger', 'neutral'] as AbLogoTone[])(
        'applies tone %s',
        (tone) => {
            host.tone.set(tone);
            fixture.detectChanges();
            expect(el().classList).toContain(`ab-logo_${tone}`);
        },
    );

    it.each(['soft', 'solid', 'outline', 'clear'] as AbLogoAppearance[])(
        'applies appearance %s',
        (a) => {
            host.appearance.set(a);
            fixture.detectChanges();
            expect(el().classList).toContain(`ab-logo_${a}`);
        },
    );

    it.each(['sm', 'md', 'lg', 'xl'] as AbLogoSize[])('applies size %s', (size) => {
        host.size.set(size);
        fixture.detectChanges();
        expect(el().classList).toContain(`ab-logo_${size}`);
    });

    it.each(['square', 'round', 'circle'] as AbControlShape[])('applies shape %s', (shape) => {
        host.shape.set(shape);
        fixture.detectChanges();
        expect(el().classList).toContain(`ab-logo_${shape}`);
    });

    it('is decorative without a label', () => {
        expect(el().getAttribute('aria-hidden')).toBe('true');
        expect(el().hasAttribute('role')).toBe(false);
    });

    it('becomes an accessible image with a label', () => {
        host.label.set('Email sent');
        fixture.detectChanges();
        expect(el().getAttribute('role')).toBe('img');
        expect(el().getAttribute('aria-label')).toBe('Email sent');
        expect(el().hasAttribute('aria-hidden')).toBe(false);
    });
});
